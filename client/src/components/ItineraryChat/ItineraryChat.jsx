import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./ItineraryChat.css";

const ItineraryChat = ({ itineraryId }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    const currentQuestion = question;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentQuestion,
      },
    ]);

    setQuestion("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/api/query/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          itineraryId,
          messages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  return (
    <section className="travel-chat">
      <div className="travel-chat-header">
        <div>
          <span className="travel-chat-label">WanderAI Assistant</span>
          <h3>Ask about your trip</h3>
          <p>
            Ask about transport, places, costs, food or anything related to your
            itinerary.
          </p>
        </div>
      </div>

      <div className="travel-chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <p>
              Try asking: <strong>“Which transport pass should I use?”</strong>
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              className={`chat-message-row ${
                isUser ? "chat-message-user" : "chat-message-assistant"
              }`}
            >
              {!isUser && <div className="assistant-avatar">AI</div>}

              <div
                className={`chat-bubble ${
                  isUser ? "user-bubble" : "assistant-bubble"
                }`}
              >
                {isUser ? (
                  <p>{message.content}</p>
                ) : (
                  <div
                    className="assistant-content"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(marked.parse(message.content)),
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="chat-message-row chat-message-assistant">
            <div className="assistant-avatar">AI</div>

            <div className="chat-bubble assistant-bubble thinking-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && <p className="chat-error">{error}</p>}

      <form className="travel-chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask something about your trip..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading || !question.trim()}>
          Ask
        </button>
      </form>
    </section>
  );
};

export default ItineraryChat;
