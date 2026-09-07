import React, { useEffect, useState } from "react";
import { Share } from "@capacitor/share";
import "./Shop.css";

import LoginPopup from "../Components/LoginPopup/LoginPopup";

import API_URL from "../apiConfig";

const poojaFestivals = [
  "All Festivals", "Pongal", "Makara Sankranti", "Vasant Panchami",
  "Maha Shivaratri", "Holi", "Ugadi", "Gudi Padwa", "Chaitra Navratri",
  "Rama Navami", "Tamil New Year", "Vishu", "Akshaya Tritiya",
  "Buddha Purnima", "Nirjala Ekadashi", "Jagannath Rath Yatra", "Guru Purnima",
  "Hariyali Teej", "Nag Panchami", "Onam", "Varalakshmi Vrat", "Raksha Bandhan",
  "Janmashtami", "Ganesh Chaturthi", "Sharad Navratri", "Dussehra", "Diwali",
  "Govardhan Puja", "Bhai Dooj", "Vaikuntha Ekadashi",
];

const festivalKeywords = {
  Pongal: ["pongal", "rice", "sugarcane"],
  "Makara Sankranti": ["sankranti", "sesame", "til", "kite"],
  "Vasant Panchami": ["saraswati", "yellow"],
  "Maha Shivaratri": ["shiva", "shiv", "bilva", "rudraksha"],
  Holi: ["holi", "colour", "color", "gulal"],
  Ugadi: ["ugadi", "neem", "mango"],
  "Gudi Padwa": ["gudi", "neem", "mango"],
  "Chaitra Navratri": ["navratri", "durga"],
  "Rama Navami": ["rama", "ram"],
  "Tamil New Year": ["tamil", "puthandu"],
  Vishu: ["vishu", "kanikonna"],
  "Akshaya Tritiya": ["akshaya", "lakshmi"],
  "Buddha Purnima": ["buddha", "lotus"],
  "Nirjala Ekadashi": ["ekadashi", "vishnu"],
  "Jagannath Rath Yatra": ["jagannath", "rath yatra"],
  "Guru Purnima": ["guru", "chandan"],
  "Hariyali Teej": ["teej", "mehndi"],
  "Nag Panchami": ["nag panchami", "naga"],
  Onam: ["onam", "pookalam"],
  "Varalakshmi Vrat": ["varalakshmi", "lakshmi"],
  "Raksha Bandhan": ["raksha", "rakhi", "bandhan"],
  Janmashtami: ["janmashtami", "krishna"],
  "Ganesh Chaturthi": ["ganesh", "ganesha", "modak"],
  "Sharad Navratri": ["navratri", "durga"],
  Dussehra: ["dussehra", "rama", "ram"],
  Diwali: ["diwali", "deepavali", "lakshmi"],
  "Govardhan Puja": ["govardhan", "krishna"],
  "Bhai Dooj": ["bhai dooj", "dooj", "tilak"],
  "Vaikuntha Ekadashi": ["vaikuntha", "ekadashi", "vishnu"],
};

