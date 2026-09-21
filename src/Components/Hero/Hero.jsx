import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

// Backgrounds and Main Graphics
import hero01 from "../../assets/hero_01.png";
import hero02 from "../../assets/hero_02.png";
import hero03 from "../../assets/hero_03.png";
import hero04 from "../../assets/hero_04.png";
import hero05 from "../../assets/hero_05.png";

import mHero01 from "../../assets/mobile_hero_01.png";
import mHero02 from "../../assets/mobile_hero_02.png";
import mHero03 from "../../assets/mobile_hero_03.png";
import mHero04 from "../../assets/mobile_hero_04.png";
import mHero05 from "../../assets/mobile_hero_05.png";

import Logo from "../Assets/lotus.png";
import ShopNowButton from "../../assets/shop_now.png";

// Category Images from src/Components/Assets
import Idols from "../Assets/idols.jpeg";
import Diyas from "../Assets/diyas.jpeg";
import Incense from "../Assets/incense.jpeg";
import Essentials from "../Assets/Essentials.jpeg";
import Kumkum from "../Assets/kumkum.jpg";
import Kits from "../Assets/pooja-kit.png";

const desktopBanners = [hero01, hero02, hero03, hero04, hero05];
const mobileBanners = [mHero01, mHero02, mHero03, mHero04, mHero05];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const banners = isMobile ? mobileBanners : desktopBanners;

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [banners.length]);

  return (
    <section className="hero">
      {/* Main Visual Banner Area */}
      <div className="hero-main-banner">
        {/* Brand Header */}
        <div className="hero-top-bar">
          <div className="brand-box">
            <img src={Logo} alt="" className="brand-logo-img" />
            <div className="brand-names">
              <h1 className="brand-title">Devaloka</h1>
              <p className="brand-tagline">Pooja Essentials • Spiritual Living • Online</p>
            </div>
          </div>
        </div>

        {/* SLIDING BANNER */}
        <div className="banner-viewport">
          <div
            className="banner-inner-slider"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((img, index) => (
              <div key={index} className="banner-slide">
                 <img src={img} alt={`Banner ${index + 1}`} className="banner-img-element" />
              </div>
            ))}
          </div>
        </div>

        <div className="slider-dots">
          {banners.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Explore Categories */}
      <div className="hero-explore-section">
        <div className="explore-header">
           <span className="script-text">Explore Our</span>
           <h2>Pooja Categories</h2>
           <div className="one-roof-tag">
              <span className="mini-lotus">🪷</span>
              <p>All Your Pooja Needs Under One Roof</p>
           </div>
        </div>

        <div className="explore-horizontal-grid">
          {[
            { img: Idols, name: "Idols & Murthis", desc: "Bring divinity home", link: "Idols%20%26%20Murtis" },
            { img: Diyas, name: "Pooja Items", desc: "For every ritual", link: "Diyas%20%26%20Lamps" },
            { img: Incense, name: "Incense & Dhoop", desc: "Fragrance of faith", link: "Incense" },
            { img: Essentials, name: "Flowers & Garlands", desc: "Freshness & purity", link: "Essentials" },
            { img: Kumkum, name: "Camphor & Agarbatti", desc: "For positive energy", link: "Kumkum%20%26%20Turmeric" },
            { img: Kits, name: "Pooja Samagri", desc: "Complete kits", link: "Pooja%20Kits" },
            { img: Idols, name: "Books & More", desc: "Knowledge for devotion", link: "Idols%20%26%20Murtis" },
          ].map((cat, i) => (
            <Link key={i} to={`/shop?category=${cat.link}`} className="explore-card">
              <div className="explore-card-arch">
                <img src={cat.img} alt={cat.name} />
              </div>
              <h4>{cat.name}</h4>
              <p>{cat.desc}</p>
            </Link>
          ))}

          {/* Special Discount Circle */}
          <div className="special-discount-card">
             <div className="discount-circle">
                <h4>Special Discounts</h4>
                <p>on Selected Pooja Products</p>
                <div className="discount-leaf">🪷</div>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="hero-action-bar">
        <div className="action-left-keywords">
          <span>Traditional</span>
          <span className="dot">•</span>
          <span>Trusted</span>
          <span className="dot">•</span>
          <span>Divine</span>
        </div>

        <div className="action-center-btn">
          <Link to="/shop" className="shop-now-image-link" aria-label="Shop Now">
            <img src={ShopNowButton} alt="Shop Now" className="shop-now-image-button" />
          </Link>
        </div>

        <div className="action-right-info">
           <div className="journey-text">
              <p>Your Spiritual Journey <strong>Starts Here!</strong></p>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
