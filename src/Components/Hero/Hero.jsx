import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

// Backgrounds and Main Graphics
import BannerBg from "../../assets/banner1.png";
import PaintStroke from "../../assets/paint01.png";
import Logo from "../Assets/lotus.png";
import ShopNowButton from "../../assets/shop_now.png";
import BringHome from "../../assets/bring_home.png";
import DivineProducts from "../../assets/divine_products.png";
import SalesButton from "../../assets/sales_started.png";
import FastDelivery from "../../assets/fast_delivery.png";
import SpecialOfferButton from "../../assets/special_offers.png";

// Category Images from src/Components/Assets
import Idols from "../Assets/idols.jpeg";
import Diyas from "../Assets/diyas.jpeg";
import Incense from "../Assets/incense.jpeg";
import Essentials from "../Assets/Essentials.jpeg";
import Kumkum from "../Assets/kumkum.jpg";
import Kits from "../Assets/pooja-kit.png";

const Hero = () => {
  return (
    <section className="hero">
      {/* Main Visual Banner Area */}
      <div className="hero-main-banner">
        {/* 1. Brand Header - MOVED INSIDE BANNER */}
        <div className="hero-top-bar">
          <div className="brand-box">
            <img src={Logo} alt="" className="brand-logo-img" />
            <div className="brand-names">
              <h1 className="brand-title">Devaloka</h1>
              <p className="brand-tagline">Pooja Essentials • Spiritual Living • Online</p>
            </div>
          </div>
          <div className="brand-quote">
            <p>Light Up Your Prayers with the Best Pooja Essentials</p>
          </div>
        </div>

        <div className="banner-image-layer">
          <img src={BannerBg} alt="Sacred Home Temple" />
        </div>

        <div className="banner-text-layer">
          {/* CURVED BADGE TEXT */}
          <div className="vibes-badge-curved">
            <svg viewBox="0 0 400 60" className="vibes-svg">
              <path id="vibes-curve" d="M 40 40 Q 200 10 360 40" fill="transparent" />
              <text className="vibes-text">
                <textPath href="#vibes-curve" startOffset="50%" textAnchor="middle">
                  ✧ Divine Vibes, Now Online! ✧
                </textPath>
              </text>
            </svg>
          </div>

          {/* CURVED TEXT WITH PAINT STROKE BG */}
          <div className="promo-headline-curved">
            <img src={PaintStroke} alt="" className="headline-paint-bg" />
            <svg
              className="sales-curved-svg"
              viewBox="0 0 600 220"
              role="img"
              aria-label="Sales Started For Your Pooja"
            >
              <path id="sales-title-curve" d="M 45 155 Q 300 0 555 155" fill="transparent" />
              <path id="sales-subtitle-curve" d="M 105 185 Q 300 85 495 185" fill="transparent" />
              <text className="sales-title-text">
                <textPath href="#sales-title-curve" startOffset="50%" textAnchor="middle">
                  Sales Started
                </textPath>
              </text>
              <text className="sales-subtitle-text">
                <textPath href="#sales-subtitle-curve" startOffset="50%" textAnchor="middle">
                  For Your Pooja !
                </textPath>
              </text>
            </svg>
          </div>

          <div className="banner-footer-text">
            <p className="purity-words">Pure • Sacred • Authentic</p>
            <p className="blessed-home">Everything You Need for a Blessed Home</p>
          </div>

          {/* 3. Features Strip */}
          <div className="hero-features-strip">
            {[
              { src: SalesButton, alt: "Sales started" },
              { src: DivineProducts, alt: "Divine products" },
              { src: BringHome, alt: "Bring home" },
              { src: SpecialOfferButton, alt: "Special offers" },
              { src: FastDelivery, alt: "Fast delivery" }
            ].map((button, i) => (
              <Link to="/shop" key={i} className="feature-item feature-button-card" aria-label={button.alt} > 
              <img src={button.src} alt={button.alt} className="feature-button-image" /> </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Explore Categories */}
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

      {/* 5. Bottom Navigation Bar */}
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
