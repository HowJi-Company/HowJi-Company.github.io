// 全域變數
let faceDetection;
let selfieSegmentation;
let camera;
let isDetectionRunning = false;
let currentFacingMode = "user"; // 將在配置初始化後更新

// DOM 元素
const videoElement = document.querySelector(".input_video");
const bgCanvas = document.querySelector(".bg_canvas");
const maskCanvas = document.querySelector(".mask_canvas");
const canvasElement = document.querySelector(".output_canvas");
const bgCtx = bgCanvas.getContext("2d");
const maskCtx = maskCanvas.getContext("2d");
const canvasCtx = canvasElement.getContext("2d");
const moonEffect = document.getElementById("moonEffect");

// 背景圖片元素
const backgroundImage1 = document.getElementById("backgroundImage1");
const backgroundImage2 = document.getElementById("backgroundImage2");

// 背景控制元素
const enableSegmentationCheckbox =
  document.getElementById("enableSegmentation");
const backgroundSelect = document.getElementById("backgroundSelect");
const effectIntensitySlider = document.getElementById("effectIntensity");
const intensityValueSpan = document.getElementById("intensityValue");
const showMaskCheckbox = document.getElementById("showMask");

// 背景特效變數
let currentBackground = "original";
let effectIntensity = 0.5;
let animationTime = 0;

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

  try {
    // 檢查 MediaPipe 是否正確載入
    if (typeof FaceDetection === "undefined") {
      throw new Error("FaceDetection 未載入，請檢查 MediaPipe 腳本");
    }

    // 初始化人臉檢測
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

    // 初始化人物分割
    if (CONFIG.SEGMENTATION.ENABLED) {
      if (typeof SelfieSegmentation === "undefined") {
        console.warn("SelfieSegmentation 未載入，分割功能將被停用");
        CONFIG.SEGMENTATION.ENABLED = false;
      } else {
        selfieSegmentation = new SelfieSegmentation({
          locateFile: (file) => {
            return `${CONFIG.ADVANCED.MEDIAPIPE_SEGMENTATION_URL}${file}`;
          },
        });

        selfieSegmentation.setOptions({
          modelSelection: CONFIG.SEGMENTATION.MODEL_SELECTION,
          selfieMode: CONFIG.SEGMENTATION.SELFIE_MODE,
        });

        selfieSegmentation.onResults(onSegmentationResults);
      }
    }

    updateStatus("MediaPipe 初始化完成");
  } catch (error) {
    console.error("MediaPipe 初始化錯誤:", error);
    updateStatus("MediaPipe 初始化失敗: " + error.message);
  }
}

// 相機初始化
function initializeCamera() {
  try {
    // 檢查 Camera 是否可用
    if (typeof Camera === "undefined") {
      throw new Error("Camera 類別未載入，請檢查 MediaPipe camera_utils 腳本");
    }

    if (!videoElement) {
      throw new Error("視頻元素未找到");
    }

    camera = new Camera(videoElement, {
      onFrame: async () => {
        if (isDetectionRunning) {
          try {
            // 同時發送到人臉檢測和人物分割
            const promises = [faceDetection.send({ image: videoElement })];

            if (
              CONFIG.SEGMENTATION.ENABLED &&
              selfieSegmentation &&
              enableSegmentationCheckbox &&
              enableSegmentationCheckbox.checked
            ) {
              promises.push(selfieSegmentation.send({ image: videoElement }));
            }

            await Promise.all(promises);
          } catch (frameError) {
            console.error("處理幀時錯誤:", frameError);
          }
        }
      },
      width: CONFIG.CAMERA.DEFAULT_WIDTH,
      height: CONFIG.CAMERA.DEFAULT_HEIGHT,
      facingMode: currentFacingMode,
    });

    console.log("✅ 相機初始化成功");
  } catch (error) {
    console.error("❌ 相機初始化錯誤:", error);
    updateStatus("相機初始化失敗: " + error.message);
  }
}

