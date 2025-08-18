// uiController.js
// UI / 事件綁定模組（ESM）
// - 導入 segmentationCore 的 API，綁定按鈕、滑桿、RWD 抽屜、快捷鍵等

import {
  CONFIG,
  initCore,
  start,
  stop,
  switchCamera,
  onResize,
  setShowMaskPreview,
  setEnableSegmentation,
  setBackgroundType,
  setBackgroundIntensity,
  setEdgeFeather,
  setTemporalAlpha,
  setThreshold,
  isRunning,
  initializeConfig,
  capturePhoto,
  setGifBlendMode,
  setShouldGenerateGif,
  setGifQuality,
} from "./segmentationCore.js";

// 取得 DOM
const videoEl = document.getElementById("video");
const bgCanvas = document.getElementById("bgCanvas");
const maskCanvas = document.getElementById("maskCanvas");
const outCanvas = document.getElementById("outputCanvas");
const bgVideoEl = document.getElementById("bgVideo");
const bgGifEl = document.getElementById("bgGif");
const bgMoonVideoEl = document.getElementById("bgVideo"); // 月相影片背景

const statusText = document.getElementById("statusText");
const faceCountEl = document.getElementById("faceCount");
const facesInAreaEl = document.getElementById("facesInArea");
const moonEffect = document.getElementById("moonEffect");

const startBtn = document.getElementById("startButton");
const stopBtn = document.getElementById("stopButton");
const switchBtn = document.getElementById("switchCamera");
const enableSegmentationCheckbox =
  document.getElementById("enableSegmentation");
const showMaskCheckbox = document.getElementById("showMask");
const toggleMaskBtn = document.getElementById("toggleMask");
const capturePhotoBtn = document.getElementById("capturePhoto");
const backgroundSelect = document.getElementById("backgroundSelect");
const effectIntensitySlider = document.getElementById("effectIntensity");
const intensityValueSpan = document.getElementById("intensityValue");
const edgeFeatherSlider = document.getElementById("edgeFeather");
const edgeFeatherVal = document.getElementById("edgeFeatherVal");
const temporalSmoothSlider = document.getElementById("temporalSmooth");
const temporalSmoothVal = document.getElementById("temporalSmoothVal");
const thresholdSlider = document.getElementById("threshold");
const thresholdVal = document.getElementById("thresholdVal");
const gifBlendModeSelect = document.getElementById("gifBlendMode");
const gifBlendOptions = document.getElementById("gifBlendOptions");
const generateGifCheckbox = document.getElementById("generateGif");
const gifOutputOptions = document.getElementById("gifOutputOptions");
const gifQualitySelect = document.getElementById("gifQuality");
const gifGenerationSettings = document.getElementById("gifGenerationSettings");
const menuBtn = document.getElementById("menuButton");
const scrimEl = document.getElementById("scrim");

// ===== Moon WebM + Alpha 測試來源（含透明）與後備 =====
// WebM (VP9 + Alpha)：月亮主題（Wikimedia，CORS 友善）
// Safari 或不支援 VP9 → 退回一般 MP4（無透明；使用 MDN cc0 示範）
const MOON_WEBM_ALPHA =
  "https://upload.wikimedia.org/wikipedia/commons/2/25/Moon_Phase_and_Libration%2C_2025_South_Up_%28SVS5416_-_phases_2025_plain_s_2160p30%29.webm";
const FALLBACK_MP4 =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

// 狀態與統計回呼
function handleStatus(t) {
  statusText.textContent = t;
}
function handleStats({ faceCount, facesInArea, moonActive }) {
  faceCountEl.textContent = String(faceCount);
  facesInAreaEl.textContent = String(facesInArea);
  moonEffect.classList.toggle("active", !!moonActive);
}

// 初始化核心（傳入 DOM 與回呼）
initCore(
  {
    videoEl,
    bgCanvas,
    maskCanvas,
    outCanvas,
    bgVideoEl,
    bgGifEl,
    bgMoonVideoEl,
  },
  { onStatus: handleStatus, onStats: handleStats }
);

