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
  capturePhoto,
  setRecordingProgressCallback,
  setVideoOutputFormat,
  hasRecordingAvailable,
  getLastRecordingUrl,
  shareLastRecording,
  clearLastRecording,
} from "./segmentationCore.js";

const shareBtn = document.getElementById("shareVideo");
const downloadVideoBtn = document.getElementById("downloadVideo");

// 取得 DOM
const videoEl = document.getElementById("video");
const bgCanvas = document.getElementById("bgCanvas");
const maskCanvas = document.getElementById("maskCanvas");
const outCanvas = document.getElementById("outputCanvas");
const bgVideoEl = document.getElementById("bgVideo");
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
const moonVideoOptions = document.getElementById("moonVideoOptions");
const moonVideoSettings = document.getElementById("moonVideoSettings");
const menuBtn = document.getElementById("menuButton");
const scrimEl = document.getElementById("scrim");

// 狀態與統計回呼
function handleStatus(t) {
  if (statusText) statusText.textContent = t;
}
function handleStats({ faceCount, facesInArea, moonActive }) {
  if (faceCountEl) faceCountEl.textContent = String(faceCount);
  if (facesInAreaEl) facesInAreaEl.textContent = String(facesInArea);
  if (moonEffect) moonEffect.classList.toggle("active", !!moonActive);
}

// 初始化核心（傳入 DOM 與回呼）
// 傳入 bgGifEl: null（不使用 GIF）
initCore(
  {
    videoEl,
    bgCanvas,
    maskCanvas,
    outCanvas,
    bgVideoEl,
    bgGifEl: null,
    bgMoonVideoEl,
  },
  { onStatus: handleStatus, onStats: handleStats }
);

