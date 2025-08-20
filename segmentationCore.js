// segmentationCore.js
// 影像處理 / 去背核心模組（ESM）
// - 封裝 MediaPipe ImageSegmenter / FaceDetector 初始化、相機控制、渲染迴圈
// - 對外提供：initCore(), start(), stop(), switchCamera(), onResize(), setters
//   以及 CONFIG / saveConfig() / resetConfig() / initializeConfig()
// - 由外部 UI 模組（uiController.js）負責綁定按鈕、滑桿、選單與顯示數值

// -----------------------------------------------------------------------------
// 公開設定（沿用使用者原本 CONFIG，僅做少數向後相容補位）
// -----------------------------------------------------------------------------
export const CONFIG = {
  FACE_DETECTION: {
    MODEL: "short",
    MIN_DETECTION_CONFIDENCE: 0.5,
    MAX_FACES: 10,
  },
  SEGMENTATION: {
    ENABLED: true,
    MODEL_SELECTION: 1, // 1 => landscape
    SELFIE_MODE: true,
    SEGMENTATION_THRESHOLD: 0.1,
  },
  DETECTION_AREA: {
    CENTER_X: 0.5,
    CENTER_Y: 0.5,
    RADIUS: 0.45,
    REQUIRED_FACES: 2,
  },
  CAMERA: {
    DEFAULT_WIDTH: 640,
    DEFAULT_HEIGHT: 480,
    DEFAULT_FACING_MODE: "user",
    FRAME_RATE: 30,
  },
  UI: {
    STATUS_UPDATE_INTERVAL: 100,
    SHOW_DEBUG_INFO: true,
    SHOW_FPS: false,
    LANGUAGE: "zh-TW",
  },
  EFFECTS: {
    MOON_EFFECT_DURATION: 3000,
    FADE_DURATION: 800,
    ENABLE_SOUND: false,
    MOON_SIZE_SCALE: 1.0,
    STAR_COUNT: 5,
    SPARKLE_COUNT: 3,
  },
  BACKGROUND_EFFECTS: {
    DEFAULT_BACKGROUND: "original",
    WAVE_EFFECT: { AMPLITUDE: 10, FREQUENCY: 0.02, SPEED: 0.05 },
    FREQUENCY_EFFECT: { BANDS: 32, HEIGHT_SCALE: 0.8, COLOR_SHIFT: 0.01 },
    EFFECT_INTENSITY: 0.5,
    BLEND_MODE: "source-over",
  },
  PERFORMANCE: {
    ENABLE_MONITORING: false,
    MAX_LATENCY: 100,
    LOW_PERFORMANCE_MODE: false,
    AUTO_ADJUST_PERFORMANCE: true,
  },
  DEBUG: {
    VERBOSE_LOGGING: false,
    SHOW_DETECTION_AREA: true,
    SHOW_FACE_BOXES: true,
    SHOW_FACE_LANDMARKS: false,
    SAVE_DETECTION_RESULTS: false,
  },
  ADVANCED: {
    MEDIAPIPE_BASE_URL:
      "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/",
    MEDIAPIPE_SEGMENTATION_URL:
      "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/",
    USE_WEB_WORKERS: false,
    MEMORY_LIMIT: 512,
    ENABLE_ERROR_REPORTING: true,
  },
};

// 讓背景設定存在（避免 undefined）
CONFIG.BACKGROUND = CONFIG.BACKGROUND || {
  TYPE:
    (CONFIG.BACKGROUND_EFFECTS &&
      CONFIG.BACKGROUND_EFFECTS.DEFAULT_BACKGROUND) ||
    "original",
  INTENSITY:
    (CONFIG.BACKGROUND_EFFECTS && CONFIG.BACKGROUND_EFFECTS.EFFECT_INTENSITY) ??
    0.5,
  GIF_BLEND_MODE: "overlay", // 仍保留欄位以向後相容（但會無效）
};

// ---- Recording storage & share helper (統一管理) ----

// 儲存最後一次錄製的 Blob / filename / objectURL（由 core 管理）
let lastRecordedBlob = null;
let lastRecordedFilename = null;
let lastRecordedObjectUrl = null;

function _revokeLastObjectUrl() {
  try {
    if (lastRecordedObjectUrl) {
      URL.revokeObjectURL(lastRecordedObjectUrl);
      lastRecordedObjectUrl = null;
    }
  } catch (e) {
    console.warn("revoke failed", e);
  }
}

/**
 * 儲存 Blob 並建立 objectURL（由 core 呼叫）
 * 回傳建立的 objectURL（或 null）
 */
export function storeRecordingBlob(blob, filename) {
  if (!blob) return null;
  // 清理舊的 objectURL
  _revokeLastObjectUrl();
  lastRecordedBlob = blob;
  lastRecordedFilename = filename || `moonAR_${Date.now()}.webm`;
  try {
    lastRecordedObjectUrl = URL.createObjectURL(blob);
  } catch (e) {
    console.warn("createObjectURL failed", e);
    lastRecordedObjectUrl = null;
  }
  return lastRecordedObjectUrl;
}

/** UI 用：是否有錄影檔可用 */
export function hasRecordingAvailable() {
  return !!lastRecordedBlob;
}

/** UI 用：取得 core 管理的 objectURL（不要在外面再 createObjectURL） */
export function getLastRecordingUrl() {
  return lastRecordedObjectUrl || null;
}

