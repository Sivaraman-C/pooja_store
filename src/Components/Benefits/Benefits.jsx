import React from "react";
import "./Benefits.css";

const Benefits = () => {
  return (
    <section className="benefits">
      <div className="benefits-container">

        {/* Card 1 */}
        <div className="benefit-card">
          <div className="benefit-icon">✧</div>

          <h3>Ethically Sourced</h3>

          <p>
            From artisan families across Varanasi, Jaipur and Moradabad.
          </p>
        </div>

        {/* Card 2 */}
        <div className="benefit-card">
          <div className="benefit-icon">♨</div>

          <h3>Blessed &amp; Ready</h3>

          <p>
            Every idol is energized before shipping. Pure, sacred, ready to install.
          </p>
        </div>

        {/* Card 3 */}
        <div className="benefit-card">
          <div className="benefit-icon">♧</div>

          <h3>Natural &amp; Pure</h3>

          <p>
            Only pure ingredients — brass, sandalwood, cotton wicks, camphor.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Benefits;