// 綁定 UI
function bindUI() {
  startBtn.addEventListener("click", async () => {
    if (isRunning()) return;
    startBtn.disabled = true;
    try {
      await start();
      stopBtn.disabled = false;
      switchBtn.disabled = false;
    } catch (e) {
      console.error(e);
      startBtn.disabled = false;
    }
  });

  stopBtn.addEventListener("click", () => {
    stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    switchBtn.disabled = true;
  });

  switchBtn.addEventListener("click", async () => {
    if (!isRunning()) return;
    try {
      await switchCamera();
    } catch (e) {
      console.warn(e);
    }
  });

  // 拍照按鈕
  capturePhotoBtn.addEventListener("click", async () => {
    if (!isRunning()) {
      alert("請先啟動相機再拍照");
      return;
    }

    // 添加拍照動畫效果
    capturePhotoBtn.style.transform = "scale(0.95)";
    capturePhotoBtn.style.opacity = "0.7";

    // 拍照
    const result = await capturePhoto();

    // 恢復按鈕狀態
    setTimeout(() => {
      capturePhotoBtn.style.transform = "scale(1)";
      capturePhotoBtn.style.opacity = "1";
    }, 150);

    // 顯示拍照反饋
    if (result) {
      // 創建閃光效果
      const flash = document.createElement("div");
      flash.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: white;
        opacity: 0.8;
        z-index: 9999;
        pointer-events: none;
        animation: photoFlash 0.2s ease-out;
      `;

      // 添加閃光動畫 CSS
      if (!document.getElementById("photoFlashStyle")) {
        const style = document.createElement("style");
        style.id = "photoFlashStyle";
        style.textContent = `
          @keyframes photoFlash {
            0% { opacity: 0; }
            50% { opacity: 0.8; }
            100% { opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(flash);
      setTimeout(() => document.body.removeChild(flash), 200);

      // 更新狀態文字
      const bgType = CONFIG.BACKGROUND && CONFIG.BACKGROUND.TYPE;
      if (
        bgType === "gif" &&
        generateGifCheckbox &&
        generateGifCheckbox.checked
      ) {
        onStatus("📸 PNG 已下載，正在生成 GIF...");

        // 簡化狀態處理
        setTimeout(() => {
          onStatus("🎬 正在生成簡單 GIF...");
        }, 500);

        setTimeout(() => {
          onStatus("檢測中");
        }, 5000);
      } else {
        onStatus("📸 拍照成功！圖片已下載");
        setTimeout(() => onStatus("檢測中"), 2000);
      }
    } else {
      alert("拍照失敗，請重試");
    }
  });

  // 快捷鍵
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      isRunning() ? stopBtn.click() : startBtn.click();
    }
    if (e.key.toLowerCase() === "c" && isRunning()) switchBtn.click();
    // 新增拍照快捷鍵：P 鍵
    if (e.key.toLowerCase() === "p" && isRunning()) {
      e.preventDefault();
      capturePhotoBtn.click();
    }
  });

  // 背景選擇 & 強度
  backgroundSelect.addEventListener("change", (e) => {
    const bgType = e.target.value;
    setBackgroundType(bgType);

    // 顯示/隱藏 GIF 相關選項
    const isGifMode = bgType === "gif";
    const isMoonVideoMode = bgType === "moon_video";

    if (gifBlendOptions) {
      gifBlendOptions.style.display = isGifMode ? "flex" : "none";
    }
    if (gifOutputOptions) {
      gifOutputOptions.style.display = isGifMode ? "flex" : "none";
    }
    if (gifGenerationSettings) {
      const showSettings =
        isGifMode && generateGifCheckbox && generateGifCheckbox.checked;
      gifGenerationSettings.style.display = showSettings ? "flex" : "none";
    }

    // 如果選擇月相影片，確保影片開始播放
    if (isMoonVideoMode && bgMoonVideoEl) {
      bgMoonVideoEl.play().catch((e) => console.warn("月相影片播放失敗:", e));
      console.log("🌙 切換到月相影片背景模式");
    }
  });

  // GIF 融合模式選擇
  if (gifBlendModeSelect) {
    gifBlendModeSelect.addEventListener("change", (e) => {
      setGifBlendMode(e.target.value);
    });
  }

  // GIF 生成選項
  if (generateGifCheckbox) {
    generateGifCheckbox.addEventListener("change", (e) => {
      const shouldGenerate = e.target.checked;
      setShouldGenerateGif(shouldGenerate);

      // 顯示/隱藏生成設定
      if (gifGenerationSettings) {
        const bgType = backgroundSelect.value;
        const showSettings = shouldGenerate && bgType === "gif";
        gifGenerationSettings.style.display = showSettings ? "flex" : "none";
      }
    });
  }

  // GIF 品質選擇
  if (gifQualitySelect) {
    gifQualitySelect.addEventListener("change", (e) => {
      setGifQuality(Number(e.target.value));
    });
  }
  effectIntensitySlider.addEventListener("input", (e) => {
    const v = Number(e.target.value) / 100;
    setBackgroundIntensity(v);
    intensityValueSpan.textContent = `${e.target.value}%`;
  });

  // 蒙版顯示
  toggleMaskBtn.addEventListener("click", () => {
    showMaskCheckbox.checked = !showMaskCheckbox.checked;
    setShowMaskPreview(showMaskCheckbox.checked);
  });
  showMaskCheckbox.addEventListener("change", (e) => {
    setShowMaskPreview(e.target.checked);
  });

  // 去背開關
  enableSegmentationCheckbox.addEventListener("change", (e) => {
    setEnableSegmentation(e.target.checked);
    if (!e.target.checked) {
      // 關閉去背時，確保蒙版預覽也隱藏
      setShowMaskPreview(false);
      showMaskCheckbox.checked = false;
    }
  });

  // 平滑與閾值
  edgeFeatherSlider.addEventListener("input", (e) => {
    setEdgeFeather(Number(e.target.value));
    edgeFeatherVal.textContent = `${e.target.value} px`;
  });
  temporalSmoothSlider.addEventListener("input", (e) => {
    const v = Number(e.target.value) / 100;
    setTemporalAlpha(v);
    temporalSmoothVal.textContent = v.toFixed(2);
  });
  thresholdSlider.addEventListener("input", (e) => {
    const v = Number(e.target.value) / 100;
    setThreshold(v);
    thresholdVal.textContent = v.toFixed(2);
  });

  // RWD 側欄抽屜
  function togglePanel() {
    document.body.classList.toggle("panel-open");
    const open = document.body.classList.contains("panel-open");
    if (scrimEl) scrimEl.hidden = !open;
    setTimeout(() => {
      onResize();
    }, 260);
  }
  if (menuBtn) menuBtn.addEventListener("click", togglePanel);
  if (scrimEl) scrimEl.addEventListener("click", togglePanel);

  // 視窗縮放
  window.addEventListener("resize", onResize);
}

