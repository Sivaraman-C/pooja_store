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
      <div className="category-grid-container">

        {/* 1. LARGE LEFT CARD */}
        <Link to="/idols" className="cat-box box-large">
           <div className="cat-image-layer">
              <img src={Idols} alt="Idols" />
           </div>
           <div className="cat-text-layer">
              <span className="cat-promo">Blessed Collections</span>
              <h2 className="cat-title">Divine Murtis & Handcrafted Idols</h2>
              <button className="cat-pill-btn">Shop now</button>
           </div>
           <div className="cat-badge-oval">New Arrivals</div>
        </Link>

        {/* 2. MIDDLE COLUMN */}
        <div className="cat-middle-col">
           {/* Top Medium Card */}
           <Link to="/shop?category=Diyas%20%26%20Lamps" className="cat-box box-medium">
              <div className="cat-image-layer">
                 <img src={Diyas} alt="Diyas" />
              </div>
              <div className="cat-text-layer">
                 <span className="cat-promo">Decor & more</span>
                 <h2 className="cat-title">Traditional Diyas</h2>
                 <span className="cat-link-text">Shop now</span>
              </div>
           </Link>

           {/* Bottom two small cards */}
           <div className="cat-bottom-row">
              <Link to="/shop?category=Essentials" className="cat-box box-small">
                 <div className="cat-image-layer">
                    <img src={Kumkum} alt="Kumkum" />
                 </div>
                 <div className="cat-text-layer">
                    <h3 className="cat-title-small">Pooja Essentials</h3>
                    <span className="cat-link-text">Shop now</span>
                 </div>
              </Link>
              <Link to="/shop?category=Essentials" className="cat-box box-small">
                 <div className="cat-image-layer">
                    <img src={Haldi} alt="Haldi" />
                 </div>
                 <div className="cat-text-layer">
                    <h3 className="cat-title-small">Pure Haldi</h3>
                    <span className="cat-link-text">Shop now</span>
                 </div>
              </Link>
           </div>
        </div>

        {/* 3. TALL RIGHT CARD */}
        <Link to="/shop?category=Incense" className="cat-box box-tall">
           <div className="cat-image-layer">
              <img src={Incense} alt="Incense" />
           </div>
           <div className="cat-text-layer">
              <span className="cat-promo">Classic Fragrance</span>
              <h2 className="cat-title">Sacred Incense & Dhoop</h2>
              <span className="cat-link-text">Shop now</span>
           </div>
        </Link>

      </div>
    </section>
  );
};

export default Category;
