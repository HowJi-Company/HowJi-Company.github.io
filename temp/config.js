//config.js 使用說明
//如果想要更換網頁中的 "文字" 或是 "圖片" 可以從這邊調整
// 這兩個url 是header的兩個logo的圖案路徑
const header_img_arr = ["./img/HowJi4.png", "./img/HowJi3.png"]
// 這兩個url 是footer的兩個logo的圖案路徑
const global_config = {
    footer_img_url1: "./img/HowJi4.png",
    footer_img_url2: "./img/HowJi3.png",
}

// 這是header的導覽列的文字內容 
const header_list = [{ title: "服務介紹", href: "#section3" },
{ title: "案例展示", href: "#section4" },
{ title: "技術與創新", href: "#section5" },
{ title: "解決方案", href: "#section6" },
{ title: "關於好吉", href: "#section7" },
{ title: "聯絡我們", href: "#section8" }]

const header_list2 = [
    { title: "服務介紹", href: "#services" }, // 呈現公司提供的各類服務，包括接案、資訊轉型與顧問等
    { title: "案例展示", href: "#cases" }, // 展示公司成功案例，讓客戶了解 HowJi 的能力和經驗
    { title: "技術與創新", href: "#technology" }, // 介紹公司在技術上的創新和專長
    { title: "客戶評價", href: "#testimonials" }, // 展示客戶的正面反饋和評價
    { title: "關於好吉", href: "#about" }, // 公司背景、願景和團隊介紹
    { title: "聯絡我們", href: "#contact" } // 提供聯絡方式，方便客戶與公司溝通
];



//第一個區塊 輪播圖片 text_1 text_2 目前被棄用 url是圖片路徑 可以調整
// img_url1 是大尺寸的圖片, img_url1_s 是小尺寸螢幕的圖片 
const section1 = [{
    text_1: "",
    text_2: "",
    img_url1: './img/b-1.png',
    img_url1_s: './img/s1-1-s.jpg',
}, {
    text_1: "",
    text_2: "",
    img_url1: './img/b-2.png',
    img_url1_s: './img/s1-2-s.jpg',
}, {
    text_1: "",
    text_2: "",
    img_url1: './img/b-3.png',
    img_url1_s: './img/s1-1-s.jpg',
}];

//最新活動區塊 
// 圖片檔案  為圖片的檔案路徑 可以調整
// 連結的路徑也有效 可以條整
const section3 = {
    title: "服務介紹",
    items: [{
        "日期": "不適用",
        "標題": "資訊系統定制開發",
        "說明文字": "針對企業特定需求，提供從系統規劃到開發實施的全方位定制服務，包括 Web 應用、移動應用和桌面應用等。",
        "連結（圖片/標題）": "./waiting.html",
        "圖片檔案": "./img/s3-1.webp"
    }, {
        "日期": "不適用",
        "標題": "資訊技術顧問服務",
        "說明文字": "提供企業資訊化轉型指導，包括技術架構咨詢、系統整合與效能優化等服務，助力企業提升運營效率。",
        "連結（圖片/標題）": "./waiting.html",
        "圖片檔案": "./img/s3-2.webp"
    }, {
        "日期": "不適用",
        "標題": "雲端與數據解決方案",
        "說明文字": "提供雲端架構設計與部署、數據分析與大數據處理解決方案，協助企業充分利用雲計算與數據資源。",
        "連結（圖片/標題）": "./waiting.html",
        "圖片檔案": "./img/s3-3.webp"
    }]
}


