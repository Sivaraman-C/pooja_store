import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Diyas.css";
import API_URL, { bypassHeaders } from "../apiConfig";

// Banner & Asset Imports
import DiyasBanner1 from "../Components/Assets/diyas.jpeg";
import DiwaliBanner from "../Components/Assets/diwali1.jpeg";
import HeroBanner from "../assets/hero_02.png";
import Banner2 from "../assets/Banner_2.png";
import PoojaBanner from "../Components/Assets/pooja.jpg";

// Category Banners for Accordion
import BrassBanner from "../Components/Assets/diyas.jpeg";
import HangingBanner from "../assets/hero_03.png";
import AkhandBanner from "../Components/Assets/diwali.jpg";

const diyasBanners = [
  { id: 1, img: DiyasBanner1, title: "Sacred Diyas & Lamps", sub: "Illuminate Your Home Altar with Divine Grace" },
  { id: 2, img: DiwaliBanner, title: "Handcrafted Brass Deepams", sub: "Traditional Craftsmanship for Festival & Daily Pujas" },
  { id: 3, img: HeroBanner, title: "Pure Spiritual Glow", sub: "Auspicious Lamp Collections to Dispel Darkness" }
];

const Diyas = () => {
  const [products, setProducts] = useState([]);
  const [cartMap, setCartMap] = useState({}); // productId -> quantity
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeDiyaTab, setActiveDiyaTab] = useState(null); // Tracks 'Brass', 'Hanging', or 'Akhand'
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.user_id;

  // Carousel Logic
  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === diyasBanners.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => setCurrentSlide(currentSlide === diyasBanners.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () => setCurrentSlide(currentSlide === 0 ? diyasBanners.length - 1 : currentSlide - 1);

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
          const diyaProducts = data.filter(p =>
            p.category.toLowerCase().includes("diya") ||
            p.category.toLowerCase().includes("lamp") ||
            p.category.toLowerCase().includes("deepam") ||
            p.name.toLowerCase().includes("diya") ||
            p.name.toLowerCase().includes("lamp") ||
            p.name.toLowerCase().includes("deepam")
          );
          setProducts(diyaProducts);
        }
      } catch (error) {
        console.error("Fetch diyas error:", error);
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
  const brassDiyas = getProductsByKeyword("brass");
  const clayDiyas = getProductsByKeyword("clay").concat(getProductsByKeyword("earthen")).concat(getProductsByKeyword("terracotta"));
  const hangingLamps = getProductsByKeyword("hanging").concat(getProductsByKeyword("hanging diya")).concat(getProductsByKeyword("chain"));
  const akhandDiyas = getProductsByKeyword("akhand").concat(getProductsByKeyword("glass")).concat(getProductsByKeyword("stand"));
  const silverDiyas = getProductsByKeyword("silver").concat(getProductsByKeyword("metal"));

  const renderProductCard = (product) => {
    const qty = cartMap[product.id] || 0;
    return (
      <div key={product.id} className="diya-product-card-v2">
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
             <span className="card-brand-tag">{product.brand || "Sacred Lights"} ⓘ</span>
             <div className="card-price-bold">₹{Number(product.price).toLocaleString("en-IN")}</div>
             <h4 className="card-title-text">{product.name}</h4>
             <div className="card-rating-row">
                <span className="card-stars">★★★★☆</span>
                <span className="card-count">18</span>
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
      <div className="diya-section-modern">
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
    <div className="diyas-page">
      {/* 1. Carousel Banner */}
      <div className="diyas-carousel-banner">
        <div className="diyas-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {diyasBanners.map((b) => (
            <div key={b.id} className="diyas-slide">
              <img src={b.img} alt="" className="diyas-slide-bg" />
              <div className="diyas-slide-overlay">
                <h1>{b.title}</h1>
                <p>{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TOP RIGHT CONTROLS */}
        <div className="diyas-nav-controls">
           <button className="diyas-nav-btn" onClick={prevSlide}>❮</button>
           <button className="diyas-nav-btn" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
             {isAutoPlaying ? "⏸" : "▶"}
           </button>
           <button className="diyas-nav-btn" onClick={nextSlide}>❯</button>
        </div>
      </div>

      <div className="diyas-content-container">
        {/* 2. Newly Arrived */}
        <div className="newly-arrived-section">
          <h2 className="main-section-title">Newly Arrived Diyas & Lamps</h2>
          <div className="horizontal-scroll-new">
            {newlyArrived.map(item => renderProductCard(item))}
          </div>
        </div>

        {/* 3. Brass Diyas Collection */}
        {renderSection(
          "Brass Diyas Collection",
          "Timeless brass oil lamps for your everyday temple rituals.",
          brassDiyas.length > 0 ? brassDiyas : products,
          "Traditional Craft",
          "Bring Home Auspicious Brass Vilakku",
          brassDiyas[0]?.image ? (brassDiyas[0].image.startsWith("http") ? brassDiyas[0].image : `${API_URL}${brassDiyas[0].image}`) : DiyasBanner1
        )}

        {/* 4. Clay & Earthen Diyas */}
        {renderSection(
          "Earthen & Clay Diyas",
          "Eco-friendly traditional terracotta diyas for auspicious occasions.",
          clayDiyas.length > 0 ? clayDiyas : products.slice(0, 4),
          "Pure & Organic",
          "Natural Earthen Glow for Festive Celebrations",
          clayDiyas[0]?.image ? (clayDiyas[0].image.startsWith("http") ? clayDiyas[0].image : `${API_URL}${clayDiyas[0].image}`) : DiwaliBanner,
          true
        )}

        {/* 5. TRIPLE ACCORDION SECTION (BRASS LAMPS, HANGING DIYAS, AKHAND DIYAS) */}
        <div className="triple-accordion-container">
           <div className="accordion-banner-row">
              <div
                className={`accordion-trigger-card ${activeDiyaTab === 'Brass' ? 'active' : ''}`}
                style={{ backgroundImage: `url(${BrassBanner})` }}
                onClick={() => setActiveDiyaTab(activeDiyaTab === 'Brass' ? null : 'Brass')}
              >
                 <div className="trigger-overlay"><h3>Brass Lamps</h3></div>
              </div>
              <div
                className={`accordion-trigger-card ${activeDiyaTab === 'Hanging' ? 'active' : ''}`}
                style={{ backgroundImage: `url(${HangingBanner})` }}
                onClick={() => setActiveDiyaTab(activeDiyaTab === 'Hanging' ? null : 'Hanging')}
              >
                 <div className="trigger-overlay"><h3>Hanging Diyas</h3></div>
              </div>
              <div
                className={`accordion-trigger-card ${activeDiyaTab === 'Akhand' ? 'active' : ''}`}
                style={{ backgroundImage: `url(${AkhandBanner})` }}
                onClick={() => setActiveDiyaTab(activeDiyaTab === 'Akhand' ? null : 'Akhand')}
              >
                 <div className="trigger-overlay"><h3>Akhand Diyas</h3></div>
              </div>
           </div>

           {/* EXPANDABLE PRODUCTS AREA */}
           {activeDiyaTab && (
             <div className="accordion-products-area">
                <div className="accordion-products-header">
                   <h3>{activeDiyaTab} Diyas Collection</h3>
                   <Link to={`/shop?search=${activeDiyaTab}`} className="view-all-link">View all {activeDiyaTab} lamps</Link>
                </div>
                <div className="accordion-grid">
                   {(activeDiyaTab === 'Brass' ? brassDiyas : activeDiyaTab === 'Hanging' ? hangingLamps : akhandDiyas)
                      .slice(0, 8)
                      .concat(products.slice(0, Math.max(0, 8 - (activeDiyaTab === 'Brass' ? brassDiyas : activeDiyaTab === 'Hanging' ? hangingLamps : akhandDiyas).length)))
                      .slice(0, 8)
                      .map(product => renderProductCard(product))}
                </div>
             </div>
           )}
        </div>

        {/* 6. Hanging Lamps & Vilakku */}
        {renderSection(
          "Hanging Lamps & Vilakku",
          "Elevate your temple room with traditional hanging oil lamps.",
          hangingLamps.length > 0 ? hangingLamps : products.slice(1, 5),
          "Temple Heritage",
          "Ornate Hanging Diyas with Bells & Chains",
          hangingLamps[0]?.image ? (hangingLamps[0].image.startsWith("http") ? hangingLamps[0].image : `${API_URL}${hangingLamps[0].image}`) : Banner2
        )}

        {/* 7. Akhand & Glass Diyas */}
        {renderSection(
          "Akhand & Glass Diyas",
          "Long-burning protected diyas ideal for uninterrupted puja.",
          akhandDiyas.length > 0 ? akhandDiyas : products.slice(2, 6),
          "Unbroken Light",
          "Brass & Glass Akhand Deepams",
          akhandDiyas[0]?.image ? (akhandDiyas[0].image.startsWith("http") ? akhandDiyas[0].image : `${API_URL}${akhandDiyas[0].image}`) : PoojaBanner,
          true
        )}
      </div>
    </div>
  );
};

export default Diyas;
