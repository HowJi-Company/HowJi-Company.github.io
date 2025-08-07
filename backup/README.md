# 🌙 月亮節 AR 人臉特效

一個使用 MediaPipe 和 LINE LIFF 的 AR 人臉檢測應用，當檢測到兩個人臉同時出現在指定圓形區域內時，會觸發美麗的月亮特效。

## ✨ 功能特色

- 🔍 **即時人臉檢測**: 使用 Google MediaPipe 進行高精度人臉檢測
- 📱 **LIFF 集成**: 完美支援 LINE 平台的 LIFF 應用
- 🎯 **區域限制檢測**: 只在指定的圓形區域內進行人臉檢測
- 🌙 **月亮特效**: 當檢測到兩個人臉時自動觸發月亮、星星和閃爍特效
- 📱 **響應式設計**: 支援各種螢幕尺寸和行動裝置
- 🖥️ **滿版顯示**: 相機畫面接近滿版，提供沉浸式AR體驗
- 🔄 **鏡頭切換**: 支援前後鏡頭切換功能
- ⌨️ **鍵盤快捷鍵**: 支援空白鍵開始/停止，C 鍵切換鏡頭

## 🚀 快速開始

### 1. 下載專案

```bash
git clone <your-repository-url>
cd moon_festival_AR
```

### 2. 配置 LIFF

