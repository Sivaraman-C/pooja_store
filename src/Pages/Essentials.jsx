import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Idols.css";
import API_URL, { bypassHeaders } from "../apiConfig";

// Banner Assets
import EssentialsBanner from "../Components/Assets/Essentials.jpeg";
import KumkumBanner from "../Components/Assets/kumkum.jpg";
import HaldiBanner from "../Components/Assets/Haldi.jpg";

const essentialsBanners = [
  { id: 1, img: EssentialsBanner, title: "Pooja Essentials", sub: "Everything you need for your daily rituals" },
  { id: 2, img: KumkumBanner, title: "Sacred Kumkum", sub: "Purity and tradition in every pinch" },
  { id: 3, img: HaldiBanner, title: "Pure Turmeric", sub: "Auspicious Haldi for sacred ceremonies" }
];

const Essentials = () => {
  const [products, setProducts] = useState([]);
  const [cartMap, setCartMap] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.user_id;

  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === essentialsBanners.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => setCurrentSlide(currentSlide === essentialsBanners.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () => setCurrentSlide(currentSlide === 0 ? essentialsBanners.length - 1 : currentSlide - 1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`, { headers: { ...bypassHeaders } });
        const data = await response.json();
        if (response.ok) {
          const filtered = data.filter(p =>
            p.category.toLowerCase().includes("essential") ||
            p.category.toLowerCase().includes("kit") ||
            p.category.toLowerCase().includes("samagri")
          );
          setProducts(filtered);
        }
      } catch (error) { console.error(error); }
    };
    fetchProducts();
    if (userId) fetchCart(userId);
  }, [userId]);

  const fetchCart = async (uId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart?user_id=${uId}`, { headers: { ...bypassHeaders } });
      const data = await response.json();
      if (response.ok && data.cart) {
        const mapping = {};
        data.cart.forEach(item => { mapping[item.product_id] = item.quantity; });
        setCartMap(mapping);
      }
    } catch (error) { console.error(error); }
  };

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
    } catch (error) { console.error(error); }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!userId || quantity < 1) return;
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
    } catch (error) { console.error(error); }
  };

  const renderProductCard = (product) => {
    const qty = cartMap[product.id] || 0;
    return (
      <div key={product.id} className="idol-product-card-v2">
        <div className="card-img-area">
          <button className="card-wish-btn">🤍</button>
          <Link to={`/product/${product.id}`}><img src={product.image.startsWith("http") ? product.image : `${API_URL}${product.image}`} alt={product.name} /></Link>
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
             <span className="card-brand-tag">{product.brand || "Sacred"} ⓘ</span>
             <div className="card-price-bold">₹{Number(product.price).toLocaleString("en-IN")}</div>
             <h4 className="card-title-text">{product.name}</h4>
             <div className="card-rating-row"><span className="card-stars">★★★★☆</span><span className="card-count">12</span></div>
             <p className="card-shipping-text">Shipping, arrives <strong>Soon</strong></p>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title, subtitle, keyword, bannerTitle, bannerHeading, bgImg, isBannerLeft = false) => {
    const items = products.filter(p =>
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p.category.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 4);

    if (items.length === 0) return null;
    return (
      <div className="deity-section-modern">
        <div className="section-header-modern">
           <div className="header-text"><h3>{title}</h3><p>{subtitle}</p></div>
           <Link to={`/shop?search=${keyword}`} className="view-all-modern">View all</Link>
        </div>
        <div className={`section-content-modern ${isBannerLeft ? 'banner-left' : ''}`}>
           <div className="products-scroll-area">{items.map(product => renderProductCard(product))}</div>
           <div className="feature-banner-card" style={{ backgroundImage: `url(${bgImg})` }}>
              <div className="banner-content">
                 <span className="b-eyebrow">{bannerTitle}</span>
                 <h2 className="b-title">{bannerHeading}</h2>
                 <Link to={`/shop?search=${keyword}`} className="b-shop-btn">Shop now</Link>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="idols-page">
      <div className="idols-carousel-banner">
        <div className="idols-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {essentialsBanners.map((b) => (
            <div key={b.id} className="idols-slide">
              <img src={b.img} alt="" className="idols-slide-bg" />
              <div className="idols-slide-overlay"><h1>{b.title}</h1><p>{b.sub}</p></div>
            </div>
          ))}
        </div>
        <div className="idols-nav-controls">
           <button className="idols-nav-btn" onClick={prevSlide}>❮</button>
           <button className="idols-nav-btn" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>{isAutoPlaying ? "⏸" : "▶"}</button>
           <button className="idols-nav-btn" onClick={nextSlide}>❯</button>
        </div>
      </div>
      <div className="idols-content-container">
        <h2 className="main-section-title">Ritual Essentials</h2>
        {renderSection("Pure Kumkum", "Auspicious vermillion for sacred tilaks.", "Kumkum", "Divine Red", "Sacred Kumkum Collection", KumkumBanner)}
        {renderSection("Organic Haldi", "Pure turmeric for holiness and health.", "Haldi", "Golden Purity", "Organic Haldi Selection", HaldiBanner, true)}
        {renderSection("Pooja Kits", "Complete sets for various spiritual ceremonies.", "Kit", "All-in-One", "Sacred Samagri Kits", EssentialsBanner)}
      </div>
    </div>
  );
};

export default Essentials;
