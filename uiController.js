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
  setRecordingProgressCallback,
  setVideoOutputFormat,
} from "./segmentationCore.js";

// 取得 DOM
const videoEl = document.getElementById("video");
const bgCanvas = document.getElementById("bgCanvas");
const maskCanvas = document.getElementById("maskCanvas");
const outCanvas = document.getElementById("outputCanvas");
const bgVideoEl = document.getElementById("bgVideo");
const bgGifEl = document.getElementById("bgGif");
const bgMoonVideoEl = document.getElementById("bgMoonVideo"); // 月相影片背景

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
const moonVideoOptions = document.getElementById("moonVideoOptions");
const moonVideoSettings = document.getElementById("moonVideoSettings");
const menuBtn = document.getElementById("menuButton");
const scrimEl = document.getElementById("scrim");

// ===== 本地月相影片 =====
// 使用專案根目錄的 m30.webm 作為月相背景

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
    startBtn.textContent = "啟動中...";

    try {
      await start();
      stopBtn.disabled = false;
      switchBtn.disabled = false;
      startBtn.textContent = "開始";
    } catch (e) {
      console.error(e);
      startBtn.disabled = false;
      startBtn.textContent = "開始";

      // 針對不同錯誤給出友善提示
      let errorMessage = "啟動失敗";
      if (
        e.name === "NotAllowedError" ||
        e.message.includes("Permission denied")
      ) {
        errorMessage =
          "相機權限被拒絕，請在瀏覽器設定中允許相機使用權限，然後重新整理頁面";
      } else if (e.name === "NotFoundError") {
        errorMessage = "找不到相機設備";
      } else if (e.name === "NotSupportedError") {
        errorMessage = "瀏覽器不支援相機功能";
      } else if (e.message.includes("MediaPipe")) {
        errorMessage = "AI 模型載入失敗，請檢查網路連線";
      }

      alert(errorMessage);
      handleStatus(errorMessage);
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

    // 檢查是否為月相影片模式，顯示錄製進度
    const bgType = backgroundSelect.value;
    let progressDialog = null;
    if (bgType === "moon_video" && bgMoonVideoEl) {
      // 設定影片輸出格式
      const selectedFormat = getSelectedVideoFormat();
      setVideoOutputFormat(selectedFormat);

      progressDialog = createRecordingProgressDialog();
      // 設置進度回調
      setRecordingProgressCallback(progressDialog);
    }

    // 拍照（會觸發錄製）
    const result = await capturePhoto();

    // 拍照完成後清理
    if (progressDialog) {
      setRecordingProgressCallback(null); // 清除回調
      progressDialog.close();
    }

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

    // 顯示/隱藏相關選項
    const isGifMode = bgType === "gif";
    const isMoonVideoMode = bgType === "moon_video";

    // GIF 相關選項
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

    // 月相影片格式選項
    if (moonVideoOptions) {
      moonVideoOptions.style.display = isMoonVideoMode ? "flex" : "none";
    }
    if (moonVideoSettings) {
      moonVideoSettings.style.display = isMoonVideoMode ? "flex" : "none";
    }

    // 如果選擇月相影片，延遲載入並播放
    if (isMoonVideoMode && bgMoonVideoEl) {
      console.log("🌙 切換到月相影片背景模式");

      // 顯示載入提示對話框
      showVideoLoadingDialog(bgMoonVideoEl);
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

  // 影片格式選擇
  document.querySelectorAll('input[name="videoFormat"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.checked) {
        setVideoOutputFormat(e.target.value);
        console.log(`📹 切換影片格式: ${e.target.value.toUpperCase()}`);
      }
    });
  });

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

// 檢測是否為手機設備
function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 900
  );
}

// 獲取選中的影片格式
function getSelectedVideoFormat() {
  const radioButtons = document.querySelectorAll('input[name="videoFormat"]');
  for (const radio of radioButtons) {
    if (radio.checked) {
      return radio.value;
    }
  }
  return "mp4"; // 預設 MP4
}

