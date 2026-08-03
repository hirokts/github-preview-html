function githubBlobToRaw(value) {
  try {
    const url = new URL(value);
    if (url.hostname !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const blobIndex = parts.indexOf("blob");
    if (blobIndex < 2 || !parts[blobIndex + 1]) return null;
    const path = parts.slice(blobIndex + 2).join("/");
    if (!/\.html?$/i.test(path)) return null;
    return `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${encodeURIComponent(parts[blobIndex + 1])}/${path.split("/").map(encodeURIComponent).join("/")}`;
  } catch {
    return null;
  }
}

function openPreview(githubUrl) {
  const rawUrl = githubBlobToRaw(githubUrl);
  if (!rawUrl) return;
  chrome.tabs.create({ url: chrome.runtime.getURL(`preview.html?url=${encodeURIComponent(rawUrl)}`) });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "open-preview") {
    openPreview(message.url);
    return;
  }

  if (message.type === "open-page-preview") {
    openPagePreview(message.html, message.sourceUrl).then(sendResponse);
    return true;
  }

  if (message.type === "get-page-preview") {
    chrome.storage.session.get(message.id).then(async (items) => {
      await chrome.storage.session.remove(message.id);
      sendResponse(items[message.id] || { ok: false, error: "プレビュー用データの有効期限が切れました。元の GitHub ページでもう一度 Preview HTML を押してください。" });
    });
    return true;
  }

  if (message.type === "fetch-preview") {
    fetchHtml(message.url).then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function openPagePreview(html, sourceUrl) {
  if (!html) return { ok: false, error: "GitHub ページから HTML ソースを取得できませんでした。" };
  const id = crypto.randomUUID();
  await chrome.storage.session.set({ [id]: { ok: true, html, sourceUrl } });
  await chrome.tabs.create({ url: chrome.runtime.getURL(`preview.html?id=${encodeURIComponent(id)}`) });
  return { ok: true };
}

async function fetchHtml(value) {
  let url;
  try { url = new URL(value); } catch { return { ok: false, error: "無効な URL です。" }; }
  if (url.protocol !== "https:" || url.hostname !== "raw.githubusercontent.com") {
    return { ok: false, error: "GitHub Raw の URL のみプレビューできます。" };
  }

  const response = await fetch(url);
  if (!response.ok) {
    return { ok: false, error: `HTML を取得できませんでした (${response.status})。公開リポジトリの HTML ファイルのみ対応しています。` };
  }
  return { ok: true, html: await response.text(), sourceUrl: url.href };
}
