import React, { useEffect, useMemo, useState } from "react";

import { useSearchParams, useNavigate } from "react-router-dom";

import styles from "../styles/Rating.module.css";

import {

  createBookingReview,

  fetchUserBookings,

  getReviewByBookingId,

} from "../api/ratingApi";



const Rating = () => {

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const queryBookingId = searchParams.get("bookingId");

  const [overallRating, setOverallRating] = useState(0);

  const [aspects, setAspects] = useState({

    Quality: 0,

    Punctuality: 0,

    Communication: 0,

    Professionalism: 0,

    Value: 0,

  });

  const [selectedTags, setSelectedTags] = useState([]);

  const [comment, setComment] = useState(""); // Added state for comment

  const [bookingId, setBookingId] = useState(queryBookingId || "");

  const [bookings, setBookings] = useState([]);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoadingBookings, setIsLoadingBookings] = useState(true);



  const tags = [

    "Friendly",

    "Thorough",

    "On Time",

    "Clean",

    "Professional",

    "Great Value",

    "Highly Recommend",

  ];



  // useEffect(() => {

  //   const loadBookings = async () => {

  //     setIsLoadingBookings(true);

  //     setError("");

  //     try {

  //       const data = await fetchUserBookings();

  //       setBookings(data || []);

  //     } catch (err) {

  //       console.error("Failed to load bookings:", err);

  //       setError(err.message || "Failed to load bookings. Please make sure you're logged in.");

  //     } finally {

  //       setIsLoadingBookings(false);

  //     }

  //   };

  //   loadBookings();

  // }, []);



  useEffect(() => {

    const checkReviewed = async () => {

      if (!bookingId) return;

      try {

        await getReviewByBookingId(bookingId);

        setError("This booking has already been reviewed.");

      } catch (_) {

        // 404 means not reviewed yet; nothing to show.

      }

    };

    checkReviewed();

  }, [bookingId]);



  const toggleTag = (tag) => {

    setSelectedTags((prev) =>

      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]

    );

  };



  const handleRating = (aspect, value) => {

    setAspects({ ...aspects, [aspect]: value });

  };



  // Logic to handle the click

  const handleSubmit = async () => {

    console.log("Submit review clicked");

    console.log("Overall rating:", overallRating);

    

    setError("");

    setSuccess("");

    if (overallRating === 0) {

      setError("Please provide an overall rating before submitting.");

      console.log("Error: No rating provided");

      return;

    }



    const aspectsText = Object.entries(aspects)

      .map(([key, value]) => `${key}: ${value}`)

      .join(", ");

    const tagsText = selectedTags.length ? `Tags: ${selectedTags.join(", ")}` : "";

    const note = [comment.trim(), tagsText, `Aspect Ratings: ${aspectsText}`]

      .filter(Boolean)

      .join(" | ");



    // Use the first available booking or skip booking requirement for checkout flow

    // const finalBookingId = bookings.length > 0 ? bookings[0].booking_id : null;

    

    // if (!finalBookingId) {

    //   // No booking available - just show success and navigate to checkout

    //   console.log("No booking available, skipping review submission");

    //   setSuccess("Thank you for your feedback! Redirecting to Review & Confirm...");

    //   setTimeout(() => {

    //     navigate('/bookings');

    //   }, 1500);

    //   return;

    // }



    // console.log("Submitting review with:", { booking_id: Number(finalBookingId), rating: overallRating, note });



    setIsSubmitting(true);

    try {

      const response = await createBookingReview({

        booking_id: bookingId,

        rating: overallRating,

        note,

      });

      console.log("Review submitted successfully:", response);

      setSuccess("Thank you! Your review was submitted. Redirecting to Bookings Page...");

      setComment("");

      setSelectedTags([]);

      setOverallRating(0);

      setAspects({

        Quality: 0,

        Punctuality: 0,

        Communication: 0,

        Professionalism: 0,

        Value: 0,

      });

      // Navigate to checkout after successful review

      setTimeout(() => {

        navigate('/bookings');

      }, 6000);

    } catch (err) {

      console.error("Error submitting review:", err);

      setError(err.message || "Failed to submit review.");

    } finally {

      setIsSubmitting(false);

    }

  };



  // const bookingOptions = useMemo(

  //   () =>

  //     bookings.map((item) => ({

  //       value: String(item.booking_id),

  //       label: `${item.service_name || item.title || "Service"} - ${new Date(

  //         item.start_at

  //       ).toLocaleDateString()}`,

  //     })),

  //   [bookings]

  // );



  return (

    <div className={styles.wrapper}>

      <div className={styles.ratingCard}>

        <h2>Rate Your Experience</h2>

        <p className={styles.subtitle}>Your honest feedback helps improve our platform for everyone.</p>

        {error && <p className={styles.errorMessage}>{error}</p>}

        {success && <p className={styles.successMessage}>{success}</p>}



        {/* Overall Rating Section */}

        <div className={styles.sectionCenter}>

          <h4>Overall Rating</h4>

          <div className={styles.largeStars}>

            {[1, 2, 3, 4, 5].map((star) => (

              <span key={star} onClick={() => setOverallRating(star)} 

                className={overallRating >= star ? styles.starActive : styles.starInactive}>

                {overallRating >= star ? '★' : '☆'}

              </span>

            ))}

          </div>

          <p className={styles.tapNote}>Tap to rate</p>

        </div>



        {/* Specific Aspects Section */}

        <div className={styles.aspectsSection}>

          <h4>Rate Specific Aspects</h4>

          {Object.keys(aspects).map((aspect) => (

            <div key={aspect} className={styles.aspectRow}>

              <span>{aspect}</span>

              <div className={styles.smallStars}>

                {[1, 2, 3, 4, 5].map((star) => (

                  <span key={star} onClick={() => handleRating(aspect, star)}

                    className={aspects[aspect] >= star ? styles.starActive : styles.starInactive}>

                    {aspects[aspect] >= star ? '★' : '☆'}

                  </span>

                ))}

              </div>

            </div>

          ))}

        </div>



        {/* Tags Section */}

        <div className={styles.tagsSection}>

          <h4>What stood out? (Optional)</h4>

          <div className={styles.tagContainer}>

            {tags.map((tag) => (

              <button key={tag} 

                className={`${styles.tagChip} ${selectedTags.includes(tag) ? styles.tagActive : ''}`}

                onClick={() => toggleTag(tag)}>

                {tag}

              </button>

            ))}

          </div>

        </div>



        {/* Comment Section */}

        <div className={styles.commentSection}>

          <h4>Leave a Comment (Optional)</h4>

          <textarea 

            placeholder="Tell others about your experience..." 

            rows="4" 

            value={comment}

            onChange={(e) => setComment(e.target.value)} // Track comment input

          />

        </div>



        <button 

          className={styles.submitBtn} 

          onClick={handleSubmit} 

          disabled={isSubmitting}

          type="button"

        >

          <span>✈️</span> Submit Review

        </button>

      </div>

    </div>

  );

};



export default Rating;