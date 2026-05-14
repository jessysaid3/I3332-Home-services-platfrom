import React, { useState } from "react";
import "../styles/Contact.css";

function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="contact-container">
      <h2>Contact us</h2>
      <p className="contact-lead">
        Questions about bookings or becoming a provider? Send a message—we typically reply within one business day.
      </p>

      <div className="contact-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          {sent ? (
            <p className="contact-success" role="status">
              Thanks! Your message has been recorded. In a full deployment this would email support@homeserve.com.
            </p>
          ) : (
            <>
              <input type="text" name="name" placeholder="Your name" required autoComplete="name" />
              <input type="email" name="email" placeholder="Your email" required autoComplete="email" />
              <textarea name="message" placeholder="Your message" rows="5" required />
              <button type="submit">Send message</button>
            </>
          )}
        </form>

        <aside className="contact-info">
          <h3>We’re here to help</h3>
          <p>
            <strong>Email:</strong> support@homeserve.com
          </p>
          <p>
            <strong>Phone:</strong> +961 03 123 456
          </p>
          <p>
            <strong>Hours:</strong> 9:00–18:00 (Mon–Sat)
          </p>
          <p>
            <strong>Location:</strong> Beirut, Lebanon
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Contact;