//熱門推薦的區塊 
// 圖片的調整 請改 圖片檔案 的 檔案路徑
const section41 = {
    title: "熱門推薦",
    items: [
        {
            "標題1": "非網管型乙太交換器",
            "標題2": "EDS-2000/G2000-EL系列",
            "滑鼠點到浮現文字": `超迷你，最耐用隨插即用功能，以及安裝完畢一切搞定的耐用性，高度耐用於任何嚴苛環境，讓關鍵網路不中斷。此外，它的體積超小，可輕易安裝於空間受限的控制機櫃或機器中。
                這些非網管型交換器提供 Fast Ethernet 和 Gigabit 的連接選項，可滿足不同的網路需求。`,
            "圖片檔案": "./img/s4-1.jpg"
        },
        {
            "標題1": "工業級無風扇電腦",
            "標題2": "UC-2100系列",
            "滑鼠點到浮現文字": `Arm base 的掌上型 IIoT 閘道器，專為空間有限的自動化應用而設計。 含 1 個 Mini PCIe 無線模組擴充插槽，這些電腦採特殊設計，可穩定地長期運作。所有機型均提供 5 年硬體保固和 10 年 Moxa Industrial Linux 支援，是遠端監控和資料擷取應用的理想選擇。`,
            "圖片檔案": "./img/s4-2.jpg"
        },
        {
            "標題1": "Modbus TCP 閘道器",
            "標題2": "MGate MB3000 系列",
            "滑鼠點到浮現文字": `支援Modbus TCP/RTU/ASCII協定間的轉換，更快速輕鬆地進行配置、故障排除和轉換，是您最佳的 Modbus 網路整合選擇。可提供自動裝置路由，簡化配置。`,
            "圖片檔案": "./img/s4-3.jpg"
        },
    ]
}
const section4 = {
    title: "案例展示",
    items: [
        {
            "標題1": "一頁式網站設計",
            "標題2": "創業公司品牌網站",
            "滑鼠點到浮現文字": "為一家新創公司設計並開發的一頁式網站，成功傳達品牌形象並提供用戶友好的瀏覽體驗。網站設計清新現代，融入了互動元素和動畫效果，有效吸引目標客戶群。",
            "圖片檔案": "./img/s4-1.webp"
        },
        {
            "標題1": "行動設備網頁開發",
            "標題2": "電子商務平台移動端",
            "滑鼠點到浮現文字": "針對一家電子商務平台開發的移動端網頁，特別優化了在手機和平板等行動設備上的使用體驗。支持觸控導航、快速加載和移動支付，大幅提升了用戶的購物滿意度。",
            "圖片檔案": "./img/s4-2.webp"
        },
        {
            "標題1": "羽球配對系統",
            "標題2": "社區羽球愛好者配對平台",
            "滑鼠點到浮現文字": "為羽球愛好者社區開發的在線配對系統，用戶可以根據技能水平和地理位置找到適合的打球伙伴。系統提供簡便的用戶界面和實時消息通知功能，促進了社區互動和運動參與度。",
            "圖片檔案": "./img/s4-3.webp"
        },
    ]
}

