// ============================================================================
// MediaPipe Tasks 版人像去背（ImageSegmenter + FaceDetector）完整範例
// - 使用 ImageSegmenter(SelfieSegmenter) 產生人像信心蒙版
// - 內建：時間平滑(EMA) + 邊緣羽化(blur) + 閾值，可明顯改善邊緣抖動
// - 可選：FaceDetector 計數 + 區域觸發（延續原專案邏輯）
// ============================================================================

// ------------------------------- 基本設定 ----------------------------------
// 月亮節 AR 應用配置文件（由使用者提供並整合）
// 請根據您的需求修改以下設定

const CONFIG = {
  // LIFF 功能已停用（LIFF 相關設定已從此檔移除，若未來需要可放回 window.APP_CONFIG 或重新加入）

  // 人臉檢測設定
  FACE_DETECTION: {
    // MediaPipe 模型類型
    // 'short': 速度快，適合行動裝置，檢測距離較短
    // 'full': 精度高，檢測距離較遠，但耗用較多資源
    MODEL: "short",

    // 最小檢測信心度 (0.0 - 1.0)
    // 數值越高越嚴格，越低越寬鬆
    MIN_DETECTION_CONFIDENCE: 0.5,

    // 最大檢測人臉數量
    MAX_FACES: 10,
  },

  // 人物分割設定 (Selfie Segmentation)
  SEGMENTATION: {
    // 是否啟用人物分割
    ENABLED: true,

    // 模型選擇
    // 0: 通用模型，適合各種場景
    // 1: 風景模型，適合人物在風景中的場景
    MODEL_SELECTION: 1,

    // 自拍模式 (針對前鏡頭優化)
    SELFIE_MODE: true,

    // 分割閾值 (0.0 - 1.0)
    // 數值越高，分割越嚴格
    SEGMENTATION_THRESHOLD: 0.1,
  },

  // 檢測區域設定
  DETECTION_AREA: {
    // 圓形區域中心 X 座標 (螢幕比例 0.0 - 1.0)
    CENTER_X: 0.5,

    // 圓形區域中心 Y 座標 (螢幕比例 0.0 - 1.0)
    CENTER_Y: 0.5,

    // 圓形區域半徑 (相對於螢幕寬度的比例) - 調整為更大
    RADIUS: 0.45,

    // 觸發特效所需的人臉數量
    REQUIRED_FACES: 2,
  },

  // 相機設定
  CAMERA: {
    // 預設視頻解析度
    DEFAULT_WIDTH: 640,
    DEFAULT_HEIGHT: 480,

    // 預設鏡頭模式
    // 'user': 前鏡頭 (自拍)
    // 'environment': 後鏡頭
    DEFAULT_FACING_MODE: "user",

    // 幀率設定 (FPS)
    FRAME_RATE: 30,
  },

  // UI 設定
  UI: {
    // 狀態更新間隔 (毫秒)
    STATUS_UPDATE_INTERVAL: 100,

    // 是否顯示除錯資訊
    SHOW_DEBUG_INFO: true,

    // 是否顯示 FPS 計數器
    SHOW_FPS: false,

    // 語言設定
    LANGUAGE: "zh-TW", // 'zh-TW', 'zh-CN', 'en', 'ja'
  },

  // 特效設定
  EFFECTS: {
    // 月亮特效持續時間 (毫秒)
    MOON_EFFECT_DURATION: 3000,

    // 特效淡入淡出時間 (毫秒)
    FADE_DURATION: 800,

    // 是否啟用聲音效果 (需要額外實作)
    ENABLE_SOUND: false,

    // 月亮大小調整 (1.0 為預設大小)
    MOON_SIZE_SCALE: 1.0,

    // 星星數量
    STAR_COUNT: 5,

    // 閃爍效果數量
    SPARKLE_COUNT: 3,
  },

  // 背景特效設定
  BACKGROUND_EFFECTS: {
    // 預設背景類型
    DEFAULT_BACKGROUND: "original",

    // 波紋效果設定
    WAVE_EFFECT: {
      AMPLITUDE: 10, // 波紋振幅
      FREQUENCY: 0.02, // 波紋頻率
      SPEED: 0.05, // 波紋速度
    },

    // 頻率效果設定
    FREQUENCY_EFFECT: {
      BANDS: 32, // 頻率條數量
      HEIGHT_SCALE: 0.8, // 高度縮放
      COLOR_SHIFT: 0.01, // 顏色變化速度
    },

    // 特效強度 (0.0 - 1.0)
    EFFECT_INTENSITY: 0.5,

    // 背景混合模式
    BLEND_MODE: "source-over",
  },

  // 效能設定
  PERFORMANCE: {
    // 是否啟用效能監控
    ENABLE_MONITORING: false,

    // 最大允許的延遲 (毫秒)
    MAX_LATENCY: 100,

    // 低效能模式 (減少特效複雜度)
    LOW_PERFORMANCE_MODE: false,

    // 自動偵測裝置效能並調整設定
    AUTO_ADJUST_PERFORMANCE: true,
  },

  // 除錯設定
  DEBUG: {
    // 是否在 console 顯示詳細日誌
    VERBOSE_LOGGING: false,

    // 是否顯示檢測區域邊框
    SHOW_DETECTION_AREA: true,

    // 是否顯示人臉邊框
    SHOW_FACE_BOXES: true,

    // 是否顯示檢測點
    SHOW_FACE_LANDMARKS: false,

    // 是否儲存檢測結果到 localStorage
    SAVE_DETECTION_RESULTS: false,
  },

  // 進階設定
  ADVANCED: {
    // MediaPipe 資源載入 URL
    MEDIAPIPE_BASE_URL:
      "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/",
    MEDIAPIPE_SEGMENTATION_URL:
      "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/",

    // 是否使用 Web Workers (實驗性功能)
    USE_WEB_WORKERS: false,

    // 記憶體限制 (MB)
    MEMORY_LIMIT: 512,

    // 是否啟用錯誤回報
    ENABLE_ERROR_REPORTING: true,
  },
};

