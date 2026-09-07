import React from "react";
import { Link } from "react-router-dom";
import AboutImage from "../Components/Assets/about.jpg";

import "./About.css";

const About = () => {
  return (
    <main className="about-page">
      <section className="about-intro">
        <div className="about-intro-copy">
          <p className="about-eyebrow">THE DEVALOKA STORY</p>
          <h1>Make room for the sacred.</h1>
          <p className="about-lead">
            Devaloka brings thoughtful pooja essentials into everyday homes,
            making it easier to create a meaningful ritual wherever you are.
          </p>
        </div>
        <div className="about-intro-image">
          <img src={AboutImage} alt="Pooja items arranged for a home ritual" />
        </div>
      </section>

      <section className="about-story">
        <div>
          <p className="about-eyebrow">OUR APPROACH</p>
          <h2>Tradition, made personal.</h2>
        </div>
        <div className="about-story-copy">
          <p>
            A ritual can be a quiet morning, a festival shared with family, or
            a few grateful minutes at the end of a long day. We curate reliable,
            beautiful essentials that respect the traditions behind them.
          </p>
          <p>
            From lamps and incense to ready-to-use pooja kits, every piece is
            selected to feel at home in modern spaces while staying connected to
            where it comes from.
          </p>
        </div>
      </section>

      <section className="about-values">
        <article>
          <span>01</span>
          <h2>Authentic essentials</h2>
          <p>Familiar, dependable pieces for daily worship and special days.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Considered curation</h2>
          <p>A calm collection chosen to make finding the right item simple.</p>
        </article>
        <article>
          <span>03</span>
          <h2>For every home</h2>
          <p>Small rituals and celebrations deserve the same care and attention.</p>
        </article>
      </section>

      <section className="about-cta">
        <p className="about-eyebrow">BEGIN YOUR RITUAL</p>
        <h2>Find something meaningful.</h2>
        <Link to="/shop">Explore the collection <span>→</span></Link>
      </section>
    </main>
  );
};

export default About;