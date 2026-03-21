import { useState } from "react";
import api from "../api/client";

function AiCoachPage() {
  const [model, setModel] = useState("mistral");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ask for schedules, priorities, or daily plans." },
  ]);

  async function ask(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    try {
      const res = await api.post("/ai/chat", { message: msg, model });
      setMessages((prev) => [...prev, { role: "assistant", text: res.data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: error?.response?.data?.message || "AI call failed" },
      ]);
    }
  }

  async function autoPlan() {
    try {
      const res = await api.get("/ai/plan");
      setMessages((prev) => [...prev, { role: "assistant", text: res.data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: error?.response?.data?.message || "Could not generate plan" },
      ]);
    }
  }

  return (
    <div className="page">
      <h1>AI Coach</h1>
      <section className="card">
        <div className="row between">
          <div className="row">
            <small>Model</small>
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <button className="btn ghost" onClick={autoPlan}>Generate daily plan</button>
        </div>
        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`msg ${msg.role}`}>{msg.text}</div>
          ))}
        </div>
        <form className="row" onSubmit={ask}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your study coach..." />
          <button className="btn" type="submit">Send</button>
        </form>
      </section>
    </div>
  );
}

export default AiCoachPage;

