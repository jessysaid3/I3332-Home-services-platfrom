import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Services.module.css';
import axios from 'axios';



const Services = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const goToWorkers = () => navigate("/workers");

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("https://backend.universalsoftwaresolutions.com/api/v1/services");

        console.log("SERVICES:", res.data);

        // Filter out duplicate services by name
        const servicesData = res.data.data || res.data;
        const uniqueServices = servicesData.filter((service, index, arr) => 
          arr.findIndex(s => (s.name || s.title) === (service.name || service.title)) === index
        );
        
        setServices(uniqueServices);

      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  // Handle selected service from navigation state
  useEffect(() => {
    if (location.state?.service) {
      setSelectedService(location.state.service);
      // Scroll to the selected service after services are loaded
      setTimeout(() => {
        const selectedServiceElement = document.getElementById(`service-${location.state.service.replace(/\s+/g, '-')}`);
        if (selectedServiceElement) {
          selectedServiceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [location.state, services]);

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <span className={styles.badge}>
          {services.length} Professional Services
        </span>
        <h1>Our Services</h1>
        <p>
          Choose from our range of professional home services. Every provider is
          verified, insured, and rated by real customers.
        </p>
      </section>

      {/* Services List */}
      <div className={styles.container}>
        <div className={styles.serviceList}>
          {services.map((service) => (
            <div
              key={service.id || service._id}
              id={`service-${(service.name || service.title).replace(/\s+/g, '-')}`}
              className={`${styles.serviceCard} ${styles.blueTheme} ${selectedService === (service.name || service.title) ? styles.highlighted : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  {/* fallback icon */}
                  🛠️
                </div>

                <div className={styles.headerText}>
                  <h3>
                    {service.name || service.title}
                  </h3>

                  <div className={styles.meta}>
                    <span className={styles.rating}>
                      ★ {service.rating || 4.5} ({service.reviews || 0} reviews)
                    </span>
                    <span className={styles.duration}>
                      • 🕒 {service.duration || "Flexible"}
                    </span>
                  </div>
                </div>

                <div className={styles.pricing}>
                  <small>Starting from</small>
                  <div className={styles.priceTag}>
                    ${service.minRate || 0}
                    <span>/hr</span>
                  </div>
                </div>
              </div>

              <p className={styles.description}>
                {service.description || "No description available"}
              </p>

              {/* Features (fallback if not موجودة من backend) */}
              <div className={styles.featuresGrid}>
                {(service.features || ["Professional", "Trusted", "Verified"]).map((feature, index) => (
                  <div key={index} className={styles.featureItem}>
                    ✔️ {feature}
                  </div>
                ))}
              </div>

              <div className={styles.actions}>
                {/* Book */}
                <Link
                  to="/offerings"
                  state={{ service: service.name || service.title }}
                  className={styles.bookBtn}
                >
                  Book {service.name || service.title} →
                </Link>

                {/* Browse Workers */}
                {/*<button
                  type="button"
                  className={styles.browseBtn}
                  onClick={goToWorkers}
                >
                  Browse Workers
                </button>*/}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Satisfaction Section */}
      <section className={styles.satisfaction}>
        <h2>100% Satisfaction Guaranteed</h2>
        <p>
          Not happy with the service? We'll send another provider at no extra
          charge or give you a full refund.
        </p>
        <button
          type="button"
          className={styles.getStartedBtn}
          onClick={goToWorkers}
        >
          Get Started Today
        </button>
      </section>
    </div>
  );
};

export default Services;