/** UI 用：清除最後一次錄影的暫存（core 會 revoke） */
export function clearLastRecording() {
  _revokeLastObjectUrl();
  lastRecordedBlob = null;
  lastRecordedFilename = null;
}

/** 取得最後錄影檔名 */
export function getLastRecordingFilename() {
  return lastRecordedFilename;
}

// 上傳 stub（請替換成你自己的後端或雲端上傳實作）
// 回傳公開可存取的 url 字串
export async function uploadBlobToServerAndGetUrl(blob, filename) {
  // 範例：呼叫 /api/upload (form-data: file)
  const fd = new FormData();
  fd.append("file", blob, filename);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("upload failed");
  const j = await res.json();
  if (!j?.url) throw new Error("upload response missing url");
  return j.url;
}

// 實際分享函式：必須在「使用者手勢」中呼叫（例如按鈕 onclick）
// 這個函式會嘗試：1) Web Share API 分享檔案；2) 上傳並分享 URL；3) 拋錯由 UI 處理
export async function shareLastRecording() {
  if (!lastRecordedBlob) throw new Error("no recording available");
  const filename = lastRecordedFilename || `moonAR_${Date.now()}.mp4`;
  const file = new File([lastRecordedBlob], filename, {
    type: lastRecordedBlob.type || "video/mp4",
  });

  // 優先嘗試檔案分享（Level 2）
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "月亮節 AR 影片",
        text: "分享給你",
      });
      return { ok: true, method: "webshare" };
    }
  } catch (err) {
    console.warn("Web Share file error:", err);
    // 繼續嘗試上傳分享 URL
  }

  // 若檔案分享不支援或失敗 -> 嘗試上傳並分享 URL
  try {
    const url = await uploadBlobToServerAndGetUrl(lastRecordedBlob, filename);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "月亮節 AR 影片",
          text: "看這個影片：",
          url,
        });
        return { ok: true, method: "url-share", url };
      } catch (err) {
        console.warn("Web Share URL error:", err);
      }
    }
    // 若不能直接呼叫 navigator.share，回傳 url 給 UI 顯示複製
    return { ok: true, method: "uploaded", url };
  } catch (err) {
    console.warn("upload failed:", err);
    throw err; // 由呼叫端（UI）處理 fallback（例如下載）
  }
}

// -----------------------------------------------------------------------------
// 狀態、DOM 參照、回呼
// -----------------------------------------------------------------------------
let imageSegmenter = null;
let faceDetector = null;
let wasmFileset = null;
let running = false;
let stream = null;
let currentFacingMode = CONFIG.CAMERA.DEFAULT_FACING_MODE || "user";

// DOM
let videoEl, bgCanvas, maskCanvas, outCanvas, bgVideoEl, bgGifEl, bgMoonVideoEl;
let bgCtx, maskCtx, outCtx;

// Callbacks（由 UI 模組註冊）
let onStatus = (t) => {};
let onStats = (stats) => {}; // { faceCount, facesInArea, moonActive }

// -----------------------------------------------------------------------------
// 內部暫存
// -----------------------------------------------------------------------------
let personLabelIndex = 0;
let lastMaskF32 = null;
let lastMaskSize = { w: 0, h: 0 };
let gMaskCanvasProcessed = null;

// offscreen
const videoDrawCanvas = document.createElement("canvas");
const videoDrawCtx = videoDrawCanvas.getContext("2d");
videoDrawCanvas.style.display = "none";

const compositeCanvas = document.createElement("canvas");
const compositeCtx = compositeCanvas.getContext("2d");
compositeCanvas.style.display = "none";

// 蒙版中繼
const maskBaseCanvas = document.createElement("canvas");
const maskBaseCtx = maskBaseCanvas.getContext("2d");
const maskUpscaleCanvas = document.createElement("canvas");
const maskUpscaleCtx = maskUpscaleCanvas.getContext("2d");
const maskSoftCanvas = document.createElement("canvas");
const maskSoftCtx = maskSoftCanvas.getContext("2d");

// 其他
let animT = 0;
let lastVideoTime = -1;

// -----------------------------------------------------------------------------
// 工具：裝置自動調整 / 驗證 / 設定持久化
// -----------------------------------------------------------------------------
function autoAdjustConfig() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isLowEnd = (navigator.hardwareConcurrency || 4) <= 2;

  if (isMobile) {
    CONFIG.CAMERA.DEFAULT_WIDTH = 480;
    CONFIG.CAMERA.DEFAULT_HEIGHT = 360;
    CONFIG.FACE_DETECTION.MODEL = "short";
    CONFIG.EFFECTS.STAR_COUNT = 3;
    CONFIG.EFFECTS.SPARKLE_COUNT = 2;
    CONFIG.DETECTION_AREA.RADIUS = Math.max(
      0.4,
      CONFIG.DETECTION_AREA.RADIUS * 0.9
    );
  }
  if (isLowEnd) {
    CONFIG.PERFORMANCE.LOW_PERFORMANCE_MODE = true;
    CONFIG.FACE_DETECTION.MIN_DETECTION_CONFIDENCE = 0.6;
    CONFIG.CAMERA.FRAME_RATE = 20;
    CONFIG.EFFECTS.MOON_SIZE_SCALE = 0.8;
  }
}

