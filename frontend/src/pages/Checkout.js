import React, { useState, useEffect } from "react";

import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

import styles from "../styles/Checkout.module.css";

import { checkoutCart } from "../api/checkoutApi";

import { makePayment } from "../api/paymentsApi";



const Checkout = () => {

  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(parseInt(searchParams.get('step')) || 1);

  const [paymentMethod, setPaymentMethod] = useState('card');



  const location = useLocation();

  const { order_id, amount, method, type, curr } = location.state || {};



  // Update step when URL parameter changes

  useEffect(() => {

    const stepParam = parseInt(searchParams.get('step'));

    if (stepParam && stepParam !== step) {

      setStep(stepParam);

    }

  }, [searchParams]);



  const [addressData, setAddressData] = useState({

    country: '',

    city: '',

    street: '',

    building: '',

    floor: null,

    apartment: ''

  })

  const [formData, setFormData] = useState({

    instructions: '',

    cardName: '',

    cardNumber: '',

    expiry: '',

    securityCode: '',

    paypalEmail: '',

    bankAccount: '',

    bankRouting: ''

  });

  const [newAddress, setNewAddress] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const navigate = useNavigate();



  const handleInputChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };



  const handleAddressPaymentChange = (e) => {

    setAddressData({

      ...addressData,

      [e.target.name]: e.target.value

    })

  }



  const handlePaymentChange = (e) => {

    setPaymentMethod(e.target.value);

  };



  const validateForm = () => {

    if (paymentMethod === 'card') {

      if (!formData.cardName.trim() || !formData.cardNumber.trim() || 

          !formData.expiry.trim() || !formData.securityCode.trim()) {

        setError('Please fill in all card details');

        return false;

      }

    }



    if (paymentMethod === 'paypal') {

      if (!formData.paypalEmail.trim() || !formData.paypalEmail.includes('@')) {

        setError('Please enter a valid PayPal email');

        return false;

      }

    }



    if (paymentMethod === 'bank') {

      if (!formData.bankAccount.trim() || !formData.bankRouting.trim()) {

        setError('Please fill in all bank details');

        return false;

      }

    }



    return true;

  };



  const handleNext = () => {

    setError('');

    if (step === 1) {

      if (newAddress) {

        if(!addressData.country || !addressData.city || !addressData.street

          || !addressData.building || !addressData.floor || !addressData.apartment

        ){

          setError('Please fill all address fields');

          return;

        }

      }

      setStep(2);

    } else if (step === 2) {

      if (!validateForm()) {

        return;

      }

    }

  };



  const handleConfirm = async () => {

    setError('');

    setLoading(true);

    try {

      await makePayment({

        info:{

          address: newAddress ? addressData : null,

          order_id: order_id,

          amount: amount,

          curr: curr,

          method: paymentMethod,

          type: type

        }

      })

      alert('Booking confirmed!');

      navigate('/bookings');

    } catch (err) {

      console.error('Checkout error:', err);

      setError('Failed to complete booking. Please try again.');

    } finally {

      setLoading(false);

    }

  };



  const handleBack = () => {

    setError('');

    if (step > 1) {

      setStep(step - 1);

    }

  };



  return (

    <div className={styles.wrapper}>

      <nav className={styles.breadcrumb}>

        <span className={styles.backLink} onClick={() => navigate(-1)} style={{cursor: 'pointer'}}>

          &lt; Services / Checkout

        </span>

      </nav>



      <div className={styles.mainContent}>

        <div className={styles.formSection}>

          {error && <p style={{color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fee'}}>{error}</p>}

          

          {step === 1 && (

            <div className={styles.card}>

              <h2>Step 1: Booking Details</h2>

              {/* <label>Service Address</label> */}

              <label>Default Address

                <input type="checkBox" 

                        checked={!newAddress} 

                        onChange={(e) => setNewAddress(!e.target.checked)}

                        className={styles.newAddress}/>

              </label>

              

              {newAddress && (

                <>

                <label>Country</label>

                  <input 

                  type="text" 

                  name="country"

                  placeholder="Enter country name..." 

                  value={addressData.country}

                  onChange={handleAddressPaymentChange}/>

                  

                <label>City</label>

                  <input 

                  type="text" 

                  name="city"

                  placeholder="Enter city name..." 

                  value={addressData.city}

                  onChange={handleAddressPaymentChange}/>

                  

                <label>Street</label>

                  <input 

                  type="text" 

                  name="street"

                  placeholder="Enter street name..." 

                  value={addressData.street}

                  onChange={handleAddressPaymentChange}/>

                  

                <label>Building</label>

                  <input 

                  type="text" 

                  name="building"

                  placeholder="Enter building name..." 

                  value={addressData.building}

                  onChange={handleAddressPaymentChange}/>

                  

                <label>Floor</label>

                  <input 

                  type="number" 

                  name="floor"

                  placeholder="Enter floor number..." 

                  value={addressData.floor}

                  onChange={handleAddressPaymentChange}/>

                  

                <label>Apartment</label>

                  <input 

                  type="text" 

                  name="apartment"

                  placeholder="Enter apartment name..." 

                  value={addressData.apartment}

                  onChange={handleAddressPaymentChange}/>

                </>

              )}

              

              <label>Special Instructions (Optional)</label>

              <textarea 

                name="instructions"

                placeholder="Any specific requirements..." 

                rows="4"

                value={formData.instructions}

                onChange={handleInputChange}

              ></textarea>

              <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>

                <button 

                  onClick={() => navigate(-1)}

                  style={{

                    padding: '15px 30px',

                    fontSize: '16px',

                    backgroundColor: '#ccc',

                    border: 'none',

                    borderRadius: '8px',

                    cursor: 'pointer'

                  }}

                >

                  Back

                </button>

                <button 

                  onClick={handleNext}

                  style={{

                    padding: '15px 40px',

                    fontSize: '18px',

                    fontWeight: 'bold',

                    backgroundColor: '#1b8a7d',

                    color: 'white',

                    border: 'none',

                    borderRadius: '8px',

                    cursor: 'pointer',

                    minWidth: '200px'

                  }}

                >

                  Next: Payment

                </button>

              </div>

            </div>

          )}



          {step === 2 && (

            <div className={styles.card}>

              <h2>Step 2: Payment Details</h2>

              

              <label>Payment Method</label>

              <div style={{border: '2px solid #ddd', padding: '15px', borderRadius: '8px', margin: '10px 0'}}>

                <div style={{marginBottom: '10px'}}>

                  <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>

                    <input

                      type="radio"

                      name="paymentMethod"

                      value="card"

                      checked={paymentMethod === 'card'}

                      onChange={handlePaymentChange}

                      className={styles.newAddress}

                    />

                    <span>💳 Credit/Debit Card</span>

                  </label>

                </div>

                <div style={{marginBottom: '10px'}}>

                  <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>

                    <input

                      type="radio"

                      name="paymentMethod"

                      value="paypal"

                      checked={paymentMethod === 'paypal'}

                      onChange={handlePaymentChange}

                      className={styles.newAddress}

                    />

                    <span>🅿️ PayPal</span>

                  </label>

                </div>

                <div style={{marginBottom: '10px'}}>

                  <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>

                    <input

                      type="radio"

                      name="paymentMethod"

                      value="bank"

                      checked={paymentMethod === 'bank'}

                      onChange={handlePaymentChange}

                      className={styles.newAddress}

                    />

                    <span>🏦 Bank Transfer</span>

                  </label>

                </div>

              </div>



              {paymentMethod === 'card' && (

                <div style={{marginTop: '20px'}}>

                  <label>Cardholder Name</label>

                  <input 

                    type="text" 

                    name="cardName"

                    placeholder="Name on card" 

                    value={formData.cardName}

                    onChange={handleInputChange}

                  />

                  <label>Card Number</label>

                  <input 

                    type="text" 

                    name="cardNumber"

                    placeholder="1234 5678 9012 3456" 

                    value={formData.cardNumber}

                    onChange={handleInputChange}

                  />

                  <div style={{display: 'flex', gap: '10px'}}>

                    <div style={{flex: 1}}>

                      <label>Expiry Date</label>

                      <input 

                        type="text" 

                        name="expiry"

                        placeholder="MM/YY" 

                        value={formData.expiry}

                        onChange={handleInputChange}

                      />

                    </div>

                    <div style={{flex: 1}}>

                      <label>Security Code</label>

                      <input 

                        type="text"

                        name="securityCode"

                        placeholder="123" 

                        value={formData.securityCode}

                        onChange={handleInputChange}

                      />

                    </div>

                  </div>

                </div>

              )}



              {paymentMethod === 'paypal' && (

                <div style={{marginTop: '20px'}}>

                  <label>PayPal Email</label>

                  <input 

                    type="email" 

                    name="paypalEmail"

                    placeholder="your@email.com" 

                    value={formData.paypalEmail}

                    onChange={handleInputChange}

                  />

                  <p style={{color: '#666', fontSize: '14px', marginTop: '5px'}}>You will be redirected to PayPal to complete your payment.</p>

                </div>

              )}



              {paymentMethod === 'bank' && (

                <div style={{marginTop: '20px'}}>

                  <label>Bank Account Number</label>

                  <input 

                    type="text" 

                    name="bankAccount"

                    placeholder="Account number" 

                    value={formData.bankAccount}

                    onChange={handleInputChange}

                  />

                  <label>Routing Number</label>

                  <input 

                    type="text" 

                    name="bankRouting"

                    placeholder="Routing number" 

                    value={formData.bankRouting}

                    onChange={handleInputChange}

                  />

                  <p style={{color: '#666', fontSize: '14px', marginTop: '5px'}}>Bank transfer may take 1-3 business days to process.</p>

                </div>

              )}



              <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px'}}>

                🛡️ Your payment info is encrypted and secure.

              </div>



              <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>

                <button 

                  onClick={handleBack}

                  style={{

                    padding: '15px 30px',

                    fontSize: '16px',

                    backgroundColor: '#ccc',

                    border: 'none',

                    borderRadius: '8px',

                    cursor: 'pointer'

                  }}

                >

                  Back

                </button>

                <button 

                  onClick={handleConfirm}

                  style={{

                    padding: '15px 40px',

                    fontSize: '18px',

                    fontWeight: 'bold',

                    backgroundColor: '#1b8a7d',

                    color: 'white',

                    border: 'none',

                    borderRadius: '8px',

                    cursor: 'pointer',

                    minWidth: '200px'

                  }}

                >

                  Make Payment

                </button>

              </div>

            </div>

          )}



          {step === 4 && (

            <div className={styles.card}>

              <h2>Step 4: Review & Confirm</h2>

              

              <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>

                <h3 style={{marginTop: 0}}>Booking Summary</h3>

                <p><strong>Service Address:</strong> {formData.address || 'Not provided'}</p>

                <p><strong>Special Instructions:</strong> {formData.instructions || 'None'}</p>

                <p><strong>Payment Method:</strong> {paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'}</p>

                {paymentMethod === 'card' && (

                  <p><strong>Card:</strong> ****{formData.cardNumber?.slice(-4) || 'Not provided'}</p>

                )}

                {paymentMethod === 'paypal' && (

                  <p><strong>PayPal Email:</strong> {formData.paypalEmail || 'Not provided'}</p>

                )}

                {paymentMethod === 'bank' && (

                  <p><strong>Bank Account:</strong> ****{formData.bankAccount?.slice(-4) || 'Not provided'}</p>

                )}

                <p><strong>Rating:</strong> Review submitted ✓</p>

              </div>



              <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>

                <button 

                  onClick={handleBack}

                  disabled={loading}

                  style={{

                    padding: '15px 30px',

                    fontSize: '16px',

                    backgroundColor: '#ccc',

                    border: 'none',

                    borderRadius: '8px',

                    cursor: loading ? 'not-allowed' : 'pointer'

                  }}

                >

                  Back

                </button>

                <button 

                  onClick={handleConfirm}

                  disabled={loading}

                  style={{

                    padding: '15px 40px',

                    fontSize: '18px',

                    fontWeight: 'bold',

                    backgroundColor: loading ? '#999' : '#1b8a7d',

                    color: 'white',

                    border: 'none',

                    borderRadius: '8px',

                    cursor: loading ? 'not-allowed' : 'pointer',

                    minWidth: '200px'

                  }}

                >

                  {loading ? 'Processing...' : 'Confirm Booking'}

                </button>

              </div>

            </div>

          )}

        </div>



        {/* <aside className={styles.sidebar}>

          <div className={styles.summaryCard}>

            <h3>Booking Summary</h3>

            <p>Service Address: {formData.address}</p>

            <p>Special Instructions: {formData.instructions}</p>

          </div>

        </aside> */}

      </div>

    </div>

  );

};



export default Checkout;