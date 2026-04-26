import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";
import { loadChatSnapshot, saveChatHistory, saveChatMode } from "../services/chatSessionStorage";

const ChatContext = createContext(null);

const DEFAULT_MESSAGES = [
  {
    id: "assistant-default",
    role: "assistant",
    text: "Ask for performance-backed advice based on your tracked data.",
    status: "completed",
    createdAt: new Date(0).toISOString(),
  },
];

function nowIso() {
  return new Date().toISOString();
}

function normalizeMessages(messages) {
  return [...messages]
    .map((msg, index) => ({
      id: msg.id || `${msg.role}-${msg.clientRequestId || msg.jobId || index}`,
      status: msg.status || "completed",
      createdAt: msg.createdAt || nowIso(),
      ...msg,
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function markInterruptedPending(messages) {
  return messages.map((msg) => {
    if (msg.role !== "assistant") return msg;
    const isPending = msg.status === "queued" || msg.status === "processing";
    if (!isPending) return msg;
    if (msg.jobId) return msg;
    return {
      ...msg,
      status: "failed",
      text: msg.text || "Previous response was interrupted before it could be queued.",
    };
  });
}

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [mode, setMode] = useState("stream-ai");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const snapshot = loadChatSnapshot(user);
    const restored = snapshot.messages && snapshot.messages.length > 0 ? snapshot.messages : DEFAULT_MESSAGES;
    setMessages(markInterruptedPending(normalizeMessages(restored)));
    setMode(snapshot.mode || "stream-ai");
    setHydrated(true);
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    saveChatHistory(user, messages);
  }, [hydrated, messages, user]);

  useEffect(() => {
    if (!hydrated) return;
    saveChatMode(user, mode);
  }, [hydrated, mode, user]);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;

    async function syncFromRecentJobs() {
      try {
        const res = await api.get("/ai/jobs/recent", { params: { limit: 30 } });
        const jobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
        if (!active || jobs.length === 0) return;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.role !== "assistant") return msg;
            const matchingJob = jobs.find(
              (job) =>
                (msg.jobId && String(job.id) === String(msg.jobId)) ||
                (msg.clientRequestId && msg.clientRequestId === job.clientRequestId)
            );
            if (!matchingJob) return msg;
            if (matchingJob.status === "completed") {
              return {
                ...msg,
                jobId: matchingJob.id,
                status: "completed",
                text: matchingJob.reply || msg.text,
                updatedAt: matchingJob.updatedAt,
              };
            }
            if (matchingJob.status === "failed") {
              return {
                ...msg,
                jobId: matchingJob.id,
                status: "failed",
                text: matchingJob.error || "AI response failed",
                updatedAt: matchingJob.updatedAt,
              };
            }
            return {
              ...msg,
              jobId: matchingJob.id,
              status: matchingJob.status,
              updatedAt: matchingJob.updatedAt,
            };
          })
        );
      } catch (_error) {
        // Silent fallback to local state.
      }
    }

    syncFromRecentJobs();
    return () => {
      active = false;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const pendingWithJobs = messages.filter(
      (msg) =>
        msg.role === "assistant" &&
        msg.jobId &&
        (msg.status === "queued" || msg.status === "processing")
    );
    if (pendingWithJobs.length === 0) return undefined;

    const timer = setInterval(async () => {
      try {
        const ids = pendingWithJobs.map((msg) => msg.jobId).join(",");
        const res = await api.get("/ai/jobs/status", { params: { ids } });
        const jobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.role !== "assistant" || !msg.jobId) return msg;
            const job = jobs.find((item) => String(item.id) === String(msg.jobId));
            if (!job) return msg;
            if (job.status === "completed") {
              return {
                ...msg,
                status: "completed",
                text: job.reply || msg.text,
                updatedAt: job.updatedAt,
              };
            }
            if (job.status === "failed") {
              return {
                ...msg,
                status: "failed",
                text: job.error || "AI response failed",
                updatedAt: job.updatedAt,
              };
            }
            return { ...msg, status: job.status, updatedAt: job.updatedAt };
          })
        );
      } catch (_error) {
        // Keep polling.
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [hydrated, messages]);

  async function sendMessage(rawInput) {
    const msg = String(rawInput || "").trim();
    if (!msg) return;

    const createdAt = nowIso();
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${createdAt}`,
        role: "user",
        text: msg,
        status: "completed",
        createdAt,
      },
    ]);

    if (mode === "data-coach") {
      try {
        const res = await api.post("/coach/chat", { message: msg });
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${nowIso()}`,
            role: "assistant",
            text: res.data.reply,
            status: "completed",
            createdAt: nowIso(),
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${nowIso()}`,
            role: "assistant",
            text: error?.response?.data?.message || "AI call failed",
            status: "failed",
            createdAt: nowIso(),
          },
        ]);
      }
      return;
    }

    const clientRequestId =
      globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${clientRequestId}`,
        role: "assistant",
        text: "",
        status: "queued",
        jobId: "",
        clientRequestId,
        createdAt: nowIso(),
      },
    ]);

    try {
      const res = await api.post("/ai/jobs", { message: msg, clientRequestId });
      const job = res.data?.job;
      setMessages((prev) =>
        prev.map((item) =>
          item.clientRequestId === clientRequestId
            ? {
                ...item,
                jobId: job?.id || "",
                status: job?.status || "processing",
                updatedAt: job?.createdAt || nowIso(),
              }
            : item
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((item) =>
          item.clientRequestId === clientRequestId
            ? {
                ...item,
                status: "failed",
                text: error?.response?.data?.message || "Unable to queue AI request",
                updatedAt: nowIso(),
              }
            : item
        )
      );
    }
  }

  function resetChat() {
    setMessages([
      {
        id: `assistant-reset-${Date.now()}`,
        role: "assistant",
        text: "Chat reset. Ask anything about your studies and planning.",
        status: "completed",
        createdAt: nowIso(),
      },
    ]);
  }

  const isStreaming = messages.some(
    (msg) =>
      msg.role === "assistant" && (msg.status === "queued" || msg.status === "processing")
  );

  const value = useMemo(
    () => ({
      messages,
      mode,
      setMode,
      sendMessage,
      resetChat,
      isStreaming,
      hydrated,
    }),
    [messages, mode, isStreaming, hydrated]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
