import DOMPurify from "dompurify";
import { marked } from "marked";
import { LuMapPin, LuCalendarDays, LuWallet, LuCompass } from "react-icons/lu";
import "./ItineraryResult.css";

const IteneraryResult = ({
  itinerary,
  tripDetails,
  onAskAI,
  onNewTrip,
  showChatButton,
}) => {
  const { destination, days, budget, travelStyle } = tripDetails;
  if (!itinerary) return null;

  const html = marked.parse(itinerary);
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_ATTR: ["target"],
  });

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = sanitizedHtml;

  tempDiv.querySelectorAll("a").forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  const finalHtml = tempDiv.innerHTML;
  return (
    <section className="itinerary-result">
      <div className="content-container">
        <article className="itinerary-card">
          <header className="itinerary-header">
            <span className="itinerary-badge">AI Generated</span>

            <h2>Your Personalized Itinerary</h2>

            <p>Here's your travel plan crafted by WanderAI.</p>

            <button type="button" className="ask-ai-button" onClick={onAskAI}>
              Ask WanderAI about your trip ↓
            </button>

            <div className="itinerary-summary">
              <div className="summary-item">
                <LuMapPin className="summary-icon" />
                <span>{destination}</span>
              </div>

              <div className="summary-item">
                <LuCalendarDays className="summary-icon" />
                <span>
                  {days} {Number(days) === 1 ? "Day" : "Days"}
                </span>
              </div>

              <div className="summary-item">
                <LuWallet className="summary-icon" />
                <span>{budget}</span>
              </div>

              <div className="summary-item">
                <LuCompass className="summary-icon" />
                <span>{travelStyle}</span>
              </div>
            </div>
          </header>

          <div
            className="itinerary-content"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />

          {showChatButton && (
            <div className="itinerary-chat-cta">
              <p>Have questions about your itinerary?</p>

              <div className="itinerary-cta-actions">
                <button
                  type="button"
                  className="ask-ai-button"
                  onClick={onAskAI}
                >
                  Chat with WanderAI ↓
                </button>

                <button
                  type="button"
                  className="new-trip-btn"
                  onClick={onNewTrip}
                >
                  Plan Another Trip
                </button>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

export default IteneraryResult;
