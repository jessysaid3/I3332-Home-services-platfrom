import React from "react";
import { Link } from "react-router-dom";
import "../styles/About.css";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About HomeServe</h1>
        <p>Connecting trusted home service providers with families who need them most.</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            At HomeServe, we're dedicated to making home services accessible, reliable, and trustworthy. 
            We connect skilled professionals with families who need quality home services, ensuring peace of mind 
            and exceptional service every time.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Do</h2>
          <p>
            Our platform offers a wide range of home services including cleaning, plumbing, electrical work, 
            AC repair, painting, car wash, handyman services, personal training, IT support, babysitting, 
            gardening, and photography. All our service providers are thoroughly vetted to ensure quality 
            and reliability.
          </p>
        </section>

        <section className="about-section">
          <h2>Why Choose HomeServe?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Verified Professionals</h3>
              <p>All service providers undergo background checks and skill verification</p>
            </div>
            <div className="feature-card">
              <h3>Easy Booking</h3>
              <p>Simple and intuitive booking process with transparent pricing</p>
            </div>
            <div className="feature-card">
              <h3>Quality Guarantee</h3>
              <p>We stand behind our services with a satisfaction guarantee</p>
            </div>
            <div className="feature-card">
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support for all your needs</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2025, HomeServe was born from a simple realization: finding reliable home services 
            shouldn't be complicated. We started with a mission to simplify the process of connecting 
            homeowners with trusted service providers, and today we're proud to serve communities across 
            Lebanon with quality home services.
          </p>
        </section>

        <section className="about-section">
          <h2>Get in Touch</h2>
          <p>
            Have questions about our services or want to become a service provider? We'd love to hear from you!
          </p>
          <div className="cta-buttons">
            <Link to="/contact" className="cta-button primary">Contact Us</Link>
            <Link to="/signup?role=provider" className="cta-button secondary">Become a Provider</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
