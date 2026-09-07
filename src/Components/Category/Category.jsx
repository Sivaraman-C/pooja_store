import React from "react";
import "./Category.css";

import Idols from "../Assets/idols.jpeg";
import Diyas from "../Assets/diyas.jpeg";
import Incense from "../Assets/incense.jpeg";
import Essentials from "../Assets/Essentials.jpeg";

const Category = () => {
  return (
    <section className="category-section">

      <div className="category-header">
        <div>
          <p className="category-subtitle">SHOP BY CATEGORY</p>

          <h2>
            Everything sacred, in one
            <br />
            place.
          </h2>
        </div>

        <a href="/Shop" className="see-all">
          See all <span>→</span>
        </a>
      </div>

      <div className="category-grid">

        <a
          href="/shop?category=Idols%20%26%20Murtis"
          className="category-card"
        >
          <img src={Idols} alt="Idols and Murtis" />

          <div className="category-overlay"></div>

          <div className="category-content">
            <h3>Idols &amp; Murtis</h3>
            <span>DISCOVER →</span>
          </div>
        </a>

        {/* Diyas */}
        <a
          href="/shop?category=Diyas%20%26%20Lamps"
          className="category-card"
        >
          <img src={Diyas} alt="Diyas and Lamps" />

          <div className="category-overlay"></div>

          <div className="category-content">
            <h3>Diyas &amp; Lamps</h3>
            <span>DISCOVER →</span>
          </div>
        </a>

        {/* Incense */}
        <a
          href="/shop?category=Incense"
          className="category-card"
        >
          <img src={Incense} alt="Incense" />

          <div className="category-overlay"></div>

          <div className="category-content">
            <h3>Incense</h3>
            <span>DISCOVER →</span>
          </div>
        </a>

        {/* Essentials */}
        <a
          href="/shop?category=Essentials"
          className="category-card"
        >
          <img src={Essentials} alt="Essentials" />

          <div className="category-overlay"></div>

          <div className="category-content">
            <h3>Essentials</h3>
            <span>DISCOVER →</span>
          </div>
        </a>

      </div>

    </section>
  );
};

export default Category;