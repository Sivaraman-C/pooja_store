import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

// Backgrounds and Main Graphics
import hero01 from "../../assets/hero_01.png";
import hero02 from "../../assets/hero_02.png";
import hero03 from "../../assets/hero_03.png";
import hero04 from "../../assets/hero_04.png";
import hero05 from "../../assets/hero_05.png";

// import mHero01 from "../../assets/mobile_hero_01.png";
// import mHero02 from "../../assets/mobile_hero_02.png";
// import mHero03 from "../../assets/mobile_hero_03.png";
// import mHero04 from "../../assets/mobile_hero_04.png";
// import mHero05 from "../../assets/mobile_hero_05.png";

// Category Images from src/Components/Assets
import Idols from "../Assets/idols.jpeg";
import Diyas from "../Assets/diyas.jpeg";
import Incense from "../Assets/incense.jpeg";
import Essentials from "../Assets/Essentials.jpeg";
import Kumkum from "../Assets/kumkum.jpg";
import Kits from "../Assets/pooja-kit.png";

const desktopBanners = [hero01, hero02, hero03, hero04, hero05];
const mobileBanners = [hero01, hero02, hero03, hero04, hero05];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

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
      setCurrentSlide((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    if (currentSlide === banners.length) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentSlide(0);
        setTimeout(() => setTransitionEnabled(true), 50);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, banners.length]);

  const extendedBanners = [banners[banners.length - 1], ...banners, banners[0]];
  const displaySlide = currentSlide + 1;

  return (
    <section className="hero">
      {/* Main Visual Banner Area */}
      <div className="hero-main-banner">
        {/* Brand Header */}
        {/* <div className="hero-top-bar">
          <div className="brand-box">
            <img src={Logo} alt="" className="brand-logo-img" />
            <div className="brand-names">
              <h1 className="brand-title">Devaloka</h1>
              <p className="brand-tagline">Pooja Essentials • Spiritual Living • Online</p>
            </div>
          </div>
        </div> */}

        {/* SLIDING BANNER */}
        <div className="banner-viewport">
          <div
            className="banner-inner-slider"
            style={{
              transform: `translateX(calc(-${displaySlide} * (100% + var(--slide-gap, 20px))))`,
              transition: transitionEnabled ? "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" : "none"
            }}
          >
            {extendedBanners.map((img, index) => (
              <div key={index} className="banner-slide">
                 <img src={img} alt={`Banner ${index}`} className="banner-img-element" />
              </div>
            ))}
          </div>
        </div>

        <div className="slider-dots">
          {banners.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === (currentSlide % banners.length) ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Explore Categories */}
      <div className="hero-explore-section">
        <div className="hero-explore-container">
          <div className="explore-header">
             <span className="script-text">Explore Our</span>
             <h2>Pooja Categories</h2>
             {/* <div className="one-roof-tag">
                <p>All Your Pooja Needs Under One Roof</p>
             </div> */}
          </div>

          <div className="explore-horizontal-grid">
          {[
            { img: Idols, name: "Idols & Murthis", desc: "Bring divinity home", link: "Idols" },
            { img: Diyas, name: "Pooja Items", desc: "For every ritual", link: "Diyas" },
            { img: Incense, name: "Incense & Dhoop", desc: "Fragrance of faith", link: "Incense" },
            { img: Essentials, name: "Essentials", desc: "Freshness & purity", link: "Pooja Essentials" },
            { img: Kits, name: "Pooja Samagri", desc: "Complete kits", link: "Pooja%20Kits" },
            { img: Kumkum, name: "Kumkum & Turmeric", desc: "Positive energy", link: "Kumkum%20%26%20Turmeric" },
            { img: Idols, name: "Books & More", desc: "Knowledge for devotion", link: "Idols%20%26%20Murtis" },
            { img: Diyas, name: "Flowers & Garlands", desc: "Pure offerings", link: "Diyas%20%26%20Lamps" },
          ].map((cat, i) => (
            <Link key={i} to={`/shop?category=${cat.link}`} className="explore-card">
              <div className="explore-card-arch">
                <img src={cat.img} alt={cat.name} />
              </div>
              <h4>{cat.name}</h4>
              <p>{cat.desc}</p>
            </Link>
          ))}
        </div>
        </div>
      </div>

      {/* Store benefits */}
      <div className="hero-action-bar">
        <div className="action-benefit">
          <svg className="action-benefit-icon" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="17" />
            <path d="M14 17h12l-1 12h-10l-1-12Z M17 17v-2a3 3 0 0 1 6 0v2" />
          </svg>
          <span>100% Pure &amp; Authentic<br />Products</span>
        </div>
        <div className="action-benefit">
          <svg className="action-benefit-icon" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="17" />
            <rect x="12" y="14" width="16" height="13" rx="2" />
            <path d="M12 18h16m-11 5h4" />
          </svg>
          <span>Secure Payment<br />Options</span>
        </div>
        <div className="action-benefit">
          <svg className="action-benefit-icon" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="17" />
            <path d="M10 16h14v11H10zM24 19h4l3 4v4h-7" />
            <circle cx="15" cy="28" r="2" />
            <circle cx="27" cy="28" r="2" />
          </svg>
          <span>Fast &amp; Reliable<br />Delivery</span>
        </div>
        <div className="action-benefit">
          <svg className="action-benefit-icon" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="17" />
            <path d="M20 11 27 14v6c0 5-3 8-7 10-4-2-7-5-7-10v-6l7-3Z" />
            <path d="M17 20h6m-3-3v6" />
          </svg>
          <span>Dedicated Customer<br />Support</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
