import React from "react";
import Hero from "../Components/Hero/Hero";
import Category from "../Components/Category/Category";
import ExtraCategories from "../Components/Category/ExtraCategories";
import PoojaGuide from "../Components/PoojaGuide/PoojaGuide";
import HomeProducts from "../Components/HomeProducts/HomeProducts";

const Home = () => {
  return (
    <div>
      <Hero />
      <Category />
      <ExtraCategories />
      <PoojaGuide />
      <HomeProducts />
    </div>
  );
};

export default Home;