function validateConfig() {
  const errors = [];
  if (
    CONFIG.FACE_DETECTION.MIN_DETECTION_CONFIDENCE < 0 ||
    CONFIG.FACE_DETECTION.MIN_DETECTION_CONFIDENCE > 1
  )
    errors.push("MIN_DETECTION_CONFIDENCE 必須在 0~1 之間");
  if (CONFIG.DETECTION_AREA.RADIUS <= 0 || CONFIG.DETECTION_AREA.RADIUS > 1)
    errors.push("DETECTION_AREA.RADIUS 必須在 0~1 之間");

  if (!navigator.mediaDevices?.getUserMedia) {
    errors.push("瀏覽器不支援相機功能");
  }
  return errors;
}

export function saveConfig() {
  try {
    localStorage.setItem("moonFestivalAR_config", JSON.stringify(CONFIG));
  } catch {}
}

export function resetConfig() {
  try {
    localStorage.removeItem("moonFestivalAR_config");
  } catch {}
  location.reload();
}

function loadCustomConfig() {
  try {
    const c = localStorage.getItem("moonFestivalAR_config");
    if (c) Object.assign(CONFIG, JSON.parse(c));
  } catch {}
}

// 初始化 / 向後相容補位
export function initializeConfig() {
  loadCustomConfig();
  autoAdjustConfig();

  // 對應舊欄位
  CONFIG.CAMERA.WIDTH =
    CONFIG.CAMERA.DEFAULT_WIDTH || CONFIG.CAMERA.WIDTH || 1280;
  CONFIG.CAMERA.HEIGHT =
    CONFIG.CAMERA.DEFAULT_HEIGHT || CONFIG.CAMERA.HEIGHT || 720;
  CONFIG.CAMERA.FACING =
    CONFIG.CAMERA.DEFAULT_FACING_MODE || CONFIG.CAMERA.FACING || "user";

  CONFIG.SEGMENTER = CONFIG.SEGMENTER || {};
  CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL =
    CONFIG.SEGMENTATION && CONFIG.SEGMENTATION.MODEL_SELECTION === 1
      ? true
      : CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL ?? true;
  CONFIG.SEGMENTER.USE_GPU = CONFIG.SEGMENTER.USE_GPU ?? true;

  CONFIG.SMOOTHING = CONFIG.SMOOTHING || {};
  CONFIG.SMOOTHING.THRESHOLD =
    CONFIG.SMOOTHING.THRESHOLD ??
    CONFIG.SEGMENTATION?.SEGMENTATION_THRESHOLD ??
    0.38;
  CONFIG.SMOOTHING.TEMPORAL_ALPHA = CONFIG.SMOOTHING.TEMPORAL_ALPHA ?? 0.6;
  CONFIG.SMOOTHING.EDGE_FEATHER_PX = CONFIG.SMOOTHING.EDGE_FEATHER_PX ?? 3;
  CONFIG.SMOOTHING.HYS_ON =
    CONFIG.SMOOTHING.HYS_ON ?? CONFIG.SMOOTHING.THRESHOLD - 0.15;
  CONFIG.SMOOTHING.HYS_OFF =
    CONFIG.SMOOTHING.HYS_OFF ?? CONFIG.SMOOTHING.THRESHOLD + 0.15;
  CONFIG.SMOOTHING.MASK_GROW_PX = CONFIG.SMOOTHING.MASK_GROW_PX ?? 1.5;

  // 模型路徑與 WASM base
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

  const errs = validateConfig();
  if (errs.length) {
    console.error("配置驗證失敗：", errs);
    return false;
  }
  return true;
}

// -----------------------------------------------------------------------------
// 初始化核心（由 UI 模組呼叫，把必要 DOM 傳進來 + 註冊回呼）
// -----------------------------------------------------------------------------
export function initCore(els, callbacks = {}) {
  videoEl = els.videoEl;
  bgCanvas = els.bgCanvas;
  maskCanvas = els.maskCanvas;
  outCanvas = els.outCanvas;
  bgVideoEl = els.bgVideoEl || null;
  bgGifEl = els.bgGifEl || null; // 雖保留變數，但 GIF 流程已移除
  bgMoonVideoEl = els.bgMoonVideoEl || null;

  bgCtx = bgCanvas.getContext("2d");
  maskCtx = maskCanvas.getContext("2d");
  outCtx = outCanvas.getContext("2d");

  if (typeof callbacks.onStatus === "function") onStatus = callbacks.onStatus;
  if (typeof callbacks.onStats === "function") onStats = callbacks.onStats;

  currentFacingMode = CONFIG.CAMERA.FACING || "user";
}

// -----------------------------------------------------------------------------
// MediaPipe 模組載入
// -----------------------------------------------------------------------------
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
      return true;
    } catch (e) {
      console.warn("[WARN] failed to import tasks-vision from", url, e);
    }
  }
  throw new Error("無法載入 @mediapipe/tasks-vision 模組");
}

