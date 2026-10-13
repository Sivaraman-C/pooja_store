import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../../apiConfig";
import "./ProductImageCarousel.css";

const ProductImageCarousel = ({ product, className = "", alt }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];

    let additionalImages = product.images;
    if (typeof additionalImages === "string") {
      try {
        additionalImages = JSON.parse(additionalImages);
      } catch {
        additionalImages = [];
      }
    }

    const imagePaths = [
      product.image,
      ...(Array.isArray(additionalImages) ? additionalImages : []),
    ].filter((image) => typeof image === "string" && image);
    const urls = imagePaths.map((image) =>
      image.startsWith("http") ? image : `${API_URL}${image}`
    );
    return [...new Set(urls)];
  }, [product]);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  if (!product || images.length === 0) return null;

  const showNextImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((current) => (current + 1) % images.length);
  };

  const showPreviousImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  return (
    <div className={`product-image-carousel ${className}`}>
      <Link
        to={`/product/${product.id}`}
        className="product-image-carousel-link"
        aria-label={`View ${product.name}`}
      >
        <img src={images[activeIndex]} alt={alt || product.name} />
      </Link>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="product-image-carousel-arrow previous"
            onClick={showPreviousImage}
            aria-label={`Previous image of ${product.name}`}
          >
            ‹
          </button>
          <button
            type="button"
            className="product-image-carousel-arrow next"
            onClick={showNextImage}
            aria-label={`Next image of ${product.name}`}
          >
            ›
          </button>
          <div className="product-image-carousel-dots" aria-label="Product image position">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={index === activeIndex ? "active" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                aria-label={`Show image ${index + 1} of ${product.name}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductImageCarousel;
