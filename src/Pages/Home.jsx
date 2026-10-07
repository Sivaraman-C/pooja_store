import React from "react";
import Hero from "../Components/Hero/Hero";
import Banner from "../Components/Banner/Banner";
// import Benefits from "../Components/Benefits/Benefits";
import Category from "../Components/Category/Category";
import Featured from "../Components/Featured/Featured";
import ExtraCategories from "../Components/Category/ExtraCategories";
import PoojaGuide from "../Components/PoojaGuide/PoojaGuide";

const Home = () => {
  return (
    <div>
      <Hero />
      <Banner />
      {/* <Benefits /> */}
      <Category />
      <Featured />
      <ExtraCategories />
      <PoojaGuide />
    </div>
  );
};

export default Home;