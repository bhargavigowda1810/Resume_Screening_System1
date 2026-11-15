
import { useState } from "react";
import { api } from "../services/api";
import "./AIChatbot.css";

const APPLICANT_SUGGESTIONS = [
  "What are the best jobs for me?",
  "Show me available jobs",
  "How can I improve my resume?",
  "How do I track my applications?",
  "How do I use this platform?",
];

const RECRUITER_SUGGESTIONS = [
  "How can I shortlist the best candidates?",
  "How do I analyse candidate resumes?",
  "How can I compare candidates using AI scores?",
  "How do I manage my job postings?",
  "How do I review applications?",
];



function AIChatbot({ role = "APPLICANT" }) {
  const isRecruiter = role === "RECRUITER";

  const SUGGESTIONS = isRecruiter
    ? RECRUITER_SUGGESTIONS
    : APPLICANT_SUGGESTIONS;

  const welcomeMessage = isRecruiter
    ? "Hi! 👋 I'm your AI Recruiting Assistant. I can help you understand candidate profiles, shortlist applicants, analyse resumes, and manage recruitment. What would you like help with?"
    : "Hi! 👋 I'm your AI Career Assistant. I can help you find jobs, improve your resume, track your applications, and navigate the platform. What would you like help with?";

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: welcomeMessage,
    },
  ]);
const sendMessage = async (text = message) => {
  const trimmedMessage = text.trim();

  if (!trimmedMessage || isLoading) return;

  setMessages((previous) => [
    ...previous,
    { role: "user", text: trimmedMessage },
  ]);

  setMessage("");
  setIsLoading(true);

  try {
    const data = await api.post("/assistant/chat", {
      message: trimmedMessage,
    });

    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        text: data.reply,
      },
    ]);
  } catch (error) {
    console.error("Chatbot error:", error);

    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        text:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Sorry, I couldn't connect to the AI service. Please try again.",
      },
    ]);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="ai-chat-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Career Assistant"
          title="AI Career Assistant"
        >
          <span className="ai-chat-launcher-icon">✦</span>
          <span>Ask AI</span>
        </button>
      )}

      {isOpen && (
        <section className="ai-chat-window" aria-label="AI Career Assistant">
          <header className="ai-chat-header">
            <div className="ai-chat-heading">
              <div className="ai-chat-avatar">✦</div>
              <div>
                <strong>
  {isRecruiter ? "AI Recruiting Assistant" : "AI Career Assistant"}
</strong>

<span>
  {isRecruiter
    ? "Your recruitment assistant"
    : "Your personal career guide"}
</span>
              </div>
            </div>

            <button
              type="button"
              className="ai-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="ai-chat-messages" aria-live="polite">
            {messages.map((item, index) => (
              <div
                key={`${index}-${item.role}`}
                className={`ai-chat-message ${item.role}`}
              >
                {item.text}
              </div>
            ))}

            {isLoading && (
              <div className="ai-chat-message assistant">
                Thinking...
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="ai-chat-suggestions">
              <p>Try asking</p>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isLoading}
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            className="ai-chat-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask me anything..."
              aria-label="Your message"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}

export default AIChatbot;
