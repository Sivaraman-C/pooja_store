import React from "react";
// import Benefits from "../Components/Benefits/Benefits";
import Category from "../Components/Category/Category";
import Featured from "../Components/Featured/Featured";
import RelatedContent from "../Components/RelatedContent/RelatedContent";

const Home = () => {
  return (
    <div>
      {/* <Benefits /> */}
      <Category />
      <Featured />
      <RelatedContent />
    </div>
  );
};

export default Home;