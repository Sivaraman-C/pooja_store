import React, { useEffect, useState } from "react";
import { Share } from "@capacitor/share";
import "./Featured.css";

import LoginPopup from "../LoginPopup/LoginPopup";

import API_URL from "../../apiConfig";

const Featured = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // Login popup
  const [showLoginPopup, setShowLoginPopup] = useState(false);


  useEffect(() => {

    const fetchFeaturedProducts = async () => {

      try {

        const response = await fetch(`${API_URL}/api/products/featured`);

        if (!response.ok) {
          throw new Error(
            "Failed to fetch featured products"
          );
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data) ? data : []
        );

      } catch (error) {

        console.error(
          "Featured products error:",
          error
        );

        setError(
          "Unable to load featured products"
        );

      } finally {

        setLoading(false);

      }

    };

    fetchFeaturedProducts();

    const user = JSON.parse(localStorage.getItem("user"));
    if (user && (user.id || user.user_id)) {
      fetchWishlist(user.id || user.user_id);
    }

  }, []);

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
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    const userId = user.id || user.user_id;

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


  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (product) => {

    // Check login
    const user = localStorage.getItem("user");

    // Not logged in
    if (!user) {

      setShowLoginPopup(true);

      return;
    }


    let currentUser;

    try {
      currentUser = JSON.parse(user);
    } catch (error) {
      setShowLoginPopup(true);
      return;
    }

    const userId = currentUser.id || currentUser.user_id;

    if (!userId) {
      setShowLoginPopup(true);
      return;
    }

    fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: product.id,
        quantity: 1,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add product to cart");
        }
      })
      .then(() => {
        window.dispatchEvent(new Event("cartUpdated"));
        alert(`${product.name} added to cart`);
      })
      .catch((error) => {
        console.error("Add to cart error:", error);
        alert(error.message || "Unable to add product to cart");
      });

  };


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <section className="featured-section">

        <div className="featured-container">

          <div className="featured-heading">

            <p>HANDPICKED</p>

            <h2>
              Featured this week
            </h2>

          </div>

          <p>
            Loading products...
          </p>

        </div>

      </section>
    );

  }


  // =========================
  // ERROR
  // =========================

  if (error) {

    return (
      <section className="featured-section">

        <div className="featured-container">

          <div className="featured-heading">

            <p>HANDPICKED</p>

            <h2>
              Featured this week
            </h2>

          </div>

          <p className="product-error">
            {error}
          </p>

        </div>

      </section>
    );

  }


  const getImageUrl = (image) => {
    if (!image) return "/logo.svg";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
  };

  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (

    <section className="featured-section">

      <div className="featured-container">


        {/* =========================
            HEADING
        ========================== */}

        <div className="featured-heading">

          <p>HANDPICKED ({products.length})</p>

          <h2>
            Featured this week
          </h2>

        </div>


        {/* =========================
            PRODUCTS
        ========================== */}

        <div className="featured-grid">

          {products.length === 0 ? (

            <p>
              No featured products available.
            </p>

          ) : (

            displayedProducts.map((product) => (

              <div
                className="product-card"
                key={product.id}
              >


                {/* IMAGE */}

                <div className="product-image">

                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
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

                <div className="product-info">


                  {/* CATEGORY */}

                  <span className="product-category">

                    {product.category}

                  </span>


                  {/* NAME */}

                  <h3>

                    {product.name}

                  </h3>


                  {/* PRICE + ADD */}

                  <div className="product-bottom">

                    <span className="product-price">

                      ₹
                      {Number(
                        product.price
                      ).toLocaleString("en-IN")}

                    </span>


                    <button
                      className="add-button"
                      onClick={() =>
                        handleAddToCart(product)
                      }
                    >

                      <span className="cart-small">
                        ▣
                      </span>

                      Add

                    </button>

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

        {products.length > 4 && (
          <div className="featured-know-more">
            <button
              className="know-more-btn"
              onClick={() => setShowAll(!showAll)}
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              {showAll ? "Know Less ↵" : "Know More ➔"}
            </button>
          </div>
        )}

      </div>


      {/* =========================
          LOGIN POPUP
      ========================== */}

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

export default Featured;
