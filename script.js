// 全域變數
let faceDetection;
let camera;
let isDetectionRunning = false;
let currentFacingMode = "user"; // 將在配置初始化後更新

// DOM 元素
const videoElement = document.querySelector(".input_video");
const canvasElement = document.querySelector(".output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const moonEffect = document.getElementById("moonEffect");

// 狀態元素
const detectionStatus = document.getElementById("detectionStatus");
const faceCountElement = document.getElementById("faceCount");
const facesInAreaElement = document.getElementById("facesInArea");

// 按鈕元素
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const switchCameraButton = document.getElementById("switchCamera");

// 檢測區域設定 (從配置文件載入)
let DETECTION_AREA = {
  centerX: 0.5, // 螢幕中心 X 比例
  centerY: 0.5, // 螢幕中心 Y 比例
  radius: 0.45, // 半徑比例 (相對於螢幕寬度) - 更大的檢測區域
};

// LIFF 初始化
async function initializeLIFF() {
  if (!CONFIG.LIFF.ENABLED) {
    console.log("LIFF 功能已停用");
    updateStatus("LIFF 功能已停用");
    return;
  }

  try {
    await liff.init({
      liffId: CONFIG.LIFF.LIFF_ID,
    });

    if (!liff.isLoggedIn()) {
      liff.login();
    }

    console.log("LIFF 初始化成功");
    updateStatus("LIFF 已就緒");
  } catch (error) {
    console.error("LIFF 初始化失敗:", error);
    updateStatus("LIFF 初始化失敗，但可以繼續使用");
  }
}

// MediaPipe 初始化
function initializeMediaPipe() {
  updateStatus("正在初始化 MediaPipe...");

  faceDetection = new FaceDetection({
    locateFile: (file) => {
      return `${CONFIG.ADVANCED.MEDIAPIPE_BASE_URL}${file}`;
    },
  });

  faceDetection.setOptions({
    model: CONFIG.FACE_DETECTION.MODEL,
    minDetectionConfidence: CONFIG.FACE_DETECTION.MIN_DETECTION_CONFIDENCE,
  });

  faceDetection.onResults(onResults);

  updateStatus("MediaPipe 初始化完成");
}

// 相機初始化
function initializeCamera() {
  camera = new Camera(videoElement, {
    onFrame: async () => {
      if (isDetectionRunning) {
        await faceDetection.send({ image: videoElement });
      }
    },
    width: CONFIG.CAMERA.DEFAULT_WIDTH,
    height: CONFIG.CAMERA.DEFAULT_HEIGHT,
    facingMode: currentFacingMode,
  });
}

function onResults(results) {
  // 1. 同步畫布大小
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // 2. 清空 + 鏡像座標系
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.save();
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);

  // 3. 畫上影像
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  // 4. 紅框：標記所有偵測到的人臉
  const faces = results.detections || [];
  updateFaceCount(faces.length);
  canvasCtx.strokeStyle = "rgba(255,0,0,0.8)";
  canvasCtx.lineWidth = 3;
  for (const face of faces) {
    const { xCenter, yCenter, width: wN, height: hN } = face.boundingBox;
    const W = canvasElement.width,
      H = canvasElement.height;
    const w = wN * W,
      h = hN * H;
    const x = (xCenter - wN / 2) * W;
    const y = (yCenter - hN / 2) * H;
    canvasCtx.strokeRect(x, y, w, h);
  }

  // 5. 篩選區域內 → 黃框＋⭐ or 🌙
  const facesInArea = checkFacesInDetectionArea(faces);
  updateFacesInArea(facesInArea.length);

  canvasCtx.strokeStyle = "#ffeb3b";
  canvasCtx.lineWidth = 4;
  canvasCtx.fillStyle = "#ffeb3b";
  canvasCtx.font = "20px sans-serif";
  canvasCtx.textAlign = "center";

  // 有 2 個以上就畫月亮，否則畫星星
  const icon = facesInArea.length >= 2 ? "🌙" : "⭐";

  for (const face of facesInArea) {
    const { xCenter, yCenter, width: wN, height: hN } = face.boundingBox;
    const W = canvasElement.width,
      H = canvasElement.height;
    const w = wN * W,
      h = hN * H;
    const x = (xCenter - wN / 2) * W;
    const y = (yCenter - hN / 2) * H;

    canvasCtx.strokeRect(x, y, w, h);
    canvasCtx.fillText(icon, x + w / 2, y + h / 2 - 10);
  }

  // 6. 繪製檢測區域圓圈
  const cx = DETECTION_AREA.centerX * canvasElement.width;
  const cy = DETECTION_AREA.centerY * canvasElement.height;
  const radius =
    DETECTION_AREA.radius * Math.min(canvasElement.width, canvasElement.height);
  canvasCtx.setLineDash([10, 5]);
  canvasCtx.strokeStyle = "rgba(255,255,255,0.6)";
  canvasCtx.lineWidth = 2;
  canvasCtx.beginPath();
  canvasCtx.arc(cx, cy, radius, 0, 2 * Math.PI);
  canvasCtx.stroke();
  canvasCtx.setLineDash([]);

  // 7. 恢復座標系 & 觸發特效
  canvasCtx.restore();
  triggerMoonEffect(facesInArea.length >= CONFIG.DETECTION_AREA.REQUIRED_FACES);

  // 8.（可選）更新 debug 面板
  if (typeof window.updateDebugResults === "function") {
    window.updateDebugResults(faces, facesInArea);
  }
}

