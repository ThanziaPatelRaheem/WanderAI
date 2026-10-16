import TravelForm from "../../components/TravelForm/TravelForm";
import Hero from "../../components/Hero/Hero";

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
