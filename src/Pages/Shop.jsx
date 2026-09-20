import React, { useEffect, useState, useMemo } from "react";
import "./Shop.css";
import { Link } from "react-router-dom";

import LoginPopup from "../Components/LoginPopup/LoginPopup";
import API_URL, { bypassHeaders } from "../apiConfig";

// Icons for the top category strip
import IdolsIcon from "../Components/Assets/idols.jpeg";
import DiyasIcon from "../Components/Assets/diyas.jpeg";
import IncenseIcon from "../Components/Assets/incense.jpeg";
import EssentialsIcon from "../Components/Assets/Essentials.jpeg";
import KitsIcon from "../Components/Assets/pooja-kit.png";

const poojaFestivals = [
  "All Festivals", "Pongal", "Makara Sankranti", "Vasant Panchami",
  "Maha Shivaratri", "Holi", "Ugadi", "Gudi Padwa", "Chaitra Navratri",
  "Rama Navami", "Tamil New Year", "Vishu", "Akshaya Tritiya",
  "Buddha Purnima", "Nirjala Ekadashi", "Jagannath Rath Yatra", "Guru Purnima",
  "Hariyali Teej", "Nag Panchami", "Onam", "Varalakshmi Vrat", "Raksha Bandhan",
  "Janmashtami", "Ganesh Chaturthi", "Sharad Navratri", "Dussehra", "Diwali",
  "Govardhan Puja", "Bhai Dooj", "Vaikuntha Ekadashi",
];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cartMap, setCartMap] = useState({}); // productId -> quantity

  // Filter States
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState("All Festivals");
  const [sortBy, setSortBy] = useState("Best Match");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Sidebar state
  const [activeFilters, setActiveFilters] = useState({
    price: true,
    brand: true,
    category: true,
    pooja: true
  });

  const toggleFilter = (filter) => {
    setActiveFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const getLoggedInUser = () => {
    const user = localStorage.getItem("user");
    try { return user ? JSON.parse(user) : null; } catch { return null; }
  };

  const getUserId = () => {
    const user = getLoggedInUser();
    return user?.id || user?.user_id || null;
  };

  const fetchCart = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart?user_id=${userId}`, {
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
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    const userId = getUserId();
    if (userId) {
      fetchWishlist(userId);
      fetchCart(userId);
    }
  }, []);

  const fetchWishlist = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${userId}`);
      const data = await response.json();
      if (response.ok) setWishlist(Array.isArray(data) ? data.map(item => item.id) : []);
    } catch {}
  };

  const handleToggleWishlist = async (productId) => {
    const userId = getUserId();
    if (!userId) { setShowLoginPopup(true); return; }
    try {
      const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await response.json();
      if (response.ok) {
        setWishlist(prev => data.liked ? [...prev, productId] : prev.filter(id => id !== productId));
      }
    } catch {}
  };

  const handleAddToCart = async (product) => {
    const userId = getUserId();
    if (!userId) { setShowLoginPopup(true); return; }
    try {
      setAddingProductId(product.id);
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 }),
      });
      if (response.ok) {
        setCartMap(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      alert("Unable to add product to cart");
    } finally {
      setAddingProductId(null);
    }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    const userId = getUserId();
    if (!userId) return;

    if (newQty < 1) {
      try {
        const response = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        if (response.ok) {
          const newMap = { ...cartMap };
          delete newMap[productId];
          setCartMap(newMap);
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } catch {}
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, quantity: newQty }),
      });
      if (response.ok) {
        setCartMap(prev => ({ ...prev, [productId]: newQty }));
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        const data = await response.json();
        if (data.message) alert(data.message);
      }
    } catch {}
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get("category");
    const urlSearch = params.get("search");
    if (urlCategory) setCategory(urlCategory);
    if (urlSearch) setSearch(urlSearch);
  }, []);

  const togglePriceRange = (range) => {
    setSelectedPriceRanges(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const pCat = String(product.category || "").toLowerCase();
      const pName = String(product.name || "").toLowerCase();
      const pBrand = String(product.brand || "").toLowerCase();
      const pPrice = Number(product.price);
      const s = search.toLowerCase().trim();

      let catMatch = category === "All" || pCat === category.toLowerCase();
      let searchMatch = pName.includes(s) || pCat.includes(s) || pBrand.includes(s);

      let priceMatch = true;
      if (selectedPriceRanges.length > 0) {
        priceMatch = selectedPriceRanges.some(range => {
          if (range === 'under500') return pPrice < 500;
          if (range === '500-1000') return pPrice >= 500 && pPrice <= 1000;
          if (range === 'above1000') return pPrice > 1000;
          return true;
        });
      }

      let brandMatch = true;
      if (selectedBrands.length > 0) {
        brandMatch = selectedBrands.some(brand => pBrand.includes(brand.toLowerCase()));
      }

      let festivalMatch = true;
      if (selectedFestival !== "All Festivals") {
        const desc = String(product.description || "").toLowerCase();
        festivalMatch = pName.includes(selectedFestival.toLowerCase()) ||
                        pCat.includes(selectedFestival.toLowerCase()) ||
                        desc.includes(selectedFestival.toLowerCase());
      }

      return catMatch && searchMatch && priceMatch && brandMatch && festivalMatch;
    });

    if (sortBy === "Price: Low to High") result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "Price: High to Low") result.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === "Newest") result.sort((a, b) => b.id - a.id);

    return result;
  }, [products, category, search, selectedPriceRanges, selectedBrands, sortBy, selectedFestival]);

  const stripCategories = [
    { name: "Idols", img: IdolsIcon, link: "Idols" },
    { name: "Diyas", img: DiyasIcon, link: "Diyas" },
    { name: "Incense", img: IncenseIcon, link: "Incense" },
    { name: "Essentials", img: EssentialsIcon, link: "Pooja Essentials" },
    { name: "Kits", img: KitsIcon, link: "Pooja Kits" }
  ];

  return (
    <div className="shop-page-new">
      <div className="shop-web-container">

        <div className="top-pills-row">
           <button className="pill-btn">In-store</button>
           <button className="pill-btn">Get it fast</button>
           <div className="pill-dropdown-wrap">
             <button className="pill-btn" onClick={() => setShowSortDropdown(!showSortDropdown)}>
               {sortBy} ▾
             </button>
             {showSortDropdown && (
               <div className="sort-dropdown">
                 {["Best Match", "Price: Low to High", "Price: High to Low", "Newest"].map(opt => (
                   <div key={opt} className="sort-opt" onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}>{opt}</div>
                 ))}
               </div>
             )}
           </div>
           <button className="pill-btn" onClick={() => {setCategory("All"); setSelectedBrands([]); setSelectedPriceRanges([]); setSelectedFestival("All Festivals"); setSearch("");}}>Clear Filters</button>
        </div>

        <div className="category-strip">
          {stripCategories.map((cat, i) => (
            <div key={i} className="strip-item" onClick={() => setCategory(cat.link)}>
              <div className={`strip-icon-box ${category === cat.link ? 'active' : ''}`}>
                <img src={cat.img} alt={cat.name} />
              </div>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>

        <div className="shop-main-layout">
          <aside className="shop-sidebar">
            <div className="filter-group">
              <h4 onClick={() => toggleFilter('price')}>Price {activeFilters.price ? '▴' : '▾'}</h4>
              {activeFilters.price && (
                <div className="filter-options">
                   <label><input type="checkbox" checked={selectedPriceRanges.includes('under500')} onChange={() => togglePriceRange('under500')} /> Under ₹500</label>
                   <label><input type="checkbox" checked={selectedPriceRanges.includes('500-1000')} onChange={() => togglePriceRange('500-1000')} /> ₹500 - ₹1000</label>
                   <label><input type="checkbox" checked={selectedPriceRanges.includes('above1000')} onChange={() => togglePriceRange('above1000')} /> Above ₹1000</label>
                </div>
              )}
            </div>

            <div className="filter-group">
              <h4 onClick={() => toggleFilter('category')}>Category {activeFilters.category ? '▴' : '▾'}</h4>
              {activeFilters.category && (
                <div className="filter-options">
                   {["Idols", "Diyas", "Incense", "Pooja Essentials", "Pooja Kits"].map(c => (
                     <label key={c}>
                       <input type="radio" name="cat" checked={category === c} onChange={() => setCategory(c)} />
                       {c}
                     </label>
                   ))}
                   <label><input type="radio" name="cat" checked={category === "All"} onChange={() => setCategory("All")} /> All</label>
                </div>
              )}
            </div>

            <div className="filter-group">
              <h4 onClick={() => toggleFilter('pooja')}>Pooja {activeFilters.pooja ? '▴' : '▾'}</h4>
              {activeFilters.pooja && (
                <div className="filter-options">
                   <select className="pooja-select-sidebar" value={selectedFestival} onChange={(e) => setSelectedFestival(e.target.value)}>
                     {poojaFestivals.map(f => <option key={f} value={f}>{f}</option>)}
                   </select>
                </div>
              )}
            </div>
          </aside>

          <main className="shop-content">
            <div className="content-header">
              <h3>Results for "{search || category}" ({filteredProducts.length})</h3>
              <div className="sort-box">Sort by | <strong>{sortBy} ▾</strong></div>
            </div>

            <div className="shop-grid-new">
              {filteredProducts.map((product) => {
                const qty = cartMap[product.id] || 0;
                return (
                  <div className="walmart-card" key={product.id}>
                    <div className="card-image-wrap">
                      <img src={product.image.startsWith("http") ? product.image : `${API_URL}${product.image}`} alt={product.name} />
                      <button className={`wish-btn ${wishlist.includes(product.id) ? 'active' : ''}`} onClick={() => handleToggleWishlist(product.id)}>
                        {wishlist.includes(product.id) ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div className="card-add-area">
                      {qty === 0 ? (
                        <button className="add-btn-expandable" onClick={() => handleAddToCart(product)} disabled={addingProductId === product.id}>
                          {addingProductId === product.id ? '...' : '+ Add'}
                        </button>
                      ) : (
                        <div className="qty-selector-pill">
                          <button onClick={() => handleUpdateQuantity(product.id, qty - 1)}>−</button>
                          <span>{qty}</span>
                          <button onClick={() => handleUpdateQuantity(product.id, qty + 1)}>+</button>
                        </div>
                      )}
                    </div>

                    <div className="card-details">
                      <span className="sponsored-tag">{product.brand || "Sacred Item"} ⓘ</span>
                      <div className="card-price-row">
                        <span className="price-now">₹{Number(product.price).toLocaleString("en-IN")}</span>
                      </div>
                      <h4 className="card-name">{product.name}</h4>
                      <div className="card-rating">
                        <span className="stars">★★★★☆</span>
                        <span className="count">12</span>
                      </div>
                      <p className="shipping-info">Shipping, arrives <strong>Soon</strong></p>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="no-results">
                  <h4>No products match your filters.</h4>
                  <button className="pill-btn" onClick={() => { setCategory("All"); setSelectedPriceRanges([]); setSelectedBrands([]); setSearch(""); setSelectedFestival("All Festivals"); }}>Reset All Filters</button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />}
    </div>
  );
};

export default Shop;