// 綁定 UI
function bindUI() {
  // 下載按鈕：用 segmentationCore.getLastRecordingUrl() 產生 ObjectURL 並下載
  if (downloadVideoBtn) {
    downloadVideoBtn.addEventListener("click", (e) => {
      const url = getLastRecordingUrl();
      if (!url) {
        alert("目前沒有可下載的影片");
        return;
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      }, 1500);
    });
  }

  // 分享按鈕（toolbar，備援）
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      try {
        const res = await shareLastRecording();
        console.log("分享結果：", res);
        if (res && res.url) {
          alert("分享成功或已上傳: " + res.url);
        } else {
          alert("分享已觸發（系統面板或已完成上傳）");
        }
      } catch (err) {
        console.error("分享失敗：", err);
        alert("分享失敗，建議先下載再手動分享");
      }
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      if (isRunning()) return;
      startBtn.disabled = true;
      startBtn.textContent = "啟動中...";

      try {
        await start();
        if (stopBtn) stopBtn.disabled = false;
        if (switchBtn) switchBtn.disabled = false;
        startBtn.textContent = "開始";
      } catch (e) {
        console.error(e);
        startBtn.disabled = false;
        startBtn.textContent = "開始";

        let errorMessage = "啟動失敗";
        if (
          e.name === "NotAllowedError" ||
          (e.message && e.message.includes("Permission denied"))
        ) {
          errorMessage =
            "相機權限被拒絕，請在瀏覽器設定中允許相機使用權限，然後重新整理頁面";
        } else if (e.name === "NotFoundError") {
          errorMessage = "找不到相機設備";
        } else if (e.name === "NotSupportedError") {
          errorMessage = "瀏覽器不支援相機功能";
        } else if (e.message && e.message.includes("MediaPipe")) {
          errorMessage = "AI 模型載入失敗，請檢查網路連線";
        }

        alert(errorMessage);
        handleStatus(errorMessage);
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener("click", () => {
      stop();
      if (startBtn) startBtn.disabled = false;
      stopBtn.disabled = true;
      if (switchBtn) switchBtn.disabled = true;
    });
  }

  if (switchBtn) {
    switchBtn.addEventListener("click", async () => {
      if (!isRunning()) return;
      try {
        await switchCamera();
      } catch (e) {
        console.warn(e);
      }
    });
  }

  // 拍照按鈕
  if (capturePhotoBtn) {
    capturePhotoBtn.addEventListener("click", async () => {
      if (!isRunning()) {
        alert("請先啟動相機再拍照");
        return;
      }

      // 添加拍照動畫效果
      capturePhotoBtn.style.transform = "scale(0.95)";
      capturePhotoBtn.style.opacity = "0.7";

      // 檢查是否為月相影片模式，顯示錄製進度
      const bgType = backgroundSelect
        ? backgroundSelect.value
        : CONFIG.BACKGROUND && CONFIG.BACKGROUND.TYPE;
      let progressDialog = null;
      if (bgType === "moon_video" && bgMoonVideoEl) {
        const selectedFormat = getSelectedVideoFormat();
        setVideoOutputFormat(selectedFormat);

        progressDialog = createRecordingProgressDialog();
        setRecordingProgressCallback(progressDialog);
      }

      // 拍照（會觸發錄製或回傳 PNG）
      const result = await capturePhoto();

      // 拍照完成後清理
      if (progressDialog) {
        setRecordingProgressCallback(null);
        // 不自動關閉 modal — 保留讓使用者按分享
        // progressDialog.close();
      }

      // 恢復按鈕狀態（視覺回饋）
      setTimeout(() => {
        capturePhotoBtn.style.transform = "scale(1)";
        capturePhotoBtn.style.opacity = "1";
      }, 150);

      // 顯示拍照反饋
      if (result) {
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

        const immediateVideoUrl =
          result && result.video && typeof result.video === "string"
            ? result.video
            : null;

        // 傳入 progressDialog（可能為 null）
        if (
          immediateVideoUrl ||
          hasRecordingAvailable() ||
          (result && result.video === "generating")
        ) {
          setupShareDownloadButtons(result, immediateVideoUrl, progressDialog);
        } else {
          handleStatus("📸 拍照成功！圖片已下載");
          setTimeout(() => handleStatus("檢測中"), 2000);
        }
      } else {
        alert("拍照失敗，請重試");
      }
    });
  }

  // 快捷鍵
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      isRunning() ? stopBtn.click() : startBtn.click();
    }
    if (e.key.toLowerCase() === "c" && isRunning()) switchBtn.click();
    if (e.key.toLowerCase() === "p" && isRunning()) {
      e.preventDefault();
      capturePhotoBtn.click();
    }
  });

  // 背景選擇 & 強度
  if (backgroundSelect) {
    backgroundSelect.addEventListener("change", (e) => {
      const bgType = e.target.value;
      setBackgroundType(bgType);

      const isMoonVideoMode = bgType === "moon_video";
      if (moonVideoOptions)
        moonVideoOptions.style.display = isMoonVideoMode ? "flex" : "none";
      if (moonVideoSettings)
        moonVideoSettings.style.display = isMoonVideoMode ? "flex" : "none";

      if (isMoonVideoMode && bgMoonVideoEl) {
        console.log("🌙 切換到月相影片背景模式");
        showVideoLoadingDialog(bgMoonVideoEl);
      }
    });
  }

  effectIntensitySlider?.addEventListener("input", (e) => {
    const v = Number(e.target.value) / 100;
    setBackgroundIntensity(v);
    if (intensityValueSpan)
      intensityValueSpan.textContent = `${e.target.value}%`;
  });

  // 蒙版顯示
  toggleMaskBtn?.addEventListener("click", () => {
    if (!showMaskCheckbox) return;
    showMaskCheckbox.checked = !showMaskCheckbox.checked;
    setShowMaskPreview(showMaskCheckbox.checked);
  });
  showMaskCheckbox?.addEventListener("change", (e) => {
    setShowMaskPreview(e.target.checked);
  });

  // 去背開關
  enableSegmentationCheckbox?.addEventListener("change", (e) => {
    setEnableSegmentation(e.target.checked);
    if (!e.target.checked) {
      setShowMaskPreview(false);
      if (showMaskCheckbox) showMaskCheckbox.checked = false;
    }
  });

  // 平滑與閾值
  edgeFeatherSlider?.addEventListener("input", (e) => {
    setEdgeFeather(Number(e.target.value));
    if (edgeFeatherVal) edgeFeatherVal.textContent = `${e.target.value} px`;
  });
  temporalSmoothSlider?.addEventListener("input", (e) => {
    const v = Number(e.target.value) / 100;
    setTemporalAlpha(v);
    if (temporalSmoothVal) temporalSmoothVal.textContent = v.toFixed(2);
  });
  thresholdSlider?.addEventListener("input", (e) => {
    const v = Number(e.target.value) / 100;
    setThreshold(v);
    if (thresholdVal) thresholdVal.textContent = v.toFixed(2);
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

  // 影片格式選擇 (radio)
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
  return "mp4";
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

    setTimeout(() => {
      if (tip.parentElement) {
        tip.remove();
      }
    }, 8000);
  }
}

