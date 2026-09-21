import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Idols.css";
import API_URL, { bypassHeaders } from "../apiConfig";

// Carousel Images
import IdolsBanner1 from "../Components/Assets/idols.jpeg";
import IdolsBanner2 from "../assets/Banner_1.png";
import IdolsBanner3 from "../assets/hero_01.png";

const idolBanners = [
  { id: 1, img: IdolsBanner1, title: "Sacred Idols & Murtis", sub: "Bring Home the Divine Presence" },
  { id: 2, img: IdolsBanner2, title: "Handcrafted Devotion", sub: "Premium Collection for Your Home Temple" },
  { id: 3, img: IdolsBanner3, title: "Divine Heritage", sub: "Artisan-Crafted Spiritual Masterpieces" }
];

const Idols = () => {
  const [products, setProducts] = useState([]);
  const [cartMap, setCartMap] = useState({}); // productId -> quantity
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.user_id;

  // Carousel Logic
  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === idolBanners.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => setCurrentSlide(currentSlide === idolBanners.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () => setCurrentSlide(currentSlide === 0 ? idolBanners.length - 1 : currentSlide - 1);

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
          const idolProducts = data.filter(p =>
            p.category.toLowerCase().includes("idol") ||
            p.category.toLowerCase().includes("murti")
          );
          setProducts(idolProducts);
        }
      } catch (error) {
        console.error("Fetch idols error:", error);
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
  const shivaProducts = getProductsByKeyword("Shiva");
  const ganeshaProducts = getProductsByKeyword("Ganesha");
  const murugaProducts = getProductsByKeyword("Muruga");
  const parvathiProducts = getProductsByKeyword("Parvathi");

  const renderProductCard = (product) => {
    const qty = cartMap[product.id] || 0;
    return (
      <div key={product.id} className="idol-product-card-v2">
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
             <span className="card-brand-tag">{product.brand || "Other"} ⓘ</span>
             <div className="card-price-bold">₹{Number(product.price).toLocaleString("en-IN")}</div>
             <h4 className="card-title-text">{product.name}</h4>
             <div className="card-rating-row">
                <span className="card-stars">★★★★☆</span>
                <span className="card-count">12</span>
             </div>
             <p className="card-shipping-text">Shipping, arrives <strong>Soon</strong></p>
          </div>
        </div>
      </div>
    );
  };

  const renderDeitySection = (title, subtitle, items, bannerTitle, bannerHeading, bannerImg) => {
    if (items.length === 0) return null;

    return (
      <div className="deity-section-modern">
        <div className="section-header-modern">
           <div className="header-text">
              <h3>{title}</h3>
              <p>{subtitle}</p>
           </div>
           <Link to={`/shop?search=${title}`} className="view-all-modern">View all</Link>
        </div>

        <div className="section-content-modern">
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
    <div className="idols-page">
      {/* 1. Carousel Banner (Walmart Style Controls) */}
      <div className="idols-carousel-banner">
        <div className="idols-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {idolBanners.map((b) => (
            <div key={b.id} className="idols-slide">
              <img src={b.img} alt="" className="idols-slide-bg" />
              <div className="idols-slide-overlay">
                <h1>{b.title}</h1>
                <p>{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TOP RIGHT CONTROLS */}
        <div className="idols-nav-controls">
           <button className="idols-nav-btn" onClick={prevSlide}>❮</button>
           <button className="idols-nav-btn" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
             {isAutoPlaying ? "⏸" : "▶"}
           </button>
           <button className="idols-nav-btn" onClick={nextSlide}>❯</button>
        </div>
      </div>

      <div className="idols-content-container">
        {/* 2. Newly Arrived */}
        <div className="newly-arrived-section">
          <h2 className="main-section-title">Newly Arrived</h2>
          <div className="horizontal-scroll-new">
            {newlyArrived.map(item => renderProductCard(item))}
          </div>
        </div>

        {/* 3. Deity Sections */}
        {renderDeitySection(
          "Shiva Collection",
          "Divine Mahadev idols for your home.",
          shivaProducts,
          "Sacred Heritage",
          "Bring Home the Lord of Dance",
          shivaProducts[0]?.image ? (shivaProducts[0].image.startsWith("http") ? shivaProducts[0].image : `${API_URL}${shivaProducts[0].image}`) : IdolsBanner1
        )}

        {renderDeitySection(
          "Ganesha Special",
          "Remover of obstacles, bringer of luck.",
          ganeshaProducts,
          "Divine Arts",
          "Handcrafted Siddhivinayak Murtis",
          ganeshaProducts[0]?.image ? (ganeshaProducts[0].image.startsWith("http") ? ganeshaProducts[0].image : `${API_URL}${ganeshaProducts[0].image}`) : IdolsBanner1
        )}

        {renderDeitySection(
          "Muruga & Murugappa",
          "Symbols of victory and wisdom.",
          murugaProducts,
          "Temple Crafts",
          "Traditional Vel & Murugan Statues",
          murugaProducts[0]?.image ? (murugaProducts[0].image.startsWith("http") ? murugaProducts[0].image : `${API_URL}${murugaProducts[0].image}`) : IdolsBanner1
        )}

        {renderDeitySection(
          "Parvathi Devi",
          "Goddess of power and devotion.",
          parvathiProducts,
          "Sacred Arts",
          "Divine Shakthi & Parvathi Murtis",
          parvathiProducts[0]?.image ? (parvathiProducts[0].image.startsWith("http") ? parvathiProducts[0].image : `${API_URL}${parvathiProducts[0].image}`) : IdolsBanner1
        )}
      </div>
    </div>
  );
};

export default Idols;
