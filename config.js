// 月亮節 AR 應用配置文件
// 請根據您的需求修改以下設定

const CONFIG = {
  // LIFF 設定
  LIFF: {
    // 請替換為您的實際 LIFF ID
    // 獲取方式：在 LINE Developers Console 創建 LIFF 應用後取得
    LIFF_ID: "YOUR_LIFF_ID_HERE",

    // 是否啟用 LIFF (如果設為 false，應用可以在一般瀏覽器中運行)
    ENABLED: true,
  },

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

  // 檢查 LIFF ID
  if (CONFIG.LIFF.ENABLED && CONFIG.LIFF.LIFF_ID === "YOUR_LIFF_ID_HERE") {
    errors.push("請設定正確的 LIFF ID");
  }

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
  loadCustomConfig();
  autoAdjustConfig();

  const errors = validateConfig();
  if (errors.length > 0) {
    console.error("配置驗證失敗:", errors);
    return false;
  }

  console.log("配置初始化完成", CONFIG);
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
