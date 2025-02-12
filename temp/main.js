document.addEventListener("DOMContentLoaded", function () {
    const hamburgerButton = document.getElementById("hamburger-button");
    const fullscreenMenu = document.getElementById("fullscreen-menu");
    const menuItems = document.querySelectorAll(".menu-item");

    hamburgerButton.addEventListener("click", function () {
        fullscreenMenu.classList.toggle("hidden");
        // 使用

    });

    menuItems.forEach(function (menuItem) {
        menuItem.addEventListener("click", function () {
            fullscreenMenu.classList.add("hidden");
            // 解鎖滾動

        });
    });
});

//section9
$(document).ready(function () {
    $("#footer_logo1").attr("src", section9.logo1)
    $("#footer_logo2").attr("src", section9.logo2)
}
)
//section8
$(document).ready(function () {
    const section8Data = section8["項目"];
    const contentContainer = $('#section8 .item-container');
    console.log(contentContainer)

    section8Data.forEach((item) => {
        const itemDiv = $('<div></div>').addClass('item');
        const smallTitle = $('<h2></h2>').addClass('small-title').text(item['小標題']);
        itemDiv.append(smallTitle);

        item['小項目'].forEach((subItem) => {
            const linkButton = $('<a target="_blank"></a>')
                .addClass('link-button')
                .text(subItem['文案'])
                .attr('href', subItem['連結']);
            itemDiv.append(linkButton);
        });

        contentContainer.append(itemDiv);
    });
});

//section7
$(document).ready(function () {
    const section7Data = section7.items;
    const itemContainer = $('#section7 .item-container');

    section7Data.forEach((item) => {
        const itemDiv = $('<div></div>').addClass('item');
        const image = $('<img>').attr('src', item['圖檔路徑']);
        const text = $('<div class="p-div"></div>').text(item['文案']);
        if (item['小文案'] != undefined) {
            const small_text = $('<div class="s-p-div"></div>').text(item['小文案']);
            text.append(small_text);
        }
        itemDiv.append(image, text);
        itemContainer.append(itemDiv);
    });
});

function linearTransform_x(x) {
    const a = 1.659;
    const b = -67.980;
    return a * x + b;
}
function linearTransform_y(x) {
    const a = 0.490;
    const b = 5.062;
    return a * x + b;
}


//section6
$(document).ready(function () {
    const section6Data = section6.items;
    $('.infoTitle1').text(section6.title);
    section6Data.forEach((item, index) => {
        const dot = $('<div></div>').addClass('dot').addClass(`dot${index}`)
            .css('left', item.x_position)
            .css('top', item.y_position)
            .attr('data-index', index);

        $('#section6 .product-map').append(dot);
    });

    $('.infoTitle1').text(section6.title);
    section6Data.forEach((item, index) => {
        // const new_vector=transformVector([ parseFloat(item.x_position.slice(0, -1)), parseFloat(item.y_position.slice(0, -1))])
        const new_x = linearTransform_x(parseFloat(item.x_position.slice(0, -1)))
        const new_y = linearTransform_y(parseFloat(item.y_position.slice(0, -1)))
        console.log(new_x, new_y)
        const dot = $('<div></div>').addClass('dot').addClass(`dot${index}`)
            .css('left', new_x + "%")
            .css('top', new_y + "%")
            // .css('left', item.x_position_rwd)
            // .css('top', item.y_position_rwd)
            .attr('data-index', index);

        $('#section6-rwd .product-map').append(dot);
    });
    //初始第一個
    const item = section6Data[0];
    $('.dot0').addClass('picked')
    $('.info-panel').css({ 'left': '-200%' });
    $('.info-panel').animate({ 'left': '-200%' }, 10);
    $('#section6').attr("style", item.img)
    console.log(item.img)
    setTimeout(() => {
        $('.infoTitle').text(item.title);
        const blocks = item.blocks.map(block => `<span>${block}</span>`).join('');
        $('.infoBlocks').html(`${blocks}`);
        const texts = item.text.map(text => `<li>${text}</li>`).join('');
        $('.infoTexts').html(`<ul>${texts}</ul>`);
        $('.info-panel').animate({ 'left': '0' }, 500);
    }, 200)

    $('.dot').click(function () {
        const index = $(this).attr('data-index');
        const item = section6Data[index];
        $('.info-panel').css({ 'left': '-200%' });
        $('.info-panel').animate({ 'left': '-200%' }, 10);
        $('#section6').attr("style", item.img)
        $(".picked").removeClass("picked")
        $(this).addClass("picked")
        console.log(item.img)
        setTimeout(() => {
            $('.infoTitle').text(item.title);
            const blocks = item.blocks.map(block => `<span>${block}</span>`).join('');
            $('.infoBlocks').html(`${blocks}`);
            const texts = item.text.map(text => `<li>${text}</li>`).join('');
            $('.infoTexts').html(`<ul>${texts}</ul>`);
            $('.info-panel').animate({ 'left': '0' }, 500);
        }, 200)
        setTimeout(() => {

        }, 1000)
    });
});


