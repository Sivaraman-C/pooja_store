import React from "react";
import Hero from "../Components/Hero/Hero";
// import Benefits from "../Components/Benefits/Benefits";
import Category from "../Components/Category/Category";
import Featured from "../Components/Featured/Featured";
import RelatedContent from "../Components/RelatedContent/RelatedContent";

const Home = () => {
  return (
    <div>
      <Hero />
      {/* <Benefits /> */}
      <Category />
      <Featured />
      <RelatedContent />
    </div>
  );
};

export default Home;