1. 在 [LINE Developers Console](https://developers.line.biz/console/) 創建新的 LIFF 應用
2. 獲取 LIFF ID
3. 在 `script.js` 中替換 `YOUR_LIFF_ID`:

```javascript
await liff.init({
    liffId: 'YOUR_ACTUAL_LIFF_ID_HERE' // 替換為您的真實 LIFF ID
});
```

### 3. 部署到 HTTPS 伺服器

由於相機權限要求，應用必須在 HTTPS 環境下運行。您可以使用：

- **GitHub Pages**: 將檔案推送到 GitHub，啟用 Pages 功能
- **Netlify**: 拖放檔案到 Netlify
- **Vercel**: 使用 Vercel 部署
- **自己的 HTTPS 伺服器**

### 4. 測試應用

#### 方式一：測試頁面 (推薦新手)
1. 直接在瀏覽器中開啟 `test.html`
2. 允許相機權限
3. 調整測試配置參數
4. 點擊「開始檢測」測試功能

#### 方式二：LINE LIFF 環境
1. 使用 LIFF URL 在 LINE 中開啟 `index.html`
2. 允許相機權限
3. 點擊「開始檢測」
4. 讓兩個人進入圓形區域，享受月亮特效！

#### 方式三：調試模式 (問題診斷)
1. 在瀏覽器中開啟 `debug.html`
2. 查看詳細的檢測信息和坐標數據
3. 診斷人臉檢測和區域判斷問題
4. 使用瀏覽器開發者工具查看詳細日誌
5. **注意**: 如果遇到問題，請停止檢測後重新開始

#### 方式四：基礎功能測試
1. 在瀏覽器中開啟 `simple_test.html`
2. 純粹測試 MediaPipe 人臉檢測功能
3. 無區域限制，專注於基本檢測驗證
4. 適合排除基礎檢測問題

## 📁 檔案結構

```
moon_festival_AR/
├── index.html          # 主 HTML 頁面 (LIFF 版本)
├── test.html           # 測試頁面 (無需 LIFF)
├── debug.html          # 調試頁面 (詳細檢測信息)
├── simple_test.html    # 基礎檢測測試頁面
├── style.css           # CSS 樣式和動畫
├── script.js           # 主要 JavaScript 邏輯
├── config.js           # 配置文件
├── CHANGELOG.md        # 更新記錄
└── README.md          # 說明文件
```

## 🔧 技術架構

### 前端技術
- **HTML5**: 結構化標記
- **CSS3**: 樣式、動畫和響應式設計
- **JavaScript ES6+**: 主要邏輯實現

### 第三方服務
- **Google MediaPipe**: 人臉檢測 AI 模型
- **LINE LIFF SDK**: LINE 平台集成
- **WebRTC**: 相機串流處理

### 核心功能模組
- **人臉檢測**: 使用 MediaPipe Face Detection
- **區域檢測**: 自定義圓形區域判斷邏輯
- **特效系統**: CSS 動畫和 JavaScript 控制
- **相機管理**: WebRTC 相機控制和切換

## 🎮 使用說明

### 基本操作
1. **開始檢測**: 點擊「開始檢測」按鈕或按空白鍵
2. **停止檢測**: 點擊「停止檢測」按鈕或再次按空白鍵
3. **切換鏡頭**: 點擊「切換鏡頭」按鈕或按 C 鍵

### 特效觸發條件
- 需要在圓形區域內檢測到**兩個人臉**
- 人臉的中心點必須在圓形區域內
- 滿足條件時會自動顯示月亮特效
- 不滿足條件時特效會自動消失

### 狀態指示器
- **檢測狀態**: 顯示當前系統狀態
- **檢測到的人臉**: 總共檢測到的人臉數量
- **區域內人臉**: 在指定區域內的人臉數量

## ⚙️ 配置選項

### 檢測區域設定

在 `script.js` 中可以調整檢測區域：

```javascript
const DETECTION_AREA = {
    centerX: 0.5,  // 中心 X 位置 (0-1)
    centerY: 0.5,  // 中心 Y 位置 (0-1)
    radius: 0.45   // 半徑大小 (相對於螢幕寬度) - 已調整為更大
};
```

### MediaPipe 設定

調整檢測靈敏度：

```javascript
faceDetection.setOptions({
    model: 'short',              // 'short' 或 'full'
    minDetectionConfidence: 0.5, // 0.0 - 1.0
});
```

## 🐛 常見問題

### Q: 相機無法啟動
**A**: 確認以下事項：
- 應用運行在 HTTPS 環境
- 瀏覽器支援 WebRTC
- 已授予相機權限
- 相機未被其他應用佔用

### Q: 完全檢測不到人臉
**A**: 按以下步驟診斷：
1. 首先開啟 `simple_test.html` 測試基礎檢測功能
2. 檢查瀏覽器控制台是否有錯誤訊息
3. 確認相機權限已正確授予
4. 嘗試重新整理頁面
5. 如果 simple_test.html 能正常檢測，問題可能在配置或區域檢測邏輯

### Q: 人臉檢測不準確
**A**: 可以嘗試：
- 調整 `minDetectionConfidence` 參數
- 確保光線充足
- 保持適當距離
- 避免快速移動

### Q: LIFF 初始化失敗
**A**: 檢查：
- LIFF ID 是否正確設定
- 網域是否已在 LIFF 設定中加入白名單
- 是否在 LINE 環境中開啟

### Q: 特效不顯示
**A**: 確認：
- 兩個人臉都在圓形區域內
- 瀏覽器支援 CSS 動畫
- 檢查瀏覽器控制台錯誤訊息

### Q: 人臉在圓形框內但顯示區域內人臉為 0
**A**: 這是常見問題，請使用調試模式診斷：
1. 開啟 `debug.html` 查看詳細檢測信息
2. 注意區分 CSS 引導圓圈和 Canvas 檢測圓圈
3. 檢查人臉中心點是否在檢測區域內
4. 確認 Canvas 尺寸和視頻尺寸是否匹配
5. 在瀏覽器開發者工具中查看詳細日誌

### Q: 檢測區域位置不正確
**A**: 可能的解決方案：
- 檢查瀏覽器縮放級別是否為 100%
- 確認 Canvas 和 CSS 坐標系統一致
- 調整 `config.js` 中的檢測區域參數
- 使用調試模式查看實際檢測座標

## 📱 支援的瀏覽器

- ✅ Chrome (推薦)
- ✅ Safari (iOS)
- ✅ LINE 內建瀏覽器
- ✅ Edge
- ⚠️ Firefox (部分功能可能受限)

## 🔒 隱私和安全

- 所有處理都在本地進行，不會上傳任何影像
- 不會儲存或記錄任何使用者資料
- 僅在必要時存取相機權限

## 🛠️ 開發和自定義

### 添加新特效
1. 在 `style.css` 中定義新的 CSS 動畫
2. 在 HTML 中添加特效元素
3. 在 `triggerMoonEffect()` 函數中添加觸發邏輯

### 修改檢測邏輯
主要邏輯在 `checkFacesInDetectionArea()` 函數中，可以修改區域判斷方式或添加其他條件。

### 集成其他 AI 模型
可以替換 MediaPipe 為其他人臉檢測服務，只需修改 `initializeMediaPipe()` 和 `onResults()` 函數。

## 📄 授權

本專案採用 MIT 授權條款。

## 🤝 貢獻

歡迎提交 Pull Request 或回報問題！

## 📞 支援

如有任何問題，請聯繫開發團隊或在 GitHub 上開啟 Issue。 