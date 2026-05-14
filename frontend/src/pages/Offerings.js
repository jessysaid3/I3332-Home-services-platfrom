import React, { useState, useEffect } from 'react';



import { useNavigate, useLocation } from 'react-router-dom';



import styles from '../styles/Offerings.module.css';



import { fetchAllOfferings, fetchOfferingsWithFilters, fetchServices } from '../api/offeringsApi';



import { addCartItem } from '../api/cartApi';



import TimeSelectionModal from '../components/TimeSelectionModal';







const Offerings = () => {



  const navigate = useNavigate(); // Initialize the navigate function



  const location = useLocation();







  // 1. Worker Data



  const [allWorkers, setAllWorkers] = useState([]);



  const [loading, setLoading] = useState(true);



  const [error, setError] = useState(null);



  const [services, setServices] = useState([]);







  // 2. States for filtering



  const [activeFilter, setActiveFilter] = useState('All');



  const [searchTerm, setSearchTerm] = useState('');







  // 3. Modal state



  const [selectedWorker, setSelectedWorker] = useState(null);



  const [isModalOpen, setIsModalOpen] = useState(false);







  // Load offerings and services on component mount



  useEffect(() => {



    const loadData = async () => {



      try {



        setLoading(true);



        const [offeringsData, servicesData] = await Promise.all([



          fetchAllOfferings(),



          fetchServices()



        ]);



        const mappedWorkers = mapApiDataToWorkers(offeringsData);



        // Filter out duplicate workers by combining provider name and service name

        const uniqueWorkers = mappedWorkers.filter((worker, index, arr) => 

          arr.findIndex(w => w.name === worker.name && w.category === worker.category && w.description === worker.description) === index

        );



        setAllWorkers(uniqueWorkers);



        setServices(servicesData);



        setError(null);







        // Set filter from navigation state if available



        if (location.state?.service) {



          setActiveFilter(location.state.service);



        }



      } catch (err) {



        setError('Failed to load offerings. Please try again later.');



        console.error('Error fetching data:', err);



      } finally {



        setLoading(false);



      }



    };







    loadData();



  }, []);







  // Map API response to component data structure



  const mapApiDataToWorkers = (apiData) => {



    return apiData.map((offer, index) => {



      const initials = offer.providerName



        .split(' ')



        .map(n => n[0])



        .join('')



        .toUpperCase()



        .slice(0, 2);







      return {



        id: offer.offerId,



        name: offer.providerName,



        initials: initials,



        category: offer.serviceName,



        description: offer.offerTitle,



        rating: '4.5',



        reviews: '0',



        years: 'N/A',



        location: `${offer.providerCity}, ${offer.providerCountry}`,



        price: offer.hourlyRate,



        status: 'Available'



      };



    });



  };







  // 3. Filtering Logic



  const filteredWorkers = allWorkers.filter((worker) => {



    const matchesCategory = activeFilter === 'All' || worker.category === activeFilter;



    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||



                          worker.location.toLowerCase().includes(searchTerm.toLowerCase());







    return matchesCategory && matchesSearch;



  });







  // 4. Navigation Logic



  const handleBookNow = (worker) => {



    setSelectedWorker(worker);



    setIsModalOpen(true);



  };







  const handleAddToCart = async (cartItem) => {



    try {



      await addCartItem(cartItem);



      setIsModalOpen(false);



      setSelectedWorker(null);



      // Navigate to cart after adding



      navigate('/cart');



    } catch (err) {



      console.error('Error adding to cart:', err);



      const errorMessage = err.message || 'Failed to add to cart';



      



      if (errorMessage.includes('401') || errorMessage.includes('No token')) {



        alert('Please sign in to add items to your cart.');



        navigate('/signin');



      } else if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {



        alert('Network Error: Please ensure the backend server is running on port 5000.');



      } else {



        alert(`Failed to add to cart: ${errorMessage}`);



      }



    }



  };







  const handleCloseModal = () => {



    setIsModalOpen(false);



    setSelectedWorker(null);



  };







  return (



    <div className={styles.page}>



      <section className={styles.hero}>



        <h1>Find Your Worker in Lebanon</h1>



        <p>Browse verified local professionals for your home service needs.</p>



      </section>







      {/* Filter Bar */}



      <div className={styles.filterBar}>



        <div className={styles.searchContainer}>



          <input



            type="text"



            placeholder="Search name or city (e.g. Beirut, Tripoli)..."



            className={styles.searchInput}



            value={searchTerm}



            onChange={(e) => setSearchTerm(e.target.value)}



          />



        </div>



        <div className={styles.filterGroup}>



          <button



            key="All"



            className={`${styles.filterBtn} ${activeFilter === 'All' ? styles.active : ''}`}



            onClick={() => setActiveFilter('All')}



          >



            All



          </button>



          {services

            .filter((service, index, arr) => arr.findIndex(s => s.name === service.name) === index)

            .map((service) => (



            <button



              key={service.name}



              className={`${styles.filterBtn} ${activeFilter === service.name ? styles.active : ''}`}



              onClick={() => setActiveFilter(service.name)}



            >



              {service.name}



            </button>



          ))}



        </div>



      </div>







      <main className={styles.container}>



        {loading && <p className={styles.resultsText}>Loading offerings...</p>}



        {error && <p className={styles.resultsText} style={{ color: 'red' }}>{error}</p>}



        {!loading && !error && (



          <>



            <p className={styles.resultsText}>{filteredWorkers.length} offerings found in Lebanon</p>



            



            <div className={styles.grid}>



              {filteredWorkers.map((worker) => (



                <div key={worker.id} className={styles.card}>



                  <div className={styles.cardHeader}>



                    <div className={styles.avatar}>{worker.initials}</div>



                    <div className={styles.nameInfo}>



                      <div className={styles.titleRow}>



                        <h3>{worker.name}</h3>



                      </div>



                      <span className={`${styles.categoryBadge} ${styles[worker.category.toLowerCase()]}`}>



                        {worker.category}



                      </span>



                    </div>



                    <div className={`${styles.statusBadge} ${worker.status === 'Available' ? styles.available : styles.busy}`}>



                      ● {worker.status}



                    </div>



                  </div>







                  <p className={styles.description}>{worker.description}</p>







                  <div className={styles.metaInfo}>



                    <div className={styles.metaItem}>⭐ <strong>{worker.rating}</strong> ({worker.reviews})</div>



                    <div className={styles.metaItem}>🕒 {worker.years}</div>



                  </div>



                  



                  <div className={styles.location}>📍 {worker.location}</div>







                  <div className={styles.cardFooter}>



                    <div className={styles.price}>${worker.price}/hr</div>



                    {worker.status === 'Available' ? (



                      <button 



                        className={styles.bookBtn}



                        onClick={() => handleBookNow(worker)}



                      >



                        Book Now



                      </button>



                    ) : (



                      <button className={styles.unavailableBtn} disabled>Unavailable</button>



                    )}



                  </div>



                </div>



              ))}



            </div>



          </>



        )}



      </main>



      



      <TimeSelectionModal



        isOpen={isModalOpen}



        onClose={handleCloseModal}



        offering={selectedWorker}



        onAddToCart={handleAddToCart}



      />



    </div>



  );



};







export default Offerings;