// 檢查人臉是否在檢測區域內
function checkFacesInDetectionArea(faces) {
  const facesInArea = [];
  const W = canvasElement.width;
  const H = canvasElement.height;

  // 圆心与半径（像素）
  const cx = DETECTION_AREA.centerX * W;
  const cy = DETECTION_AREA.centerY * H;
  const radius = DETECTION_AREA.radius * Math.min(W, H);

  faces.forEach((face, index) => {
    // 1. 先拿归一化中心和尺寸
    const { xCenter, yCenter, width: wNorm, height: hNorm } = face.boundingBox;
    // 2. 计算实际像素中心点
    const fx = xCenter * W;
    const fy = yCenter * H;

    // 3. 距离
    const dx = fx - cx;
    const dy = fy - cy;
    const dist = Math.hypot(dx, dy);

    if (CONFIG.DEBUG && CONFIG.DEBUG.VERBOSE_LOGGING) {
      console.log(
        `Face ${index + 1} center: (${fx.toFixed(1)},${fy.toFixed(1)}) `,
        `dist=${dist.toFixed(1)} radius=${radius.toFixed(1)}`,
        dist <= radius ? "✅inside" : "❌outside"
      );
    }

    // 4. 如果中心点在圆内，就算“区域内”
    if (dist <= radius) {
      facesInArea.push(face);
    }
  });

  return facesInArea;
}

// 繪製人臉檢測結果
// onResults 裡面呼叫 drawFaceDetections 之後，不要在 drawFaceDetections 用到 icon
function drawFaceDetections(allFaces, facesInArea) {
  const canvasWidth = canvasElement.width;
  const canvasHeight = canvasElement.height;

  // 繪製所有人臉邊框 (淺色)
  canvasCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  canvasCtx.lineWidth = 2;
  allFaces.forEach((face) => {
    const bbox = face.boundingBox;
    canvasCtx.strokeRect(
      bbox.xMin * canvasWidth,
      bbox.yMin * canvasHeight,
      bbox.width * canvasWidth,
      bbox.height * canvasHeight
    );
  });

  // **這裡把標星星／月亮的 code 拿掉，只畫圓圈**
  const cx = DETECTION_AREA.centerX * canvasWidth;
  const cy = DETECTION_AREA.centerY * canvasHeight;
  const r = DETECTION_AREA.radius * Math.min(canvasWidth, canvasHeight);

  canvasCtx.setLineDash([10, 5]);
  canvasCtx.strokeStyle = "rgba(255,255,255,0.6)";
  canvasCtx.lineWidth = 2;
  canvasCtx.beginPath();
  canvasCtx.arc(cx, cy, r, 0, 2 * Math.PI);
  canvasCtx.stroke();
  canvasCtx.setLineDash([]);
}

// 觸發月亮特效
function triggerMoonEffect(shouldShow) {
  if (shouldShow) {
    moonEffect.classList.add("active");
  } else {
    moonEffect.classList.remove("active");
  }
}

// 更新狀態顯示
function updateStatus(status) {
  detectionStatus.textContent = status;
}

function updateFaceCount(count) {
  faceCountElement.textContent = count;
}

function updateFacesInArea(count) {
  facesInAreaElement.textContent = count;
}

// 開始檢測
async function startDetection() {
  if (isDetectionRunning) return;

  try {
    updateStatus("正在啟動相機...");

    await camera.start();
    isDetectionRunning = true;

    startButton.disabled = true;
    stopButton.disabled = false;
    switchCameraButton.disabled = false;

    updateStatus("檢測中...");
  } catch (error) {
    console.error("啟動相機失敗:", error);
    updateStatus("相機啟動失敗");
    alert("無法啟動相機，請檢查權限設定");
  }
}

