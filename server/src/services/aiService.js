const axios = require("axios");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "phi3";

async function askAiStudyCoach({ message, model }) {
  const usedModel = model || DEFAULT_MODEL;
  const prompt = `You are an AI study coach for a BCA 4th semester student.
Give concise and practical advice with bullet points when useful.
Include a suggested plan with priorities and timeline if applicable.

Student request: ${message}`;

  const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
    model: usedModel,
    prompt,
    stream: false,
  });

  return (
    response?.data?.response ||
    response?.data?.output ||
    response?.data?.message?.content ||
    "No response from model."
  );
}

module.exports = { askAiStudyCoach };