// 顯示影片載入對話框（月相影片）
function showVideoLoadingDialog(videoElement) {
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
  const videoSize = "約 30MB";

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

  overlay.querySelector("#cancelVideoLoad").addEventListener("click", () => {
    clearInterval(progressInterval);
    overlay.remove();

    if (backgroundSelect) backgroundSelect.value = "waves";
    setBackgroundType("waves");
    handleStatus("已取消影片載入，切換到波紋背景");

    videoElement.src = "";
    videoElement.load();
  });

  handleStatus("開始載入月相影片...");

  if (!videoElement.src && videoElement.children.length > 0) {
    videoElement.load();
  }

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

    if (backgroundSelect) backgroundSelect.value = "waves";
    setBackgroundType("waves");
  };

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

  const cleanup = () => {
    clearInterval(progressInterval);
    clearTimeout(timeoutHandler);
    videoElement.removeEventListener("canplay", onCanPlay);
    videoElement.removeEventListener("error", onError);
  };

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

// 創建錄製進度對話框（含 modal 內的 分享 / 下載按鈕）
// 回傳物件包含：updateProgress(current,total), setStatus(str), close(), enableShareControls(url)
function createRecordingProgressDialog() {
  // 主 overlay + dialog
  const overlay = document.createElement("div");
  overlay.id = "recordingProgressOverlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    backdrop-filter: blur(6px);
  `;

  const dialog = document.createElement("div");
  dialog.style.cssText = `
    background: rgba(11,16,32,0.98);
    border: 2px solid #ffeb3b;
    border-radius: 12px;
    padding: 20px;
    width: min(92vw, 420px);
    color: #e6edf3;
    text-align: center;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
  `;

  dialog.innerHTML = `
    <div style="margin-bottom: 12px;">
      <h3 style="margin:0 0 8px;color:#ffeb3b;font-size:18px;">🎬 錄製月相影片中</h3>
      <div style="font-size:13px;color:#9fb0c0;margin-bottom:6px;">靜止人物 + 動態月相背景</div>
    </div>
    <div style="margin: 12px 0;">
      <div style="background: rgba(255,255,255,0.06); height: 12px; border-radius: 6px; overflow:hidden;">
        <div id="recordingProgressFill" style="height:100%; width:0%; transition: width 0.12s linear; background: linear-gradient(90deg,#ffeb3b,#ffc107);"></div>
      </div>
      <div id="recordingProgressText" style="color:#ffeb3b;font-weight:bold;margin-top:10px;">準備錄製...</div>
      <div id="recordingTimeText" style="color:#9fb0c0;margin-top:6px;font-size:13px;">0.0s / 8.0s</div>
    </div>
    <div id="recordingHint" style="margin-top:12px;color:#9fb0c0;font-size:13px;">
      影片生成後會顯示分享與下載按鈕
    </div>

    <div style="display:flex; gap:10px; justify-content:center; margin-top:14px;">
      <button id="modalDownloadBtn" disabled style="padding:8px 12px;border-radius:8px;border:1px solid #22314d;background:#0b1020;color:#e6edf3;display:none;">⬇ 下載</button>
      <button id="modalShareBtn" disabled style="padding:8px 12px;border-radius:8px;border:1px solid #22314d;background:#ffeb3b;color:#0b1020;display:none;">🔗 分享</button>
      <button id="modalCloseBtn" style="padding:8px 12px;border-radius:8px;border:1px solid #22314d;background:transparent;color:#9fb0c0;">關閉</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const progressFill = dialog.querySelector("#recordingProgressFill");
  const progressText = dialog.querySelector("#recordingProgressText");
  const timeText = dialog.querySelector("#recordingTimeText");
  const modalDownloadBtn = dialog.querySelector("#modalDownloadBtn");
  const modalShareBtn = dialog.querySelector("#modalShareBtn");
  const modalCloseBtn = dialog.querySelector("#modalCloseBtn");
  const recordingHint = dialog.querySelector("#recordingHint");

  // 關閉按鈕（只關閉 dialog，不會 revoke core 裡的 objectURL；由使用者主動按下載或分享）
  modalCloseBtn.addEventListener("click", () => {
    // 只移除 modal，不刪除 lastRecordedBlob
    overlay.remove();
  });

  // enableShareControls 會綁定 modal 的下載與分享事件（把 URL 或交由 core 分享）
  function enableShareControls(url) {
    if (!url) return;
    // 顯示按鈕
    modalDownloadBtn.style.display = "inline-block";
    modalShareBtn.style.display = "inline-block";
    modalDownloadBtn.disabled = false;
    modalShareBtn.disabled = false;

    // 下載（使用 url；有可能是 objectURL）
    modalDownloadBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // 不在這裡立即 revoke，讓使用者有時間分享或再次下載；但可在短延遲後 revoke
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      }, 3000);
    };

    // 分享（呼叫 core 的分享函式 — 必須在 user gesture）
    modalShareBtn.onclick = async () => {
      try {
        modalShareBtn.disabled = true;
        await shareLastRecording();
      } catch (err) {
        console.error("modal 分享失敗：", err);
        alert("分享失敗，請先下載再手動分享");
      } finally {
        modalShareBtn.disabled = false;
      }
    };

    recordingHint.textContent = "影片已生成：可直接分享或下載（建議先分享）";
  }

  return {
    updateProgress: (current, total) => {
      const percent = total > 0 ? (current / total) * 100 : 0;
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `錄製進度：${percent.toFixed(1)}%`;
      timeText.textContent = `${current.toFixed(1)}s / ${total.toFixed(1)}s`;
    },
    setStatus: (s) => {
      progressText.textContent = s;
    },
    close: () => {
      if (overlay.parentElement) overlay.remove();
    },
    enableShareControls, // 外部可呼叫以啟用 modal 分享/下載
    dom: { overlay, dialog, modalDownloadBtn, modalShareBtn, modalCloseBtn },
  };
}

