import React from "react";
import { Link } from "react-router-dom";
import "./PoojaGuide.css";

import Idols from "../Assets/idols.jpeg";
import Diyas from "../Assets/diyas.jpeg";
import Diwali from "../Assets/diwali.jpg";

const guideItems = [
  {
    title: "How to do Ganesha Puja",
    subtitle: "Step by step guide",
    image: Idols,
    link: "/calendar",
  },
  {
    title: "Diwali Lakshmi Puja",
    subtitle: "Complete procedure",
    image: Diyas,
    link: "/calendar",
  },
  {
    title: "Navratri Puja Guide",
    subtitle: "Day wise rituals",
    image: Diwali,
    link: "/calendar",
  },
];

const PoojaGuide = () => {
  return (
    <section className="pooja-guide-section">
      <div className="pooja-guide-container">
        <div className="pooja-guide-header">
          <div className="pooja-guide-titles">
            <h2>Pooja Guide</h2>
            <p>Learn the right way to perform your pooja</p>
          </div>
          <Link to="/calendar" className="pooja-guide-view-all">
            View All →
          </Link>
        </div>

        <div className="pooja-guide-grid">
          {guideItems.map((item, index) => (
            <Link key={index} to={item.link} className="pooja-guide-card">
              <div className="pooja-guide-image-wrap">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="pooja-guide-card-content">
                <h4>{item.title}</h4>
                <div className="pooja-guide-sub-row">
                  <span>{item.subtitle}</span>
                  <span className="pooja-guide-arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PoojaGuide;
