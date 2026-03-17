const preloadImagesList = ["images/surume.png", "images/beef.png", "images/nuts.png"];

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").then(
      function (registration) {
        console.log("ServiceWorker registration successful");
      },
      function (err) {
        console.log("ServiceWorker registration failed: ", err);
      },
    );
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("bell-curve-svg");
  const shapeContainer = document.querySelector(".shape-container");
  const pathElement = document.getElementById("bell-path");
  const textElement = document.getElementById("bell-text");

  // ★追加：スクロールコンテナの取得
  const scrollContainer = document.getElementById("scroll-container");

  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let animationFrameId = null;

  function getPointerPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  }

  function drawShape(scrollProgress, extraX = 0, extraY = 0) {
    // ... (drawShape関数のロジックは変更なし) ...
    const width = shapeContainer.clientWidth;
    const height = shapeContainer.clientHeight;
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    const aspectRatio = width / height;
    let maxTopWidthRatio = aspectRatio < 1 ? 0.85 : 0.7;
    let startPeakRatio = aspectRatio < 1 ? 0.45 : 0.4;
    let endPeakRatio = 0.1;
    let curveStrength = 0.25;

    const maxTopWidth = width * maxTopWidthRatio;
    const currentTopWidth = maxTopWidth * scrollProgress;
    const startPeakY = height * startPeakRatio;
    const endPeakY = height * endPeakRatio;
    let currentPeakY = startPeakY + (endPeakY - startPeakY) * scrollProgress;
    if (scrollProgress === 0) currentPeakY += extraY;

    const centerX = width * 0.5;
    const halfTop = currentTopWidth * 0.5;
    const peakCenterX = centerX + extraX;
    const peakLeftX = peakCenterX - halfTop;
    const peakRightX = peakCenterX + halfTop;
    const controlOffset = width * curveStrength * (1 - scrollProgress * 0.5);

    const pathData = `
            M 0 0 L ${width} 0 L ${width} ${height} L ${width} ${height}
            C ${width - controlOffset} ${height}, ${peakRightX + controlOffset} ${currentPeakY}, ${peakRightX} ${currentPeakY}
            L ${peakLeftX} ${currentPeakY}
            C ${peakLeftX - controlOffset} ${currentPeakY}, ${controlOffset} ${height}, 0 ${height}
            L 0 ${height} Z
        `;
    if (pathElement) pathElement.setAttribute("d", pathData);

    if (textElement) {
      const textStartY = height * 0.4;
      const textMoveUp = height * 0.1;
      const currentTextY = textStartY - textMoveUp * scrollProgress + (scrollProgress === 0 ? extraY : 0);
      textElement.style.transform = `translate(${scrollProgress === 0 ? extraX : 0}px, 0)`;
      const tspans = textElement.querySelectorAll("tspan");
      tspans.forEach((span) => span.setAttribute("y", currentTextY));
      let opacity = 1 - scrollProgress * 2;
      textElement.style.opacity = opacity < 0 ? 0 : opacity;
    }
  }

  // --- 3. スクロール連動（ここを修正） ---
  function onScroll() {
    if (isDragging) return;
    // ★修正：scrollContainer.scrollTop を使用
    const scrollY = scrollContainer.scrollTop;
    const windowHeight = window.innerHeight;
    let progress = scrollY / windowHeight;
    if (progress > 1) progress = 1;
    if (progress < 0) progress = 0;
    drawShape(progress, dragOffsetX, dragOffsetY);
  }

  function onStart(e) {
    // ★修正：判定も scrollContainer.scrollTop に
    if (scrollContainer.scrollTop > 5) return;
    const isTouch = e.type.startsWith("touch");
    if (isTouch && e.touches.length < 2) return;

    isDragging = true;
    const pos = getPointerPos(e);
    startX = pos.x;
    startY = pos.y;
    if (!isTouch) e.preventDefault();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }

  // ... (onMove, onEnd, springBack は変更なし) ...
  function onMove(e) {
    if (!isDragging) return;
    const isTouch = e.type.startsWith("touch");
    if (isTouch && e.touches.length < 2) return;
    if (e.cancelable) e.preventDefault();
    const pos = getPointerPos(e);
    dragOffsetX = (pos.x - startX) * 0.4;
    dragOffsetY = (pos.y - startY) * 0.4;
    drawShape(0, dragOffsetX, dragOffsetY);
  }

  function onEnd(e) {
    const isTouch = e.type.startsWith("touch");
    if (isTouch && e.touches.length >= 2) return;
    if (!isDragging) return;
    isDragging = false;
    springBack();
  }

  function springBack() {
    dragOffsetX *= 0.85;
    dragOffsetY *= 0.85;
    if (Math.abs(dragOffsetX) < 0.5 && Math.abs(dragOffsetY) < 0.5) {
      dragOffsetX = 0;
      dragOffsetY = 0;
      drawShape(0, 0, 0);
      return;
    }
    drawShape(0, dragOffsetX, dragOffsetY);
    animationFrameId = requestAnimationFrame(springBack);
  }

  // --- 5. イベント登録 ---
  window.addEventListener("mousedown", onStart);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onEnd);
  window.addEventListener("touchstart", onStart, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onEnd);

  // ★修正：window ではなく scrollContainer のスクロールを監視
  scrollContainer.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onScroll);
  onScroll();
});