// 全域變數用於存儲最新的結果
let latestFaceResults = null;
let latestSegmentationResults = null;

// 分割結果處理函數
function onSegmentationResults(results) {
  latestSegmentationResults = results;
  // 如果有人臉檢測結果，則進行合成
  if (latestFaceResults) {
    processAndRender();
  }
}

// 人臉檢測結果處理函數 (修改原有的 onResults)
function onResults(results) {
  latestFaceResults = results;

  // 如果啟用分割且有分割結果，則進行合成
  if (
    CONFIG.SEGMENTATION.ENABLED &&
    enableSegmentationCheckbox &&
    enableSegmentationCheckbox.checked &&
    latestSegmentationResults
  ) {
    console.log("✅ 使用分割合成模式");
    processAndRender();
  } else {
    console.log("⚪ 使用原始渲染模式");
    // 否則使用原有的渲染邏輯
    renderWithoutSegmentation(results);
  }
}

// 合成和渲染函數
function processAndRender() {
  if (!latestFaceResults || !latestSegmentationResults) return;

  const faceResults = latestFaceResults;
  const segmentationResults = latestSegmentationResults;

  console.log("🎨 開始分割合成渲染...");

  // 同步所有 canvas 大小
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;

  [bgCanvas, maskCanvas, canvasElement].forEach((canvas) => {
    canvas.width = width;
    canvas.height = height;
  });

  // 1. 繪製背景
  renderBackground(width, height);

  // 2. 處理分割蒙版
  if (showMaskCheckbox && showMaskCheckbox.checked) {
    maskCanvas.style.display = "block";
    maskCtx.clearRect(0, 0, width, height);
    maskCtx.drawImage(
      segmentationResults.segmentationMask,
      0,
      0,
      width,
      height
    );
  } else {
    maskCanvas.style.display = "none";
  }

  // 3. 合成最終圖像
  canvasCtx.clearRect(0, 0, width, height);

  // 整個合成過程都在翻轉座標系中進行，保持一致性
  canvasCtx.save();
  canvasCtx.translate(width, 0);
  canvasCtx.scale(-1, 1);

  // 第一步：繪製背景（背景不翻轉，所以需要反向處理）
  canvasCtx.save();
  canvasCtx.scale(-1, 1);
  canvasCtx.translate(-width, 0);
  canvasCtx.drawImage(bgCanvas, 0, 0);
  canvasCtx.restore();

  // 第二步：直接在翻轉座標系中繪製人物和蒙版
  // 創建臨時 canvas 處理人物蒙版
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");

  // 在臨時 canvas 上繪製人物（不翻轉，因為我們要的就是翻轉效果）
  tempCtx.drawImage(faceResults.image, 0, 0, width, height);

  // 使用翻轉的蒙版裁剪人物（修復 X 方向翻轉不一致）
  tempCtx.globalCompositeOperation = "destination-in";
  tempCtx.save();
  tempCtx.translate(width, 0);
  tempCtx.scale(-1, 1);
  tempCtx.drawImage(segmentationResults.segmentationMask, 0, 0, width, height);
  tempCtx.restore();

  // 將裁剪後的人物繪製到主 canvas 上（在翻轉座標系中）
  canvasCtx.drawImage(tempCanvas, 0, 0);

  // 第三步：繪製人臉檢測結果（已經在翻轉座標系中）
  renderFaceDetections(faceResults);

  canvasCtx.restore();

  // 5. 觸發特效
  const faces = faceResults.detections || [];
  const facesInArea = checkFacesInDetectionArea(faces);
  updateFaceCount(faces.length);
  updateFacesInArea(facesInArea.length);
  triggerMoonEffect(facesInArea.length >= CONFIG.DETECTION_AREA.REQUIRED_FACES);

  // 6. 更新調試信息
  if (typeof window.updateDebugResults === "function") {
    window.updateDebugResults(faces, facesInArea);
  }
}

