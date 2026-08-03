const status = document.getElementById("status");
const frame = document.getElementById("preview");
const sourceLink = document.getElementById("source-link");
const rawUrl = new URLSearchParams(location.search).get("url");
const previewId = new URLSearchParams(location.search).get("id");

async function showPreview() {
  if (!rawUrl && !previewId) return showError("プレビュー対象が指定されていません。");
  const result = previewId
    ? await chrome.runtime.sendMessage({ type: "get-page-preview", id: previewId })
    : await chrome.runtime.sendMessage({ type: "fetch-preview", url: rawUrl });
  if (!result?.ok) return showError(result?.error || "HTML の読み込みに失敗しました。");
  sourceLink.href = result.sourceUrl?.includes("github.com/") ? result.sourceUrl : githubUrlFromRaw(rawUrl);

  // base を付け、相対 CSS・画像などを同じコミット／ブランチ上で解決する。
  const base = `<base href="${escapeAttribute(baseUrlFor(result.sourceUrl, rawUrl))}">`;
  frame.srcdoc = result.html.replace(/<head(\s[^>]*)?>/i, (tag) => `${tag}${base}`);
  if (!/<head[\s>]/i.test(result.html)) frame.srcdoc = `${base}${result.html}`;
  status.hidden = true;
  frame.style.display = "block";
}

function baseUrlFor(sourceUrl, fallbackRawUrl) {
  if (sourceUrl?.includes("/blob/")) {
    const [owner, repository, _blob, ref, ...path] = new URL(sourceUrl).pathname.split("/").filter(Boolean);
    return `https://raw.githubusercontent.com/${owner}/${repository}/${encodeURIComponent(ref)}/${path.slice(0, -1).map(encodeURIComponent).join("/")}/`;
  }
  return new URL(".", fallbackRawUrl || sourceUrl).href;
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function githubUrlFromRaw(value) {
  const parts = new URL(value).pathname.split("/").filter(Boolean);
  const [owner, repository, ref, ...path] = parts;
  return `https://github.com/${owner}/${repository}/blob/${encodeURIComponent(ref)}/${path.map(encodeURIComponent).join("/")}`;
}

function showError(message) {
  status.textContent = message;
  status.className = "error";
}

showPreview();
