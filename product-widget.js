/**
 * MO PRODUCT WIDGET — ENGINE (dùng chung cho toàn site, hiếm khi sửa)
 *
 * Đọc dữ liệu từ window.MO_PRODUCT_WIDGETS — một mảng do CÁC FILE DATA
 * (mỗi file 1 box) push vào. File này không chứa sản phẩm nào cả.
 *
 * ---- Thứ tự nhúng trên trang ----
 * <div id="mo-product-widget-tiktok"></div>
 * ... nội dung bài viết ...
 * <div id="mo-product-widget-shopee"></div>
 *
 * <script src="mo-product-data-box1.js"></script>
 * <script src="mo-product-data-box2.js"></script>
 * <script src="mo-product-widget-engine.js"></script>
 *
 * Lưu ý thứ tự: các file data phải nhúng TRƯỚC file engine.
 * Thứ tự GIỮA các file data với nhau (box1 trước hay box2 trước) không
 * quan trọng, vì mỗi file chỉ "push" thêm phần tử của riêng nó vào mảng
 * chung — không ghi đè nhau.
 */
(function () {

  const css = (id) => `
  <style>
    #${id}.mo-pw { font-family:'Open Sans',Helvetica,Arial,sans-serif; width:100%; max-width:600px; margin:0 auto; }
    #${id} .mo-pw-grid {
      display:flex; flex-wrap:wrap; justify-content:center;
      transition:opacity .35s ease;
    }
    #${id} .mo-pw-grid.mo-pw-fade { opacity:0; }

    #${id} .mo-pw-item {
      box-sizing:border-box;
      width:calc((100% / 3) - 6px);
      margin:0 3px 10px;
      border:1px solid #E8E8E8;
      border-radius:10px;
      background:#fff;
      box-shadow:0 1px 2px rgba(0,0,0,.15);
      position:relative;
      overflow:hidden;
      transition:box-shadow .2s ease, transform .2s ease;
    }
    #${id} .mo-pw-item:hover { box-shadow:0 3px 8px rgba(0,0,0,.18); transform:translateY(-1px); }
    #${id} .mo-pw-item a { color:#242424; text-decoration:none; }

    #${id} .mo-pw-img {
      width:100%; aspect-ratio:1/1; background:#fff;
      display:flex; align-items:center; justify-content:center;
      padding:6%; box-sizing:border-box;
    }
    #${id} .mo-pw-img img { max-width:100%; max-height:100%; object-fit:contain; }

    #${id} .mo-pw-title {
      font-size:clamp(11px, 2.6vw, 14px);
      line-height:1.35;
      text-align:center;
      padding:0 6px 6px;
      min-height:2.7em;
      display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden;
    }
    #${id} .mo-pw-title:hover { color:#2c7fce; }

    #${id} .mo-pw-price {
      text-align:center;
      padding:0 6px 8px;
      min-height:1.4em;
    }
    #${id} .mo-pw-price .mo-pw-cur {
      font-size:clamp(12px, 2.8vw, 14px);
      font-weight:600; color:#242424; display:block;
    }
    #${id} .mo-pw-price .mo-pw-old {
      font-size:clamp(10px, 2.2vw, 12px);
      color:#999; text-decoration:line-through; margin-left:4px;
    }

    #${id} .mo-pw-discount {
      position:absolute; top:5px; left:5px;
      background:#f7202e; color:#fff;
      font-size:clamp(10px, 2.4vw, 13px);
      line-height:20px; border-radius:3px; padding:0 4px;
    }

    #${id} .mo-pw-cta {
      display:block; width:100%; box-sizing:border-box;
      text-align:center; padding:8px 0;
      font-size:clamp(11px, 2.6vw, 14px); font-weight:600;
      color:#fff !important; background:#28c76f;
      border-bottom-left-radius:10px; border-bottom-right-radius:10px;
    }
    #${id} .mo-pw-cta:hover { opacity:.9; }

    @media screen and (max-width:575px) {
      #${id} .mo-pw-item { width:calc((100% / 2) - 6px); }
    }
  </style>`;

  function renderCard(p) {
    const priceHtml = p.price ? `
      <div class="mo-pw-price">
        <span class="mo-pw-cur">${p.price}</span>
        ${p.original_price ? `<span class="mo-pw-old">${p.original_price}</span>` : ""}
      </div>` : "";
    const discountHtml = p.discount_percent ? `<div class="mo-pw-discount">-${p.discount_percent}%</div>` : "";

    return `
      <div class="mo-pw-item">
        ${discountHtml}
        <a href="${p.tracking_link}" target="_blank" rel="nofollow">
          <div class="mo-pw-img"><img src="${p.image_url}" alt="${p.product_name}" loading="lazy"></div>
          <div class="mo-pw-title" title="${p.product_name}">${p.product_name}</div>
        </a>
        ${priceHtml}
        <a class="mo-pw-cta" href="${p.tracking_link}" target="_blank" rel="nofollow">Mua ngay</a>
      </div>`;
  }

  function getGroup(products, startIdx, count) {
    const total = products.length;
    const group = [];
    for (let i = 0; i < count && i < total; i++) {
      group.push(products[(startIdx + i) % total]);
    }
    return group;
  }

  function bootWidget(widgetConfig) {
    const { containerId, products, itemsPerView = 3, rotateSeconds = 5 } = widgetConfig;
    const container = document.getElementById(containerId);
    if (!container || !products || products.length === 0) return;

    container.classList.add("mo-pw");
    container.innerHTML = css(containerId) + `<div class="mo-pw-grid"></div>`;
    const grid = container.querySelector(".mo-pw-grid");

    let startIdx = 0;
    function paint() {
      grid.innerHTML = getGroup(products, startIdx, itemsPerView).map(renderCard).join("");
    }
    paint();

    if (rotateSeconds > 0 && products.length > itemsPerView) {
      setInterval(() => {
        grid.classList.add("mo-pw-fade");
        setTimeout(() => {
          startIdx = (startIdx + itemsPerView) % products.length;
          paint();
          grid.classList.remove("mo-pw-fade");
        }, 350);
      }, rotateSeconds * 1000);
    }
  }

  function boot() {
    const widgets = window.MO_PRODUCT_WIDGETS || [];
    widgets.forEach(bootWidget);
  }

  function init() {
    // Nếu ít nhất 1 file data đã push dữ liệu, chạy luôn.
    if (Array.isArray(window.MO_PRODUCT_WIDGETS) && window.MO_PRODUCT_WIDGETS.length > 0) {
      boot();
      return;
    }
    // Cơ chế chờ an toàn (phòng khi thứ tự load bị lệch, script data bị chậm...)
    let tries = 0;
    const waiter = setInterval(() => {
      tries++;
      if (Array.isArray(window.MO_PRODUCT_WIDGETS) && window.MO_PRODUCT_WIDGETS.length > 0) {
        clearInterval(waiter);
        boot();
      } else if (tries > 50) { // ~5s timeout
        clearInterval(waiter);
        console.warn("[mo-product-widget] Không tìm thấy window.MO_PRODUCT_WIDGETS — kiểm tra các file data (mo-product-data-boxN.js) đã nhúng trước file engine chưa.");
      }
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
