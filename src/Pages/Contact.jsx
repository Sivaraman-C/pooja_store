import React, { useState } from "react";

import "./Contact.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className="contact-page">
      <div className="contact-container">
        <section className="contact-heading">
          <p className="contact-eyebrow">WE ARE HERE TO HELP</p>
          <h1>Let’s talk.</h1>
          <p>Questions about an order, a product, or choosing something for a special occasion? Send us a note.</p>
        </section>

        <section className="contact-layout">
          <div className="contact-details">
            <div className="contact-detail">
              <span>Email</span>
              <a href="mailto:hello@devaloka.in">hello@devaloka.in</a>
            </div>
            <div className="contact-detail">
              <span>Phone</span>
              <a href="tel:+918754060365">+91 87540 60365</a>
            </div>
            <div className="contact-detail">
              <span>Hours</span>
              <p>Monday – Saturday<br />10:00 AM – 6:00 PM IST</p>
            </div>
            <div className="contact-detail">
              <span>Follow along</span>
              <p>@devaloka.store</p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <label>Full name<input name="name" value={form.name} onChange={handleChange} required /></label>
            <label>Email address<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
            <label>How can we help?<textarea name="message" rows="6" value={form.message} onChange={handleChange} required /></label>
            <button type="submit">Send message <span>→</span></button>
            {submitted && <p className="contact-success" role="status">Thanks for reaching out. We’ll get back to you soon.</p>}
          </form>
        </section>
      </div>
    </main>
  );
};

export default Contact;