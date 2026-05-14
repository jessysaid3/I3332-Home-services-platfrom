import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import styles from "../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        
        {/* COLUMN 1 - LOGO */}
        <div className={styles.logo}>
          <h2 className={styles.logoText}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home<span className={styles.highlight}>Serve</span>
          </h2>

          <p className={styles.description}>
            Connecting trusted home service providers with families who need them most.
          </p>

          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* COLUMN 2 - SERVICES */}
        <div className={styles.column}>
          <h4>Services</h4>
          <Link to="/services" state={{ service: "Cleaning" }}>Cleaning</Link>
          <Link to="/services" state={{ service: "Plumbing" }}>Plumbing</Link>
          <Link to="/services" state={{ service: "Electrician" }}>Electrician</Link>
          <Link to="/services" state={{ service: "AC Repair" }}>AC Repair</Link>
          <Link to="/services" state={{ service: "Painting" }}>Painting</Link>
          <Link to="/services" state={{ service: "Car Wash" }}>Car Wash</Link>
          <Link to="/services" state={{ service: "Handyman" }}>Handyman</Link>
          <Link to="/services" state={{ service: "Personal Training" }}>Personal Training</Link>
          <Link to="/services" state={{ service: "IT Support" }}>IT Support</Link>
          <Link to="/services" state={{ service: "Babysitting" }}>Babysitting</Link>
          <Link to="/services" state={{ service: "Gardening" }}>Gardening</Link>
          <Link to="/services" state={{ service: "Photography" }}>Photography</Link>
        </div>

        {/* COLUMN 3 - COMPANY */}
        <div className={styles.column}>
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/offerings">Find Workers</Link>
          <Link to="/signup?role=provider">Become a Provider</Link>
          <Link to="/signup?role=admin">Admin Portal</Link>
        </div>

        {/* COLUMN 4 - CONTACT */}
        <div className={styles.column}>
          <h4>Contact</h4>
          <div className={styles.contactItem}>
            <FaEnvelope className={styles.contactIcon} />
            <span>support@homeserve.com</span>
          </div>
          <div className={styles.contactItem}>
            <FaPhoneAlt className={styles.contactIcon} />
            <span>+961 03 123 456</span>
          </div>
          <div className={styles.contactItem}>
            <FaMapMarkerAlt className={styles.contactIcon} />
            <span>Beirut, Lebanon</span>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className={styles.bottomSection}>
        <div className={styles.copyright}>
          {/* Using dynamic year based on image showing 2025 */}
          © {new Date().getFullYear()} HomeServe. All rights reserved.
        </div>
        <div className={styles.bottomLinks}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;