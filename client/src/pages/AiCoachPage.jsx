import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const DEFAULT_MESSAGES = [
  {
    role: "assistant",
    text: "Ask for performance-backed advice based on your tracked data.",
  },
];

function AiCoachPage() {
  const { user } = useAuth();
  const storageKey = useMemo(
    () => `ai-chat-history:${user?._id || user?.email || "guest"}`,
    [user]
  );
  const modeStorageKey = useMemo(
    () => `ai-chat-mode:${user?._id || user?.email || "guest"}`,
    [user]
  );
  const [input, setInput] = useState("");
  const [mode, setMode] = useState(() => localStorage.getItem(modeStorageKey) || "stream-ai");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);

  const quickPrompts = useMemo(
    () => [
      "Create a 7-day revision plan for DBMS and Java.",
      "I am weak in DSA. How should I improve in 2 weeks?",
      "Give me a focused plan for this weekend before internal exams.",
      "How can I balance attendance, assignments, and coding practice?",
    ],
    []
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch (_error) {
      setMessages(DEFAULT_MESSAGES);
    }
  }, [storageKey]);

  useEffect(() => {
    setMode(localStorage.getItem(modeStorageKey) || "stream-ai");
  }, [modeStorageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    localStorage.setItem(modeStorageKey, mode);
  }, [mode, modeStorageKey]);

  useEffect(() => {
    async function syncFromRecentJobs() {
      try {
        const res = await api.get("/ai/jobs/recent", { params: { limit: 30 } });
        const jobs = res.data?.jobs || [];
        if (!Array.isArray(jobs) || jobs.length === 0) return;

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
              };
            }
            if (matchingJob.status === "failed") {
              return {
                ...msg,
                jobId: matchingJob.id,
                status: "failed",
                text: matchingJob.error || "AI response failed",
              };
            }
            return { ...msg, jobId: matchingJob.id, status: matchingJob.status };
          })
        );
      } catch (_error) {
        // Silent fallback; local history still works even if sync fails.
      }
    }

    syncFromRecentJobs();
  }, []);

  useEffect(() => {
    const pending = messages.filter(
      (msg) =>
        msg.role === "assistant" &&
        msg.jobId &&
        (msg.status === "queued" || msg.status === "processing")
    );
    setIsStreaming(pending.length > 0);
    if (pending.length === 0) return undefined;

    const timer = setInterval(async () => {
      try {
        const ids = pending.map((msg) => msg.jobId).join(",");
        const res = await api.get("/ai/jobs/status", { params: { ids } });
        const jobs = res.data?.jobs || [];

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.role !== "assistant" || !msg.jobId) return msg;
            const job = jobs.find((item) => String(item.id) === String(msg.jobId));
            if (!job) return msg;

            if (job.status === "completed") {
              return { ...msg, status: "completed", text: job.reply || msg.text };
            }
            if (job.status === "failed") {
              return { ...msg, status: "failed", text: job.error || "AI response failed" };
            }
            return { ...msg, status: job.status };
          })
        );
      } catch (_error) {
        // Keep polling in next interval.
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [messages]);

  async function ask(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    if (mode === "data-coach") {
      try {
        const res = await api.post("/coach/chat", { message: msg });
        setMessages((prev) => [...prev, { role: "assistant", text: res.data.reply }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: error?.response?.data?.message || "AI call failed" },
        ]);
      }
      return;
    }
    const clientRequestId =
      globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const pendingAssistant = {
      id: `assistant-${clientRequestId}`,
      role: "assistant",
      text: "",
      status: "queued",
      jobId: "",
      clientRequestId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, pendingAssistant]);
    try {
      const res = await api.post("/ai/jobs", { message: msg, clientRequestId });
      const job = res.data?.job;
      setMessages((prev) =>
        prev.map((item) =>
          item.clientRequestId === clientRequestId
            ? { ...item, jobId: job?.id || "", status: job?.status || "processing" }
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
              }
            : item
        )
      );
    }
  }

  function clearChat() {
    const resetMessages = [
      {
        role: "assistant",
        text: "Chat reset. Ask anything about your studies and planning.",
      },
    ];
    setMessages(resetMessages);
    localStorage.setItem(storageKey, JSON.stringify(resetMessages));
  }

  return (
    <div className="page">
      <div className="hero">
        <h1>AI Study Assistant</h1>
        <p>
          Ask for revision strategies, weekly plans, and subject-wise improvements. Use streaming
          mode for natural responses or switch to data coach for performance-backed guidance.
        </p>
      </div>
      <section className="card">
        <div className="row gap-sm coach-toolbar">
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="stream-ai">AI Chat (background response mode)</option>
            <option value="data-coach">Data Coach (performance-backed)</option>
          </select>
          <button type="button" className="btn ghost" onClick={clearChat}>
            Clear chat
          </button>
        </div>
        <div className="quick-prompts">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="prompt-chip"
              onClick={() => setInput(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`msg ${msg.role}`}>
              {msg.text || (msg.role === "assistant" && msg.status !== "completed" ? "..." : "")}
            </div>
          ))}
          {isStreaming && <div className="typing">AI is typing...</div>}
        </div>
        <form className="row" onSubmit={ask}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your study coach..."
          />
          <button className="btn" type="submit" disabled={isStreaming}>
            {isStreaming ? "Streaming..." : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AiCoachPage;

