// Service worker: talks to the Aura API (host_permissions => no CORS trouble) and owns the
// right-click "Remember in Aura" menu. Settings (URL + token) live in chrome.storage.sync.

async function settings() {
  const { auraUrl = "http://localhost:3100", auraToken = "" } = await chrome.storage.sync.get(["auraUrl", "auraToken"]);
  return { auraUrl: auraUrl.replace(/\/$/, ""), auraToken };
}

async function api(path, init = {}) {
  const { auraUrl, auraToken } = await settings();
  if (!auraToken) throw new Error("No Aura token set. Click the Aura icon to add one.");
  const res = await fetch(auraUrl + path, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${auraToken}`, ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`Aura ${res.status}: ${(await res.json().catch(() => ({}))).error ?? res.statusText}`);
  return res.json();
}

// Messages from content script / popup.
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  (async () => {
    if (msg.type === "search") return reply({ ok: true, memories: (await api(`/api/memories?q=${encodeURIComponent(msg.query)}`)).memories });
    if (msg.type === "list") return reply({ ok: true, memories: (await api(`/api/memories`)).memories });
    if (msg.type === "add") return reply({ ok: true, memory: (await api(`/api/memories`, { method: "POST", body: JSON.stringify({ text: msg.text, space: msg.space }) })).memory });
    reply({ ok: false, error: "unknown message" });
  })().catch((e) => reply({ ok: false, error: e.message }));
  return true; // async reply
});

// Effortless capture: select text anywhere → right-click → Remember in Aura.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "aura-remember", title: "🧠 Remember in Aura: “%s”", contexts: ["selection"] });
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "aura-remember" || !info.selectionText) return;
  const text = info.selectionText.trim().slice(0, 1000);
  try {
    await api(`/api/memories`, { method: "POST", body: JSON.stringify({ text }) });
    notify(tab?.id, `Remembered: “${text.slice(0, 60)}${text.length > 60 ? "…" : ""}”`);
  } catch (e) {
    notify(tab?.id, `Aura error: ${e.message}`);
  }
});

function notify(tabId, message) {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, { type: "toast", message }).catch(() => {});
}
