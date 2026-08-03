function isHtmlBlobPage() {
  const path = location.pathname;
  return /\/blob\/[^/]+\/.*\.html?$/i.test(path);
}

function addPreviewButton() {
  if (!isHtmlBlobPage() || document.getElementById("github-html-preview-button")) return;

  const anchor = document.querySelector("#raw-url, a[data-testid='raw-button'], a[href*='/raw/']");
  const container = anchor?.parentElement || document.querySelector("[data-testid='file-header']") || document.querySelector(".file-header") || document.body;
  if (!container) return;

  const button = document.createElement("button");
  button.id = "github-html-preview-button";
  button.type = "button";
  button.className = "btn btn-sm";
  button.textContent = "Preview HTML";
  button.title = "新しいタブで HTML をプレビュー";
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Preparing preview…";
    try {
      const html = getDisplayedHtml();
      const result = await chrome.runtime.sendMessage({ type: "open-page-preview", html, sourceUrl: location.href });
      if (!result?.ok) {
        alert(result?.error || "プレビューを準備できませんでした。");
      }
    } catch {
      alert("プレビューを準備できませんでした。");
    } finally {
      button.disabled = false;
      button.textContent = "Preview HTML";
    }
  });
  if (anchor) {
    container.insertBefore(button, anchor);
  } else {
    // GitHub の UI が変わっても、HTML ファイルなら操作不能にならないようにする。
    button.classList.add("github-html-preview-floating");
    Object.assign(button.style, {
      position: "fixed", right: "24px", bottom: "24px", zIndex: "9999",
      padding: "9px 14px", color: "#fff", background: "#1f883d",
      border: "1px solid rgba(27,31,36,.15)", borderRadius: "6px",
      boxShadow: "0 3px 8px rgba(27,31,36,.2)", cursor: "pointer"
    });
    document.body.append(button);
  }
}

function getDisplayedHtml() {
  const textarea = document.querySelector("#read-only-cursor-text-area");
  if (textarea?.value) return textarea.value;

  const modernLines = [...document.querySelectorAll(".react-code-line")];
  if (modernLines.length) return modernLines.map((line) => line.textContent).join("\n");

  const legacyLines = [...document.querySelectorAll("td.blob-code, td.js-file-line")];
  return legacyLines.map((line) => line.textContent).join("\n");
}

addPreviewButton();
new MutationObserver(addPreviewButton).observe(document.documentElement, { childList: true, subtree: true });