// 根據裝置類型自動調整設定
function autoAdjustConfig() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isLowEnd = navigator.hardwareConcurrency <= 2;

  if (isMobile) {
    // 行動裝置優化
    CONFIG.CAMERA.DEFAULT_WIDTH = 480;
    CONFIG.CAMERA.DEFAULT_HEIGHT = 360;
    CONFIG.FACE_DETECTION.MODEL = "short";
    CONFIG.EFFECTS.STAR_COUNT = 3;
    CONFIG.EFFECTS.SPARKLE_COUNT = 2;
    // 行動裝置上稍微調整檢測區域，但保持較大的範圍
    CONFIG.DETECTION_AREA.RADIUS = Math.max(
      0.4,
      CONFIG.DETECTION_AREA.RADIUS * 0.9
    );
  }

  if (isLowEnd) {
    // 低階裝置優化
    CONFIG.PERFORMANCE.LOW_PERFORMANCE_MODE = true;
    CONFIG.FACE_DETECTION.MIN_DETECTION_CONFIDENCE = 0.6;
    CONFIG.CAMERA.FRAME_RATE = 20;
    CONFIG.EFFECTS.MOON_SIZE_SCALE = 0.8;
  }
}

// 驗證配置的有效性
function validateConfig() {
  const errors = [];

  // 檢查數值範圍
  if (
    CONFIG.FACE_DETECTION.MIN_DETECTION_CONFIDENCE < 0 ||
    CONFIG.FACE_DETECTION.MIN_DETECTION_CONFIDENCE > 1
  ) {
    errors.push("MIN_DETECTION_CONFIDENCE 必須在 0.0 - 1.0 之間");
  }

  if (CONFIG.DETECTION_AREA.RADIUS <= 0 || CONFIG.DETECTION_AREA.RADIUS > 1) {
    errors.push("DETECTION_AREA.RADIUS 必須在 0.0 - 1.0 之間");
  }

  // 檢查必要的瀏覽器功能
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errors.push("瀏覽器不支援相機功能");
  }

  return errors;
}

// 載入自訂配置 (如果存在)
function loadCustomConfig() {
  try {
    const customConfig = localStorage.getItem("moonFestivalAR_config");
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      // 合併自訂配置
      Object.assign(CONFIG, parsed);
      console.log("已載入自訂配置");
    }
  } catch (error) {
    console.warn("載入自訂配置失敗:", error);
  }
}

// 儲存配置到 localStorage
function saveConfig() {
  try {
    localStorage.setItem("moonFestivalAR_config", JSON.stringify(CONFIG));
    console.log("配置已儲存");
  } catch (error) {
    console.warn("儲存配置失敗:", error);
  }
}

// 重設為預設配置
function resetConfig() {
  localStorage.removeItem("moonFestivalAR_config");
  location.reload(); // 重新載入頁面以應用預設配置
}