// 一般商用 vs 工業級網通 區塊 
// 圖片檔案一樣可以修改
//full_item_span 這一項中的路徑 是點擊按鈕擴展後的內容
const section51 = {
    title: "一般商用 vs 工業級網通",
    full_item: {
        "圖片檔案": "./img/s5-1.jpg",
        "標題": "工業環境：品質與可靠度極限",
        "文案": [
            "高溫、震動頻繁、電磁波干擾的惡劣環境",
            "工廠、變電站、軌道、太陽能案場等戶外場域",
            "滿足設備連線穩定不中斷的需求",
            "產品使用年限10年以上",
            "維護年限約5年"
        ]
    },
    half_items: [{
        "圖片檔案": "./img/s5-2.jpg",
        "標題": "家用環境",
        "文案": [
            "一般住家、10人以下的小型辦公室",
            "網頁瀏覽、線上影音串流、遊戲等娛樂需求",
            "滿足上網需求即可",
            "產品使用年限約1-2年"
        ]
    }, {
        "圖片檔案": "./img/s5-3.jpg",
        "標題": "商用環境",
        "文案": [
            "餐廳、飯店、學校、中大型企業等跨樓層建築",
            "連結多台電腦、IT機房、印表機、POS 、視訊會議需求",
            "滿足高網速與多人同時連線需求",
            "產品使用年限約3 - 5年",
            "維護年限約3年"
        ]
    }],
    full_item_span: {
        "標題": "工業級應用環境",
        "內容": [
            {
                "圖片檔案": "./img/s5-1-1.png",
                "文案": "震動頻繁",
            },
            {
                "圖片檔案": "./img/s5-1-2.png",
                "文案": "高溫或密閉機櫃",
            },
            {
                "圖片檔案": "./img/s5-1-3.png",
                "文案": "設備密集，<br>高電磁干擾",
            },
            {
                "圖片檔案": "./img/s5-1-4.png",
                "文案": "各設備通訊協定不同",
            },
            {
                "圖片檔案": "./img/s5-1-5.png",
                "文案": "戶外溫差與高濕度",
            },
            {
                "圖片檔案": "./img/s5-1-6.png",
                "文案": "重要設備安全連網"
            },
        ]
    }
}
const section5 = {
    title: "技術與創新",
    full_item: {
        "圖片檔案": "./img/s5-1.webp",
        "標題": "尖端技術探索",
        "文案": [
            "採用最新技術建構軟體解決方案",
            "雲端計算、人工智能、大數據分析",
            "實現資料驅動決策與自動化流程",
            "確保高效率運作與最優用戶體驗",
            "不斷追求創新，引領行業趨勢"
        ]
    },
    half_items: [{
        "圖片檔案": "./img/s5-2.webp",
        "標題": "用戶體驗設計",
        "文案": [
            "以用戶為中心的設計理念",
            "提升產品的互動性和易用性",
            "創造引人入勝的數字體驗",
            "持續改善，回應用戶反饋",
            "增強客戶滿意度與忠誠度"
        ]
    }, {
        "圖片檔案": "./img/s5-3.webp",
        "標題": "資訊安全與隱私保護",
        "文案": [
            "在所有項目中優先考慮安全性與隱私",
            "採用行業領先的安全協議和標準",
            "保護用戶數據免受未經授權的訪問",
            "實現可靠的資訊保護策略",
            "為用戶提供安心的數字環境"
        ]
    }],
    full_item_span: {
        "標題": "專案實施與部署",
        "內容": [
            {
                "圖片檔案": "./img/s5-1-1.webp",
                "文案": "敏捷開發與持續交付",
            },
            {
                "圖片檔案": "./img/s5-1-2.webp",
                "文案": "跨平台應用開發",
            },
            {
                "圖片檔案": "./img/s5-1-3.webp",
                "文案": "雲基礎架構與微服務架構",
            },
            {
                "圖片檔案": "./img/s5-1-4.webp",
                "文案": "自動化測試與品質保證",
            },
            {
                "圖片檔案": "./img/s5-1-5.webp",
                "文案": "持續整合與持續部署(CI/CD)",
            },
            {
                "圖片檔案": "./img/s5-1-6.webp",
                "文案": "技術支持與維護"
            },
        ]
    }
}