// 支援檢查（不放核心，純 UI 提醒用）
function checkSupport() {
  if (!navigator.mediaDevices?.getUserMedia) {
    alert("此瀏覽器不支援相機，請改用新版 Chrome / Edge / Safari");
    return false;
  }
  return true;
}

// 自動選用「月亮 WebM + Alpha」或後備 MP4
function setupMoonBackgroundVideo() {
  if (!bgVideoEl) return;

  // 盡量避免跨域污染 canvas
  bgVideoEl.crossOrigin = "anonymous";

  // iOS/Safari 對 WebM 支援差，先偵測 VP9
  const testVid = document.createElement("video");
  const canVP9 = testVid.canPlayType('video/webm; codecs="vp9"') !== "";

  // 設定來源
  bgVideoEl.src = canVP9 ? MOON_WEBM_ALPHA : FALLBACK_MP4;

  // 確保自動播放條件
  bgVideoEl.muted = true;
  bgVideoEl.loop = true;
  bgVideoEl.playsInline = true;

  // 切到 video 背景模式
  backgroundSelect.value = "video";
  setBackgroundType("video");

  // 載入與播放
  const tryPlay = () => bgVideoEl.play().catch(() => {});
  bgVideoEl.addEventListener("canplay", tryPlay, { once: true });
  bgVideoEl.addEventListener("error", (e) => {
    console.warn("[bgVideo] 播放錯誤，改用後備 MP4", e);
    if (bgVideoEl.src !== FALLBACK_MP4) {
      bgVideoEl.src = FALLBACK_MP4;
      bgVideoEl.load();
      tryPlay();
    }
  });

  // 立刻嘗試
  try {
    bgVideoEl.load();
    tryPlay();
  } catch (e) {
    console.warn("[bgVideo] 初始播放失敗：", e);
  }
}

// 初始化入口
window.addEventListener("load", () => {
  if (!checkSupport()) return;

  // 初始化顯示數值（與滑桿同步）
  temporalSmoothVal.textContent = (
    Number(temporalSmoothSlider.value) / 100
  ).toFixed(2);
  thresholdVal.textContent = (Number(thresholdSlider.value) / 100).toFixed(2);
  edgeFeatherVal.textContent = `${edgeFeatherSlider.value} px`;
  intensityValueSpan.textContent = `${effectIntensitySlider.value}%`;

  // 背景選擇預設（與 HTML 下拉一致）
  setBackgroundType(backgroundSelect.value);
  setBackgroundIntensity(Number(effectIntensitySlider.value) / 100);
  setShowMaskPreview(showMaskCheckbox.checked);
  setEnableSegmentation(enableSegmentationCheckbox.checked);

  // 初始化 GIF 相關選項顯示狀態
  const isGifMode = backgroundSelect.value === "gif";
  if (gifBlendOptions) {
    gifBlendOptions.style.display = isGifMode ? "flex" : "none";
  }
  if (gifOutputOptions) {
    gifOutputOptions.style.display = isGifMode ? "flex" : "none";
  }
  if (gifGenerationSettings) {
    const showSettings =
      isGifMode && generateGifCheckbox && generateGifCheckbox.checked;
    gifGenerationSettings.style.display = showSettings ? "flex" : "none";
  }

  // 設定預設 GIF 相關設定
  if (gifBlendModeSelect) {
    setGifBlendMode(gifBlendModeSelect.value);
  }
  if (generateGifCheckbox) {
    setShouldGenerateGif(generateGifCheckbox.checked);
  }
  if (gifQualitySelect) {
    setGifQuality(Number(gifQualitySelect.value));
  }

  // ⭐ 自動載入「月亮 WebM + Alpha」或後備 MP4
  setupMoonBackgroundVideo();

  // 綁好事件
  bindUI();
});