// 手機版優化提示
function showMobileOptimizationTip() {
  if (isMobileDevice()) {
    const tip = document.createElement("div");
    tip.style.cssText = `
      position: fixed;
      top: 60px;
      left: 10px;
      right: 10px;
      background: rgba(255, 193, 7, 0.9);
      color: #000;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    tip.innerHTML = `
      📱 <strong>手機版提示</strong><br>
      為了更好的體驗，建議選擇「波紋」或「頻率條」背景
      <button onclick="this.parentElement.remove()" style="margin-left: 8px; padding: 4px 8px; border: none; background: #000; color: #fff; border-radius: 4px; cursor: pointer;">知道了</button>
    `;
    document.body.appendChild(tip);

    // 3秒後自動消失
    setTimeout(() => {
      if (tip.parentElement) {
        tip.remove();
      }
    }, 8000);
  }
}

// 顯示影片載入對話框
function showVideoLoadingDialog(videoElement) {
  // 創建載入對話框
  const overlay = document.createElement("div");
  overlay.id = "videoLoadingOverlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(11, 16, 32, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(8px);
  `;

  const isMobile = isMobileDevice();
  const videoSize = "約 10MB"; // m30.webm 預估大小

  overlay.innerHTML = `
    <div style="text-align: center; color: #e6edf3; max-width: 400px; padding: 0 20px;">
      <div style="width: 60px; height: 60px; border: 4px solid rgba(255, 235, 59, 0.3); border-top: 4px solid #ffeb3b; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px;"></div>
      
      <h3 style="margin: 0 0 16px; color: #ffeb3b; font-size: 20px;">🌙 載入月相影片</h3>
      
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5;">
        正在下載高畫質月相動畫<br>
        檔案大小：${videoSize}
      </p>
      
      <div id="loadingProgress" style="margin: 16px 0; font-size: 14px; color: #9fb0c0;">
        準備下載中...
      </div>
      
      <div style="margin-top: 20px;">
        <button id="cancelVideoLoad" style="
          padding: 8px 16px; 
          border: 1px solid #ffeb3b; 
          background: transparent; 
          color: #ffeb3b; 
          border-radius: 6px; 
          cursor: pointer;
          font-size: 14px;
        ">取消並選擇其他背景</button>
      </div>
      
      ${
        isMobile
          ? `
        <div style="margin-top: 16px; padding: 12px; background: rgba(255, 193, 7, 0.15); border-radius: 6px; font-size: 13px; color: #ffc107;">
          ⚠️ 手機版提醒：此影片較大，建議在 WiFi 環境下使用
        </div>
      `
          : ""
      }
    </div>
  `;

  document.body.appendChild(overlay);

  // 進度更新函數
  let progressInterval;
  let loadingStartTime = Date.now();
  const progressEl = overlay.querySelector("#loadingProgress");

  function updateProgress() {
    const elapsed = Math.floor((Date.now() - loadingStartTime) / 1000);
    const readyState = videoElement.readyState;

    let progressText = "";
    if (readyState === 0) {
      progressText = `下載中... (${elapsed}s)`;
    } else if (readyState === 1) {
      progressText = `下載中，已獲取基本信息... (${elapsed}s)`;
    } else if (readyState === 2) {
      progressText = `下載中，可開始播放... (${elapsed}s)`;
    } else if (readyState === 3) {
      progressText = `下載進行中，可流暢播放... (${elapsed}s)`;
    } else if (readyState === 4) {
      progressText = `下載完成！ (${elapsed}s)`;
    }

    progressEl.textContent = progressText;
  }

  progressInterval = setInterval(updateProgress, 500);

  // 取消按鈕
  overlay.querySelector("#cancelVideoLoad").addEventListener("click", () => {
    clearInterval(progressInterval);
    overlay.remove();

    // 切換回預設背景
    backgroundSelect.value = "waves";
    setBackgroundType("waves");
    handleStatus("已取消影片載入，切換到波紋背景");

    // 停止影片載入
    videoElement.src = "";
    videoElement.load();
  });

  // 開始載入影片
  handleStatus("開始載入月相影片...");

  if (!videoElement.src && videoElement.children.length > 0) {
    videoElement.load();
  }

  // 監聽載入事件
  const onCanPlay = () => {
    clearInterval(progressInterval);
    progressEl.textContent = "載入完成，開始播放...";

    videoElement
      .play()
      .then(() => {
        setTimeout(() => {
          overlay.remove();
          handleStatus("月相影片載入完成");
          setTimeout(() => handleStatus("檢測中"), 2000);
        }, 1000);
      })
      .catch((e) => {
        console.warn("月相影片播放失敗:", e);
        overlay.remove();
        handleStatus("月相影片播放失敗，請手動點擊播放");
      });
  };

  const onError = () => {
    clearInterval(progressInterval);
    overlay.remove();
    handleStatus("月相影片載入失敗");

    // 切換回預設背景
    backgroundSelect.value = "waves";
    setBackgroundType("waves");
  };

  // 超時處理
  const timeoutHandler = setTimeout(() => {
    if (videoElement.readyState < 3) {
      progressEl.innerHTML = `
        載入時間較長，可能因為網路較慢<br>
        <small style="color: #9fb0c0;">建議取消並選擇其他背景</small>
      `;
    }
  }, 10000);

  videoElement.addEventListener("canplay", onCanPlay, { once: true });
  videoElement.addEventListener("error", onError, { once: true });

  // 清理函數
  const cleanup = () => {
    clearInterval(progressInterval);
    clearTimeout(timeoutHandler);
    videoElement.removeEventListener("canplay", onCanPlay);
    videoElement.removeEventListener("error", onError);
  };

  // 確保對話框被移除時清理資源
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === overlay) {
          cleanup();
          observer.disconnect();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true });
}

