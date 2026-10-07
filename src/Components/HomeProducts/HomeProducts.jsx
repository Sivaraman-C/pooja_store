import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL, { bypassHeaders } from "../../apiConfig";
import LoginPopup from "../LoginPopup/LoginPopup";
import ProductModal from "../ProductModal/ProductModal";
import "./HomeProducts.css";

const getUserId = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    return user?.id || user?.user_id || null;
  } catch (error) {
    console.error("Unable to read the saved user session:", error);
    return null;
  }
};

const getProductImageUrl = (image) => {
  if (typeof image !== "string" || !image) return "";
  return image.startsWith("http") ? image : `${API_URL}${image}`;
};

const HomeProducts = () => {
  const [products, setProducts] = useState([]);
  const [cartMap, setCartMap] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`, {
          headers: { ...bypassHeaders },
        });
        if (!response.ok) {
          throw new Error(`Unable to load products (${response.status}).`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The products response was not a list.");
        }
        if (isMounted) setProducts(data);
      } catch (error) {
        console.error("Home products fetch error:", error);
        if (isMounted) setLoadError(error.message || "Unable to load products.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadCustomerData = async (userId) => {
      try {
        const [cartResponse, wishlistResponse] = await Promise.all([
          fetch(`${API_URL}/api/cart?user_id=${userId}`, {
            headers: { ...bypassHeaders },
          }),
          fetch(`${API_URL}/api/wishlist/${userId}`, {
            headers: { ...bypassHeaders },
          }),
        ]);

        if (!cartResponse.ok || !wishlistResponse.ok) {
          throw new Error("Unable to load your cart or wishlist.");
        }

        const [cartData, wishlistData] = await Promise.all([
          cartResponse.json(),
          wishlistResponse.json(),
        ]);

        if (isMounted && cartData.cart) {
          const mapping = {};
          cartData.cart.forEach((item) => {
            mapping[item.product_id] = item.quantity;
          });
          setCartMap(mapping);
        }
        if (isMounted && Array.isArray(wishlistData)) {
          setWishlist(wishlistData.map((item) => item.id));
        }
      } catch (error) {
        console.error("Home customer data fetch error:", error);
        if (isMounted) {
          setActionError("Your cart or wishlist could not be loaded. Please refresh and try again.");
        }
      }
    };

    loadProducts();
    const userId = getUserId();
    if (userId) loadCustomerData(userId);

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = async (product, quantity = 1) => {
    const userId = getUserId();
    if (!userId) {
      setShowLoginPopup(true);
      return;
    }

    setActionError("");
    setAddingProductId(product.id);
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity,
        }),
      });
      if (!response.ok) {
        throw new Error(`Unable to add ${product.name} to your cart (${response.status}).`);
      }

      setCartMap((current) => ({
        ...current,
        [product.id]: (current[product.id] || 0) + quantity,
      }));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Add to cart error:", error);
      setActionError(error.message || "Unable to add this product to your cart.");
    } finally {
      setAddingProductId(null);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    const userId = getUserId();
    if (!userId) {
      setShowLoginPopup(true);
      return;
    }

    setActionError("");
    try {
      const removing = newQuantity < 1;
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: removing ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify(
          removing
            ? { user_id: userId }
            : { user_id: userId, quantity: newQuantity }
        ),
      });
      if (!response.ok) {
        throw new Error(`Unable to update your cart (${response.status}).`);
      }

      setCartMap((current) => {
        const updated = { ...current };
        if (removing) delete updated[productId];
        else updated[productId] = newQuantity;
        return updated;
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Cart quantity update error:", error);
      setActionError(error.message || "Unable to update your cart.");
    }
  };

  const handleToggleWishlist = async (productId) => {
    const userId = getUserId();
    if (!userId) {
      setShowLoginPopup(true);
      return;
    }

    setActionError("");
    try {
      const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({ userId, productId }),
      });
      if (!response.ok) {
        throw new Error(`Unable to update your wishlist (${response.status}).`);
      }
      const data = await response.json();
      setWishlist((current) =>
        data.liked
          ? [...new Set([...current, productId])]
          : current.filter((id) => id !== productId)
      );
    } catch (error) {
      console.error("Wishlist update error:", error);
      setActionError(error.message || "Unable to update your wishlist.");
    }
  };

  return (
    <section className="home-products-section">
      <div className="home-products-container">
        <div className="home-products-header">
          <div>
            <p>SHOP THE COLLECTION</p>
            <h2>All Products</h2>
          </div>
          <Link to="/shop">Browse Shop →</Link>
        </div>

        {actionError && <p className="home-products-error" role="alert">{actionError}</p>}
        {loading ? (
          <p className="home-products-message">Loading products...</p>
        ) : loadError ? (
          <p className="home-products-message" role="alert">{loadError}</p>
        ) : products.length === 0 ? (
          <p className="home-products-message">No products are available right now.</p>
        ) : (
          <div className="home-products-grid">
            {products.map((product) => {
              const quantity = cartMap[product.id] || 0;
              const imageUrl = getProductImageUrl(product.image);
              const productWithImage = {
                ...product,
                image: typeof product.image === "string" ? product.image : "",
              };

              return (
                <article className="walmart-card" key={product.id}>
                  <div className="card-image-wrap">
                    <button
                      type="button"
                      className="home-products-image-button"
                      onClick={() => setSelectedProduct(productWithImage)}
                      aria-label={`View ${product.name}`}
                    >
                      <img src={imageUrl} alt="" />
                    </button>
                    <button
                      type="button"
                      className={`wish-btn ${wishlist.includes(product.id) ? "active" : ""}`}
                      aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      aria-pressed={wishlist.includes(product.id)}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleWishlist(product.id);
                      }}
                    >
                      {wishlist.includes(product.id) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div className="card-add-area">
                    {quantity === 0 ? (
                      <button
                        type="button"
                        className="add-btn-expandable"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingProductId === product.id}
                      >
                        {addingProductId === product.id ? "Adding..." : "+ Add"}
                      </button>
                    ) : (
                      <div className="qty-selector-pill" aria-label={`Quantity: ${quantity}`}>
                        <button type="button" aria-label="Remove one" onClick={() => handleUpdateQuantity(product.id, quantity - 1)}>−</button>
                        <span>{quantity}</span>
                        <button type="button" aria-label="Add one" onClick={() => handleUpdateQuantity(product.id, quantity + 1)}>+</button>
                      </div>
                    )}
                  </div>

                  <div className="card-details">
                    <span className="sponsored-tag">{product.brand || "Sacred Item"}</span>
                    <span className="price-now">₹{Number(product.price).toLocaleString("en-IN")}</span>
                    <h3
                      className="card-name"
                      onClick={() => setSelectedProduct(productWithImage)}
                    >
                      {product.name}
                    </h3>
                    <div className="card-rating">
                    <span className="stars">★★★★☆</span>
                    <span className="count">12</span>
                  </div>
                  <p className="shipping-info">Shipping, arrives <strong>Soon</strong></p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          allProducts={products}
        />
      )}
    </section>
  );
};

export default HomeProducts;