// 停止檢測
function stopDetection() {
  if (!isDetectionRunning) return;

  camera.stop();
  isDetectionRunning = false;

  startButton.disabled = false;
  stopButton.disabled = true;
  switchCameraButton.disabled = true;

  // 清除 canvas
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // 隱藏月亮特效
  moonEffect.classList.remove("active");

  // 清除調試信息（如果調試頁面存在）
  if (typeof window.clearDebugResults === "function") {
    window.clearDebugResults();
  }

  updateStatus("檢測已停止");
  updateFaceCount(0);
  updateFacesInArea(0);
}

// 切換鏡頭
async function switchCamera() {
  if (!isDetectionRunning) return;

  try {
    updateStatus("正在切換鏡頭...");

    // 停止當前相機
    camera.stop();

    // 切換鏡頭模式
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";

    // 重新初始化相機
    initializeCamera();

    // 重新啟動
    await camera.start();

    updateStatus("檢測中...");
  } catch (error) {
    console.error("切換鏡頭失敗:", error);
    updateStatus("切換鏡頭失敗");
    // 回退到原來的鏡頭模式
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  }
}

// 事件監聽器
startButton.addEventListener("click", startDetection);
stopButton.addEventListener("click", stopDetection);
switchCameraButton.addEventListener("click", switchCamera);

// 鍵盤快捷鍵
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case " ": // 空格鍵開始/停止
      e.preventDefault();
      if (isDetectionRunning) {
        stopDetection();
      } else {
        startDetection();
      }
      break;
    case "c": // C 鍵切換鏡頭
      if (isDetectionRunning) {
        switchCamera();
      }
      break;
  }
});

// 頁面可見性變化處理
document.addEventListener("visibilitychange", () => {
  if (document.hidden && isDetectionRunning) {
    // 頁面被隱藏時停止檢測以節省資源
    stopDetection();
  }
});

// 窗口大小變化處理
window.addEventListener("resize", () => {
  if (isDetectionRunning) {
    // 重新調整 canvas 大小
    setTimeout(() => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
    }, 100);
  }
});

// 錯誤處理
window.addEventListener("error", (e) => {
  console.error("全域錯誤:", e.error);
  updateStatus("發生錯誤，請重新整理頁面");
});

// 初始化應用程式
async function initializeApp() {
  try {
    updateStatus("正在初始化應用程式...");

    // 首先初始化配置
    if (!initializeConfig()) {
      updateStatus("配置初始化失敗");
      return;
    }

    // 從配置更新全域變數
    currentFacingMode = CONFIG.CAMERA.DEFAULT_FACING_MODE;
    DETECTION_AREA = {
      centerX: CONFIG.DETECTION_AREA.CENTER_X,
      centerY: CONFIG.DETECTION_AREA.CENTER_Y,
      radius: CONFIG.DETECTION_AREA.RADIUS,
    };

    // 初始化 LIFF (非必需，失敗也能繼續)
    await initializeLIFF();

    // 初始化 MediaPipe
    initializeMediaPipe();

    // 初始化相機
    initializeCamera();

    updateStatus("應用程式已就緒，點擊開始檢測");
  } catch (error) {
    console.error("初始化失敗:", error);
    updateStatus("初始化失敗，請重新整理頁面");
  }
}

// 檢查瀏覽器支援
function checkBrowserSupport() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("您的瀏覽器不支援相機功能，請使用較新的瀏覽器");
    updateStatus("瀏覽器不支援相機功能");
    return false;
  }

  if (!window.MediaPipe) {
    console.warn("MediaPipe 可能未完全載入");
  }

  return true;
}

// 當頁面載入完成時初始化
document.addEventListener("DOMContentLoaded", () => {
  if (checkBrowserSupport()) {
    // 延遲初始化以確保所有資源載入完成
    setTimeout(initializeApp, 500);
  }
});

// 載入動畫
window.addEventListener("load", () => {
  // 隱藏任何載入動畫
  document.body.classList.add("loaded");
});

// 導出一些函數供外部使用 (如果需要)
window.MoonFestivalAR = {
  startDetection,
  stopDetection,
  switchCamera,
  isRunning: () => isDetectionRunning,
};

// 導出調試函數
window.checkFacesInDetectionArea = checkFacesInDetectionArea;
window.DETECTION_AREA = DETECTION_AREA;
