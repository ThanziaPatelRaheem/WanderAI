import { useEffect, useRef, useState } from "react";
import ItineraryResult from "../ItineraryResult/ItineraryResult";
import "./TravelForm.css";

const TravelForm = () => {
  const [formData, setFormData] = useState({
    destination: "",
    days: "",
    budget: "",
    travelStyle: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState("");
  const [error, setError] = useState("");
  const itineraryRef = useRef(null);

  useEffect(() => {
    if (itinerary && isLoading) {
      itineraryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [itinerary, isLoading]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  async function handelSubmit(e) {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      setItinerary("");
      const res = await fetch(
        "http://localhost:8080/api/itineraries/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to generate itinerary");
      }

      if (!res.body) {
        throw new Error("Streaming is not supported in this browser");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, {
          stream: true,
        });

        setItinerary((prev) => prev + chunk);
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Failed to generate itinerary");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <section className="travel-form-section">
        <div className="container">
          <div className="travel-form-card">
            <form className="travel-form" onSubmit={handelSubmit}>
              <div className="travel-form__grid">
                <div className="form-group">
                  <label htmlFor="destination">Destination</label>

                  <input
                    id="destination"
                    type="text"
                    placeholder="e.g. Kyoto, Japan"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="days">Number of days</label>

                  <input
                    id="days"
                    type="number"
                    placeholder="e.g. 5"
                    name="days"
                    value={formData.days}
                    onChange={handleChange}
                    min="1"
                    max="30"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Budget</label>

                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select your budget
                    </option>
                    <option value="budget">Budget-friendly</option>
                    <option value="moderate">Moderate</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="travelStyle">Travel style</label>

                  <select
                    id="travelStyle"
                    name="travelStyle"
                    value={formData.travelStyle}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select your travel style
                    </option>
                    <option value="relaxed">Relaxed</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="family">Family</option>
                    <option value="romantic">Romantic</option>
                    <option value="food-focused">Food-focused</option>
                    <option value="kids">Kids</option>
                    <option value="religious">Religious</option>
                  </select>
                </div>
              </div>

              <button
                className="travel-form__submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Creating your itinerary..."
                  : "Generate my itinerary"}
              </button>
            </form>

            {error && (
              <p className="travel-form__error" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="itinerary-section">
        <div ref={itineraryRef} className="content-container">
          {isLoading && (
            <p className="itinerary-section__loading">
              Creating your personalized itinerary...
            </p>
          )}

          <ItineraryResult itinerary={itinerary} tripDetails={formData} />
        </div>
      </section>
    </>
  );
};

export default TravelForm;
