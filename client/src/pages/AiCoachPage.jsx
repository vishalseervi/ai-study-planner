import { useMemo, useState } from "react";
import { useChat } from "../context/ChatContext";

function AiCoachPage() {
  const { messages, mode, setMode, isStreaming, hydrated, sendMessage, resetChat } = useChat();
  const [input, setInput] = useState("");

  const quickPrompts = useMemo(
    () => [
      "Create a 7-day revision plan for DBMS and Java.",
      "I am weak in DSA. How should I improve in 2 weeks?",
      "Give me a focused plan for this weekend before internal exams.",
      "How can I balance attendance, assignments, and coding practice?",
    ],
    []
  );

  async function ask(e) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
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
          <button type="button" className="btn ghost" onClick={resetChat}>
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
          {!hydrated && <div className="typing">Restoring previous conversation...</div>}
          {messages.map((msg) => (
            <div key={msg.id || `${msg.role}-${msg.createdAt || msg.text}`} className={`msg ${msg.role}`}>
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