//section5
$(document).ready(function () {
    // 请确保您的 section5 数据对象在这里或者在其他地方已经定义
    const { title, full_item, half_items, full_item_span } = section5;

    // 添加区块标题
    $('#section5').append(`<h3 class="text-center common-section-title">${title}</h3>`);

    // 添加 full_item
    let fullItemHtml = `
<div class="row full-item-row">
  <div class="col-12 col-md-6 left-div">
    <img src="${full_item['圖片檔案']}" class="img-fluid1" height="100%">
  </div>
  <div class="col-12 col-md-6 right-div">
    
        <h3>${full_item['標題']}</h3>
        <div class="divider"></div>
        <ul>
        ${full_item['文案'].map(text => `<li>${text}</li>`).join('')}
        </ul>
        <button id="showMore" class="btn btn-link show-more-btn span_off">
            了解更多
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="11" viewBox="0 0 18 11" fill="none" id="span_off_svg">
                <path d="M9 0L0 8.49534L2.45391 10.8116L9 4.63262L15.5461 10.8116L18 8.49534L9 0Z" fill="white"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="11" viewBox="0 0 18 11" fill="none" class="hidden" id="span_on_svg">
                <path d="M9 10.8116L18 2.3163L15.5461 -3.07555e-06L9 6.17903L2.45391 -4.22011e-06L7.42686e-07 2.3163L9 10.8116Z" fill="#008787"/>
            </svg>
        </button>
   
  </div>
</div>
`;
    $('#section5').append(fullItemHtml);

    // 添加 full_item_span（最初是隐藏的）
    let fullItemSpanHtml = `
<div id="fullItemSpan" class="row full-item-span justify-content-center" style="display: none;">
    <h4>${full_item_span['標題']}</h4>
    <div id="fullItemSpan_div1"> </div>
    <div class="row">
      ${full_item_span['內容'].map((item, index) => `
        <div class="col-md-6 col-12">
            <div class='d-flex block block${index}'>
                <div class="d-flex align-items-center ">
                    <img src="${item['圖片檔案']}" class="img-fluid">
                </div>
                <div class="d-flex align-items-center mb-3">
                    <span>${item['文案']}</span>
                </div>
            </div>
        </div>`).join('')}
    </div>
</div>
`;

    // 在 full_item 之后添加 full_item_span
    $('.full-item-row').after(fullItemSpanHtml);

    const fullItemSpan = section5.full_item_span;
    // const items = fullItemSpan["內容"];
    // const ul = $('<ul></ul>');
    // items.forEach(item => {
    //     const li = $('<li></li>').text(item["文案"]);
    //     ul.append(li);
    // });
    // $("#fullItemSpan_div1").append(ul);

    // “显示更多”按钮点击事件
    $('#showMore').click(function () {
        $('#fullItemSpan').toggle();
        if ($(this).hasClass("span_off") == true) {
            $(this).removeClass("span_off").addClass("span_on")
            $("#span_on_svg").removeClass("hidden")
            $("#span_off_svg").addClass("hidden")
            $("#section5 .right-div").addClass("span_on")
        } else {
            $(this).removeClass("span_on").addClass("span_off")
            $("#span_off_svg").removeClass("hidden")
            $("#span_on_svg").addClass("hidden")
            $("#section5 .right-div").removeClass("span_on")
        }

    });

    // 添加 half_items
    let halfItemsHtml = '<div class="row justify-content-between half-items-row">';
    half_items.forEach(item => {
        halfItemsHtml += `
  <div class="col-12 col-md-6 half-item-col">
    <div class="card">
      <img src="${item['圖片檔案']}" class="card-img-top">
      <div class="card-body">
        <h5 class="card-title">${item['標題']}</h5>
        <div class="divider"></div>
        <ul>
          ${item['文案'].map(text => `<li>${text}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>
`;
    });
    halfItemsHtml += '</div>';
    $('#section5').append(halfItemsHtml);
});


//section4
$(document).ready(function () {

    $('#section4').prepend(`<h3 class="text-center  common-section-title">${section4.title}</h3>`);

    section4.items.forEach((item) => {
        const recItem = $(`
  <div class="item">
    <div class="card hover-card">
      <div class="card-img-wrapper">
        <img src="${item['圖片檔案']}" class="card-img-top" alt="${item['標題1']}">
        <div class="img-overlay">
          <p>${item['滑鼠點到浮現文字']}</p>
        </div>
      </div>
      <div class="card-body hover-card-body">
        <h5 class="card-title">${item['標題1']}</h5>
        <p class="card-subtitle">${item['標題2']}</p>
      </div>
    </div>
  </div>
`);
        $('#recommendationItems').append(recItem);
    });
});
//section3
$(document).ready(function () {
    const items = section3.items;
    $("#section3-title").text(section3.title)
    items.forEach((item) => {
        const eventItem = $(`
    <div class="item">
      <div class="card">
        <img src="${item['圖片檔案']}" class="card-img-top" alt="${item['標題']}">
        <div class="card-body">
          <h5 class="card-title">${item['標題']}</h5>
          <small>${item['說明文字']}</small>
          <a href="${item['連結（圖片/標題）']}" target="_blank" class="btn btn-primary s3-btn">了解詳情</a>
        </div>
      </div>
    </div>
  `);
        $('#eventItems').append(eventItem);
    });
});
// 第一區產生
$(document).ready(function () {


    // Randomly select an initial active slide
    const randomIndex = Math.floor(Math.random() * section1.length);

    section1.forEach((slide, index) => {
        // Add indicators
        const indicator = $('<li>', {
            'data-bs-target': '#myCarousel',
            'data-bs-slide-to': index,
            'class': index === randomIndex ? 'active' : ''
        });
        $('#carouselIndicators').append(indicator);

        // Add slides
        const slideItem = $('<div>', { class: `carousel-item ${index === randomIndex ? 'active' : ''}` });
        const width = screen.width;
        const slide_img_url = width >= 768 ? slide.img_url1 : slide.img_url1_s;
        // const image = $('<img>', { src: slide.img_url1, class: 'd-block w-100', alt: `Image ${index + 1}` });
        const image = $('<img>', { src: slide_img_url, class: 'd-block w-100', alt: `Image ${index + 1}` });
        const caption = $('<div>', { class: 'carousel-caption d-none d-md-block text-start' });
        const text1 = $('<h1>', { text: slide.text_1 });
        const text2 = $('<h3>', { text: slide.text_2 });

        caption.append(text1, text2);
        slideItem.append(image, caption);
        $('#carouselSlides').append(slideItem);
    });
});
// header nav產生
$(document).ready(function () {
    // const header_list = ["最新活動", "熱門推薦", "商用vs工業級", "產品應用", "Why Moxa", "聯絡我們"];
    

    header_list.forEach((item, index) => {
        const spacingClass = index < header_list.length - 1 ? 'me-3' : '';
        const navItem = $('<li>', { class: `nav-item ${spacingClass}` });
        const navLink = $('<a>', { class: 'nav-link', text: item.title, href: item.href });
        navItem.append(navLink);
        $('#navbarNavList').append(navItem);
    });
    $("#nav-img-1").attr("src", header_img_arr[0])
    $("#nav-img-2").attr("src", header_img_arr[1])
});