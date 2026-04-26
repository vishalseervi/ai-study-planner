const STORAGE_VERSION = 1;

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return fallback;
  }
}

export function getChatStorageKey(user, suffix) {
  const userId = user?._id || user?.email || "guest";
  return `ai-chat:${suffix}:${userId}`;
}

export function loadChatSnapshot(user) {
  const historyKey = getChatStorageKey(user, "history");
  const modeKey = getChatStorageKey(user, "mode");
  const historyPayload = safeParse(localStorage.getItem(historyKey), null);
  const mode = localStorage.getItem(modeKey) || "stream-ai";

  if (!historyPayload || historyPayload.version !== STORAGE_VERSION) {
    return { mode, messages: null };
  }

  const messages = Array.isArray(historyPayload.messages) ? historyPayload.messages : null;
  return { mode, messages };
}

export function saveChatHistory(user, messages) {
  const historyKey = getChatStorageKey(user, "history");
  const payload = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    messages,
  };
  localStorage.setItem(historyKey, JSON.stringify(payload));
}

export function saveChatMode(user, mode) {
  const modeKey = getChatStorageKey(user, "mode");
  localStorage.setItem(modeKey, mode);
}
