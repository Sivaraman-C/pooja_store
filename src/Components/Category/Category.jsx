import React from "react";
import "./Category.css";
import { Link } from "react-router-dom";

import Idols from "../Assets/idols.jpeg";
import Diyas from "../Assets/diyas.jpeg";
import Incense from "../Assets/incense.jpeg";

const Category = () => {
  const categories = [
    {
      name: "Handcrafted Idols & Murthis",
      img: Idols,
      link: "/shop?category=Idols%20%26%20Murtis",
      desc: "Bring divinity home"
    },
    {
      name: "Traditional Diyas & Lamps",
      img: Diyas,
      link: "/shop?category=Diyas%20%26%20Lamps",
      desc: "Light up your sacred space"
    },
    {
      name: "Sacred Incense & Dhoop",
      img: Incense,
      link: "/shop?category=Incense",
      desc: "Pure fragrance of faith"
    },
  ];

  return (
    <section className="category-section">
      <div className="category-container">
        {/* Large Left Card */}
        <Link to={categories[0].link} className="cat-card large-card">
          <div className="cat-info">
            <h3>{categories[0].name}</h3>
            <span className="shop-now-link">Shop now</span>
          </div>
          <div className="cat-img-box">
            <img src={categories[0].img} alt={categories[0].name} />
          </div>
          <div className="cat-footer-text">
            <span>Sacred Collection</span>
          </div>
        </Link>

        {/* Right Side Stack */}
        <div className="cat-right-stack">
          {/* Small Top Card */}
          <Link to={categories[1].link} className="cat-card small-card">
            <div className="cat-info">
              <h3>{categories[1].name}</h3>
              <span className="shop-now-link">Shop now</span>
            </div>
            <div className="cat-img-box">
              <img src={categories[1].img} alt={categories[1].name} />
            </div>
          </Link>

          {/* Small Bottom Card */}
          <Link to={categories[2].link} className="cat-card small-card">
            <div className="cat-info">
              <h3>{categories[2].name}</h3>
              <span className="shop-now-link">Shop now</span>
            </div>
            <div className="cat-img-box">
              <img src={categories[2].img} alt={categories[2].name} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Category;