// 初始化配置
function initializeConfig() {
  // 合併來自 window.APP_CONFIG（若有），這樣在外部掛載設定時可向後相容
  try {
    if (window.APP_CONFIG && typeof window.APP_CONFIG === "object") {
      const app = window.APP_CONFIG;
      if (app.camera) {
        CONFIG.CAMERA.DEFAULT_WIDTH =
          app.camera.width ?? CONFIG.CAMERA.DEFAULT_WIDTH;
        CONFIG.CAMERA.DEFAULT_HEIGHT =
          app.camera.height ?? CONFIG.CAMERA.DEFAULT_HEIGHT;
        CONFIG.CAMERA.DEFAULT_FACING_MODE =
          app.camera.facing ?? CONFIG.CAMERA.DEFAULT_FACING_MODE;
      }
      if (app.segmenter) {
        app.segmenter.useGPU !== undefined &&
          ((CONFIG.SEGMENTER = CONFIG.SEGMENTER || {}),
          (CONFIG.SEGMENTER.USE_GPU = app.segmenter.useGPU));
        app.segmenter.useLandscapeModel !== undefined &&
          ((CONFIG.SEGMENTER = CONFIG.SEGMENTER || {}),
          (CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL =
            app.segmenter.useLandscapeModel));
      }
      if (app.detectionArea) {
        CONFIG.DETECTION_AREA.CENTER_X =
          app.detectionArea.centerX ?? CONFIG.DETECTION_AREA.CENTER_X;
        CONFIG.DETECTION_AREA.CENTER_Y =
          app.detectionArea.centerY ?? CONFIG.DETECTION_AREA.CENTER_Y;
        CONFIG.DETECTION_AREA.RADIUS =
          app.detectionArea.radius ?? CONFIG.DETECTION_AREA.RADIUS;
        CONFIG.DETECTION_AREA.REQUIRED_FACES =
          app.detectionArea.requiredFaces ??
          CONFIG.DETECTION_AREA.REQUIRED_FACES;
      }
      if (app.background) {
        CONFIG.BACKGROUND.TYPE = app.background.type ?? CONFIG.BACKGROUND.TYPE;
        CONFIG.BACKGROUND.INTENSITY =
          app.background.intensity ?? CONFIG.BACKGROUND.INTENSITY;
      }
    }
  } catch (err) {
    console.warn("merge APP_CONFIG failed", err);
  }

  loadCustomConfig();
  autoAdjustConfig();

  const errors = validateConfig();
  if (errors.length > 0) {
    console.error("配置驗證失敗:", errors);
    return false;
  }

  console.log("配置初始化完成", CONFIG);

  // 進行向後相容性的 mapping，將使用者配置對應到原 script 預期的欄位
  // camera
  CONFIG.CAMERA.WIDTH =
    CONFIG.CAMERA.DEFAULT_WIDTH || CONFIG.CAMERA.WIDTH || 1280;
  CONFIG.CAMERA.HEIGHT =
    CONFIG.CAMERA.DEFAULT_HEIGHT || CONFIG.CAMERA.HEIGHT || 720;
  CONFIG.CAMERA.FACING =
    CONFIG.CAMERA.DEFAULT_FACING_MODE || CONFIG.CAMERA.FACING || "user";
  // segmentation → SEGMENTER
  CONFIG.SEGMENTER = CONFIG.SEGMENTER || {};
  CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL =
    CONFIG.SEGMENTATION && CONFIG.SEGMENTATION.MODEL_SELECTION === 1
      ? true
      : CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL ?? true;
  CONFIG.SEGMENTER.USE_GPU = CONFIG.SEGMENTER.USE_GPU ?? true;
  // smoothing
  CONFIG.SMOOTHING = CONFIG.SMOOTHING || {};
  CONFIG.SMOOTHING.THRESHOLD =
    CONFIG.SMOOTHING.THRESHOLD ??
    CONFIG.SEGMENTATION?.SEGMENTATION_THRESHOLD ??
    0.38;
  CONFIG.SMOOTHING.TEMPORAL_ALPHA = CONFIG.SMOOTHING.TEMPORAL_ALPHA ?? 0.6;
  CONFIG.SMOOTHING.EDGE_FEATHER_PX = CONFIG.SMOOTHING.EDGE_FEATHER_PX ?? 3;
  // 進階：雙閾值 + Grow 預設（可依需要微調）
  CONFIG.SMOOTHING.HYS_ON =
    CONFIG.SMOOTHING.HYS_ON ?? CONFIG.SMOOTHING.THRESHOLD - 0.15;
  CONFIG.SMOOTHING.HYS_OFF =
    CONFIG.SMOOTHING.HYS_OFF ?? CONFIG.SMOOTHING.THRESHOLD + 0.15;
  CONFIG.SMOOTHING.MASK_GROW_PX = CONFIG.SMOOTHING.MASK_GROW_PX ?? 1.5;

  return true;
}

// 導出配置和相關函數
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG, initializeConfig, saveConfig, resetConfig };
} else {
  window.CONFIG = CONFIG;
  window.initializeConfig = initializeConfig;
  window.saveConfig = saveConfig;
  window.resetConfig = resetConfig;
}

// 確保有預設的背景設定（避免 CONFIG.BACKGROUND 為 undefined 導致 render 錯誤）
CONFIG.BACKGROUND = CONFIG.BACKGROUND || {
  TYPE:
    (CONFIG.BACKGROUND_EFFECTS &&
      CONFIG.BACKGROUND_EFFECTS.DEFAULT_BACKGROUND) ||
    "original",
  INTENSITY:
    (CONFIG.BACKGROUND_EFFECTS && CONFIG.BACKGROUND_EFFECTS.EFFECT_INTENSITY) ??
    0.5,
};

// ------------------------------- DOM 取得 ----------------------------------

const videoEl = document.getElementById("video");
const bgCanvas = document.getElementById("bgCanvas");
const maskCanvas = document.getElementById("maskCanvas");
const outCanvas = document.getElementById("outputCanvas");
const bgCtx = bgCanvas.getContext("2d");
const maskCtx = maskCanvas.getContext("2d");
const outCtx = outCanvas.getContext("2d");
const statusText = document.getElementById("statusText");

const startBtn = document.getElementById("startButton");
const stopBtn = document.getElementById("stopButton");
const switchBtn = document.getElementById("switchCamera");
const enableSegmentationCheckbox =
  document.getElementById("enableSegmentation");
const showMaskCheckbox = document.getElementById("showMask");
const toggleMaskBtn = document.getElementById("toggleMask");
const backgroundSelect = document.getElementById("backgroundSelect");
const effectIntensitySlider = document.getElementById("effectIntensity");
const intensityValueSpan = document.getElementById("intensityValue");
const edgeFeatherSlider = document.getElementById("edgeFeather");
const edgeFeatherVal = document.getElementById("edgeFeatherVal");
const temporalSmoothSlider = document.getElementById("temporalSmooth");
const temporalSmoothVal = document.getElementById("temporalSmoothVal");
const thresholdSlider = document.getElementById("threshold");
const thresholdVal = document.getElementById("thresholdVal");
const menuBtn = document.getElementById("menuButton");
const scrimEl = document.getElementById("scrim");
const faceCountEl = document.getElementById("faceCount");
const facesInAreaEl = document.getElementById("facesInArea");
const moonEffect = document.getElementById("moonEffect");