// 產品分類地圖 
// 此區的調整最為特別 全部以比例去客製化調整 
// x y position 可以微調點點的位置
const section61 = {
    "背景圖案": "",
    title: "Moxa 產品分類地圖",
    "備註": "備註 : *專案產品，請洽詢專人服務	./waiting.html",
    items: [
        {
            title: "再生能源和儲能",
            blocks: ["乙太網路交換器 ", "通用控制器和 I/O", "*工業級無風扇 ARM 電腦"],
            text: ["Moxa 設備可在戶外惡劣環境中穩定運作",
                "支援遠端故障排除功能，簡化維護流程",
                "支援 Modbus 資料擷取和 MQTT ，整合到SCADA以及雲端應用"],
            x_position: "58.2%",
            y_position: "32.55%",
            x_position_rwd: "28.6%",
            y_position_rwd: "21.1%",
            img: "background-image: url('./img/s6-1-1.jpg');"
        }, {
            title: "電力應用：變電站 ",
            blocks: ["乙太網路交換器", "協定閘道器", "先進控制器和 I/O ", "*工業級無風扇x86 電腦"],
            text: ["簡單設定的遠端 I / O ，輕鬆收集現場資料",
                "IEC61850 / DNP 3 新舊設備無縫銜接",
                "用於變電站通訊和運算的端對端 PRP / HSR網路備源",],
            x_position: "53.4%",
            y_position: "60.5%",
            x_position_rwd: "20%",
            y_position_rwd: "31%",
            img: "background-image: url('./img/s6-1-2.jpg');"
        }, {
            title: "智慧交通和軌道運輸",
            blocks: ["乙太網路交換機", " 串列轉乙太網路設備伺服器 ", "工業LTE行動通訊閘道器", "工業無線網路WiFi AP/Client", "協定閘道器"],
            text: ["超過 500 次成功部署於全球領先鐵道公司的各種系統中",
                "符合 IEC 61375、EN 50155 和EN 50121 - 4 ",
                "IRIS認證確保高品質需求",
                "提供高傳輸速率、多元的網路介面",
                "Turbo Ring和Turbo Chain 20 ms網路備援",],
            x_position: "76%",
            y_position: "34%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1-3.jpg');"
        }, {
            title: "海事船舶",
            blocks: ["乙太網路交換機", "*工業級無風扇x86 電腦"],
            text: ["通過認證並符合DNV、LR、ABS等多項海事標準",
                " 無風扇工業級，可持續承受高溫，高抗震性，確保長時間運作",
                "可靠網路備援技術和網路安全功能，符合 IEC 62443 標準",],
            x_position: "64.4%",
            y_position: "56.18%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1-4.jpg');"

        }, {
            title: "智慧製造",
            blocks: ["乙太網路交換機", "串列轉乙太網路設備伺服器", "協定閘道器", "工業無線網路 Wifi AP/Client", "*工業安全路由器"],
            text: ["為全球 70 多個國家的領先製造商提供可靠的工業網路解決方案",
                "支援各式各樣的協定、介面和媒體，可將所有設備連網",
                "支援毫秒級的有線和無線網路備援",
                "縱深防禦方案保護工廠網路和重要設備"],
            x_position: "75.9%",
            y_position: "62.7%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1-5.jpg');"

        }, {
            title: "自動化倉儲",
            blocks: ["非網管交換器", "工業無線網路WiFi AP/Client", "通用控制器和 I/O", "串列至串列轉換器"],
            text: ["輕巧靈活非網管交換器和Wi-Fi 用戶端，可安裝於小型AGV 中",
                "AP 無線備援僅 150 毫秒，確保無縫接軌",
                "支援多種工業協定，將 AMHS輕鬆整合入SCADA ",
                "工業等級設計，抗電磁干擾、震動、高溫等",],
            x_position: "83.8%",
            y_position: "64.2%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1-6.jpg');"

        },
        {
            title: "大樓機房",
            blocks: ["乙太網路交換器", "協定閘道器", "*工業級無風扇 ARM 電腦"],
            text: ["應對機房封閉環境，可耐高溫操作",
                "支援各式各樣界面、協定和媒體，方便將 HVAC、UPS、火災警報系統等設備全部連網",
                "乙太網路交換器可在 20ms 內恢復網路運作，確保設施網路可靠性",
                "可視化網路管理，快速診斷連線問題，降低時間和成本"],
            x_position: "88.2%",
            y_position: "49.5%",
            x_position_rwd: "58%",
            y_position_rwd: "30%",
            img: "background-image: url('./img/s6-1-7.jpg');"

        }, {
            title: "太空站",
            blocks: ["工業無線網路WiFi AP/Client "],
            text: ["-100 °C 至 100 °C 快速擺盪的溫度範圍",
                "超強的輻射",
                "在極端惡劣條件下可靠地傳輸資料",
                "實現高速的資料傳輸"],
            x_position: "90.2%",
            y_position: "16.8%",
            x_position_rwd: "82.2%",
            y_position_rwd: "13.4%",
            img: "background-image: url('./img/s6-1-8.jpg');"

        }, {
            title: "油氣石化",
            blocks: ["乙太網路交換器", "安全路由器", "協定閘道器", "*面板電腦"],
            text: ["全球部署協助100 多個石油和天然氣田連網",
                "通過 C1D2/ATEX/IECEx Zone 2 認證",
                "安全可靠的網路，可在鑽機室（driller’s cabin）中即時監控作業狀況",
                "面板電腦陽光下清晰可讀、具 IP66 防護等級，可有效操控鑽井控制系統",],
            x_position: "71.5%",
            y_position: "28.4%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1-9.jpg');"

        }, {
            title: "IIoT數位轉型",
            blocks: ["IIoT 閘道器", "工業級USB 集線器/ USB轉串列轉換器", "通用控制器和 I/O", "*工業級無風扇 ARM 和 x86 電腦"],
            text: ["入門級 IIoT 閘道器可將 Modbus 設備，整合到與Azure、AWS 以及MQTT 雲端", "全面支援遠端監控和遙測應用，在極端溫度環境中提供可靠的無線連接。"],
            x_position: "74.84%",
            y_position: "43.63%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1-10.jpg');"

        },
    ],

}
const section6 = {
    "背景圖案": "",
    title: "HowJi 服務與解決方案概覽",
    "備註": "備註 : *特色服務，請洽詢專人服務 ./waiting.html",
    items: [
        {
            title: "軟體定制與開發",
            blocks: ["全棧開發", "移動應用", "*雲端解決方案"],
            text: ["提供端到端軟體解決方案，從前端到後端",
                "開發跨平台移動應用，提升用戶體驗",
                "利用雲計算技術，打造可擴展的雲端應用"],
            x_position: "58.2%",
            y_position: "32.55%",
            x_position_rwd: "28.6%",
            y_position_rwd: "21.1%",
            img: "background-image: url('./img/s6-1.webp');"
        }, {
            title: "資訊技術顧問服務",
            blocks: ["技術策略", "系統整合", "數據分析與大數據"],
            text: ["提供企業級技術策略規劃與顧問",
                "幫助客戶實現系統整合，提升業務運作效率",
                "利用數據分析與大數據技術，驅動業務增長"],
            x_position: "53.4%",
            y_position: "60.5%",
            x_position_rwd: "20%",
            y_position_rwd: "31%",
            img: "background-image: url('./img/s6-1.webp');"
        },
        {
            title: "雲端與物聯網解決方案",
            blocks: ["物聯網平台", "雲端基礎架構", "邊緣計算"],
            text: ["建構物聯網平台，實現設備連接與管理",
                "提供雲端基礎架構設計與部署服務",
                "利用邊緣計算技術，實現數據即時處理"],
            x_position: "76%",
            y_position: "34%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1.webp');"
        },
        {
            title: "企業資訊安全",
            blocks: ["網絡安全", "資料保護", "*合規與風險管理"],
            text: ["網絡安全解決方案，保護企業資料免受威脅",
                "實施資料保護策略，確保資料安全與隱私",
                "幫助企業達成合規要求，管理風險"],
            x_position: "64.4%",
            y_position: "56.18%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1.webp');"
        },
        {
                        title: "數字轉型與創新",
            blocks: ["數字化顧問", "業務流程自動化", "*創新技術實驗室"],
            text: ["助力企業數字化轉型，開啟創新之旅",
                "透過業務流程自動化提升運營效率",
                "探索新技術，加速產品和服務創新"],
            x_position: "71.5%",
            y_position: "28.4%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1.webp');"
        },
        {
            title: "客戶關係管理",
            blocks: ["CRM 系統定制", "客戶數據分析", "用戶體驗優化"],
            text: ["定制 CRM 系統，加強客戶關係管理",
                "利用客戶數據分析深化客戶洞察",
                "優化用戶體驗，提升客戶滿意度"],
            x_position: "83.8%",
            y_position: "64.2%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1.webp');"
        },
        {
            title: "產品UI/UX設計",
            blocks: ["互動設計", "用戶界面設計", "用戶體驗策略"],
            text: ["專注於創造引人入勝的互動設計",
                "打造直觀易用的用戶界面",
                "制定用戶體驗策略，提升產品吸引力"],
            x_position: "88.2%",
            y_position: "49.5%",
            x_position_rwd: "58%",
            y_position_rwd: "30%",
            img: "background-image: url('./img/s6-1.webp');"
        },
        {
            title: "雲計算與大數據",
            blocks: ["雲服務開發", "大數據分析", "數據倉庫解決方案"],
            text: ["開發靈活的雲服務解決方案",
                "通過大數據分析洞察業務機會",
                "提供數據倉庫建設和優化服務"],
            x_position: "90.2%",
            y_position: "16.8%",
            x_position_rwd: "82.2%",
            y_position_rwd: "13.4%",
            img: "background-image: url('./img/s6-1.webp');"
        },
        {
            title: "網絡安全解決方案",
            blocks: ["網絡侵入檢測", "資料加密技術", "安全策略規劃"],
            text: ["提供網絡侵入檢測和預防解決方案",
                "運用先進的資料加密技術保護企業資訊",
                "制定全面的安全策略規劃，加強防護"],
            x_position: "71.5%",
            y_position: "28.4%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1.webp');"
        },
        {
            title: "技術支持與維護",
            blocks: ["產品技術支持", "系統維護與更新", "客戶服務管理"],
            text: ["提供全方位產品技術支持",
                "確保系統穩定運行，及時進行維護與更新",
                "專業客戶服務管理，解決使用過程中的任何問題"],
            x_position: "74.84%",
            y_position: "43.63%",
            x_position_rwd: "58.5%",
            y_position_rwd: "32%",
            img: "background-image: url('./img/s6-1.webp');"
        }
    ],
}