async function initTasks() {
  if (!wasmFileset) {
    wasmFileset = await FilesetResolver.forVisionTasks(CONFIG.WASM_BASE);
  }
  // 依 outCanvas 比例選擇使用 landscape/square
  try {
    const rect = outCanvas.getBoundingClientRect();
    CONFIG.SEGMENTER.USE_LANDSCAPE_MODEL =
      (rect.width || 1) >= (rect.height || 1);
  } catch {}

  // ImageSegmenter
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
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
  } catch (e) {
    console.warn("[Segmenter] GPU 失敗，改用 CPU:", e);
    imageSegmenter = await ImageSegmenter.createFromOptions(wasmFileset, {
      baseOptions: { ...baseOptions, delegate: "CPU" },
      runningMode: "VIDEO",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
  }

  // FaceDetector（可選）
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
    console.warn("[FaceDetector] GPU 失敗，改用 CPU:", e);
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

// -----------------------------------------------------------------------------
// 相機控制
// -----------------------------------------------------------------------------
async function startCamera() {
  if (stream) {
    try {
      stream.getTracks().forEach((t) => t.stop());
    } catch {}
  }
  const constraints = {
    audio: false,
    video: {
      facingMode: currentFacingMode,
      width: { ideal: CONFIG.CAMERA.WIDTH },
      height: { ideal: CONFIG.CAMERA.HEIGHT },
      frameRate: { ideal: CONFIG.CAMERA.FRAME_RATE },
    },
  };
  stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoEl.srcObject = stream;
  videoEl.setAttribute("playsinline", "");
  videoEl.muted = true;
  videoEl.autoplay = true;

  await new Promise((resolve) => {
    if (videoEl.readyState >= 1 && videoEl.videoWidth && videoEl.videoHeight)
      return resolve();
    videoEl.onloadedmetadata = () => resolve();
    setTimeout(resolve, 1500);
  });
  try {
    await videoEl.play();
  } catch {}

  syncCanvasSize();
}

export async function switchCamera() {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
  await startCamera();
}

// -----------------------------------------------------------------------------
// 畫布尺寸同步
// -----------------------------------------------------------------------------
export function syncCanvasSize() {
  const stageEl = outCanvas.closest(".stage") || outCanvas.parentElement;
  const rect = stageEl.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
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
  lastMaskSize = { w: outCanvas.width, h: outCanvas.height };
}

// -----------------------------------------------------------------------------
// 背景繪製（含「影片」背景選項）
// -----------------------------------------------------------------------------
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

  if (bgType === "original") {
    // 透明
    return;
  }
  if (bgType === "waves") {
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
    return;
  }
  if (bgType === "frequency") {
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
    return;
  }
  if (bgType === "video" && bgVideoEl) {
    // 以 cover 方式鋪滿
    const vw = bgVideoEl.videoWidth || 1;
    const vh = bgVideoEl.videoHeight || 1;
    if (bgVideoEl.readyState >= 2) {
      const scale = Math.max(w / vw, h / vh);
      const dw = Math.round(vw * scale);
      const dh = Math.round(vh * scale);
      const ox = Math.round((w - dw) / 2);
      const oy = Math.round((h - dh) / 2);
      try {
        if (bgVideoEl.paused) bgVideoEl.play().catch(() => {});
      } catch {}
      ctx.globalAlpha = Math.min(1, 0.3 + intensity * 0.7);
      ctx.drawImage(bgVideoEl, 0, 0, vw, vh, ox, oy, dw, dh);
      ctx.globalAlpha = 1;
    }
    return;
  }
  // 月相影片背景
  if (bgType === "moon_video" && bgMoonVideoEl) {
    try {
      if (bgMoonVideoEl.readyState >= 2 && !bgMoonVideoEl.paused) {
        const vw = bgMoonVideoEl.videoWidth || bgMoonVideoEl.width || 1;
        const vh = bgMoonVideoEl.videoHeight || bgMoonVideoEl.height || 1;
        if (vw > 1 && vh > 1) {
          const scale = Math.max(w / vw, h / vh);
          const dw = Math.round(vw * scale);
          const dh = Math.round(vh * scale);
          const ox = Math.round((w - dw) / 2);
          const oy = Math.round((h - dh) / 2);

          ctx.globalAlpha = Math.min(1, 0.3 + intensity * 0.7);
          ctx.drawImage(bgMoonVideoEl, 0, 0, vw, vh, ox, oy, dw, dh);
          ctx.globalAlpha = 1;
        }
      } else if (bgMoonVideoEl.paused) {
        bgMoonVideoEl.play().catch((e) => console.warn("月相影片播放失敗:", e));
      }
    } catch (e) {
      console.warn("月相影片渲染錯誤:", e);
    }
    return;
  }
}

function renderBackground(w, h) {
  renderBackgroundTo(bgCtx, w, h);
}

// -----------------------------------------------------------------------------
// 蒙版處理（EMA 平滑 + 邊緣羽化）
// -----------------------------------------------------------------------------
function emaUpdate(srcF32, w, h) {
  const N = w * h;
  if (!lastMaskF32 || lastMaskSize.w !== w || lastMaskSize.h !== h) {
    lastMaskF32 = new Float32Array(N);
    lastMaskF32.set(srcF32);
    lastMaskSize = { w, h };
    return lastMaskF32;
  }
  const a = CONFIG.SMOOTHING.TEMPORAL_ALPHA;
  for (let i = 0; i < N; i++) {
    lastMaskF32[i] = a * lastMaskF32[i] + (1 - a) * srcF32[i];
  }
  return lastMaskF32;
}

function buildAlphaImage(maskF32, w, h) {
  const T = CONFIG.SMOOTHING.THRESHOLD;
  const N = w * h;
  const img = new ImageData(w, h);
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

  const VW = outCanvas.width,
    VH = outCanvas.height;
  maskUpscaleCanvas.width = VW;
  maskUpscaleCanvas.height = VH;
  maskUpscaleCtx.clearRect(0, 0, VW, VH);
  maskUpscaleCtx.imageSmoothingEnabled = true;
  maskUpscaleCtx.imageSmoothingQuality = "high";
  maskUpscaleCtx.drawImage(maskBaseCanvas, 0, 0, VW, VH);

  const blurPx = CONFIG.SMOOTHING.EDGE_FEATHER_PX;
  maskSoftCanvas.width = VW;
  maskSoftCanvas.height = VH;
  maskSoftCtx.clearRect(0, 0, VW, VH);
  maskSoftCtx.filter = blurPx > 0 ? `blur(${blurPx}px)` : "none";
  maskSoftCtx.drawImage(maskUpscaleCanvas, 0, 0);
  maskSoftCtx.filter = "none";
  return maskSoftCanvas;
}

// -----------------------------------------------------------------------------
// 臉部檢測 / 區域與疊圖
// -----------------------------------------------------------------------------
function checkFacesInArea(detections) {
  const facesIn = [];
  const W = outCanvas.width,
    H = outCanvas.height;
  const cx = CONFIG.DETECTION_AREA.CENTER_X * W;
  const cy = CONFIG.DETECTION_AREA.CENTER_Y * H;
  const r = CONFIG.DETECTION_AREA.RADIUS * Math.min(W, H);

  for (const d of detections) {
    const box = d.boundingBox;
    const fx = box.originX + box.width / 2;
    const fy = box.originY + box.height / 2;
    const dist = Math.hypot(fx - cx, fy - cy);
    if (dist <= r) facesIn.push(d);
  }
  return facesIn;
}

function renderOverlay(detections) {
  const W = outCanvas.width,
    H = outCanvas.height;
  outCtx.save();
  outCtx.translate(W, 0);
  outCtx.scale(-1, 1);

  outCtx.strokeStyle = "rgba(255,255,255,0.8)";
  outCtx.lineWidth = 2;
  if (CONFIG.DEBUG.SHOW_FACE_BOXES) {
    for (const d of detections) {
      const { originX, originY, width, height } = d.boundingBox;
      outCtx.strokeRect(originX, originY, width, height);
    }
  }

  if (CONFIG.DEBUG.SHOW_DETECTION_AREA) {
    const cx = CONFIG.DETECTION_AREA.CENTER_X * W;
    const cy = CONFIG.DETECTION_AREA.CENTER_Y * H;
    const r = CONFIG.DETECTION_AREA.RADIUS * Math.min(W, H);
    outCtx.setLineDash([10, 5]);
    outCtx.strokeStyle = "rgba(255,255,255,0.6)";
    outCtx.beginPath();
    outCtx.arc(cx, cy, r, 0, Math.PI * 2);
    outCtx.stroke();
    outCtx.setLineDash([]);
  }

  const facesIn = checkFacesInArea(detections);
  outCtx.restore();

  // 更新回呼
  onStats({
    faceCount: detections.length,
    facesInArea: facesIn.length,
    moonActive: facesIn.length >= CONFIG.DETECTION_AREA.REQUIRED_FACES,
  });
}

// -----------------------------------------------------------------------------
// 主渲染迴圈
// -----------------------------------------------------------------------------
async function renderLoop() {
  if (!running) return;
  const now = performance.now();
  const W = outCanvas.width,
    H = outCanvas.height;

  // 背景
  outCtx.clearRect(0, 0, W, H);
  renderBackground(W, H);

  // 將 video 以 contain 方式畫到暫存
  videoDrawCtx.clearRect(0, 0, W, H);
  const vw = videoEl.videoWidth || 1,
    vh = videoEl.videoHeight || 1;
  const scale = Math.min(W / vw, H / vh);
  const dw = Math.round(vw * scale),
    dh = Math.round(vh * scale);
  const ox = Math.round((W - dw) / 2),
    oy = Math.round((H - dh) / 2);
  try {
    videoDrawCtx.drawImage(videoEl, 0, 0, vw, vh, ox, oy, dw, dh);
  } catch {}

  // Segmentation（僅在新幀）
  if (imageSegmenter && CONFIG.SEGMENTATION.ENABLED) {
    if (videoEl.currentTime !== lastVideoTime) {
      lastVideoTime = videoEl.currentTime;
      try {
        const result = imageSegmenter.segmentForVideo
          ? imageSegmenter.segmentForVideo(videoDrawCanvas, now)
          : await imageSegmenter.segment(videoDrawCanvas);
        if (result) {
          let maskF32 = null,
            mw = 0,
            mh = 0;
          if (result.confidenceMasks && result.confidenceMasks.length) {
            const idx =
              personLabelIndex < result.confidenceMasks.length
                ? personLabelIndex
                : 0;
            const cm = result.confidenceMasks[idx];
            if (cm?.getAsFloat32Array) {
              const src = cm.getAsFloat32Array();
              maskF32 = new Float32Array(src.length);
              maskF32.set(src);
              mw = cm.width;
              mh = cm.height;
            }
            for (const m of result.confidenceMasks) {
              try {
                m?.close?.();
              } catch {}
            }
          } else if (result.categoryMask?.getAsUint8Array) {
            const cat = result.categoryMask;
            const u8 = cat.getAsUint8Array();
            maskF32 = new Float32Array(u8.length);
            mw = cat.width;
            mh = cat.height;
            const personIdx = personLabelIndex;
            for (let i = 0; i < u8.length; i++)
              maskF32[i] = u8[i] === personIdx ? 1 : 0;
            try {
              cat.close?.();
            } catch {}
          }
          if (maskF32 && mw && mh) {
            const sm = emaUpdate(maskF32, mw, mh);
            gMaskCanvasProcessed = buildAlphaImage(sm, mw, mh);
          }
        }
      } catch (e) {
        console.warn("segmentForVideo error:", e);
      }
    }
  } else {
    gMaskCanvasProcessed = null;
  }

  // composite：先把人物合成到離屏，再畫回 outCanvas（避免破壞背景）
  compositeCtx.clearRect(0, 0, W, H);
  compositeCtx.save();
  compositeCtx.drawImage(videoDrawCanvas, 0, 0, W, H);
  if (gMaskCanvasProcessed) {
    compositeCtx.globalCompositeOperation = "destination-in";
    compositeCtx.drawImage(gMaskCanvasProcessed, 0, 0, W, H);
    compositeCtx.globalCompositeOperation = "source-over";
  }
  compositeCtx.restore();

  // 以鏡像方式繪回（與原本一致）
  outCtx.save();
  outCtx.translate(W, 0);
  outCtx.scale(-1, 1);
  outCtx.drawImage(compositeCanvas, 0, 0, W, H);
  outCtx.restore();

  // Mask 預覽
  maskCtx.clearRect(0, 0, W, H);
  if (gMaskCanvasProcessed && _showMaskPreview) {
    maskCtx.globalAlpha = 0.9;
    maskCtx.drawImage(gMaskCanvasProcessed, 0, 0, W, H);
    maskCtx.globalAlpha = 1.0;
    maskCanvas.style.display = "block";
  } else {
    maskCanvas.style.display = "none";
  }

  // 臉部檢測
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

// -----------------------------------------------------------------------------
// 公開 API：start/stop/onResize & 參數 setters
// -----------------------------------------------------------------------------
export async function start() {
  if (running) return;
  const ok = initializeConfig();
  if (!ok) {
    onStatus("配置錯誤，請檢查控制台");
    return;
  }
  onStatus("初始化...");
  await ensureTasksVisionLoaded();
  await initTasks();
  await startCamera();
  running = true;
  onStatus("檢測中");
  requestAnimationFrame(renderLoop);
}

export function stop() {
  running = false;
  try {
    if (stream) stream.getTracks().forEach((t) => t.stop());
  } catch {}
  if (outCtx && maskCtx && bgCtx) {
    outCtx.clearRect(0, 0, outCanvas.width, outCanvas.height);
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  }
  onStats({ faceCount: 0, facesInArea: 0, moonActive: false });
  onStatus("已停止");
}

export function onResize() {
  if (running) syncCanvasSize();
}

// setters
let _showMaskPreview = false;
export function setShowMaskPreview(v) {
  _showMaskPreview = !!v;
}
export function setEnableSegmentation(v) {
  CONFIG.SEGMENTATION.ENABLED = !!v;
}
export function setBackgroundType(t) {
  CONFIG.BACKGROUND.TYPE = t;
}
export function setBackgroundIntensity(p01) {
  CONFIG.BACKGROUND.INTENSITY = Math.max(0, Math.min(1, p01));
}
export function setEdgeFeather(px) {
  CONFIG.SMOOTHING.EDGE_FEATHER_PX = Math.max(0, Number(px) || 0);
}
export function setTemporalAlpha(v01) {
  CONFIG.SMOOTHING.TEMPORAL_ALPHA = Math.max(
    0,
    Math.min(0.95, Number(v01) || 0)
  );
}
export function setThreshold(v01) {
  CONFIG.SMOOTHING.THRESHOLD = Math.max(0, Math.min(1, Number(v01) || 0));
}

// 為了向後相容，保留 GIF 相關 setter（no-op），你之後可以完全移除
export function setGifBlendMode(mode) {
  // no-op: GIF 功能已移除於 core
  CONFIG.BACKGROUND.GIF_BLEND_MODE = mode;
}
export function setShouldGenerateGif(value) {
  // no-op
  return;
}

// 便利：提供目前是否在跑
export function isRunning() {
  return running;
}

// -----------------------------------------------------------------------------
// 拍照功能（不包含 GIF 流程）
// -----------------------------------------------------------------------------
export async function capturePhoto() {
  if (!outCanvas || !running) {
    console.warn("無法拍照：相機未啟動或畫布不存在");
    return null;
  }

  try {
    // 創建一個新的 canvas 來合成最終圖像
    const captureCanvas = document.createElement("canvas");
    const captureCtx = captureCanvas.getContext("2d");

    // 設定拍照尺寸（使用當前渲染尺寸）
    const W = outCanvas.width;
    const H = outCanvas.height;
    captureCanvas.width = W;
    captureCanvas.height = H;

    // 檢查背景類型
    const bgType = CONFIG.BACKGROUND && CONFIG.BACKGROUND.TYPE;

    if (bgType === "moon_video" && bgMoonVideoEl) {
      // 月相影片模式：靜止人物 + 動態影片背景 → 8秒影片
      console.log("🌙 月相影片模式：生成 8 秒動態影片...");

      // 1. 先繪製當前畫面作為靜止人物 (outCanvas 已包含前景與背景)
      captureCtx.drawImage(outCanvas, 0, 0, W, H);

      // 2. 生成靜止人物的 PNG 作為基礎
      const staticPersonDataURL = captureCanvas.toDataURL("image/png", 1.0);

      // 3. 開始錄製 8 秒動態影片
      return await generateVideoWithStaticPerson(staticPersonDataURL, W, H);
    } else {
      // 一般模式：先背景後人物
      captureCtx.drawImage(bgCanvas, 0, 0, W, H);
      captureCtx.drawImage(outCanvas, 0, 0, W, H);
    }

    // 轉換為 DataURL
    const dataURL = captureCanvas.toDataURL("image/png", 1.0);
    const timestamp = new Date()
      .toISOString()
      .replace(/[:]/g, "-")
      .split(".")[0];

    // 總是先下載 PNG 版本
    const pngLink = document.createElement("a");
    const pngFilename = `月亮節AR拍照_${timestamp}.png`;
    pngLink.download = pngFilename;
    pngLink.href = dataURL;
    document.body.appendChild(pngLink);
    pngLink.click();
    document.body.removeChild(pngLink);

    console.log(`📸 PNG 拍照成功！`);

    return { png: dataURL };
  } catch (error) {
    console.error("拍照失敗：", error);
    return null;
  }
}

// 全域進度回調函數
let recordingProgressCallback = null;
let videoOutputFormat = "mp4"; // 預設 MP4

// 設定錄製進度回調
export function setRecordingProgressCallback(callback) {
  recordingProgressCallback = callback;
}

// 設定影片輸出格式
export function setVideoOutputFormat(format) {
  videoOutputFormat = format;
}

// 生成靜止人物 + 動態影片背景的 8 秒影片
async function generateVideoWithStaticPerson(
  staticPersonDataURL,
  width,
  height
) {
  console.log("🎬 開始錄製靜止人物 + 動態背景影片...");

  try {
    // 檢查瀏覽器支援
    if (!window.MediaRecorder) {
      console.warn("瀏覽器不支援 MediaRecorder");
      return { png: staticPersonDataURL, error: "瀏覽器不支援影片錄製" };
    }

    // 創建錄製用的 Canvas - 保持原始比例
    const recordCanvas = document.createElement("canvas");
    const recordCtx = recordCanvas.getContext("2d");

    // 計算保持比例的尺寸
    const maxSize = 640; // 最大邊長限制
    const aspectRatio = width / height;

    if (width > height) {
      // 橫向影片
      recordCanvas.width = Math.min(maxSize, width);
      recordCanvas.height = Math.round(recordCanvas.width / aspectRatio);
    } else {
      // 直向影片
      recordCanvas.height = Math.min(maxSize, height);
      recordCanvas.width = Math.round(recordCanvas.height * aspectRatio);
    }

    console.log(
      `錄製 Canvas 尺寸: ${recordCanvas.width}x${
        recordCanvas.height
      } (原始: ${width}x${height}, 比例: ${aspectRatio.toFixed(2)})`
    );

    // 載入靜止人物圖片
    const personImg = new Image();

    return new Promise((resolve, reject) => {
      personImg.onload = async () => {
        console.log("靜止人物圖片載入完成，開始錄製...");

        // 設定錄製參數：8 秒，20 FPS
        const DURATION_SECONDS = 8;
        const FPS = 20;
        const totalFrames = DURATION_SECONDS * FPS;

        // 確保月相影片開始播放
        if (bgMoonVideoEl && bgMoonVideoEl.paused) {
          await bgMoonVideoEl
            .play()
            .catch((e) => console.warn("影片播放失敗:", e));
        }

        // 設定 MediaRecorder
        const stream = recordCanvas.captureStream(FPS);

        // 根據選擇的格式設定 MediaRecorder
        let recorderOptions;
        if (videoOutputFormat === "mp4") {
          // MP4 設定 (瀏覽器支援性有限)
          if (MediaRecorder.isTypeSupported("video/mp4; codecs=h264")) {
            recorderOptions = {
              mimeType: "video/mp4; codecs=h264",
              videoBitsPerSecond: 3000000, // 3 Mbps
            };
          } else if (MediaRecorder.isTypeSupported("video/mp4")) {
            recorderOptions = {
              mimeType: "video/mp4",
              videoBitsPerSecond: 3000000,
            };
          } else {
            // 降級到 WebM
            console.warn("瀏覽器不支援 MP4，降級到 WebM");
            recorderOptions = {
              mimeType: "video/webm; codecs=vp8",
              videoBitsPerSecond: 3000000,
            };
            videoOutputFormat = "webm"; // 更新格式標識
          }
        } else {
          // WebM 設定
          recorderOptions = {
            mimeType: "video/webm; codecs=vp8",
            videoBitsPerSecond: 3000000,
          };
        }

        const recorder = new MediaRecorder(stream, recorderOptions);
        console.log(`📹 使用格式: ${recorderOptions.mimeType}`);

        const chunks = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const mimeType =
            videoOutputFormat === "mp4" ? "video/mp4" : "video/webm";
          const extension = videoOutputFormat === "mp4" ? "mp4" : "webm";
          const blob = new Blob(chunks, { type: mimeType });

          const timestamp = new Date()
            .toISOString()
            .replace(/[:]/g, "-")
            .split(".")[0];
          const filename = `月亮節AR_月相影片_${timestamp}.${extension}`;

          // 儲存 blob & filename（由 core 管理 objectURL）
          const storedUrl = storeRecordingBlob(blob, filename);

          // 觸發回呼通知 UI：可在 UI 顯示「分享」按鈕與「下載」按鈕
          if (typeof onStatus === "function") {
            onStatus("影片已生成，可按 分享 或 下載");
          }
          if (typeof onStats === "function") {
            // optional: 傳回 video blob info 給 UI
            onStats({
              lastVideoUrl: storedUrl,
              lastVideoFilename: filename,
            });
          }

          // resolve 並回傳由 core 管理的 URL
          resolve({
            png: staticPersonDataURL,
            video: storedUrl,
            duration: DURATION_SECONDS,
            format: extension,
            saved: true,
          });
        };

        recorder.onerror = (event) => {
          console.error("錄製錯誤:", event.error);
          reject(event.error);
        };

        // 開始錄製
        recorder.start();
        console.log(`開始錄製 ${DURATION_SECONDS} 秒影片...`);

        let frame = 0;

        // 逐幀繪製函數
        function drawFrame() {
          // 清除畫布
          recordCtx.clearRect(0, 0, recordCanvas.width, recordCanvas.height);

          // 1. 繪製月相影片背景（動態）
          if (bgMoonVideoEl && bgMoonVideoEl.readyState >= 2) {
            const vw = bgMoonVideoEl.videoWidth || bgMoonVideoEl.width || 1;
            const vh = bgMoonVideoEl.videoHeight || bgMoonVideoEl.height || 1;
            if (vw > 1 && vh > 1) {
              const scale = Math.max(
                recordCanvas.width / vw,
                recordCanvas.height / vh
              );
              const dw = Math.round(vw * scale);
              const dh = Math.round(vh * scale);
              const ox = Math.round((recordCanvas.width - dw) / 2);
              const oy = Math.round((recordCanvas.height - dh) / 2);

              const intensity = CONFIG.BACKGROUND.INTENSITY || 0.5;
              recordCtx.globalAlpha = Math.min(1, 0.3 + intensity * 0.7);
              recordCtx.drawImage(bgMoonVideoEl, 0, 0, vw, vh, ox, oy, dw, dh);
              recordCtx.globalAlpha = 1;
            }
          }

          // 2. 繪製靜止人物（前景）- 保持原始比例
          const personWidth = personImg.naturalWidth || personImg.width;
          const personHeight = personImg.naturalHeight || personImg.height;

          if (personWidth > 0 && personHeight > 0) {
            // 計算人物圖片的縮放，保持比例並完全覆蓋畫面
            const personScaleX = recordCanvas.width / personWidth;
            const personScaleY = recordCanvas.height / personHeight;
            const personScale = Math.max(personScaleX, personScaleY); // cover 模式

            const personDrawWidth = Math.round(personWidth * personScale);
            const personDrawHeight = Math.round(personHeight * personScale);
            const personOffsetX = Math.round(
              (recordCanvas.width - personDrawWidth) / 2
            );
            const personOffsetY = Math.round(
              (recordCanvas.height - personDrawHeight) / 2
            );

            recordCtx.drawImage(
              personImg,
              0,
              0,
              personWidth,
              personHeight,
              personOffsetX,
              personOffsetY,
              personDrawWidth,
              personDrawHeight
            );
          } else {
            // 備用方案：直接拉伸
            recordCtx.drawImage(
              personImg,
              0,
              0,
              recordCanvas.width,
              recordCanvas.height
            );
          }

          frame++;

          // 更新進度到 UI
          const currentTime = frame / FPS;
          if (recordingProgressCallback) {
            recordingProgressCallback.updateProgress(
              currentTime,
              DURATION_SECONDS
            );
          }

          // 繼續下一幀或結束錄製
          if (frame < totalFrames) {
            setTimeout(drawFrame, 1000 / FPS);
          } else {
            if (recordingProgressCallback) {
              recordingProgressCallback.setStatus("錄製完成，正在生成檔案...");
            }
            recorder.stop();
            console.log("所有幀錄製完成");
          }
        }

        // 開始繪製第一幀
        drawFrame();
      };

      personImg.onerror = () => {
        reject(new Error("靜止人物圖片載入失敗"));
      };

      personImg.src = staticPersonDataURL;
    });
  } catch (error) {
    console.error("影片生成錯誤:", error);
    return { png: staticPersonDataURL, error: error.message };
  }
}

// 嘗試使用 Web Share API 分享 Blob（若支援檔案分享）
// 這是內部工具函式（UI 應使用 shareLastRecording）
async function tryShareBlob(
  blob,
  filename,
  title = "月亮節 AR 影片",
  text = ""
) {
  try {
    const file = new File([blob], filename, { type: blob.type || "video/mp4" });

    if (navigator.share && navigator.canShare) {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        return { ok: true, method: "webshare" };
      }
      return { ok: false, reason: "canShare-false" };
    }

    // 若沒有 canShare（或只支援 url/text），視為不支援檔案分享
    return { ok: false, reason: "no-file-share-support" };
  } catch (err) {
    console.warn("tryShareBlob error", err);
    return { ok: false, reason: "error", error: err };
  }
}
