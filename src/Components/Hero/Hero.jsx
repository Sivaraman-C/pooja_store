import React from "react";
import "./Hero.css";

import BannerBg from "../Assets/banner-bg.jpg";

const Hero = () => {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${BannerBg})` }}
    >
      <div className="hero-overlay">
        <div className="hero-content">
          <h3>Know The</h3>

          <h1>Real History Of Pooja</h1>

          <p className="description">
            For thousands of years, pooja has been a sacred way to connect
            with the divine through devotion, gratitude, and prayer. We bring
            authentic pooja essentials to help every home continue this
            timeless tradition. 🕉️
          </p>

          <button className="know-more-btn">
            Know More
            <span> →</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;