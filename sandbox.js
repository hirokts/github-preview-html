// manifest の sandbox ページとして動き、拡張機能ページの CSP を継承せずに HTML 内のスクリプトを実行する。
window.addEventListener("message", (event) => {
  if (event.source !== window.parent || event.data?.type !== "render-preview") return;
  document.open();
  document.write(event.data.html);
  document.close();
});

window.parent.postMessage({ type: "sandbox-ready" }, "*");