// 不使用分割的渲染函數 (原有邏輯)
function renderWithoutSegmentation(results) {
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

// 背景渲染函數
function renderBackground(width, height) {
  bgCtx.clearRect(0, 0, width, height);
  animationTime += 0.016; // 約 60fps

  switch (currentBackground) {
    case "original":
      // 不繪製背景，保持透明
      break;

    case "gradient1":
      if (backgroundImage1.complete) {
        bgCtx.drawImage(backgroundImage1, 0, 0, width, height);
      }
      break;

    case "gradient2":
      if (backgroundImage2.complete) {
        bgCtx.drawImage(backgroundImage2, 0, 0, width, height);
      }
      break;

    case "waves":
      renderWaveBackground(width, height);
      break;

    case "frequency":
      renderFrequencyBackground(width, height);
      break;
  }
}

// 波紋背景效果
function renderWaveBackground(width, height) {
  const config = CONFIG.BACKGROUND_EFFECTS.WAVE_EFFECT;

  // 創建漸層背景
  const gradient = bgCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#1a2332");
  gradient.addColorStop(0.5, "#2d3a50");
  gradient.addColorStop(1, "#0f1419");
  bgCtx.fillStyle = gradient;
  bgCtx.fillRect(0, 0, width, height);

  // 繪製波紋
  bgCtx.strokeStyle = `rgba(100, 200, 255, ${effectIntensity * 0.5})`;
  bgCtx.lineWidth = 2;

  for (let i = 0; i < 8; i++) {
    bgCtx.beginPath();
    for (let x = 0; x < width; x += 5) {
      const offset = i * 50;
      const y =
        height / 2 +
        Math.sin(
          (x + offset) * config.FREQUENCY + animationTime * config.SPEED
        ) *
          config.AMPLITUDE *
          effectIntensity;

      if (x === 0) {
        bgCtx.moveTo(x, y);
      } else {
        bgCtx.lineTo(x, y);
      }
    }
    bgCtx.stroke();
  }
}

// 頻率背景效果
function renderFrequencyBackground(width, height) {
  const config = CONFIG.BACKGROUND_EFFECTS.FREQUENCY_EFFECT;

  // 暗色背景
  bgCtx.fillStyle = "#0a0a0a";
  bgCtx.fillRect(0, 0, width, height);

  // 繪製頻率條
  const barWidth = width / config.BANDS;

  for (let i = 0; i < config.BANDS; i++) {
    const x = i * barWidth;
    const barHeight =
      (Math.sin(animationTime * 0.1 + i * 0.2) * 0.5 + 0.5) *
      height *
      config.HEIGHT_SCALE *
      effectIntensity;

    // 動態顏色
    const hue = (animationTime * config.COLOR_SHIFT + i * 10) % 360;
    bgCtx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;

    bgCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
  }
}

// 人臉檢測結果渲染函數
function renderFaceDetections(faceResults) {
  const faces = faceResults.detections || [];
  const facesInArea = checkFacesInDetectionArea(faces);

  // 繪製所有人臉邊框
  canvasCtx.strokeStyle = "rgba(255,255,255,0.8)";
  canvasCtx.lineWidth = 2;
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

  // 繪製區域內人臉的特殊標記
  canvasCtx.strokeStyle = "#ffeb3b";
  canvasCtx.lineWidth = 4;
  canvasCtx.fillStyle = "#ffeb3b";
  canvasCtx.font = "20px sans-serif";
  canvasCtx.textAlign = "center";

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

  // 繪製檢測區域圓圈
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
    console.log("🚀 開始初始化應用程式...");
    updateStatus("正在初始化應用程式...");

    // 首先初始化配置
    console.log("📋 初始化配置...");
    if (!initializeConfig()) {
      console.error("❌ 配置初始化失敗");
      updateStatus("配置初始化失敗");
      return;
    }
    console.log("✅ 配置初始化成功");

    // 從配置更新全域變數
    currentFacingMode = CONFIG.CAMERA.DEFAULT_FACING_MODE;
    DETECTION_AREA = {
      centerX: CONFIG.DETECTION_AREA.CENTER_X,
      centerY: CONFIG.DETECTION_AREA.CENTER_Y,
      radius: CONFIG.DETECTION_AREA.RADIUS,
    };
    console.log("✅ 全域變數設定完成");

    // 初始化 LIFF (非必需，失敗也能繼續)
    console.log("📱 初始化 LIFF...");
    await initializeLIFF();

    // 初始化 MediaPipe
    console.log("🎯 初始化 MediaPipe...");
    initializeMediaPipe();

    // 初始化相機
    console.log("📷 初始化相機...");
    initializeCamera();

    console.log("🎉 應用程式初始化完成");
    updateStatus("應用程式已就緒，點擊開始檢測");
  } catch (error) {
    console.error("❌ 初始化失敗:", error);
    updateStatus("初始化失敗：" + error.message);
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
  console.log("📄 DOM 載入完成");

  // 初始化背景控制
  initializeBackgroundControlsOnLoad();

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

// 背景控制事件監聽器
function initializeBackgroundControls() {
  // 背景選擇變化
  if (backgroundSelect) {
    backgroundSelect.addEventListener("change", (e) => {
      currentBackground = e.target.value;
      console.log("背景切換到:", currentBackground);
    });
  }

  // 特效強度變化
  if (effectIntensitySlider && intensityValueSpan) {
    effectIntensitySlider.addEventListener("input", (e) => {
      effectIntensity = e.target.value / 100;
      intensityValueSpan.textContent = e.target.value + "%";
    });
  }

  // 顯示蒙版切換
  if (showMaskCheckbox) {
    showMaskCheckbox.addEventListener("change", (e) => {
      console.log("蒙版顯示:", e.target.checked);
    });
  }

  // 分割啟用切換
  if (enableSegmentationCheckbox) {
    enableSegmentationCheckbox.addEventListener("change", (e) => {
      console.log("分割功能:", e.target.checked ? "啟用" : "停用");
      // 重置結果以觸發重新渲染
      if (!e.target.checked) {
        latestSegmentationResults = null;
      }
    });
  }
}

// 在頁面載入時初始化背景控制
function initializeBackgroundControlsOnLoad() {
  console.log("🎛️ 初始化背景控制...");

  // 延遲一點確保 DOM 完全載入
  setTimeout(() => {
    try {
      initializeBackgroundControls();

      // 初始化預設值
      if (backgroundSelect) {
        currentBackground = backgroundSelect.value;
        console.log("✅ 背景選擇器已初始化:", currentBackground);
      } else {
        console.warn("⚠️ 背景選擇器元素未找到");
      }

      if (effectIntensitySlider && intensityValueSpan) {
        effectIntensity = effectIntensitySlider.value / 100;
        intensityValueSpan.textContent = effectIntensitySlider.value + "%";
        console.log("✅ 特效強度滑桿已初始化:", effectIntensity);
      } else {
        console.warn("⚠️ 特效強度控制元素未找到");
      }

      console.log("✅ 背景控制初始化完成");
    } catch (error) {
      console.error("❌ 背景控制初始化錯誤:", error);
    }
  }, 200);
}

// 導出調試函數
window.checkFacesInDetectionArea = checkFacesInDetectionArea;
window.DETECTION_AREA = DETECTION_AREA;

// 導出背景控制函數
window.setCurrentBackground = (background) => {
  currentBackground = background;
  if (backgroundSelect) {
    backgroundSelect.value = background;
  }
};

window.setEffectIntensity = (intensity) => {
  effectIntensity = intensity;
  if (effectIntensitySlider && intensityValueSpan) {
    effectIntensitySlider.value = intensity * 100;
    intensityValueSpan.textContent = Math.round(intensity * 100) + "%";
  }
};
