import React, { useState } from "react";
import "./Category.css";

import Idols from "../Assets/idols.jpeg";
import Diyas from "../Assets/diyas.jpeg";
import Incense from "../Assets/incense.jpeg";
import Essentials from "../Assets/Essentials.jpeg";
import Kumkum from "../Assets/kumkum.jpg";
import Kits from "../Assets/pooja-kit.png";

const Category = () => {
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { name: "Idols & Murtis", img: Idols, link: "/shop?category=Idols%20%26%20Murtis" },
    { name: "Diyas & Lamps", img: Diyas, link: "/shop?category=Diyas%20%26%20Lamps" },
    { name: "Incense", img: Incense, link: "/shop?category=Incense" },
    { name: "Essentials", img: Essentials, link: "/shop?category=Essentials" },
    { name: "Kumkum", img: Kumkum, link: "/shop?category=Kumkum%20%26%20Turmeric" },
    { name: "Pooja Kits", img: Kits, link: "/shop?category=Pooja%20Kits" },
  ];

  const displayedCategories = showAll ? categories : categories.slice(0, 4);

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

        <a href="/Shop" className="see-all desktop-only">
          See all <span>→</span>
        </a>
      </div>

      <div className="category-grid">
        {displayedCategories.map((cat, index) => (
          <a key={index} href={cat.link} className="category-card">
            <img src={cat.img} alt={cat.name} />
            <div className="category-overlay"></div>
            <div className="category-content">
              <h3>{cat.name}</h3>
              <span>DISCOVER →</span>
            </div>
          </a>
        ))}
      </div>

      {categories.length > 4 && (
        <div className="category-know-more mobile-only">
          <button className="know-more-btn" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Know Less ↵" : "Know More ➔"}
          </button>
        </div>
      )}

    </section>
  );
};

export default Category;
