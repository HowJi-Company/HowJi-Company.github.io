//config.js 使用說明
//如果想要更換網頁中的 "文字" 或是 "圖片" 可以從這邊調整
// 

// 這兩個url 是header的兩個logo的圖案路徑
const global_config = {
    header_img_url1: "./img/logo1_0.png",
    header_img_url2: "./img/logo2_0.png",
}

// 這是header的導覽列的文字內容 
const header_list = [{ title: "最新活動", href: "#section3" },
{ title: "熱門推薦", href: "#section4" },
{ title: "商用vs工業級", href: "#section5" },
{ title: "產品應用", href: "#section6" },
{ title: "Why Moxa", href: "#section7" },
{ title: "聯絡我們", href: "#section8" }]

//第一個區塊 輪播圖片 text_1 text_2 目前被棄用 url是圖片路徑 可以調整
// img_url1 是大尺寸的圖片, img_url1_s 是小尺寸螢幕的圖片 
const section1 = [{
    text_1: "",
    text_2: "",
    img_url1: './img/banner_1_pc_@2x.jpg',
    img_url1_s: './img/s1-1-s.jpg',
}, {
    text_1: "",
    text_2: "",
    img_url1: './img/banner_2_pc_@2x.jpg',
    img_url1_s: './img/s1-2-s.jpg',
}, {
    text_1: "",
    text_2: "",
    img_url1: './img/banner_1_pc_@2x.jpg',
    img_url1_s: './img/s1-1-s.jpg',
}];

//最新活動區塊 
// 圖片檔案  為圖片的檔案路徑 可以調整
// 連結的路徑也有效 可以條整
const section3 = {
    title: "最新活動",
    items: [{
        "日期": "2023.08.29(Tue) 9:00-16:30",
        "標題": "[🔥熱烈報名中]  工業無線好夥伴-無線網路解決方案",
        "說明文字": "不論您是第一次部署無線網路，或是已經有相關經驗，都歡迎報名此實戰課程，只需要短短６小時，即可獲得 Moxa 網路部署專家的傾囊相授，從實際場域部署的痛點出發，不只有紙上談兵的理論課程，更是結合大量hands-on實作，目標是在短短的時間裡重點濃縮，將應用端會遇到的實際情況分享給您，讓您在理論、實作、應用中創造三贏，讓無線網路實現您的無限可能！",
        "連結（圖片/標題）": "https://www.moxa.com/tw/promo/Event/2023/Industrial-Technology-Exploration-Day/index.html",
        "圖片檔案": "./img/s3-1.jpg"
    }, {
        "日期": "2023.09.19(Tue) 9:00-16:30",
        "標題": "[🔥熱烈報名中]  工廠最佳翻譯官-邊緣設定連結",
        "說明文字": "Industrial Technology Exploration Day 由 Moxa 專業講師群提供一系列多元實戰課程，帶您實際學習並操作工業通訊所需的技能與產品，主題課程包含邊緣設備連結、無線工業網路佈建、可視化網路管理以及 OT 資安防護等實用內容，不論是各產業領域的現場工程人員或是管理方，皆可透過 Industrial Technology Exploration Day 了解更多工業場域所需具備的網路通訊技能、提升產業競爭力。",
        "連結（圖片/標題）": "https://www.moxa.com/tw/promo/Event/2023/Industrial-Technology-Exploration-Day/index.html",
        "圖片檔案": "./img/s3-1.jpg"
    }, {
        "日期": "2023.09.19(Tue) 9:00-16:30",
        "標題": "[🔥熱烈報名中]  工業無線好夥伴-無線網路解決方案",
        "說明文字": "不論您是第一次部署無線網路，或是已經有相關經驗，都歡迎報名此實戰課程，只需要短短６小時，即可獲得 Moxa 網路部署專家的傾囊相授，從實際場域部署的痛點出發，不只有紙上談兵的理論課程，更是結合大量hands-on實作，目標是在短短的時間裡重點濃縮，將應用端會遇到的實際情況分享給您，讓您在理論、實作、應用中創造三贏，讓無線網路實現您的無限可能！",
        "連結（圖片/標題）": "https://www.moxa.com/tw/promo/Event/2023/Industrial-Technology-Exploration-Day/index.html",
        "圖片檔案": "./img/s3-1.jpg"
    }]
}

//熱門推薦的區塊 
// 圖片的調整 請改 圖片檔案 的 檔案路徑
const section4 = {
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
// 一般商用 vs 工業級網通 區塊 
// 圖片檔案一樣可以修改
//full_item_span 這一項中的路徑 是點擊按鈕擴展後的內容
const section5 = {
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

// 產品分類地圖 
// 此區的調整最為特別 全部以比例去客製化調整 
// x y position 可以微調點點的位置
const section6 = {
    "背景圖案": "",
    title: "Moxa 產品分類地圖",
    "備註": "備註 : *專案產品，請洽詢專人服務	https://www.moxa.com/tw/contact-us/contact-form",
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

//產品地圖的圖片檔案
//此社可以預先載入 提高速度
const imageList = ['./img/s6-1-1.jpg', './img/s6-1-2.jpg', './img/s6-1-3.jpg', './img/s6-1-4.jpg', './img/s6-1-5.jpg', './img/s6-1-6.jpg', './img/s6-1-7.jpg', './img/s6-1-8.jpg', './img/s6-1-9.jpg', './img/s6-1-10.jpg',];

imageList.forEach((image) => {
    const img = new Image();
    img.src = `${image}`;
});

//台灣在地的35年工業網路及通訊專家 區塊 
//圖片 文案 可自行更換
const section7 = {
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

//聯絡我們區塊  連結可以自行調整
const section8 = {
    "大標題": "聯絡我們",
    "項目": [
        {
            "小標題": "我是用戶",
            "小項目": [
                {
                    "文案": "了解更多產品訊息",
                    "連結": "https://www.moxa.com/tw/support"
                },
                {
                    "文案": "專人諮詢服務",
                    "連結": "https://www.moxa.com/tw/contact-us"
                },
                {
                    "文案": "線上採購",
                    "連結": "https://www.eclife.com.tw/product/brand/MOXA?coid=Megamenu"
                }
            ]
        },
        {
            "小標題": "我是經銷商",
            "小項目": [
                {
                    "文案": "了解更多產品訊息",
                    "連結": "https://www.moxa.com/tw/support"
                },
                {
                    "文案": "洽代理商－展碁國際",
                    "連結": "https://forms.office.com/r/XguazD3k2J"
                },

            ]
        }
    ]
}
//footer 區塊
const section9 = { logo1: global_config.header_img_url1, logo2: global_config.header_img_url2 }