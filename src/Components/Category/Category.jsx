import React from "react";
import "./Category.css";
import { Link } from "react-router-dom";

import Idols from "../Assets/idols.jpeg";
import Diyas from "../Assets/diyas.jpeg";
import Incense from "../Assets/incense.jpeg";
import Kumkum from "../Assets/kumkum.jpg";
import Haldi from "../Assets/Haldi.jpg";

const Category = () => {
  return (
    <section className="category-section">
      <div className="category-top-info">
        <p>Discover everything you need for your daily pooja rituals</p>
        <div className="category-info-header">
          <h2>Shop by Category</h2>
        </div>
      </div>

      <div className="category-grid-container">

        {/* 1. LARGE LEFT CARD */}
        <Link to="/idols" className="cat-box box-large">
           <div className="cat-image-layer">
              <img src={Idols} alt="Idols" />
           </div>
           <span className="cat-title">Divine Idols</span>
        </Link>

        {/* 2. MIDDLE COLUMN */}
        <div className="cat-middle-col">
           {/* Top Medium Card */}
           <Link to="/diyas" className="cat-box box-medium">
              <div className="cat-image-layer">
                 <img src={Diyas} alt="Diyas" />
              </div>
              <span className="cat-title">Traditional Diyas</span>
           </Link>

           {/* Bottom two small cards */}
           <div className="cat-bottom-row">
              <Link to="/shop?category=Essentials" className="cat-box box-small">
                 <div className="cat-image-layer">
                    <img src={Kumkum} alt="Kumkum" />
                 </div>
                 <span className="cat-title-small">Pooja Essentials</span>
              </Link>
              <Link to="/shop?category=Essentials" className="cat-box box-small">
                 <div className="cat-image-layer">
                    <img src={Haldi} alt="Haldi" />
                 </div>
                 <span className="cat-title-small">Pure Haldi</span>
              </Link>
           </div>
        </div>

        {/* 3. TALL RIGHT CARD */}
        <Link to="incense" className="cat-box box-tall">
           <div className="cat-image-layer">
              <img src={Incense} alt="Incense" />
           </div>
           <span className="cat-title">Sacred Incense & Dhoop</span>
        </Link>

      </div>
    </section>
  );
};

export default Category;