// 建立共用的分享/下載按鈕綁定（適用於 moon_video 或 core 錄製）
// 新增參數 progressDialog：若提供，會優先在 modal 顯示按鈕
function setupShareDownloadButtons(
  result,
  immediateVideoUrl,
  progressDialog = null
) {
  // 清除 toolbar 綁定（保留 toolbar 作為備援）
  if (downloadVideoBtn) downloadVideoBtn.onclick = null;
  if (shareBtn) shareBtn.onclick = null;

  const hasCoreRecording = hasRecordingAvailable();
  const urlToUse =
    immediateVideoUrl || (hasCoreRecording ? getLastRecordingUrl() : null);

  // 若已經有直接可用的 url（core 或 immediate），直接啟用（modal 或 toolbar）
  if (urlToUse) {
    if (
      progressDialog &&
      typeof progressDialog.enableShareControls === "function"
    ) {
      progressDialog.enableShareControls(urlToUse);
    } else {
      // toolbar 行為
      if (downloadVideoBtn) {
        downloadVideoBtn.style.display = "inline-block";
        downloadVideoBtn.disabled = false;
        downloadVideoBtn.onclick = () => {
          const a = document.createElement("a");
          a.href = urlToUse;
          a.download = "";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => {
            try {
              URL.revokeObjectURL(urlToUse);
            } catch (e) {}
          }, 2000);
        };
      }
      if (shareBtn) {
        shareBtn.style.display = "inline-block";
        shareBtn.disabled = false;
        shareBtn.onclick = async () => {
          try {
            shareBtn.disabled = true;
            await shareLastRecording();
          } catch (err) {
            console.error("分享失敗：", err);
            alert("分享失敗，請先下載再手動分享");
          } finally {
            shareBtn.disabled = false;
          }
        };
      }
      handleStatus("影片已生成，可按「分享」或「下載」");
    }
    return;
  }

  // 若正在生成（result.video === 'generating'），顯示等待並輪詢 core 是否完成
  if (result && result.video === "generating") {
    // 顯示按鈕區域（disabled）
    if (
      progressDialog &&
      typeof progressDialog.enableShareControls === "function"
    ) {
      // 顯示 modal 的按鈕但保持 disabled（enable 等待完成）
      // 這裡不直接 enableShareControls，等 poller 發現完成後才啟用
      // 同時提示使用者等待
      progressDialog.setStatus("影片生成中，請稍候...");
    } else {
      if (downloadVideoBtn) {
        downloadVideoBtn.style.display = "inline-block";
        downloadVideoBtn.disabled = true;
      }
      if (shareBtn) {
        shareBtn.style.display = "inline-block";
        shareBtn.disabled = true;
      }
      handleStatus("影片正在生成，請稍候...");
    }

    let waited = 0;
    const pollInterval = 500;
    const maxWait = 15000;
    const poller = setInterval(() => {
      if (hasRecordingAvailable()) {
        clearInterval(poller);
        const url = getLastRecordingUrl();
        if (
          progressDialog &&
          typeof progressDialog.enableShareControls === "function"
        ) {
          // 啟用 modal 的按鈕
          progressDialog.enableShareControls(url);
        } else {
          // 啟用 toolbar 按鈕
          if (downloadVideoBtn) {
            downloadVideoBtn.disabled = false;
            downloadVideoBtn.onclick = () => {
              const a = document.createElement("a");
              a.href = url;
              a.download = "";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => {
                try {
                  URL.revokeObjectURL(url);
                } catch (e) {}
              }, 2000);
            };
          }
          if (shareBtn) {
            shareBtn.disabled = false;
            shareBtn.onclick = async () => {
              try {
                shareBtn.disabled = true;
                await shareLastRecording();
              } catch (err) {
                console.error("分享失敗：", err);
                alert("分享失敗，請先下載再手動分享");
              } finally {
                shareBtn.disabled = false;
              }
            };
          }
          handleStatus("影片生成完成，可按「分享」或「下載」");
        }
        return;
      }
      waited += pollInterval;
      if (waited >= maxWait) {
        clearInterval(poller);
        handleStatus("影片生成超時，請稍後檢查或下載 PNG");
        if (downloadVideoBtn) downloadVideoBtn.disabled = true;
        if (shareBtn) shareBtn.disabled = true;
        if (progressDialog && typeof progressDialog.setStatus === "function") {
          progressDialog.setStatus("影片生成超時，請稍後或先下載 PNG");
        }
      }
    }, pollInterval);
    return;
  }

  // 其他情況
  alert("目前沒有可下載或分享的影片，僅有 PNG 圖片");
}

// 初始化入口
window.addEventListener("load", () => {
  if (!checkSupport()) return;

  temporalSmoothVal.textContent = (
    Number(temporalSmoothSlider.value) / 100
  ).toFixed(2);
  thresholdVal.textContent = (Number(thresholdSlider.value) / 100).toFixed(2);
  edgeFeatherVal.textContent = `${edgeFeatherSlider.value} px`;
  intensityValueSpan.textContent = `${effectIntensitySlider.value}%`;

  setBackgroundType(
    backgroundSelect
      ? backgroundSelect.value
      : CONFIG.BACKGROUND && CONFIG.BACKGROUND.TYPE
  );
  setBackgroundIntensity(Number(effectIntensitySlider.value) / 100);
  setShowMaskPreview(showMaskCheckbox.checked);
  setEnableSegmentation(enableSegmentationCheckbox.checked);

  setVideoOutputFormat("mp4");

  setTimeout(showMobileOptimizationTip, 1000);

  bindUI();
});
