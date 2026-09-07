import React from "react";
import { Link } from "react-router-dom";
import "./RelatedContent.css";
import PoojaKit from "../Assets/pooja-kit.png";
import AboutImage from "../Assets/about.jpg";
import Diwali from "../Assets/diwali.jpg";

const relatedLinks = [
  {
    label: "OUR COLLECTION",
    title: "Find something meaningful",
    text: "Explore sacred pieces selected to bring warmth and intention to every home.",
    action: "Browse the collection",
    to: "/shop",
    image: PoojaKit,
    imageAlt: "Pooja essentials",
  },
  {
    label: "OUR STORY",
    title: "Made for your rituals",
    text: "Learn more about the care and thought behind the products we bring together.",
    action: "Discover our story",
    to: "/about",
    image: AboutImage,
    imageAlt: "Pooja Store collection",
  },
  {
    label: "NEED HELP?",
    title: "We are here for you",
    text: "Have a question about an item or an order? Our team would love to help.",
    action: "Get in touch",
    to: "/contact",
    image: Diwali,
    imageAlt: "Festival prayer setting",
  },
];

const RelatedContent = () => {
  return (
    <section className="related-content-section">
      <div className="related-content-container">
        <div className="related-content-heading">
          <p>KEEP EXPLORING</p>
          <h2>More to discover</h2>
        </div>

        <div className="related-content-grid">
          {relatedLinks.map((item, index) => (
            <article className="related-content-card" key={item.to}>
              <div className="related-content-card-top">
                <p>{item.label}</p>
                <span className="related-content-number">0{index + 1}</span>
              </div>
              <div className="related-content-image">
                <img src={item.image} alt={item.imageAlt} />
              </div>
              <h3>{item.title}</h3>
              <span>{item.text}</span>
              <Link to={item.to}>
                {item.action}
                <b>&rarr;</b>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedContent;
