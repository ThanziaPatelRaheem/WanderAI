import React from "react";
import TravelForm from "../../components/TravelForm/TravelForm";
import Hero from "../../components/Hero/Hero";
import "./Home.css";

const Home = () => {
  return (
    <main>
      <Hero />
      <section id="travel-form">
        <TravelForm />
      </section>
    </main>
  );
};

export default Home;