const Shop = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");

  const [search, setSearch] = useState("");
  const [isListening, setIsListening] = useState(false);

  const [selectedFestival, setSelectedFestival] =
    useState("All Festivals");

  const [showLoginPopup, setShowLoginPopup] =
    useState(false);

  const [addingProductId, setAddingProductId] =
    useState(null);

  // =====================================================
  // CART COUNT
  // =====================================================
  const [selectedProduct, setSelectedProduct] =
  useState(null);

  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(user);

      return parsedUser;

    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );

      localStorage.removeItem("user");

      return null;
    }
  };

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const user = getLoggedInUser();

    if (!user) {
      return null;
    }

    // Supports both id and user_id
    return user.id || user.user_id || null;
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported on this device.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const query = event.results[0][0].transcript;
      setSearch(query);
    };
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access in your browser settings.");
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        alert(`Voice search error: ${event.error}`);
      }
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // =====================================================
  // GET CATEGORY FROM URL
  // =====================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const urlCategory =
      params.get("category");

    const urlSearch = params.get("search");

    if (urlCategory) {
      setCategory(urlCategory);
    } else {
      setCategory("All");
    }

    if (urlSearch) {
      setSearch(urlSearch);
    }
  }, []);

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data =
          await response.json();

        console.log(
          "Products from database:",
          data
        );

        setProducts(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {
        console.error(
          "Shop products error:",
          error
        );

        setError(
          "Unable to load products"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, []);

  // =====================================================
  // FETCH CART COUNT
  // =====================================================

  const fetchCartCount = async (userId) => {
    if (!userId) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/cart?user_id=${userId}`
      );

      const data =
        await response.json();

      console.log(
        "Cart response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to fetch cart"
        );
      }

      const cart =
        Array.isArray(data.cart)
          ? data.cart
          : [];

      // Total quantity
      const totalQuantity =
        cart.reduce(
          (total, item) =>
            total +
            Number(
              item.quantity || 0
            ),
          0
        );

      setCartCount(
        totalQuantity
      );

    } catch (error) {
      console.error(
        "Fetch cart count error:",
        error
      );

      setCartCount(0);
    }
  };

  // =====================================================
  // FETCH WISHLIST
  // =====================================================

  const fetchWishlist = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setWishlist(Array.isArray(data) ? data.map(item => item.id) : []);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    }
  };

  const handleToggleWishlist = async (productId) => {
    const userId = getUserId();
    if (!userId) {
      setShowLoginPopup(true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.liked) {
          setWishlist(prev => [...prev, productId]);
        } else {
          setWishlist(prev => prev.filter(id => id !== productId));
        }
      }
    } catch (error) {
      console.error("Toggle wishlist error:", error);
    }
  };

  const handleShareProduct = async (product) => {
    try {
      const shareUrl = `${window.location.origin}/shop?search=${encodeURIComponent(product.name)}`;

      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        await Share.share({
          title: product.name,
          text: `Check out this ${product.name} at Devaloka!`,
          url: shareUrl,
          dialogTitle: 'Share this product',
        });
      } else if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out this ${product.name} at Devaloka!`,
          url: shareUrl,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert("Product link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // =====================================================
  // LOAD CART COUNT WHEN USER LOGS IN
  // =====================================================

  useEffect(() => {
    const userId =
      getUserId();

    if (userId) {
      fetchCartCount(userId);
      fetchWishlist(userId);
    } else {
      setCartCount(0);
      setWishlist([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // CATEGORY FILTER
  // =====================================================

  const filteredProducts =
    products.filter((product) => {
      const productCategory =
        String(
          product.category || ""
        )
          .toLowerCase()
          .trim();

      const productName =
        String(
          product.name || ""
        ).toLowerCase();

      const productDescription = String(
        product.description || ""
      ).toLowerCase();

      const searchText =
        search
          .toLowerCase()
          .trim();

      let categoryMatch = true;

      if (category !== "All") {
        if (
          category ===
          "Idols & Murtis"
        ) {
          categoryMatch =
            productCategory.includes(
              "idol"
            ) ||
            productCategory.includes(
              "murti"
            ) ||
            productCategory.includes(
              "statue"
            ) ||
            productCategory.includes(
              "god"
            );
        }

        else if (
          category ===
          "Diyas & Lamps"
        ) {
          categoryMatch =
            productCategory.includes(
              "diya"
            ) ||
            productCategory.includes(
              "lamp"
            );
        }

        else if (
          category ===
          "Incense"
        ) {
          categoryMatch =
            productCategory.includes(
              "incense"
            ) ||
            productCategory.includes(
              "agarbatti"
            );
        }

        else if (
          category ===
          "Essentials"
        ) {
          categoryMatch =
            productCategory.includes(
              "essential"
            );
        }
      }

      const searchMatch =
        productName.includes(
          searchText
        ) ||
        productCategory.includes(
          searchText
        );

      const festivalMatch =
        selectedFestival === "All Festivals" ||
        (festivalKeywords[selectedFestival] || []).some(
          (keyword) =>
            `${productName} ${productCategory} ${productDescription}`
              .includes(keyword)
        );

      return (
        categoryMatch &&
        searchMatch &&
        festivalMatch
      );
    });

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "/logo.svg";
    }

    if (
      image.startsWith("http")
    ) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  // =====================================================
  // PRICE
  // =====================================================

  const formatPrice = (price) => {
    return `₹${Number(
      price || 0
    ).toLocaleString("en-IN")}`;
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async (
  product = selectedProduct
) => {
  console.log("Add to cart:", product);

  const user = getLoggedInUser();

  if (!user) {
    setShowLoginPopup(true);
    return;
  }

  const userId =
    user.id ||
    user.user_id;

  if (!userId) {
    console.error(
      "Logged-in user does not have an ID:",
      user
    );

    localStorage.removeItem("user");

    setShowLoginPopup(true);

    return;
  }

  try {
    setAddingProductId(product.id);

    const response = await fetch(
      `${API_URL}/api/cart`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity: quantity,
        }),
      }
    );

    const data =
      await response.json();

    console.log(
      "Add cart API response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Failed to add product to cart"
      );
    }

    await fetchCartCount(userId);
    window.dispatchEvent(new Event("cartUpdated"));

    // Close popup
    setSelectedProduct(null);

    // Reset quantity
    setQuantity(1);

    alert(
      `${product.name} added to cart`
    );

  } catch (error) {
    console.error(
      "Add to cart error:",
      error
    );

    alert(
      error.message ||
      "Unable to add product to cart"
    );

  } finally {
    setAddingProductId(null);
  }
};

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="shop-page">

      <div className="shop-container">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="shop-header">

          <div className="shop-title">

            <p>SHOP</p>

            <h1>
              {category === "All"
                ? "All Products"
                : category}
            </h1>

          </div>


          {/* SEARCH */}

          <div className="shop-search">

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              className={`voice-search-button${isListening ? " listening" : ""}`}
              onClick={handleVoiceSearch}
              aria-label={isListening ? "Listening" : "Search by voice"}
              title={isListening ? "Listening" : "Search by voice"}
            >
              {isListening ? "●" : "🎙"}
            </button>

            <button>
              Search
            </button>

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================== */}

        <div className="shop-toolbar">

          <div className="category-filters">

            {[
              "All",
              "Idols & Murtis",
              "Diyas & Lamps",
              "Incense",
              "Essentials",
            ].map((item) => (

              <button
                key={item}

                className={
                  category === item
                    ? "active"
                    : ""
                }

                onClick={() => {
                  setCategory(item);

                  if (
                    item === "All"
                  ) {
                    window.history.pushState(
                      {},
                      "",
                      "/shop"
                    );
                  } else {
                    window.history.pushState(
                      {},
                      "",
                      `/shop?category=${encodeURIComponent(
                        item
                      )}`
                    );
                  }
                }}
              >
                {item}
              </button>

            ))}

          </div>

          <div className="pooja-filter">
            <label htmlFor="pooja-festival">Pooja</label>
            <select
              id="pooja-festival"
              value={selectedFestival}
              onChange={(e) => setSelectedFestival(e.target.value)}
            >
              {poojaFestivals.map((festival) => (
                <option key={festival} value={festival}>
                  {festival}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="shop-message">
            <p>
              Loading products...
            </p>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================== */}

        {!loading &&
          error && (
            <div className="shop-message error">
              <p>
                {error}
              </p>
            </div>
          )}

        {/* =================================================
            PRODUCTS
        ================================================== */}

        {!loading &&
          !error && (

            <div className="shop-grid">

              {filteredProducts.length >
              0 ? (

                filteredProducts.map(
                  (product) => (

                    <div
                      className="shop-product-card"
                      key={product.id}
                    >

                      {/* IMAGE */}

                      <div className="shop-product-image">
                        <img
                          src={getImageUrl(
                            product.image
                          )}
                          alt={
                            product.name
                          }
                        />

                        <div className="product-card-actions">
                          <button
                            className={`action-btn heart-btn ${wishlist.includes(product.id) ? "active" : ""}`}
                            onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product.id); }}
                          >
                            {wishlist.includes(product.id) ? "❤️" : "🤍"}
                          </button>
                          <button
                            className="action-btn share-btn"
                            onClick={(e) => { e.stopPropagation(); handleShareProduct(product); }}
                          >
                            📤
                          </button>
                        </div>
                      </div>

                      {/* INFO */}

                      <div className="shop-product-info">

                        <span className="shop-product-category">

                          {String(
                            product.category ||
                            ""
                          ).toUpperCase()}

                        </span>

                        <h3>
                          {product.name}
                        </h3>

                        <div className="shop-product-bottom">

                          <span className="shop-product-price">

                            {formatPrice(
                              product.price
                            )}

                          </span>

<button
  className="shop-add-button"
  onClick={() => {
    const user = getLoggedInUser();

    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    setSelectedProduct(product);
    setQuantity(1);
  }}
>
  <span>▣</span>
  Add
</button>

                        </div>

                      </div>

                    </div>

                  )
                )

              ) : (

                <div className="no-products">

                  <h3>
                    No products found
                  </h3>

                  <p>
                    Try another category
                    or search term.
                  </p>

                </div>

              )}

            </div>

          )}

      </div>

{/* =================================================
    ADD TO CART POPUP
================================================= */}

{selectedProduct && (
  <div
    className="cart-popup-overlay"
    onClick={() =>
      setSelectedProduct(null)
    }
  >
    <div
      className="cart-popup"
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      {/* CLOSE */}

      <button
        className="cart-popup-close"
        onClick={() => {
          setSelectedProduct(null);
          setQuantity(1);
        }}
      >
        ×
      </button>

      {/* IMAGE */}

      <div className="cart-popup-image">
        <img
          src={getImageUrl(
            selectedProduct.image
          )}
          alt={selectedProduct.name}
        />
      </div>

      {/* PRODUCT */}

      <div className="cart-popup-content">

        <span className="cart-popup-category">
          {selectedProduct.category}
        </span>

        <h2>
          {selectedProduct.name}
        </h2>

        <p className="cart-popup-price">
          {formatPrice(
            selectedProduct.price
          )}
        </p>

        {/* QUANTITY */}

        <div className="quantity-section">

          <label>
            Quantity
          </label>

          <div className="quantity-control">

            <button
              onClick={() =>
                setQuantity(
                  Math.max(
                    1,
                    quantity - 1
                  )
                )
              }
            >
              −
            </button>

            <span>
              {quantity}
            </span>

            <button
              onClick={() => {
                const stock =
                  Number(
                    selectedProduct.stock || 0
                  );

                if (
                  stock > 0 &&
                  quantity >= stock
                ) {
                  alert(
                    `Only ${stock} item(s) available`
                  );
                  return;
                }

                setQuantity(
                  quantity + 1
                );
              }}
            >
              +
            </button>

          </div>

        </div>

        {/* TOTAL */}

        <div className="popup-total">

          <span>
            Total
          </span>

          <strong>
            {formatPrice(
              Number(
                selectedProduct.price
              ) * quantity
            )}
          </strong>

        </div>

        {/* ADD */}

        <button
          className="popup-add-cart-button"
          disabled={
            addingProductId ===
            selectedProduct.id
          }
          onClick={() =>
            handleAddToCart(
              selectedProduct
            )
          }
        >
          {addingProductId ===
          selectedProduct.id
            ? "Adding..."
            : "Add to Cart"}
        </button>

      </div>

    </div>
  </div>
)}

      {/* =================================================
          LOGIN POPUP
      ================================================== */}

      {showLoginPopup && (

        <LoginPopup
          onClose={() =>
            setShowLoginPopup(false)
          }
        />

      )}

    </section>
  );
};

export default Shop;