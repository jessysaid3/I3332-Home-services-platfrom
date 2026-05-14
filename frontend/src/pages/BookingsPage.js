import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import "../styles/BookingsPage.css";

import StatusTracker from "../components/StatusTracker";

import { cancelUserBooking, fetchUserBookings } from "../api/bookingsPageApi";



const STATUS_TO_STEP = {

  requested: 0,

  accepted: 1,

  "in progress": 2,

  completed: 3,

  cancelled: 0,

  rejected: 0,

};



const STATUS_TO_CLASS = {

  completed: "statusDone",

  accepted: "statusDone",

  requested: "statusPending",

  cancelled: "statusPending",

  rejected: "statusPending",

};



function BookingsPage() {

  const [bookings, setBookings] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionBookingId, setActionBookingId] = useState(null);



  const loadBookings = async () => {

    setIsLoading(true);

    setError("");

    try {

      const data = await fetchUserBookings();

      setBookings(data || []);

    } catch (err) {

      setError(err.message || "Failed to load bookings.");

    } finally {

      setIsLoading(false);

    }

  };



  useEffect(() => {

    loadBookings();

  }, []);



  const handleCancel = async (bookingId) => {

    setActionBookingId(bookingId);

    setError("");

    try {

      await cancelUserBooking(bookingId);

      await loadBookings();

    } catch (err) {

      setError(err.message || "Failed to cancel booking.");

    } finally {

      setActionBookingId(null);

    }

  };



  return (

    <div className="history-container">

      <h2>My bookings</h2>

      <p className="history-lead">

        Track progress for each visit. Status updates appear here as your provider moves through the

        job.

      </p>

      {isLoading && <p>Loading your bookings...</p>}

      {error && <p>{error}</p>}



      <div className="booking-list">

        {!bookings.length && !isLoading && <p>No bookings found.</p>}

        {bookings.map((booking) => {

          const normalizedStatus = (booking.booking_status || "").toLowerCase();

          const dateText = booking.start_at

            ? new Date(booking.start_at).toLocaleDateString()

            : "n/a";

          const badgeClass = STATUS_TO_CLASS[normalizedStatus] || "statusPending";

          const step = STATUS_TO_STEP[normalizedStatus] ?? 0;

          const canCancel = !["cancelled", "completed", "rejected"].includes(normalizedStatus);

          const canReview = ["completed", "accepted", "in progress"].includes(normalizedStatus);



          return (

            <article className="booking-card" key={booking.booking_id}>

              <h3>

                <span>{booking.service_name || booking.title || "Service"}</span>

                <span className={`statusBadge ${badgeClass}`}>{booking.booking_status}</span>

              </h3>

              <p>

                <strong>Date:</strong> {dateText}

              </p>

              <p>

                <strong>Provider:</strong> {booking.provider_name || "-"}

              </p>

              <p>

                <strong>Total:</strong> {booking.curr || "$"} {booking.total || 0}

              </p>

              {canCancel && (

                <button

                  type="button"

                  className="cancelBookingBtn"

                  onClick={() => handleCancel(booking.booking_id)}

                  disabled={actionBookingId === booking.booking_id}

                >

                  {actionBookingId === booking.booking_id ? "Cancelling..." : "Cancel Booking"}

                </button>

              )}

              {canReview && (

                <Link

                  className="reviewBookingBtn"

                  to={`/rating?bookingId=${booking.booking_id}`}

                >

                  Leave Review

                </Link>

              )}

              <StatusTracker currentStep={step} />

            </article>

          );

        })}

      </div>

    </div>

  );

}



export default BookingsPage;