//產品地圖的圖片檔案
//此社可以預先載入 提高速度
const imageList = ['./img/s6-1-1.jpg', './img/s6-1-2.jpg', './img/s6-1-3.jpg', './img/s6-1-4.jpg', './img/s6-1-5.jpg', './img/s6-1-6.jpg', './img/s6-1-7.jpg', './img/s6-1-8.jpg', './img/s6-1-9.jpg', './img/s6-1-10.jpg',];

imageList.forEach((image) => {
    const img = new Image();
    img.src = `${image}`;
});

//台灣在地的35年工業網路及通訊專家 區塊 
//圖片 文案 可自行更換
const section71 = {
    "大標題": "台灣在地的35年工業網路及通訊專家",
    "背景圖檔路徑": "",
    items: [
        {
            "文案": "100% MIT設計、生產、 製造，提供中小型客戶最具競爭力的解決方案",
            "圖檔路徑": "./img/s7-1.png"
        },
        {
            "文案": "簡單易用，無須技術背景也能輕鬆佈署",
            "圖檔路徑": "./img/s7-2.png"
        },
        {
            "文案": "5年保固與健全的經銷網路，提供安心售後服務",
            "小文案": "*依Moxa原廠保固年限公告為準",
            "圖檔路徑": "./img/s7-3.png"
        }
    ]
}
const section7 = {
    "大標題": "HowJi — 軟體創新與顧問的首選夥伴",
    "背景圖檔路徑": "",
    items: [
        {
            "文案": "專注於客製化軟體解決方案，致力於實現企業數位轉型",
            "圖檔路徑": "./img/s7-1.webp"
        },
        {
            "文案": "介面友好，專為用戶打造簡單直觀的使用體驗",
            "圖檔路徑": "./img/s7-2.webp"
        },
        {
            "文案": "提供全面技術支持與維護，確保項目長期穩定運行",
            "小文案": "客戶成功，就是我們的成功",
            "圖檔路徑": "./img/s7-3.webp"
        }
    ]
}


//聯絡我們區塊  連結可以自行調整
const section8 = {
    "大標題": "聯絡我們",
    "項目": [
        {
            "小標題": "我是用戶",
            "小項目": [
                {
                    "文案": "了解更多產品訊息",
                    "連結": "./waiting.html"
                },
                {
                    "文案": "專人諮詢服務",
                    "連結": "./waiting.html"
                },
                {
                    "文案": "線上採購",
                    "連結": "./waiting.html"
                }
            ]
        },
        {
            "小標題": "我是經銷商",
            "小項目": [
                {
                    "文案": "了解更多產品訊息",
                    "連結": "./waiting.html"
                },
                {
                    "文案": "經銷商加盟",
                    "連結": "./waiting.html"
                },

            ]
        }
    ]
}
//footer 區塊
const section9 = { logo1: global_config.footer_img_url1, logo2: global_config.footer_img_url2 }