// ------------------------------ 全域狀態 -----------------------------------
let imageSegmenter = null; // MediaPipe Tasks：ImageSegmenter
let faceDetector = null; // MediaPipe Tasks：FaceDetector（可選）
let wasmFileset = null; // FilesetResolver
let running = false;
let stream = null;
let currentFacingMode = CONFIG.CAMERA.FACING;

// mask 狀態
let personLabelIndex = 0; // SelfieSegmenter 的「人」索引通常為 0（單一類別 person）
let lastMaskF32 = null; // EMA 緩存（Float32Array）
let lastMaskSize = { w: 0, h: 0 };
let gMaskCanvasProcessed = null; // 供跨影格沿用的已處理蒙版（放大+羽化後的 canvas）

// offscreen canvas：用於將影片以「保持比例(contain)」的方式繪製到與輸出同尺寸的暫存畫布，避免在畫布上直接拉伸導致變形
const videoDrawCanvas = document.createElement("canvas");
const videoDrawCtx = videoDrawCanvas.getContext("2d");
videoDrawCanvas.style.display = "none";
// document.body.appendChild(videoDrawCanvas); // debug 用，部署時可註解掉

// composite canvas：先把 video 與 mask 合成到此 canvas，再把結果畫到 outCanvas（避免 destination-in 影響到背景）
const compositeCanvas = document.createElement("canvas");
const compositeCtx = compositeCanvas.getContext("2d");
compositeCanvas.style.display = "none";
// document.body.appendChild(compositeCanvas); // 方便在 debug 時檢查（可移除）

// 輸出尺寸
function syncCanvasSize() {
  // 以 stage 容器的顯示尺寸為畫布像素尺寸，避免 CSS 放大導致畫面被裁切
  const stageRect = document.querySelector(".stage").getBoundingClientRect();
  const w = Math.max(1, Math.round(stageRect.width));
  const h = Math.max(1, Math.round(stageRect.height));

  [bgCanvas, maskCanvas, outCanvas, videoDrawCanvas, compositeCanvas].forEach(
    (c) => {
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
    }
  );

  lastMaskSize.w = outCanvas.width;
  lastMaskSize.h = outCanvas.height;
}

// 在視窗大小改變時重新 fit 畫布
window.addEventListener("resize", () => {
  if (running) syncCanvasSize();
});

// ------------------------------ 初始化 Tasks --------------------------------
// 保障：若 CDN 無法載入，使用動態 import(.mjs) 作為備援
async function ensureTasksVisionLoaded() {
  if (window.FilesetResolver && window.ImageSegmenter) return true;
  const urls = [
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/vision_bundle.mjs",
    "https://unpkg.com/@mediapipe/tasks-vision@0.10.7/vision_bundle.mjs",
  ];
  for (const url of urls) {
    try {
      const mod = await import(url);
      if (mod.FilesetResolver) window.FilesetResolver = mod.FilesetResolver;
      if (mod.ImageSegmenter) window.ImageSegmenter = mod.ImageSegmenter;
      if (mod.FaceDetector) window.FaceDetector = mod.FaceDetector;
      window.__mp_tasks_vision_module = mod;
      console.log("[OK] tasks-vision loaded via dynamic import from", url);
      return true;
    } catch (err) {
      console.warn("[WARN] dynamic import failed for", url, err);
    }
  }
  throw new Error("無法從 CDN 載入 @mediapipe/tasks-vision（.mjs）");
}
// ------------------------------ 初始化 Tasks --------------------------------
// 向後相容防護：確保必要的模型路徑與 wasm base 存在，避免因為 CONFIG 被覆寫或缺失導致錯誤
if (!CONFIG.MODELS) {
  CONFIG.MODELS = {
    SELFIE_SEGMENTER_LANDSCAPE:
      "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite",
    SELFIE_SEGMENTER_SQUARE:
      "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
    FACE_DETECTOR:
      "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
  };
}
CONFIG.WASM_BASE =
  CONFIG.WASM_BASE ||
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm";
CONFIG.SEGMENTER = CONFIG.SEGMENTER || {};
if (typeof CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL === "undefined")
  CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL =
    CONFIG.SEGMENTATION && CONFIG.SEGMENTATION.MODEL_SELECTION === 1
      ? true
      : true;
CONFIG.SEGMENTER.USE_GPU = CONFIG.SEGMENTER.USE_GPU ?? true;

