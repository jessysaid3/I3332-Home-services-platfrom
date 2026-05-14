import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/WorkerDashboard.module.css";
import {
  acceptProviderBooking,
  createManualBusySlot,
  deleteManualBusySlot,
  fetchManualBusySlots,
  fetchProviderBookingRequests,
  fetchProviderBookings,
  rejectProviderBooking,
} from "../api/workerDashboardApi";
import { getStoredToken } from "../api/http";
import {
  createProviderOffer,
  deleteProviderOffer,
  editProviderOffer,
  fetchProviderOffers,
  fetchServices,
} from "../api/offeringsApi";

const WorkerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [providerOffers, setProviderOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [error, setError] = useState("");
  const [offersError, setOffersError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const [offerActionLoadingId, setOfferActionLoadingId] = useState(null);
  const [busySlots, setBusySlots] = useState([]);
  const [busySlotsLoading, setBusySlotsLoading] = useState(true);
  const [busySlotsError, setBusySlotsError] = useState("");
  const [busySlotActionLoadingId, setBusySlotActionLoadingId] = useState(null);
  const [isCreatingBusySlot, setIsCreatingBusySlot] = useState(false);
  const [busySlotForm, setBusySlotForm] = useState({
    start_at: "",
    end_at: "",
  });
  const [offerForm, setOfferForm] = useState({
    service_id: "",
    title: "",
    rate: "",
    curr: "USD",
    active: true,
  });
  const offeringFormRef = useRef(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const pendingData = await fetchProviderBookingRequests();
      console.log("Pending bookings data:", pendingData);
      console.log("Pending bookings length:", pendingData?.length || 0);
      console.log("User is logged in with token:", getStoredToken() ? "Yes" : "No");
      setRequests(pendingData || []);

      try {
        const allBookingsData = await fetchProviderBookings();
        console.log("All bookings data:", allBookingsData);
        console.log("All bookings length:", allBookingsData?.length || 0);
        setBookings(allBookingsData || []);
      } catch (bookingsErr) {
        console.error("Failed to load booking history:", bookingsErr);
        // Don't fail the whole load if history fails
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to load booking requests:", err);
      const errorMsg = err.message || "Failed to load booking requests.";
      if (errorMsg.includes("not a provider") || errorMsg.includes("403")) {
        setError("You must be logged in as a provider to view this dashboard.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const loadOffersSection = async () => {
    setOffersLoading(true);
    setOffersError("");
    try {
      const [offersData, servicesData] = await Promise.all([
        fetchProviderOffers(),
        fetchServices(),
      ]);
      setProviderOffers(Array.isArray(offersData) ? offersData : []);
      if (Array.isArray(servicesData)) {
        setServices(servicesData);
      } else if (Array.isArray(servicesData?.items)) {
        setServices(servicesData.items);
      } else if (Array.isArray(servicesData?.data)) {
        setServices(servicesData.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      setOffersError(err.message || "Failed to load your offerings.");
    } finally {
      setOffersLoading(false);
    }
  };

  useEffect(() => {
    loadOffersSection();
  }, []);

  const loadBusySlots = async () => {
    setBusySlotsLoading(true);
    setBusySlotsError("");
    try {
      const data = await fetchManualBusySlots();
      const slots = Array.isArray(data) ? data : data?.slots;
      setBusySlots(Array.isArray(slots) ? slots : []);
    } catch (err) {
      setBusySlotsError(err.message || "Failed to load busy time slots.");
    } finally {
      setBusySlotsLoading(false);
    }
  };

  useEffect(() => {
    loadBusySlots();
  }, []);

  const handleAction = async (bookingId, action) => {
    setActionLoadingId(bookingId);
    setError("");
    try {
      if (action === "accept") {
        await acceptProviderBooking(bookingId);
      } else {
        await rejectProviderBooking(bookingId);
      }
      await loadRequests();
    } catch (err) {
      setError(err.message || "Failed to update booking status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalRevenue = useMemo(
    () => requests.reduce((sum, req) => sum + Number(req.total || 0), 0),
    [requests]
  );

  const acceptedBookings = useMemo(
    () => bookings.filter((b) => b.booking_status === "accepted"),
    [bookings]
  );
  const rejectedBookings = useMemo(
    () => bookings.filter((b) => b.booking_status === "rejected"),
    [bookings]
  );

  const activeOfferCount = useMemo(
    () => providerOffers.filter((offer) => offer.active).length,
    [providerOffers]
  );

  const manualBusyCount = useMemo(() => busySlots.length, [busySlots]);

  const mapOfferToForm = (offer) => {
    const selectedService =
      services.find((service) => service.name === offer.serviceName) || null;
    return {
      service_id: selectedService?.service_id ? String(selectedService.service_id) : "",
      title: offer.offerTitle || "",
      rate: offer.hourlyRate != null ? String(offer.hourlyRate) : "",
      curr: offer.currency || "USD",
      active: Boolean(offer.active),
    };
  };

  const resetOfferForm = () => {
    setOfferForm({
      service_id: "",
      title: "",
      rate: "",
      curr: "USD",
      active: true,
    });
    setEditingOfferId(null);
  };

  const handleEditOffer = (offer) => {
    setEditingOfferId(offer.offerId);
    setOffersError("");
    setOfferForm(mapOfferToForm(offer));
    requestAnimationFrame(() => {
      offeringFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleOfferFormChange = (field, value) => {
    setOfferForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerForm.service_id || !offerForm.title.trim() || !offerForm.rate) {
      setOffersError("Please fill all required offering fields.");
      return;
    }

    const payload = {
      service_id: Number(offerForm.service_id),
      title: offerForm.title.trim(),
      rate: Number(offerForm.rate),
      curr: offerForm.curr.trim().toUpperCase(),
      active: Boolean(offerForm.active),
    };

    setIsSavingOffer(true);
    setOffersError("");
    try {
      if (editingOfferId) {
        await editProviderOffer(editingOfferId, payload);
      } else {
        await createProviderOffer(payload);
      }
      await loadOffersSection();
      resetOfferForm();
    } catch (err) {
      setOffersError(err.message || "Failed to save offering.");
    } finally {
      setIsSavingOffer(false);
    }
  };

  const handleDeleteOffer = async (offeringId) => {
    if (!window.confirm("Delete this offering?")) {
      return;
    }
    setOfferActionLoadingId(offeringId);
    setOffersError("");
    try {
      await deleteProviderOffer(offeringId);
      await loadOffersSection();
      if (editingOfferId === offeringId) {
        resetOfferForm();
      }
    } catch (err) {
      setOffersError(err.message || "Failed to delete offering.");
    } finally {
      setOfferActionLoadingId(null);
    }
  };

  const handleToggleOfferStatus = async (offer) => {
    setOfferActionLoadingId(offer.offerId);
    setOffersError("");
    const selectedService = services.find((service) => service.name === offer.serviceName);
    if (!selectedService?.service_id) {
      setOffersError(
        "Could not match this offering to a service. Please edit and save it manually."
      );
      setOfferActionLoadingId(null);
      return;
    }
    try {
      await editProviderOffer(offer.offerId, {
        service_id: selectedService.service_id,
        title: offer.offerTitle,
        rate: Number(offer.hourlyRate),
        curr: offer.currency,
        active: !offer.active,
      });
      await loadOffersSection();
      if (editingOfferId === offer.offerId) {
        setOfferForm((prev) => ({ ...prev, active: !offer.active }));
      }
    } catch (err) {
      setOffersError(err.message || "Failed to update offering status.");
    } finally {
      setOfferActionLoadingId(null);
    }
  };

  const handleBusySlotFormChange = (field, value) => {
    setBusySlotForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateBusySlot = async (e) => {
    e.preventDefault();
    if (!busySlotForm.start_at || !busySlotForm.end_at) {
      setBusySlotsError("Please select both start and end time.");
      return;
    }

    const startDate = new Date(busySlotForm.start_at);
    const endDate = new Date(busySlotForm.end_at);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setBusySlotsError("Invalid date format.");
      return;
    }
    if (startDate >= endDate) {
      setBusySlotsError("Start time must be before end time.");
      return;
    }

    setIsCreatingBusySlot(true);
    setBusySlotsError("");
    try {
      await createManualBusySlot(startDate.toISOString(), endDate.toISOString());
      setBusySlotForm({ start_at: "", end_at: "" });
      await loadBusySlots();
    } catch (err) {
      setBusySlotsError(err.message || "Failed to create busy time slot.");
    } finally {
      setIsCreatingBusySlot(false);
    }
  };

  const handleDeleteBusySlot = async (slotId) => {
    if (!window.confirm("Delete this busy slot?")) {
      return;
    }
    setBusySlotActionLoadingId(slotId);
    setBusySlotsError("");
    try {
      await deleteManualBusySlot(slotId);
      await loadBusySlots();
    } catch (err) {
      setBusySlotsError(err.message || "Failed to delete busy slot.");
    } finally {
      setBusySlotActionLoadingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Worker Dashboard</h1>
          <p>Track your upcoming jobs and manage your availability.</p>
        </div>
        <div className={styles.chip}>Today • Worker View</div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Requests</span>
          <strong className={styles.statValue}>{requests.length}</strong>
          <span className={styles.statHint}>Waiting for your response</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Potential Revenue</span>
          <strong className={styles.statValue}>${totalRevenue.toFixed(2)}</strong>
          <span className={styles.statHint}>From current pending requests</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Accepted Jobs</span>
          <strong className={styles.statValue}>{acceptedBookings.length}</strong>
          <span className={styles.statHint}>Confirmed bookings</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Offerings</span>
          <strong className={styles.statValue}>{activeOfferCount}</strong>
          <span className={styles.statHint}>Visible to clients right now</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Manual Busy Slots</span>
          <strong className={styles.statValue}>{manualBusyCount}</strong>
          <span className={styles.statHint}>Blocked availability windows</span>
        </div>
      </section>
      {error && <p>{error}</p>}
      {isLoading && <p>Loading booking requests...</p>}

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Booking Requests</h2>
          </div>
          <ul className={styles.requestList}>
            {!requests.length && !isLoading && <p>No pending requests right now.</p>}
            {requests.map((req) => (
              <li key={req.booking_id} className={styles.requestItem}>
                <div className={styles.requestMain}>
                  <div>
                    <h3>{req.service_name || req.title || "Service Request"}</h3>
                    <p className={styles.clientName}>Client: {req.client_name || "-"}</p>
                    <p className={styles.meta}>
                      {new Date(req.start_at).toLocaleDateString()} •{" "}
                      {new Date(req.start_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className={styles.badgeRow}>
                    <span
                      className={
                        req.booking_status === "requested"
                          ? styles.statusNew
                          : styles.statusConfirmed
                      }
                    >
                      {req.booking_status}
                    </span>
                    <span className={styles.price}>${Number(req.total || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => handleAction(req.booking_id, "reject")}
                    disabled={actionLoadingId === req.booking_id}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => handleAction(req.booking_id, "accept")}
                    disabled={actionLoadingId === req.booking_id}
                  >
                    Accept
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Booking History</h2>
          </div>
          <div className={styles.historySection}>
            <h3>Accepted Bookings</h3>
            <ul className={styles.requestList}>
              {!acceptedBookings.length && <p>No accepted bookings yet.</p>}
              {acceptedBookings.map((req) => (
                <li key={req.booking_id} className={styles.requestItem}>
                  <div className={styles.requestMain}>
                    <div>
                      <h3>{req.service_name || req.title || "Service Request"}</h3>
                      <p className={styles.clientName}>Client: {req.client_name || "-"}</p>
                      <p className={styles.meta}>
                        {new Date(req.start_at).toLocaleDateString()} •{" "}
                        {new Date(req.start_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className={styles.badgeRow}>
                      <span className={styles.statusConfirmed}>
                        {req.booking_status}
                      </span>
                      <span className={styles.price}>${Number(req.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <h3>Rejected Bookings</h3>
            <ul className={styles.requestList}>
              {!rejectedBookings.length && <p>No rejected bookings yet.</p>}
              {rejectedBookings.map((req) => (
                <li key={req.booking_id} className={styles.requestItem}>
                  <div className={styles.requestMain}>
                    <div>
                      <h3>{req.service_name || req.title || "Service Request"}</h3>
                      <p className={styles.clientName}>Client: {req.client_name || "-"}</p>
                      <p className={styles.meta}>
                        {new Date(req.start_at).toLocaleDateString()} •{" "}
                        {new Date(req.start_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className={styles.badgeRow}>
                      <span className={styles.statusRejected}>
                        {req.booking_status}
                      </span>
                      <span className={styles.price}>${Number(req.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Busy Time Slots</h2>
          </div>
          <p className={styles.helperText}>
            Add manual unavailable windows. These are saved as time slots with no booking.
          </p>
          {busySlotsError && <p className={styles.errorText}>{busySlotsError}</p>}
          <form className={styles.offeringForm} onSubmit={handleCreateBusySlot}>
            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span>Start *</span>
                <input
                  type="datetime-local"
                  value={busySlotForm.start_at}
                  onChange={(e) => handleBusySlotFormChange("start_at", e.target.value)}
                  disabled={isCreatingBusySlot}
                />
              </label>
              <label className={styles.formField}>
                <span>End *</span>
                <input
                  type="datetime-local"
                  value={busySlotForm.end_at}
                  onChange={(e) => handleBusySlotFormChange("end_at", e.target.value)}
                  disabled={isCreatingBusySlot}
                />
              </label>
            </div>
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={isCreatingBusySlot}
              >
                {isCreatingBusySlot ? "Creating..." : "Add Busy Slot"}
              </button>
            </div>
          </form>

          {busySlotsLoading ? (
            <p>Loading busy time slots...</p>
          ) : (
            <ul className={styles.requestList}>
              {!busySlots.length && <p>No manual busy slots yet.</p>}
              {busySlots.map((slot) => (
                <li key={slot.id} className={styles.requestItem}>
                  <div className={styles.requestMain}>
                    <div>
                      <h3>Manual Block #{slot.id}</h3>
                      <p className={styles.meta}>
                        {new Date(slot.start_at).toLocaleString()} -{" "}
                        {new Date(slot.end_at).toLocaleString()}
                      </p>
                      <p className={styles.clientName}>
                        booking_id: {slot.booking_id == null ? "null" : slot.booking_id}
                      </p>
                    </div>
                    <div className={styles.badgeRow}>
                      <span className={styles.statusInactive}>busy</span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.dangerBtn}
                      onClick={() => handleDeleteBusySlot(slot.id)}
                      disabled={busySlotActionLoadingId === slot.id}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`${styles.card} ${styles.fullWidthCard}`}>
          <div className={styles.cardHeader}>
            <h2>My Offerings</h2>
            <span className={styles.badge}>{providerOffers.length} total</span>
          </div>
          {offersError && <p className={styles.errorText}>{offersError}</p>}
          <form
            ref={offeringFormRef}
            className={styles.offeringForm}
            onSubmit={handleOfferSubmit}
          >
            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span>Service *</span>
                <select
                  value={offerForm.service_id}
                  onChange={(e) => handleOfferFormChange("service_id", e.target.value)} //???????
                  disabled={isSavingOffer}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.formField}>
                <span>Title *</span>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => handleOfferFormChange("title", e.target.value)}
                  placeholder="e.g. Deep home cleaning"
                  disabled={isSavingOffer}
                />
              </label>
              <label className={styles.formField}>
                <span>Rate *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerForm.rate}
                  onChange={(e) => handleOfferFormChange("rate", e.target.value)}
                  placeholder="0.00"
                  disabled={isSavingOffer}
                />
              </label>
              <label className={styles.formField}>
                <span>Currency *</span>
                <input
                  type="text"
                  maxLength={3}
                  value={offerForm.curr}
                  onChange={(e) => handleOfferFormChange("curr", e.target.value)}
                  placeholder="USD"
                  disabled={isSavingOffer}
                />
              </label>
              <label className={styles.formField}>
                <span>Status</span>
                <select
                  value={offerForm.active ? "true" : "false"}
                  onChange={(e) =>
                    handleOfferFormChange("active", e.target.value === "true")
                  }
                  disabled={isSavingOffer}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.primaryBtn} disabled={isSavingOffer}>
                {isSavingOffer
                  ? "Saving..."
                  : editingOfferId
                  ? "Update Offering"
                  : "Create Offering"}
              </button>
              {editingOfferId && (
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={resetOfferForm}
                  disabled={isSavingOffer}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {offersLoading ? (
            <p>Loading your offerings...</p>
          ) : (
            <ul className={styles.requestList}>
              {!providerOffers.length && <p>No offerings yet. Create your first one.</p>}
              {providerOffers.map((offer) => (
                <li key={offer.offerId} className={styles.requestItem}>
                  <div className={styles.requestMain}>
                    <div>
                      <h3>{offer.offerTitle}</h3>
                      <p className={styles.clientName}>
                        {offer.serviceName} • {offer.providerCity}, {offer.providerCountry}
                      </p>
                      <p className={styles.meta}>
                        Currency: {offer.currency} • Rate: $
                        {Number(offer.hourlyRate || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className={styles.badgeRow}>
                      <span
                        className={
                          offer.active ? styles.statusConfirmed : styles.statusInactive
                        }
                      >
                        {offer.active ? "active" : "inactive"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => handleEditOffer(offer)}
                      disabled={offerActionLoadingId === offer.offerId}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => handleToggleOfferStatus(offer)}
                      disabled={offerActionLoadingId === offer.offerId}
                    >
                      {offer.active ? "Set Inactive" : "Set Active"}
                    </button>
                    <button
                      type="button"
                      className={styles.dangerBtn}
                      onClick={() => handleDeleteOffer(offer.offerId)}
                      disabled={offerActionLoadingId === offer.offerId}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default WorkerDashboard;