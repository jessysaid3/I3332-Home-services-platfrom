import React, { useState, useEffect } from 'react';

import { fetchOfferingAvailableTime } from '../api/offeringsApi';

import styles from '../styles/TimeSelectionModal.module.css';



const STRICT_INSIDE_BUFFER_MS = 60 * 1000;



const TimeSelectionModal = ({ isOpen, onClose, offering, onAddToCart }) => {

  const [availableTimes, setAvailableTimes] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);

  const [selectedStartTime, setSelectedStartTime] = useState('');

  const [selectedEndTime, setSelectedEndTime] = useState('');



  useEffect(() => {

    if (isOpen && offering) {

      fetchAvailableTimes();

    }

  }, [isOpen, offering]);



  const toDateTimeLocalValue = (dateInput) => {

    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) return '';



    const pad = (num) => String(num).padStart(2, '0');

    const year = date.getFullYear();

    const month = pad(date.getMonth() + 1);

    const day = pad(date.getDate());

    const hours = pad(date.getHours());

    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;

  };



  const getStrictInsideBounds = (slot) => {

    const slotStart = new Date(slot.start);

    const slotEnd = new Date(slot.end);



    return {

      minInside: new Date(slotStart.getTime() + STRICT_INSIDE_BUFFER_MS),

      maxInside: new Date(slotEnd.getTime() - STRICT_INSIDE_BUFFER_MS)

    };

  };



  const fetchAvailableTimes = async () => {

    try {

      setLoading(true);

      setError(null);

      

      // Fetch available times from API

      const freeTimes = await fetchOfferingAvailableTime(offering.id);

      

      const fullDateTimeOptions = {

        weekday: 'short',

        month: 'short',

        day: 'numeric',

        year: 'numeric',

        hour: '2-digit',

        minute: '2-digit'

      };



      // Convert the API response to time slots

      const slots = freeTimes.map((timeRange, index) => {

        const startDate = new Date(timeRange[0]);

        const endDate = new Date(timeRange[1]);

        

        return {

          start: timeRange[0],

          end: timeRange[1],

          startLabel: startDate.toLocaleString('en-US', fullDateTimeOptions),

          endLabel: endDate.toLocaleString('en-US', fullDateTimeOptions)

        };

      });

      

      setAvailableTimes(slots);

    } catch (err) {

      setError('Failed to load available times');

      console.error('Error fetching available times:', err);

    } finally {

      setLoading(false);

    }

  };



  const handleSlotSelect = (slot) => {

    setSelectedSlot(slot);

    const { minInside, maxInside } = getStrictInsideBounds(slot);



    if (minInside >= maxInside) {

      setSelectedStartTime('');

      setSelectedEndTime('');

      setError('Selected slot is too short to pick a start and end time strictly inside it.');

      return;

    }

    const preselectedEnd = maxInside.getTime() - minInside.getTime() > 60*60*1000 

      ? new Date(minInside.getTime() + 60*60*1000).toISOString()

      : maxInside.toISOString();

    setSelectedStartTime(minInside.toISOString());

    setSelectedEndTime(preselectedEnd);

    setError(null);

  };



  const handleStartTimeChange = (value) => {

    if (!selectedSlot || !value) return;



    const nextStart = new Date(value);

    const currentEnd = selectedEndTime ? new Date(selectedEndTime) : null;

    const { minInside, maxInside } = getStrictInsideBounds(selectedSlot);



    if (nextStart < minInside || nextStart > maxInside) {

      setError('Start time must be strictly inside the selected slot.');

      return;

    }



    if (currentEnd && nextStart >= currentEnd) {

      setError('Start time must be before end time.');

      return;

    }



    setSelectedStartTime(nextStart.toISOString());

    setError(null);

  };



  const handleEndTimeChange = (value) => {

    if (!selectedSlot || !value) return;



    const nextEnd = new Date(value);

    const currentStart = selectedStartTime ? new Date(selectedStartTime) : null;

    const { minInside, maxInside } = getStrictInsideBounds(selectedSlot);



    if (nextEnd < minInside || nextEnd > maxInside) {

      setError('End time must be strictly inside the selected slot.');

      return;

    }



    if (currentStart && nextEnd <= currentStart) {

      setError('End time must be after start time.');

      return;

    }



    setSelectedEndTime(nextEnd.toISOString());

    setError(null);

  };



  const handleAddToCart = () => {

    if (!selectedSlot) {

      setError('Please select a time slot');

      return;

    }



    if (!selectedStartTime || !selectedEndTime) {

      setError('Please choose both start and end date/time.');

      return;

    }



    const startTime = new Date(selectedStartTime);

    const endTime = new Date(selectedEndTime);

    const { minInside, maxInside } = getStrictInsideBounds(selectedSlot);



    if (startTime < minInside || startTime > maxInside || endTime < minInside || endTime > maxInside) {

      setError('Start and end must be strictly inside the selected slot.');

      return;

    }



    if (startTime >= endTime) {

      setError('Start time must be before end time.');

      return;

    }



    console.log('Adding to cart:', {

      offeringId: offering.id,

      start_at: selectedStartTime,

      end_at: selectedEndTime

    });



    onAddToCart({

      offeringId: offering.id,

      start_at: startTime.getTime(),

      end_at: endTime.getTime()

    });

  };



  if (!isOpen) return null;



  return (

    <div className={styles.modalOverlay} onClick={onClose}>

      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        <div className={styles.modalHeader}>

          <h2>Select Time Slot</h2>

          <button className={styles.closeBtn} onClick={onClose}>×</button>

        </div>

        

        <div className={styles.modalBody}>

          {loading && <p className={styles.loadingText}>Loading available times...</p>}

          {error && <p className={styles.errorText}>{error}</p>}

          

          {!loading && !error && (

            <>

              <div className={styles.offeringInfo}>

                <h3>{offering.name}</h3>

                <p>{offering.category}</p>

                <p className={styles.price}>${offering.price}/hr</p>

              </div>

              

              <div className={styles.timeSlots}>

                <h4>Available Time Slots</h4>

                <div className={styles.slotsGrid}>

                  {availableTimes.map((slot, index) => (

                    <button

                      key={index}

                      className={`${styles.slotBtn} ${selectedSlot === slot ? styles.selected : ''}`}

                      onClick={() => handleSlotSelect(slot)}

                    >

                      <div className={styles.slotDate}>From {slot.startLabel}</div>

                      <div className={styles.slotTime}>To {slot.endLabel}</div>

                    </button>

                  ))}

                </div>

              </div>



              {selectedSlot && (

                <div className={styles.customTimeRange}>

                  <h4>Choose Start and End</h4>

                  <p className={styles.rangeHint}>

                    Pick a start and end that stay strictly inside the selected slot.

                  </p>



                  <div className={styles.pickerGrid}>

                    <label className={styles.pickerField}>

                      <span>Start date & time</span>

                      <input

                        type="datetime-local"

                        value={toDateTimeLocalValue(selectedStartTime)}

                        min={toDateTimeLocalValue(getStrictInsideBounds(selectedSlot).minInside)}

                        max={toDateTimeLocalValue(getStrictInsideBounds(selectedSlot).maxInside)}

                        onChange={(e) => handleStartTimeChange(e.target.value)}

                      />

                    </label>



                    <label className={styles.pickerField}>

                      <span>End date & time</span>

                      <input

                        type="datetime-local"

                        value={toDateTimeLocalValue(selectedEndTime) }

                        min={toDateTimeLocalValue(getStrictInsideBounds(selectedSlot).minInside)}

                        max={toDateTimeLocalValue(getStrictInsideBounds(selectedSlot).maxInside)}

                        onChange={(e) => handleEndTimeChange(e.target.value)}

                      />

                    </label>

                  </div>

                </div>

              )}

            </>

          )}

        </div>

        

        <div className={styles.modalFooter}>

          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>

          <button 

            className={styles.addBtn} 

            onClick={handleAddToCart}

            disabled={!selectedSlot || !selectedStartTime || !selectedEndTime}

          >

            Add to Cart

          </button>

        </div>

      </div>

    </div>

  );

};



export default TimeSelectionModal;

