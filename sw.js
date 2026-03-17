// Service Workerのインストール
self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
});

// fetchイベント（通信）の制御
// キャッシュは使わず、常にネットワークから最新を取得する設定
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request));
});
