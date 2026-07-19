import React, { useEffect, useState } from "react";
import { heroImages } from "./heroImages";
import { Link } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIndex = (prev + 1) % heroImages.length;

        if (nextIndex >= heroImages.length) {
          return 0;
        }
        return nextIndex;
      });
    }, 9000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero__backgrounds" aria-hidden="true">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`hero__background ${
              index === currentImageIndex ? "hero__background--active" : ""
            }`}
            style={{
              backgroundImage: `url(${image})`,
            }}
          />
        ))}
      </div>
      <div className="hero__overlay" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__content">
          <h1 className="hero__title">
            Plan your trip with <span className="hero__title-accent">AI</span>
          </h1>

          <p className="hero__description">
            Create a personalized day-by-day itinerary in seconds.
          </p>
          <p className="hero__subtext">
            Choose your destination, travel style and budget. We'll craft your
            perfect itinerary.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
