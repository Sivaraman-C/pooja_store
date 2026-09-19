import React from "react";
import "./ExtraCategories.css";
import { Link } from "react-router-dom";

import Essentials from "../Assets/Essentials.jpeg";
import Kumkum from "../Assets/kumkum.jpg";
import Kits from "../Assets/pooja-kit.png";

const ExtraCategories = () => {
  const categories = [
    {
      name: "Flowers & Garlands",
      img: Essentials,
      link: "/shop?category=Essentials",
      desc: "Freshness & purity"
    },
    {
      name: "Camphor & Agarbatti",
      img: Kumkum,
      link: "/shop?category=Kumkum%20%26%20Turmeric",
      desc: "For positive energy"
    },
    {
      name: "Complete Pooja Kits",
      img: Kits,
      link: "/shop?category=Pooja%20Kits",
      desc: "Everything in one box"
    },
  ];

  return (
    <section className="extra-cat-section">
      <div className="extra-cat-container">
        {categories.map((cat, i) => (
          <Link key={i} to={cat.link} className="extra-cat-card">
            <div className="extra-cat-img">
              <img src={cat.img} alt={cat.name} />
            </div>
            <div className="extra-cat-info">
              <h4>{cat.name}</h4>
              <p>{cat.desc}</p>
              <span className="extra-cat-link">Explore Now →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ExtraCategories;
