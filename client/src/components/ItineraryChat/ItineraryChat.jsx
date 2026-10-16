import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./ItineraryChat.css";

const ItineraryChat = ({ itineraryId, isReady }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesContainerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady || isLoading) return;

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
      const res = await fetch(`${API_BASE_URL}/api/query/ask`, {
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
    const container = messagesContainerRef.current;
    if (!container) return;

    if (isLoading) {
      // While generating, scroll to the loading dots
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    } else {
      // When the answer arrives, scroll to its beginning
      const messageRows = container.querySelectorAll(".chat-message-row");
      const lastMessage = messageRows[messageRows.length - 1];

      if (!lastMessage) return;

      container.scrollTo({
        top:
          lastMessage.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop -
          12,
        behavior: "smooth",
      });
    }
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

      <div className="travel-chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <p>
              Try asking: <strong>“What should I know before my trip?”</strong>
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
                      __html: DOMPurify.sanitize(
                        marked.parse(message.content),
                        {
                          ADD_ATTR: ["target"],
                        },
                      ).replace(
                        /<a\s/g,
                        '<a target="_blank" rel="noopener noreferrer" ',
                      ),
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

        <div />
      </div>

      {error && <p className="chat-error">{error}</p>}

      <form className="travel-chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={
            isReady
              ? "Ask something about your trip..."
              : "Preparing your travel assistance"
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={!isReady || isLoading}>
          {isLoading ? "Generating..." : "Ask"}
        </button>
      </form>
    </section>
  );
};

export default ItineraryChat;