async function initTasks() {
  if (!wasmFileset) {
    wasmFileset = await FilesetResolver.forVisionTasks(CONFIG.WASM_BASE);
  }
  // 依輸出比例自動選擇 square(細節較好) 或 landscape(較省)
  try {
    const rect = document
      .querySelector(".stage")
      ?.getBoundingClientRect?.() || {
      width: outCanvas.width,
      height: outCanvas.height,
    };
    CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL =
      (rect.width || 1) >= (rect.height || 1);
  } catch (e) {
    /* ignore */
  }

  // 建立 ImageSegmenter（優先 GPU，失敗回退 CPU）
  const baseOptions = {
    modelAssetPath: CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL
      ? CONFIG.MODELS.SELFIE_SEGMENTER_LANDSCAPE
      : CONFIG.MODELS.SELFIE_SEGMENTER_SQUARE,
    delegate: CONFIG.SEGMENTER.USE_GPU ? "GPU" : "CPU",
  };
  try {
    imageSegmenter = await ImageSegmenter.createFromOptions(wasmFileset, {
      baseOptions,
      runningMode: "VIDEO",
      outputCategoryMask: false, // 我們用連續值做平滑
      outputConfidenceMasks: true,
    });
  } catch (e) {
    console.warn("[Segmenter] GPU 失敗，改用 CPU：", e);
    imageSegmenter = await ImageSegmenter.createFromOptions(wasmFileset, {
      baseOptions: { ...baseOptions, delegate: "CPU" },
      runningMode: "VIDEO",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
  }

  // 建立 FaceDetector（可選）
  try {
    faceDetector = await FaceDetector.createFromOptions(wasmFileset, {
      baseOptions: {
        modelAssetPath: CONFIG.MODELS.FACE_DETECTOR,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      minDetectionConfidence: 0.6,
      minSuppressionThreshold: 0.3,
    });
  } catch (e) {
    console.warn("[FaceDetector] GPU 失敗，改用 CPU：", e);
    faceDetector = await FaceDetector.createFromOptions(wasmFileset, {
      baseOptions: {
        modelAssetPath: CONFIG.MODELS.FACE_DETECTOR,
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      minDetectionConfidence: 0.6,
      minSuppressionThreshold: 0.3,
    });
  }
}

// ------------------------------ 相機控制 ------------------------------------
async function startCamera() {
  try {
    if (stream) stream.getTracks().forEach((t) => t.stop());

    const constraints = {
      audio: false,
      video: {
        facingMode: currentFacingMode,
        width: { ideal: CONFIG.CAMERA.WIDTH },
        height: { ideal: CONFIG.CAMERA.HEIGHT },
      },
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoEl.srcObject = stream;

    // 為避免 autoplay 被阻擋：設定 playsinline + muted
    try {
      videoEl.setAttribute("playsinline", "");
      videoEl.muted = true;
      videoEl.autoplay = true;
    } catch (e) {
      console.warn("set video attributes failed", e);
    }

    // 先等 metadata，確保 videoWidth/videoHeight 可用
    await new Promise((resolve) => {
      if (videoEl.readyState >= 1 && videoEl.videoWidth && videoEl.videoHeight)
        return resolve();
      videoEl.onloadedmetadata = () => resolve();
      // safeguard: timeout after 1500ms
      setTimeout(resolve, 1500);
    });

    // 再呼叫 play（捕捉可能的拒絕）
    try {
      await videoEl.play();
    } catch (err) {
      console.warn("video.play() failed or was rejected:", err);
    }

    // 同步畫布至 stage 尺寸
    syncCanvasSize();
    console.log(
      "相機啟動，video size:",
      videoEl.videoWidth,
      videoEl.videoHeight
    );
  } catch (err) {
    console.error("startCamera failed:", err);
    statusText.textContent = "相機啟動失敗";
    throw err;
  }
}

async function switchCamera() {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  await startCamera();
}

// ------------------------------ 背景繪製 ------------------------------------
let animT = 0;

// 單一背景繪製函式：把背景畫到指定 ctx，避免多畫布不同步造成閃爍
function renderBackgroundTo(ctx, w, h) {
  const bgType =
    (CONFIG.BACKGROUND && CONFIG.BACKGROUND.TYPE) ||
    (CONFIG.BACKGROUND_EFFECTS &&
      CONFIG.BACKGROUND_EFFECTS.DEFAULT_BACKGROUND) ||
    "original";
  const intensity =
    CONFIG.BACKGROUND && typeof CONFIG.BACKGROUND.INTENSITY === "number"
      ? CONFIG.BACKGROUND.INTENSITY
      : (CONFIG.BACKGROUND_EFFECTS &&
          CONFIG.BACKGROUND_EFFECTS.EFFECT_INTENSITY) ??
        0.5;

  ctx.clearRect(0, 0, w, h);
  animT += 0.016;

  switch (bgType) {
    case "original":
      // 保持透明
      break;
    case "waves": {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#1a2332");
      grad.addColorStop(0.5, "#2d3a50");
      grad.addColorStop(1, "#0f1419");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = `rgba(100,200,255,${intensity * 0.6})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        for (let x = 0; x < w; x += 5) {
          const off = i * 50;
          const y =
            h / 2 + Math.sin((x + off) * 0.012 + animT * 1.2) * 20 * intensity;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case "frequency": {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);
      const bands = 48;
      const bw = w / bands;
      for (let i = 0; i < bands; i++) {
        const x = i * bw;
        const bh =
          (Math.sin(animT * 2 + i * 0.2) * 0.5 + 0.5) * h * 0.5 * intensity;
        const hue = (animT * 30 + i * 10) % 360;
        ctx.fillStyle = `hsla(${hue},70%,60%,0.8)`;
        ctx.fillRect(x, h - bh, bw - 1, bh);
      }
      break;
    }
  }
}

// 兼容舊呼叫點：仍保留 renderBackground，實際轉呼叫到 bgCtx
function renderBackground(w, h) {
  renderBackgroundTo(bgCtx, w, h);
}

// ------------------------------ 蒙版處理 ------------------------------------
const maskBaseCanvas = document.createElement("canvas");
const maskBaseCtx = maskBaseCanvas.getContext("2d");
const maskUpscaleCanvas = document.createElement("canvas");
const maskUpscaleCtx = maskUpscaleCanvas.getContext("2d");
const maskSoftCanvas = document.createElement("canvas");
const maskSoftCtx = maskSoftCanvas.getContext("2d");

function emaUpdate(srcF32, w, h) {
  const N = w * h;
  if (!lastMaskF32 || lastMaskSize.w !== w || lastMaskSize.h !== h) {
    lastMaskF32 = new Float32Array(N);
    lastMaskF32.set(srcF32);
    lastMaskSize = { w, h };
    return lastMaskF32;
  }
  const a = CONFIG.SMOOTHING.TEMPORAL_ALPHA; // 0..0.95
  for (let i = 0; i < N; i++) {
    lastMaskF32[i] = a * lastMaskF32[i] + (1 - a) * srcF32[i];
  }
  return lastMaskF32;
}

function buildAlphaImage(maskF32, w, h) {
  // 簡化版：軟閾值 + 放大 + 邊緣羽化（回到穩定版本）
  const T = CONFIG.SMOOTHING.THRESHOLD; // 0..1
  const N = w * h;
  const img = new ImageData(w, h);
  // 直接把 >=T 的值以 0..255 輸出，<T 緩和成 0（可視為軟二值）
  for (let i = 0, j = 0; i < N; i++, j += 4) {
    const v = maskF32[i];
    const a = v >= T ? Math.min(255, Math.round(v * 255)) : 0;
    img.data[j] = 0;
    img.data[j + 1] = 0;
    img.data[j + 2] = 0;
    img.data[j + 3] = a;
  }
  maskBaseCanvas.width = w;
  maskBaseCanvas.height = h;
  maskBaseCtx.putImageData(img, 0, 0);

  // 放大到輸出大小
  const VW = outCanvas.width,
    VH = outCanvas.height;
  maskUpscaleCanvas.width = VW;
  maskUpscaleCanvas.height = VH;
  maskUpscaleCtx.clearRect(0, 0, VW, VH);
  maskUpscaleCtx.imageSmoothingEnabled = true;
  maskUpscaleCtx.imageSmoothingQuality = "high";
  maskUpscaleCtx.drawImage(maskBaseCanvas, 0, 0, VW, VH);

  // 邊緣羽化
  const blurPx = CONFIG.SMOOTHING.EDGE_FEATHER_PX;
  maskSoftCanvas.width = VW;
  maskSoftCanvas.height = VH;
  maskSoftCtx.clearRect(0, 0, VW, VH);
  maskSoftCtx.filter = blurPx > 0 ? `blur(${blurPx}px)` : "none";
  maskSoftCtx.drawImage(maskUpscaleCanvas, 0, 0);
  maskSoftCtx.filter = "none";

  return maskSoftCanvas;
}

// ------------------------------ 臉部檢測/區域 -------------------------------
function checkFacesInArea(detections) {
  const facesIn = [];
  const W = outCanvas.width,
    H = outCanvas.height;
  const cx = CONFIG.DETECTION_AREA.CENTER_X * W;
  const cy = CONFIG.DETECTION_AREA.CENTER_Y * H;
  const r = CONFIG.DETECTION_AREA.RADIUS * Math.min(W, H);

  for (const d of detections) {
    const box = d.boundingBox; // 畫素座標
    const fx = box.originX + box.width / 2;
    const fy = box.originY + box.height / 2;
    // 注意：我們最後是鏡像顯示，統計一律用未鏡像的座標即可
    const dist = Math.hypot(fx - cx, fy - cy);
    if (dist <= r) facesIn.push(d);
  }
  return facesIn;
}

function renderOverlay(detections) {
  const W = outCanvas.width,
    H = outCanvas.height;
  outCtx.save();
  // 鏡像座標系（與輸出一致）
  outCtx.translate(W, 0);
  outCtx.scale(-1, 1);

  // 全部人臉（白）
  outCtx.strokeStyle = "rgba(255,255,255,0.8)";
  outCtx.lineWidth = 2;
  for (const d of detections) {
    const { originX, originY, width, height } = d.boundingBox;
    outCtx.strokeRect(originX, originY, width, height);
  }

  // 區域 圓圈
  const cx = CONFIG.DETECTION_AREA.CENTER_X * W;
  const cy = CONFIG.DETECTION_AREA.CENTER_Y * H;
  const r = CONFIG.DETECTION_AREA.RADIUS * Math.min(W, H);
  outCtx.setLineDash([10, 5]);
  outCtx.strokeStyle = "rgba(255,255,255,0.6)";
  outCtx.lineWidth = 2;
  outCtx.beginPath();
  outCtx.arc(cx, cy, r, 0, Math.PI * 2);
  outCtx.stroke();
  outCtx.setLineDash([]);

  // 區域內人臉（黃）+ ⭐/🌙
  const facesIn = checkFacesInArea(detections);
  outCtx.strokeStyle = "#ffeb3b";
  outCtx.lineWidth = 4;
  outCtx.fillStyle = "#ffeb3b";
  outCtx.font = "20px sans-serif";
  outCtx.textAlign = "center";
  const icon =
    facesIn.length >= CONFIG.DETECTION_AREA.REQUIRED_FACES ? "🌙" : "⭐";
  for (const d of facesIn) {
    const { originX, originY, width, height } = d.boundingBox;
    outCtx.strokeRect(originX, originY, width, height);
    outCtx.fillText(icon, originX + width / 2, originY + height / 2 - 10);
  }
  outCtx.restore();

  // UI 更新
  faceCountEl.textContent = String(detections.length);
  facesInAreaEl.textContent = String(facesIn.length);
  moonEffect.classList.toggle(
    "active",
    facesIn.length >= CONFIG.DETECTION_AREA.REQUIRED_FACES
  );
}

// ------------------------------ 主渲染迴圈 ---------------------------------
let lastVideoTime = -1;
async function renderLoop() {
  if (!running) return;

  const now = performance.now();
  const W = outCanvas.width,
    H = outCanvas.height;

  // 回復舊版：背景畫在 bgCanvas（底層），outCanvas 只負責人像合成
  outCtx.clearRect(0, 0, W, H);
  renderBackground(W, H);

  // 把 video 以保持比例 (contain) 的方式繪製到暫存畫布 videoDrawCanvas（尺寸與 outCanvas 相同）
  videoDrawCtx.clearRect(0, 0, W, H);
  const vw = videoEl.videoWidth || 1;
  const vh = videoEl.videoHeight || 1;
  const scale = Math.min(W / vw, H / vh);
  const dw = Math.round(vw * scale);
  const dh = Math.round(vh * scale);
  const offsetX = Math.round((W - dw) / 2);
  const offsetY = Math.round((H - dh) / 2);
  try {
    videoDrawCtx.drawImage(videoEl, 0, 0, vw, vh, offsetX, offsetY, dw, dh);
  } catch (e) {
    // video 尚未就緒
  }

  // ======= segmentation（必要時） =======
  // 結果存到全域 gMaskCanvasProcessed，讓非新影格也能沿用上一次的蒙版
  if (imageSegmenter && enableSegmentationCheckbox.checked) {
    // 只在新幀上呼叫 segmentation（節省資源）
    if (videoEl.currentTime !== lastVideoTime) {
      lastVideoTime = videoEl.currentTime;
      try {
        // 使用 videoDrawCanvas 做為輸入（與繪製位置一致）
        const result = imageSegmenter.segmentForVideo
          ? imageSegmenter.segmentForVideo(videoDrawCanvas, now)
          : await imageSegmenter.segment(videoDrawCanvas);
        if (result) {
          let maskF32 = null;
          let mw = 0,
            mh = 0;
          if (result.confidenceMasks && result.confidenceMasks.length > 0) {
            // 取 person 類別（通常為索引 0）；若索引越界則回退到 0
            const idx =
              personLabelIndex < result.confidenceMasks.length
                ? personLabelIndex
                : 0;
            const cm = result.confidenceMasks[idx];
            if (cm && typeof cm.getAsFloat32Array === "function") {
              const src = cm.getAsFloat32Array();
              // 重要：複製一份數據再釋放 MPMask，避免 TypedArray 指向被回收的 WASM 記憶體而造成閃爍
              maskF32 = new Float32Array(src.length);
              maskF32.set(src);
              mw = cm.width;
              mh = cm.height;
            }
            // 釋放所有 mask 實例（包含非使用的），避免資源外洩與下一幀抖動
            for (const m of result.confidenceMasks) {
              if (m && typeof m.close === "function")
                try {
                  m.close();
                } catch (e) {}
            }
          } else if (result.categoryMask) {
            // category mask -> convert to float32（1=person，其它=背景）
            const cat = result.categoryMask;
            if (cat && typeof cat.getAsUint8Array === "function") {
              const u8 = cat.getAsUint8Array();
              maskF32 = new Float32Array(u8.length);
              mw = cat.width;
              mh = cat.height;
              const personIdx = personLabelIndex; // 預設 0
              for (let i = 0; i < u8.length; i++)
                maskF32[i] = u8[i] === personIdx ? 1 : 0;
              if (cat && typeof cat.close === "function") cat.close();
            }
          }

          if (maskF32 && mw > 0 && mh > 0) {
            // 時間平滑 + build alpha -> 回傳一個可以直接 drawImage 的 canvas
            const sm = emaUpdate(maskF32, mw, mh);
            gMaskCanvasProcessed = buildAlphaImage(sm, mw, mh);
          }
        }
      } catch (segErr) {
        console.warn("segmentForVideo error:", segErr);
        // 若 segmentation 失敗，保留上一張 gMaskCanvasProcessed（不要立刻清空避免閃爍）
      }
    }
  } else {
    // 去背未啟用時，不套用蒙版
    gMaskCanvasProcessed = null;
  }

  // ======= composite（在離屏 compositeCanvas 上做 destination-in，避免影響背景） =======
  compositeCtx.clearRect(0, 0, W, H);
  compositeCtx.save();
  // composite 使用非鏡像座標系，把 video 畫上去
  compositeCtx.drawImage(videoDrawCanvas, 0, 0, W, H);

  if (gMaskCanvasProcessed) {
    compositeCtx.globalCompositeOperation = "destination-in";
    compositeCtx.drawImage(gMaskCanvasProcessed, 0, 0, W, H);
    compositeCtx.globalCompositeOperation = "source-over";
  }
  compositeCtx.restore();

  // 最後把 compositeCanvas（已經只含人物的畫面，若未做 segmentation 則為整張影片）以鏡像方式畫到 outCtx（在背景之上）
  outCtx.save();
  outCtx.translate(W, 0);
  outCtx.scale(-1, 1);
  outCtx.drawImage(compositeCanvas, 0, 0, W, H);
  outCtx.restore();

  // 顯示蒙版預覽（若勾選）
  if (gMaskCanvasProcessed) {
    maskCtx.clearRect(0, 0, W, H);
    if (showMaskCheckbox.checked) {
      maskCtx.globalAlpha = 0.9;
      maskCtx.drawImage(gMaskCanvasProcessed, 0, 0, W, H);
      maskCtx.globalAlpha = 1.0; // 還原，避免下一幀沿用透明度造成閃爍
      maskCanvas.style.display = "block";
    } else {
      maskCanvas.style.display = "none";
    }
  } else {
    maskCtx.clearRect(0, 0, W, H);
    maskCanvas.style.display = "none";
  }

  // 臉部檢測（若存在），使用 videoDrawCanvas 作為輸入，這樣座標會對齊
  if (faceDetector) {
    try {
      const det = faceDetector.detectForVideo
        ? faceDetector.detectForVideo(videoDrawCanvas, now)
        : null;
      if (det) renderOverlay(det.detections || []);
    } catch (e) {
      console.warn("faceDetector error:", e);
    }
  }

  requestAnimationFrame(renderLoop);
}

// ------------------------------ 事件與 UI -----------------------------------
function bindUI() {
  startBtn.addEventListener("click", async () => {
    if (running) return;
    statusText.textContent = "初始化...";
    // 在啟動前先執行 initializeConfig() 做必要的欄位補齊與驗證
    try {
      const ok =
        typeof initializeConfig === "function" ? initializeConfig() : true;
      if (!ok) {
        statusText.textContent = "配置錯誤，請檢查控制台";
        return;
      }
    } catch (e) {
      console.error("initializeConfig 發生錯誤：", e);
      statusText.textContent = "配置初始化失敗";
      return;
    }

    await ensureTasksVisionLoaded();
    await initTasks();
    await startCamera();
    running = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    switchBtn.disabled = false;
    statusText.textContent = "檢測中";
    renderLoop();
  });

  stopBtn.addEventListener("click", () => {
    running = false;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    startBtn.disabled = false;
    stopBtn.disabled = true;
    switchBtn.disabled = true;
    statusText.textContent = "已停止";
    outCtx.clearRect(0, 0, outCanvas.width, outCanvas.height);
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    moonEffect.classList.remove("active");
    faceCountEl.textContent = "0";
    facesInAreaEl.textContent = "0";
  });

  switchBtn.addEventListener("click", async () => {
    await switchCamera();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      running ? stopBtn.click() : startBtn.click();
    }
    if (e.key.toLowerCase() === "c" && running) {
      switchBtn.click();
    }
  });

  toggleMaskBtn.addEventListener("click", () => {
    showMaskCheckbox.checked = !showMaskCheckbox.checked;
  });

  backgroundSelect.addEventListener("change", (e) => {
    CONFIG.BACKGROUND.TYPE = e.target.value;
  });
  effectIntensitySlider.addEventListener("input", (e) => {
    CONFIG.BACKGROUND.INTENSITY = Number(e.target.value) / 100;
    intensityValueSpan.textContent = e.target.value + "%";
  });

  edgeFeatherSlider.addEventListener("input", (e) => {
    CONFIG.SMOOTHING.EDGE_FEATHER_PX = Number(e.target.value);
    edgeFeatherVal.textContent = `${e.target.value} px`;
  });
  temporalSmoothSlider.addEventListener("input", (e) => {
    const v = Number(e.target.value) / 100;
    CONFIG.SMOOTHING.TEMPORAL_ALPHA = v;
    temporalSmoothVal.textContent = v.toFixed(2);
  });
  thresholdSlider.addEventListener("input", (e) => {
    const v = Number(e.target.value) / 100;
    CONFIG.SMOOTHING.THRESHOLD = v;
    thresholdVal.textContent = v.toFixed(2);
  });

  enableSegmentationCheckbox.addEventListener("change", (e) => {
    if (!e.target.checked) {
      // 關閉去背：清除預覽並停用蒙版
      gMaskCanvasProcessed = null;
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCanvas.style.display = "none";
    }
  });
}

function checkSupport() {
  if (!navigator.mediaDevices?.getUserMedia) {
    alert("此瀏覽器不支援相機，請改用新版 Chrome / Edge / Safari");
    return false;
  }
  // tasks-vision 模組會在背景載入；按下「開始」時程式會再次確保載入，故此處不強制要求
  return true;
}

window.addEventListener("load", () => {
  // 為了避免多層重繪造成的閃爍，直接隱藏 bgCanvas（背景改由 outCanvas 繪製）
  try {
    bgCanvas.style.display = "";
  } catch (e) {}
  if (!checkSupport()) return;
  bindUI();
  document.body.classList.add("loaded");

  // 行動裝置：側欄抽屜切換
  function togglePanel() {
    document.body.classList.toggle("panel-open");
    const open = document.body.classList.contains("panel-open");
    if (scrimEl) scrimEl.hidden = !open;
    // 面板開合會改變 stage 寬度，延遲重算畫布避免 layout 轉場期間取錯尺寸
    setTimeout(() => {
      if (running) syncCanvasSize();
    }, 260);
  }
  if (menuBtn) menuBtn.addEventListener("click", togglePanel);
  if (scrimEl) scrimEl.addEventListener("click", togglePanel);
});