const hamburger = document.getElementById("js-hamburger");
const nav = document.getElementById("js-nav");
const overlay = document.getElementById("js-overlay");

// 開閉処理を関数化
const toggleMenu = () => {
  hamburger.classList.toggle("is-active");
  nav.classList.toggle("is-active");
  overlay.classList.toggle("is-active");
};

// クリックイベント
hamburger.addEventListener("click", toggleMenu);
overlay.addEventListener("click", toggleMenu); // 背景クリックでも閉じる

document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("menuTrack");
  const originalItems = document.querySelectorAll(".menu-item"); // クローン前のアイテムリスト
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pagination = document.getElementById("pagination");

  // 設定
  let currentIndex = 1; // クローンが入るので初期位置は1
  let isTransitioning = false;
  let itemWidth = 0;

  // ===============================================
  // 1. 初期化処理（クローン作成・ドット作成）
  // ===============================================

  // クローンの作成 [Last] - [1] - [2] - [3] - [First]
  const firstClone = originalItems[0].cloneNode(true);
  const lastClone = originalItems[originalItems.length - 1].cloneNode(true);

  firstClone.classList.add("clone");
  lastClone.classList.add("clone");

  track.appendChild(firstClone); // 末尾に追加
  track.insertBefore(lastClone, originalItems[0]); // 先頭に追加

  const allItems = document.querySelectorAll(".menu-item"); // クローン含む全リスト

  // ドットの生成
  originalItems.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    // ドットクリックで移動する機能（オプション）
    dot.addEventListener("click", () => {
      if (isTransitioning) return;
      currentIndex = index + 1; // クローン分の +1
      updateSlide(true);
      updateDots();
    });
    pagination.appendChild(dot);
  });
  const dots = document.querySelectorAll(".dot");

  // ===============================================
  // 2. スライド・更新関数
  // ===============================================

  // サイズ取得と位置合わせ
  const setSize = () => {
    itemWidth = allItems[0].clientWidth;
    // PCサイズ(1001px以上)ならリセット、スマホなら位置計算
    if (window.innerWidth <= 1000) {
      updateSlide(false); // アニメーションなしで位置補正
    }
  };

  // スライド実行関数
  const updateSlide = (withTransition = true) => {
    if (withTransition) {
      track.style.transition = "transform 0.3s ease-in-out";
    } else {
      track.style.transition = "none";
    }
    track.style.transform = `translateX(${-itemWidth * currentIndex}px)`;
  };

  // ドットの更新
  const updateDots = () => {
    // 現在のインデックスから、本物のアイテム番号(0~2)を計算
    // currentIndex: 0(CloneL) -> 1(Real1) -> 2(Real2) -> 3(Real3) -> 4(CloneF)
    let realIndex = currentIndex - 1;

    if (realIndex < 0) realIndex = originalItems.length - 1;
    if (realIndex >= originalItems.length) realIndex = 0;

    dots.forEach((dot) => dot.classList.remove("active"));
    if (dots[realIndex]) {
      dots[realIndex].classList.add("active");
    }
  };

  // ===============================================
  // 3. イベントリスナー
  // ===============================================

  // 次へボタン
  nextBtn.addEventListener("click", () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateSlide(true);
    updateDots();
  });

  // 前へボタン
  prevBtn.addEventListener("click", () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateSlide(true);
    updateDots();
  });

  // アニメーション終了時の瞬間移動（無限ループの核）
  track.addEventListener("transitionend", () => {
    isTransitioning = false;

    const currentItem = allItems[currentIndex];

    // クローンに到達していたら、本物へ瞬間移動
    if (currentItem.classList.contains("clone")) {
      if (currentIndex === 0) {
        // 先頭のクローン(Lastの中身) -> 本物のLastへ
        currentIndex = allItems.length - 2;
      } else if (currentIndex === allItems.length - 1) {
        // 末尾のクローン(Firstの中身) -> 本物のFirstへ
        currentIndex = 1;
      }
      updateSlide(false); // transitionなしで移動
    }
  });

  // ウィンドウリサイズ時
  window.addEventListener("resize", setSize);

  // 初回実行
  setSize();
});

// ID 'qrcode' の要素の中にQRコードを生成
new QRCode(document.getElementById("qrcode"), {
  text: "https://mutohikaru.github.io/otsuumami-shop/", // 埋め込みたいURLやテキスト
  width: 400,
  height: 400,
  colorDark: "#000000", // ドットの色
  colorLight: "#ffffff", // 背景色
  correctLevel: QRCode.CorrectLevel.H, // 誤り訂正レベル（H=高）
});

const triggerBox = document.querySelector(".qrcode-box");
const modeloverlay = document.getElementById("modal-overlay");
const closeBtn = document.getElementById("close-btn");

// 1. .qrcode-box をクリックしたら表示
triggerBox.addEventListener("click", () => {
  if (window.matchMedia("(orientation: portrait)").matches) {
    modeloverlay.classList.add("active");
  } else {
  }
});

// 2. 閉じるボタンをクリックしたら非表示
closeBtn.addEventListener("click", () => {
  modeloverlay.classList.remove("active");
});

// 3. 背景（暗い部分）をクリックしても閉じるようにする
modeloverlay.addEventListener("click", (e) => {
  // クリックされたのが「背景そのもの」なら閉じる
  // （中の白い箱をクリックした時は閉じないようにする判定）
  if (e.target === overlay) {
    modeloverlay.classList.remove("active");
  }
});
