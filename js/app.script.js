const preloadImagesList = ["/images/imgs1.png", "/images/imgs2.png", "/images/imgs3.png", "/images/imgs4.png", "/images/imgs5.png", "/images/imgs6.png", "/images/imgs7.png", "/images/imgs8.png", "/images/imgs9.png", "/images/imgs10.png", "/images/imgs11.png", "/images/imgm1.png", "/images/imgm2.png", "/images/imgm3.png", "/images/imgm4.png", "/images/imgm5.png", "/images/imgm6.png", "/images/imgm7.png", "/images/imgm8.png", "/images/imgm9.png", "/images/imgm10.png", "/images/imgm11.png", "/images/imgb1.png", "/images/imgb2.png", "/images/imgb3.png", "/images/imgb4.png", "/images/imgb5.png", "/images/imgb6.png", "/images/imgb7.png", "/images/imgb8.png", "/images/imgb9.png", "/images/imgb10.png", "/images/imgb11.png", "/images/survey.png", "/images/shellfish.png", "/images/osake.png", "/images/100off.png", "/images/kaisou.png", "/images/okaikei.png"];

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

// === JavaScript（切り替えロジック） ===
function switchTab(pageId, btnElement) {
  // 1. すべてのページを隠す
  const pages = document.querySelectorAll(".page-content");
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  // 2. 指定されたページだけ表示する
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add("active");
  }

  // 3. すべてのボタンの選択状態を解除
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
  });

  // 4. 押されたボタンを選択状態にする
  btnElement.classList.add("active");
  if (pageId === "home") {
    // app.jsで登録した関数が存在するか確認してから実行
    if (typeof window.refreshBarcode === "function") {
      window.refreshBarcode();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // --- 設定 ---
  const UPDATE_INTERVAL = 30; // 更新間隔（秒）※デモなら10秒推奨

  // --- 変数 ---
  let timeLeft = UPDATE_INTERVAL;
  const timerBar = document.getElementById("timerBar");

  // --- 関数定義 ---

  // 13桁のランダムな数字を作る関数
  function generateRandomNumber() {
    return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
  }

  // バーコードを再描画する関数
  function refreshBarcode() {
    const randomId = generateRandomNumber();

    // ライブラリを使って描画
    JsBarcode("#barcode", randomId, {
      format: "CODE128",
      lineColor: "#000",
      width: 2,
      height: 80,
      displayValue: true,
      fontSize: 18,
    });

    // タイマーをリセット
    timeLeft = UPDATE_INTERVAL;
    updateTimerBar();
  }

  window.refreshBarcode = refreshBarcode;

  // タイマーバー（ゲージ）の見た目を更新する関数
  function updateTimerBar() {
    // 残り時間の割合（%）を計算
    const percentage = (timeLeft / UPDATE_INTERVAL) * 100;

    // CSSのwidthを変更
    timerBar.style.width = percentage + "%";

    // 残り時間が20%を切ったら赤くする演出
    if (percentage < 20) {
      timerBar.style.backgroundColor = "#ff4444"; // 赤
    } else {
      timerBar.style.backgroundColor = "#007bff"; // 青
    }
  }

  // --- 実行開始 ---

  // 初回実行
  refreshBarcode();

  // 1秒ごとにカウントダウン処理を行うタイマー
  setInterval(() => {
    timeLeft--;
    updateTimerBar();

    // 0秒になったら更新
    if (timeLeft <= 0) {
      refreshBarcode();
    }
  }, 1000);
});

// すべてのクーポンアイテムを取得
const items = document.querySelectorAll(".coupon-item");

items.forEach((item) => {
  // アイテム内のカード部分をクリックした時
  const card = item.querySelector(".coupon-card");

  card.addEventListener("click", () => {
    // 既に開いているかチェック
    const isAlreadyActive = item.classList.contains("active");

    // 1. 他をすべて閉じる（activeクラスを削除）
    // これにより display: block が display: none に戻り、即座に消えます
    items.forEach((i) => i.classList.remove("active"));

    // 2. 自分が閉じていたなら開く
    if (!isAlreadyActive) {
      item.classList.add("active");
    }
  });
});

function useCoupon(event, id) {
  event.stopPropagation(); // 親のクリックイベントを防止
  alert(id + " を使用しました");

  // 使用後に閉じる場合
  const item = event.target.closest(".coupon-item");
  if (item) item.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-item");
  const contents = document.querySelectorAll(".content-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // 1. すべてのタブから active クラスを削除
      tabs.forEach((t) => t.classList.remove("active"));

      // 2. クリックされたタブに active クラスを追加
      tab.classList.add("active");

      // 3. すべてのコンテンツを非表示にする
      contents.forEach((content) => content.classList.remove("active"));

      // 4. 対応するコンテンツを表示する
      const targetId = tab.getAttribute("data-target");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });
});
