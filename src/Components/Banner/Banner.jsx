import React, { useState, useEffect } from "react";
import "./Banner.css";
import { Link } from "react-router-dom";

import Banner1 from "../../assets/Banner_1.png";
import Banner2 from "../../assets/Banner_2.png";
import Banner3 from "../../assets/banner.png";

const banners = [
  {
    id: 1,
    image: Banner1,
    eyebrow: "Pooja Special",
    title: "Save up to 40% on Premium Brass Items",
    btnText: "Shop Brass Collection",
    link: "/shop?category=Diyas%20%26%20Lamps",
    bgColor: "#4d00d1"
  },
  {
    id: 2,
    image: Banner2,
    eyebrow: "Exclusive Offer",
    title: "Divine Deals on Complete Pooja Kits",
    btnText: "View Pooja Kits",
    link: "/shop?category=Pooja%20Kits",
    bgColor: "#0071ce"
  },
  {
    id: 3,
    image: Banner3,
    eyebrow: "Sacred Collection",
    title: "Handcrafted Idols for Your Home Temple",
    btnText: "Explore Idols",
    link: "/shop?category=Idols%20%26%20Murtis",
    bgColor: "#76361A"
  }
];

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => setCurrent(current === banners.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? banners.length - 1 : current - 1);

  return (
    <div className="banner-carousel-container">
      <div className="banner-carousel" style={{ backgroundColor: banners[current].bgColor }}>
        <div className="banner-slider" style={{ transform: `translateX(-${current * 100}%)` }}>
          {banners.map((b) => (
            <div key={b.id} className="banner-slide">
              <div className="banner-content-wrapper">
                <div className="banner-text-content">
                  <span className="banner-eyebrow">{b.eyebrow}</span>
                  <h2 className="banner-title">{b.title}</h2>
                  <Link to={b.link} className="banner-pill-btn">
                    {b.btnText}
                  </Link>
                </div>
                <div className="banner-image-content">
                  <img src={b.image} alt="" className="banner-main-img" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TOP RIGHT NAVIGATION (WALMART STYLE) */}
        <div className="banner-nav-overlay">
           <button className="banner-arrow-btn" onClick={prevSlide}>❮</button>
           <button className="banner-play-btn" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
             {isAutoPlaying ? "⏸" : "▶"}
           </button>
           <button className="banner-arrow-btn" onClick={nextSlide}>❯</button>
        </div>
      </div>

      {/* BOTTOM INFO ROW */}
      <div className="banner-bottom-info">
        <div className="info-header">
           <h2>Sacred Deals</h2>
           <Link to="/shop">View all</Link>
        </div>
        <p>Pure authentic products at blessed prices</p>
      </div>
    </div>
  );
};

export default Banner;
