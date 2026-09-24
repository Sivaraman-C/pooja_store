import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Incense.css";
import API_URL, { bypassHeaders } from "../apiConfig";

// Banner & Asset Imports
import IncenseBanner1 from "../Components/Assets/incense.jpeg";
import HeroBanner1 from "../assets/hero_03.png";
import HeroBanner2 from "../assets/hero_04.png";
import Banner2 from "../assets/Banner_2.png";
import PoojaBanner from "../Components/Assets/pooja.jpg";

// Accordion Banners
import AgarbattiBanner from "../Components/Assets/incense.jpeg";
import DhoopBanner from "../assets/hero_04.png";
import SambraniBanner from "../Components/Assets/pooja.jpg";

const incenseBanners = [
  { id: 1, img: IncenseBanner1, title: "Sacred Incense & Dhoop", sub: "Pure fragrances to elevate your soul and space" },
  { id: 2, img: HeroBanner1, title: "Organic Agarbatti Collection", sub: "Handcrafted natural floral & herbal scents" },
  { id: 3, img: HeroBanner2, title: "Aromatic Divine Blessings", sub: "Bring home peaceful aromas for daily meditation" }
];

const Incense = () => {
  const [products, setProducts] = useState([]);
  const [cartMap, setCartMap] = useState({}); // productId -> quantity
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeIncenseTab, setActiveIncenseTab] = useState(null); // Tracks 'Agarbatti', 'Dhoop', or 'Sambrani'
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.user_id;

  // Carousel Logic
  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === incenseBanners.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => setCurrentSlide(currentSlide === incenseBanners.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () => setCurrentSlide(currentSlide === 0 ? incenseBanners.length - 1 : currentSlide - 1);

  const fetchCart = async (uId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart?user_id=${uId}`, {
        headers: { ...bypassHeaders }
      });
      const data = await response.json();
      if (response.ok && data.cart) {
        const mapping = {};
        data.cart.forEach(item => {
          mapping[item.product_id] = item.quantity;
        });
        setCartMap(mapping);
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`, {
          headers: { ...bypassHeaders }
        });
        const data = await response.json();
        if (response.ok) {
          const incenseProducts = data.filter(p =>
            p.category.toLowerCase().includes("incense") ||
            p.category.toLowerCase().includes("agarbatti") ||
            p.category.toLowerCase().includes("dhoop") ||
            p.category.toLowerCase().includes("sambrani") ||
            p.name.toLowerCase().includes("incense") ||
            p.name.toLowerCase().includes("agarbatti") ||
            p.name.toLowerCase().includes("dhoop") ||
            p.name.toLowerCase().includes("sambrani") ||
            p.name.toLowerCase().includes("stick")
          );
          setProducts(incenseProducts);
        }
      } catch (error) {
        console.error("Fetch incense error:", error);
      }
    };
    fetchProducts();
    if (userId) fetchCart(userId);
  }, [userId]);

  const handleAddToCart = async (product) => {
    if (!userId) { navigate("/login"); return; }
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 }),
      });
      if (response.ok) {
        setCartMap(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!userId) return;
    if (quantity < 1) return;
    try {
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({ user_id: userId, quantity }),
      });
      if (response.ok) {
        setCartMap(prev => ({ ...prev, [productId]: quantity }));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const getProductsByKeyword = (keyword) => {
    return products.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
  };

  const newlyArrived = products.slice(0, 8);
  const agarbattiSticks = getProductsByKeyword("agarbatti").concat(getProductsByKeyword("stick"));
  const dhoopProducts = getProductsByKeyword("dhoop").concat(getProductsByKeyword("cone"));
  const sambraniProducts = getProductsByKeyword("sambrani").concat(getProductsByKeyword("cup")).concat(getProductsByKeyword("resin")).concat(getProductsByKeyword("loban"));
  const camphorProducts = getProductsByKeyword("camphor").concat(getProductsByKeyword("oil")).concat(getProductsByKeyword("aroma"));

  const renderProductCard = (product) => {
    const qty = cartMap[product.id] || 0;
    return (
      <div key={product.id} className="incense-product-card-v2">
        <div className="card-img-area">
          <button className="card-wish-btn">🤍</button>
          <Link to={`/product/${product.id}`}>
            <img src={product.image.startsWith("http") ? product.image : `${API_URL}${product.image}`} alt={product.name} />
          </Link>
        </div>

        <div className="card-details-area">
          <div className="card-add-action">
             {qty === 0 ? (
               <button className="purple-add-btn" onClick={() => handleAddToCart(product)}>+ Add</button>
             ) : (
               <div className="purple-qty-pill">
                  <button onClick={() => updateQuantity(product.id, qty - 1)}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => updateQuantity(product.id, qty + 1)}>+</button>
               </div>
             )}
          </div>

          <div className="card-meta">
             <span className="card-brand-tag">{product.brand || "Divine Aromas"} ⓘ</span>
             <div className="card-price-bold">₹{Number(product.price).toLocaleString("en-IN")}</div>
             <h4 className="card-title-text">{product.name}</h4>
             <div className="card-rating-row">
                <span className="card-stars">★★★★☆</span>
                <span className="card-count">24</span>
             </div>
             <p className="card-shipping-text">Shipping, arrives <strong>Soon</strong></p>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title, subtitle, items, bannerTitle, bannerHeading, bannerImg, isBannerLeft = false) => {
    if (items.length === 0) return null;

    return (
      <div className="incense-section-modern">
        <div className="section-header-modern">
           <div className="header-text">
              <h3>{title}</h3>
              <p>{subtitle}</p>
           </div>
           <Link to={`/shop?search=${title}`} className="view-all-modern">View all</Link>
        </div>

        <div className={`section-content-modern ${isBannerLeft ? 'banner-left' : ''}`}>
           <div className="products-scroll-area">
              {items.slice(0, 4).map(product => renderProductCard(product))}
           </div>

           <div className="feature-banner-card" style={{ backgroundImage: `url(${bannerImg})` }}>
              <div className="banner-content">
                 <span className="b-eyebrow">{bannerTitle}</span>
                 <h2 className="b-title">{bannerHeading}</h2>
                 <Link to={`/shop?search=${title}`} className="b-shop-btn">Shop now</Link>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="incense-page">
      {/* 1. Carousel Banner */}
      <div className="incense-carousel-banner">
        <div className="incense-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {incenseBanners.map((b) => (
            <div key={b.id} className="incense-slide">
              <img src={b.img} alt="" className="incense-slide-bg" />
              <div className="incense-slide-overlay">
                <h1>{b.title}</h1>
                <p>{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TOP RIGHT CONTROLS */}
        <div className="incense-nav-controls">
           <button className="incense-nav-btn" onClick={prevSlide}>❮</button>
           <button className="incense-nav-btn" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
             {isAutoPlaying ? "⏸" : "▶"}
           </button>
           <button className="incense-nav-btn" onClick={nextSlide}>❯</button>
        </div>
      </div>

      <div className="incense-content-container">
        {/* 2. Newly Arrived */}
        <div className="newly-arrived-section">
          <h2 className="main-section-title">Newly Arrived Incense & Dhoop</h2>
          <div className="horizontal-scroll-new">
            {newlyArrived.map(item => renderProductCard(item))}
          </div>
        </div>

        {/* 3. Agarbatti & Incense Sticks */}
        {renderSection(
          "Agarbatti & Incense Sticks",
          "Pure floral and herbal sticks crafted for serene worship.",
          agarbattiSticks.length > 0 ? agarbattiSticks : products,
          "Aromatic Purity",
          "Fragrant Agarbatti Collection for Daily Puja",
          agarbattiSticks[0]?.image ? (agarbattiSticks[0].image.startsWith("http") ? agarbattiSticks[0].image : `${API_URL}${agarbattiSticks[0].image}`) : IncenseBanner1
        )}

        {/* 4. Dhoop Sticks & Cones */}
        {renderSection(
          "Dhoop Sticks & Cones",
          "Traditional bamboo-less incense with rich long-lasting aromas.",
          dhoopProducts.length > 0 ? dhoopProducts : products.slice(0, 4),
          "Mystic Scents",
          "Organic Charcoal-Free Dhoop & Cones",
          dhoopProducts[0]?.image ? (dhoopProducts[0].image.startsWith("http") ? dhoopProducts[0].image : `${API_URL}${dhoopProducts[0].image}`) : HeroBanner2,
          true
        )}

        {/* 5. TRIPLE ACCORDION SECTION (AGARBATTI, DHOOP, SAMBRANI) */}
        <div className="triple-accordion-container">
           <div className="accordion-banner-row">
              <div
                className={`accordion-trigger-card ${activeIncenseTab === 'Agarbatti' ? 'active' : ''}`}
                style={{ backgroundImage: `url(${AgarbattiBanner})` }}
                onClick={() => setActiveIncenseTab(activeIncenseTab === 'Agarbatti' ? null : 'Agarbatti')}
              >
                 <div className="trigger-overlay"><h3>Agarbatti</h3></div>
              </div>
              <div
                className={`accordion-trigger-card ${activeIncenseTab === 'Dhoop' ? 'active' : ''}`}
                style={{ backgroundImage: `url(${DhoopBanner})` }}
                onClick={() => setActiveIncenseTab(activeIncenseTab === 'Dhoop' ? null : 'Dhoop')}
              >
                 <div className="trigger-overlay"><h3>Dhoop Cones</h3></div>
              </div>
              <div
                className={`accordion-trigger-card ${activeIncenseTab === 'Sambrani' ? 'active' : ''}`}
                style={{ backgroundImage: `url(${SambraniBanner})` }}
                onClick={() => setActiveIncenseTab(activeIncenseTab === 'Sambrani' ? null : 'Sambrani')}
              >
                 <div className="trigger-overlay"><h3>Sambrani Cups</h3></div>
              </div>
           </div>

           {/* EXPANDABLE PRODUCTS AREA */}
           {activeIncenseTab && (
             <div className="accordion-products-area">
                <div className="accordion-products-header">
                   <h3>{activeIncenseTab} Collection</h3>
                   <Link to={`/shop?search=${activeIncenseTab}`} className="view-all-link">View all {activeIncenseTab} products</Link>
                </div>
                <div className="accordion-grid">
                   {(activeIncenseTab === 'Agarbatti' ? agarbattiSticks : activeIncenseTab === 'Dhoop' ? dhoopProducts : sambraniProducts)
                      .slice(0, 8)
                      .concat(products.slice(0, Math.max(0, 8 - (activeIncenseTab === 'Agarbatti' ? agarbattiSticks : activeIncenseTab === 'Dhoop' ? dhoopProducts : sambraniProducts).length)))
                      .slice(0, 8)
                      .map(product => renderProductCard(product))}
                </div>
             </div>
           )}
        </div>

        {/* 6. Sambrani & Resin Cups */}
        {renderSection(
          "Sambrani & Resin Cups",
          "Traditional Loban and Benzoin resin cups for holy ambiance.",
          sambraniProducts.length > 0 ? sambraniProducts : products.slice(1, 5),
          "Ancient Heritage",
          "Pure Sambrani & Loban Cups",
          sambraniProducts[0]?.image ? (sambraniProducts[0].image.startsWith("http") ? sambraniProducts[0].image : `${API_URL}${sambraniProducts[0].image}`) : PoojaBanner
        )}

        {/* 7. Camphor & Essential Oils */}
        {renderSection(
          "Camphor & Essential Oils",
          "Pure Bhimseni camphor and fragrant oils for divine aroma.",
          camphorProducts.length > 0 ? camphorProducts : products.slice(2, 6),
          "Pure & Healing",
          "Natural Camphor & Puja Diffusers",
          camphorProducts[0]?.image ? (camphorProducts[0].image.startsWith("http") ? camphorProducts[0].image : `${API_URL}${camphorProducts[0].image}`) : Banner2,
          true
        )}
      </div>
    </div>
  );
};

export default Incense;