// 創建錄製進度對話框
function createRecordingProgressDialog() {
  // 創建進度對話框
  const progressOverlay = document.createElement("div");
  progressOverlay.id = "recordingProgressOverlay";
  progressOverlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(11, 16, 32, 0.95);
    border: 2px solid #ffeb3b;
    border-radius: 12px;
    padding: 24px;
    z-index: 10001;
    backdrop-filter: blur(8px);
    min-width: 350px;
    text-align: center;
    color: #e6edf3;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  `;

  progressOverlay.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; color: #ffeb3b; font-size: 18px;">🎬 錄製月相影片中</h3>
      <div style="font-size: 14px; color: #9fb0c0; margin-bottom: 16px;">
        靜止人物 + 動態月相背景
      </div>
    </div>
    
    <div style="margin: 16px 0;">
      <div id="recordingProgressBar" style="background: rgba(255, 255, 255, 0.1); height: 12px; border-radius: 6px; overflow: hidden; margin: 12px 0;">
        <div id="recordingProgressFill" style="background: linear-gradient(90deg, #ffeb3b, #ffc107); height: 100%; width: 0%; transition: width 0.1s linear;"></div>
      </div>
      <div id="recordingProgressText" style="font-size: 16px; color: #ffeb3b; font-weight: bold;">
        準備錄製...
      </div>
      <div id="recordingTimeText" style="font-size: 14px; color: #9fb0c0; margin-top: 8px;">
        0.0s / 8.0s
      </div>
    </div>
    
    <div style="margin: 16px 0; padding: 12px; background: rgba(255, 235, 59, 0.1); border-radius: 6px; font-size: 13px;">
      🌙 正在錄製 8 秒高畫質月相動畫
    </div>
  `;

  // 添加背景遮罩
  const backdrop = document.createElement("div");
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    backdrop-filter: blur(4px);
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(progressOverlay);

  // 獲取進度元素
  const progressFill = progressOverlay.querySelector("#recordingProgressFill");
  const progressText = progressOverlay.querySelector("#recordingProgressText");
  const timeText = progressOverlay.querySelector("#recordingTimeText");

  // 返回控制對象
  return {
    updateProgress: (current, total) => {
      const percent = (current / total) * 100;
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `錄製進度：${percent.toFixed(1)}%`;
      timeText.textContent = `${current.toFixed(1)}s / ${total.toFixed(1)}s`;
    },

    setStatus: (status) => {
      progressText.textContent = status;
    },

    close: () => {
      if (backdrop.parentElement) backdrop.remove();
      if (progressOverlay.parentElement) progressOverlay.remove();
    },
  };
}

// 舊的顯示影片進度對話框（保留但改名）
function showVideoProgressDialog() {
  if (!bgMoonVideoEl) return;

  const currentTime = bgMoonVideoEl.currentTime || 0;
  const duration = bgMoonVideoEl.duration || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 計算月相階段
  const getMoonPhase = (progressPercent) => {
    if (progressPercent < 12.5) return "🌑 新月";
    if (progressPercent < 25) return "🌒 眉月";
    if (progressPercent < 37.5) return "🌓 上弦月";
    if (progressPercent < 50) return "🌔 盈凸月";
    if (progressPercent < 62.5) return "🌕 滿月";
    if (progressPercent < 75) return "🌖 虧凸月";
    if (progressPercent < 87.5) return "🌗 下弦月";
    return "🌘 殘月";
  };

  const moonPhase = getMoonPhase(progress);

  // 創建進度對話框
  const progressOverlay = document.createElement("div");
  progressOverlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(11, 16, 32, 0.95);
    border: 2px solid #ffeb3b;
    border-radius: 12px;
    padding: 24px;
    z-index: 10001;
    backdrop-filter: blur(8px);
    min-width: 300px;
    text-align: center;
    color: #e6edf3;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  `;

  progressOverlay.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px; color: #ffeb3b; font-size: 18px;">🌙 月相背景當前狀態</h3>
      <div style="font-size: 24px; margin: 12px 0;">${moonPhase}</div>
      <div style="font-size: 12px; color: #9fb0c0; margin-bottom: 8px;">
        (背景影片當前播放進度)
      </div>
    </div>
    
    <div style="margin: 16px 0;">
      <div style="background: rgba(255, 255, 255, 0.1); height: 8px; border-radius: 4px; overflow: hidden; margin: 8px 0;">
        <div style="background: linear-gradient(90deg, #ffeb3b, #ffc107); height: 100%; width: ${progress.toFixed(
          1
        )}%; transition: width 0.3s ease;"></div>
      </div>
      <div style="font-size: 14px; color: #9fb0c0;">
        進度：${progress.toFixed(1)}% (${currentTime.toFixed(
    1
  )}s / ${duration.toFixed(1)}s)
      </div>
    </div>
    
    <div style="margin: 16px 0; padding: 12px; background: rgba(255, 235, 59, 0.1); border-radius: 6px; font-size: 13px;">
      <div style="margin-bottom: 8px;">
        此時拍照將記錄 <strong style="color: #ffeb3b;">${moonPhase}</strong> 階段的月相背景
      </div>
      <div style="font-size: 12px; color: #ffc107; border-top: 1px solid rgba(255, 193, 7, 0.3); padding-top: 8px; margin-top: 8px;">
        ⚠️ 注意：將生成 8 秒動態影片，包含完整月相週期變化
      </div>
    </div>
    
    <div style="margin: 12px 0; font-size: 12px; color: #9fb0c0;">
      📌 此對話框不會自動消失，當前顯示的是背景影片的播放進度
    </div>
    
    <div style="display: flex; gap: 8px; justify-content: center; margin-top: 16px;">
      <button id="cancelPhoto" style="
        padding: 8px 16px; 
        border: 1px solid #9fb0c0; 
        background: transparent; 
        color: #9fb0c0; 
        border-radius: 6px; 
        cursor: pointer;
        font-size: 14px;
      ">取消拍照</button>
      
      <button id="closeProgressDialog" style="
        padding: 8px 16px; 
        border: 1px solid #ffeb3b; 
        background: #ffeb3b; 
        color: #0b1020; 
        border-radius: 6px; 
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      ">確定錄製 8 秒影片</button>
    </div>
  `;

  // 添加背景遮罩
  const backdrop = document.createElement("div");
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    backdrop-filter: blur(2px);
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(progressOverlay);

  // 關閉對話框的函數
  let closeDialog = () => {
    backdrop.remove();
    progressOverlay.remove();
  };

  // 取消拍照的函數
  let cancelPhoto = () => {
    closeDialog();
    // 恢復拍照按鈕狀態
    capturePhotoBtn.style.transform = "scale(1)";
    capturePhotoBtn.style.opacity = "1";
    handleStatus("已取消拍照");
  };

  // 綁定事件
  progressOverlay
    .querySelector("#closeProgressDialog")
    .addEventListener("click", closeDialog);
  progressOverlay
    .querySelector("#cancelPhoto")
    .addEventListener("click", cancelPhoto);
  backdrop.addEventListener("click", cancelPhoto); // 點擊背景取消而不是確定

  // 按 ESC 鍵取消
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      cancelPhoto();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  // 移除自動關閉，改為只能手動關閉
  // 這樣用戶可以仔細查看月相進度

  // 添加清理函數到關閉和取消對話框
  const originalCloseDialog = closeDialog;
  const originalCancelPhoto = cancelPhoto;

  closeDialog = () => {
    document.removeEventListener("keydown", handleEscape);
    originalCloseDialog();
  };

  cancelPhoto = () => {
    document.removeEventListener("keydown", handleEscape);
    originalCancelPhoto();
  };
}

// 本地月相影片不需要複雜的設定，直接使用 HTML 中的 m30.webm

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

  // 設定預設影片格式為 MP4
  setVideoOutputFormat("mp4");

  // 注意：不再自動載入月相影片，改為按需載入以提升手機版效能

  // 顯示手機版優化提示
  setTimeout(showMobileOptimizationTip, 1000);

  // 綁好事件
  bindUI();
});
