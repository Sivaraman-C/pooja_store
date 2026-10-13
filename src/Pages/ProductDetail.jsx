import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API_URL, { bypassHeaders } from "../apiConfig";
import ProductImageCarousel from "../Components/ProductImageCarousel/ProductImageCarousel";
import "./ProductDetail.css";

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [actionError, setActionError] = useState("");
  const [cartNotice, setCartNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`, {
          headers: { ...bypassHeaders },
        });
        if (!response.ok) {
          throw new Error(`Unable to load product details (${response.status}).`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The products response was not a list.");
        }
        if (isMounted) setProducts(data);
      } catch (error) {
        console.error("Product detail fetch error:", error);
        if (isMounted) setLoadError(error.message || "Unable to load this product.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setQuantity(1);
    setActionError("");
    setCartNotice("");
  }, [id]);

  const product = products.find((item) => String(item.id) === id);
  const productImages = useMemo(() => {
    if (!product) return [];

    let images = product.images;
    if (typeof images === "string") {
      try {
        images = JSON.parse(images);
      } catch {
        images = [];
      }
    }
    const imageList = Array.isArray(images) ? images : [];
    return [...new Set([product.image, ...imageList].map(getProductImageUrl).filter(Boolean))];
  }, [product]);
  const imageUrl = selectedImage || productImages[0] || "";
  const activeImageIndex = productImages.indexOf(imageUrl);
  const recommendations = useMemo(() => {
    if (!product) return [];

    const sameCategory = products.filter(
      (item) =>
        String(item.id) !== id &&
        String(item.category || "").toLowerCase() === String(product.category || "").toLowerCase()
    );
    const otherProducts = products.filter(
      (item) =>
        String(item.id) !== id &&
        String(item.category || "").toLowerCase() !== String(product.category || "").toLowerCase()
    );
    return { sameCategory, otherProducts };
  }, [id, product, products]);

  useEffect(() => {
    setSelectedImage("");
  }, [id]);

  const handleAddToCart = async (buyNow = false) => {
    const userId = getUserId();
    if (!userId) {
      navigate("/login");
      return;
    }

    setActionError("");
    setCartNotice("");
    setAddingToCart(true);
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

      window.dispatchEvent(new Event("cartUpdated"));
      if (buyNow) {
        navigate("/checkout");
      } else {
        setCartNotice(`${product.name} added to your cart.`);
      }
    } catch (error) {
      console.error("Product detail add to cart error:", error);
      setActionError(error.message || "Unable to add this product to your cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const changeProductImage = (direction) => {
    if (productImages.length < 2) return;
    const nextIndex =
      (activeImageIndex + direction + productImages.length) % productImages.length;
    setSelectedImage(productImages[nextIndex]);
  };

  if (loading) {
    return <main className="product-detail-page"><p className="product-detail-message">Loading product...</p></main>;
  }

  if (loadError || !product) {
    return (
      <main className="product-detail-page">
        <p className="product-detail-message" role="alert">
          {loadError || "This product could not be found."}
        </p>
        <Link className="product-detail-back-link" to="/shop">Back to shop</Link>
      </main>
    );
  }

  const renderProductRow = (items) => (
    <div className="product-detail-product-row">
      {items.map((item) => (
        <div className="product-detail-related-card" key={item.id}>
          <div className="product-detail-related-image">
            <ProductImageCarousel product={item} />
          </div>
          <h3><Link to={`/product/${item.id}`}>{item.name}</Link></h3>
          <p>₹{Number(item.price).toLocaleString("en-IN")}</p>
        </div>
      ))}
    </div>
  );
  const searchTerms = [...new Set(
    `${product.name} ${product.category || ""} ${product.brand || ""}`
      .split(/[\s,]+/)
      .filter((term) => term.length > 3)
  )].slice(0, 8);

  return (
    <main className="product-detail-page">
      {recommendations.sameCategory.length > 0 && (
        <section className="product-detail-top-recommendations">
          <div className="product-detail-section-heading">
            <div>
              <p>EXPLORE THE COLLECTION</p>
              <h2>Similar products</h2>
            </div>
            <Link to="/shop">See all <span aria-hidden="true">→</span></Link>
          </div>
          {renderProductRow(recommendations.sameCategory.slice(0, 7))}
        </section>
      )}

      <nav className="product-detail-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop">Shop</Link>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <span>{product.category}</span>
          </>
        )}
      </nav>

      <section className="product-detail-layout">
        <div className="product-detail-gallery">
          <div className="product-detail-thumbnails" aria-label="Product images">
            {productImages.length > 0 ? productImages.map((image, index) => (
              <button
                type="button"
                className={`product-detail-thumbnail ${image === imageUrl ? "active" : ""}`}
                key={image}
                onClick={() => setSelectedImage(image)}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={image === imageUrl}
              >
                <img src={image} alt="" />
              </button>
            )) : (
              <div className="product-detail-thumbnail-placeholder">No image</div>
            )}
          </div>
          <div className="product-detail-image">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} />
            ) : (
              <div className="product-detail-image-placeholder">Image unavailable</div>
            )}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="product-detail-image-arrow previous"
                  onClick={() => changeProductImage(-1)}
                  aria-label="Previous product image"
                >‹</button>
                <button
                  type="button"
                  className="product-detail-image-arrow next"
                  onClick={() => changeProductImage(1)}
                  aria-label="Next product image"
                >›</button>
              </>
            )}
          </div>
        </div>

        <div className="product-detail-info">
          {product.brand && <p className="product-detail-brand">{product.brand}</p>}
          <h1>{product.name}</h1>
          <p className="product-detail-category">{product.category || "Pooja essentials"}</p>
          <div className="product-detail-price-row">
            <p className="product-detail-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
            <span>Inclusive of all taxes</span>
          </div>

          <div className="product-detail-actions">
            <div className="product-detail-quantity" aria-label="Select quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >−</button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((current) => current + 1)}
              >+</button>
            </div>
            <button
              type="button"
              className="product-detail-add-button"
              onClick={() => handleAddToCart()}
              disabled={addingToCart}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>
          <button
            type="button"
            className="product-detail-buy-button"
            onClick={() => handleAddToCart(true)}
            disabled={addingToCart}
          >
            Buy Now
          </button>

          {actionError && <p className="product-detail-feedback error" role="alert">{actionError}</p>}
          {cartNotice && <p className="product-detail-feedback success" role="status">{cartNotice}</p>}

          <section className="product-detail-accordion">
            <h2>Delivery and returns</h2>
            <p><span aria-hidden="true">▣</span> Delivery details are shown during checkout.</p>
            <p><span aria-hidden="true">↺</span> For help with your order, contact our support team.</p>
          </section>

          <section className="product-detail-accordion">
            <h2>About this product</h2>
            <p>{product.description || "Product details will be added soon."}</p>
            <div className="product-detail-highlights">
              <span><b>✦</b> Category: {product.category || "Pooja essentials"}</span>
              {product.brand && <span><b>✦</b> Brand: {product.brand}</span>}
              {product.stock !== undefined && <span><b>✦</b> Availability: {Number(product.stock) > 0 ? "In stock" : "Currently unavailable"}</span>}
            </div>
          </section>
        </div>
      </section>

      {searchTerms.length > 0 && (
        <section className="product-detail-searches">
          <h2>Explore related searches</h2>
          <div className="product-detail-chips">
            {searchTerms.map((term) => (
              <Link to={`/shop?search=${encodeURIComponent(term)}`} key={term}>{term}</Link>
            ))}
          </div>
        </section>
      )}

      <section className="product-detail-review-prompt">
        <span className="product-detail-review-star" aria-hidden="true">☆</span>
        <div>
          <h2>Have you tried this product?</h2>
          <p>We’d love to hear about your experience. Reviews are coming soon.</p>
        </div>
      </section>

      {product.brand && (
        <section className="product-detail-brand-panel">
          <div className="product-detail-brand-mark" aria-hidden="true">{product.brand.slice(0, 1).toUpperCase()}</div>
          <div>
            <p>FROM THE BRAND</p>
            <h2>{product.brand}</h2>
            <span>Explore more products from this brand.</span>
          </div>
          <Link to={`/shop?search=${encodeURIComponent(product.brand)}`}>View collection</Link>
        </section>
      )}

      {recommendations.sameCategory.length > 0 && (
        <section className="product-detail-recommendations">
          <div className="product-detail-section-heading">
            <div>
              <p>MORE TO DISCOVER</p>
              <h2>More from {product.category || "this collection"}</h2>
            </div>
            <Link to={`/shop?search=${encodeURIComponent(product.category || "")}`}>See more <span aria-hidden="true">→</span></Link>
          </div>
          {renderProductRow(recommendations.sameCategory.slice(0, 6))}
        </section>
      )}

      {recommendations.otherProducts.length > 0 && (
        <section className="product-detail-recommendations">
          <div className="product-detail-section-heading">
            <div>
              <p>HANDPICKED FOR YOU</p>
              <h2>You may also like</h2>
            </div>
            <Link to="/shop">Browse shop <span aria-hidden="true">→</span></Link>
          </div>
          {renderProductRow(recommendations.otherProducts.slice(0, 6))}
        </section>
      )}
    </main>
  );
};

export default ProductDetail;
