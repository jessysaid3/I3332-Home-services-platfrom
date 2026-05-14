import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Orders.module.css";
import {
  cancelUserOrder,
  fetchOrderItems,
  fetchUserOrders,
  payOrder,
} from "../api/ordersApi";

const FINAL_STATUSES = ["cancelled", "completed"];

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionOrderId, setActionOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItemsById, setOrderItemsById] = useState({});
  const [itemsLoadingId, setItemsLoadingId] = useState(null);
  const [paymentOrderId, setPaymentOrderId] = useState(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    method: "card",
    type: "full",
    amount: "",
    curr: "USD",
  });

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (orderId) => {
    setActionOrderId(orderId);
    setError("");
    try {
      await cancelUserOrder(orderId);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to cancel order.");
    } finally {
      setActionOrderId(null);
    }
  };

  const handleToggleItems = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);
    if (orderItemsById[orderId]) return;

    setItemsLoadingId(orderId);
    setError("");
    try {
      const items = await fetchOrderItems(orderId);
      setOrderItemsById((prev) => ({ ...prev, [orderId]: Array.isArray(items) ? items : [] }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load order items.");
      setOrderItemsById((prev) => ({ ...prev, [orderId]: [] }));
    } finally {
      setItemsLoadingId(null);
    }
  };

  const openPaymentModal = (order) => {
    setPaymentModalOrder(order);
    setPaymentForm({
      method: "card",
      type: "full",
      amount: String(order.total || 0),
      curr: order.curr || "USD",
    });
  };

  const closePaymentModal = () => {
    setPaymentModalOrder(null);
  };

  const handlePayNow = async () => {
    if (!paymentModalOrder) return;
    const amountValue = Number(paymentForm.amount);
    if (!amountValue || amountValue <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setPaymentOrderId(paymentModalOrder.id);
    setError("");
    try {
      await payOrder({
        order_id: paymentModalOrder.id,
        method: paymentForm.method,
        type: paymentForm.type,
        amount: amountValue,
        curr: paymentForm.curr,
      });
      await loadOrders();
      closePaymentModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed.");
    } finally {
      setPaymentOrderId(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <h1>My Orders</h1>
        <p>View your service orders and cancel active ones when needed.</p>
      </section>

      {loading && <p className={styles.info}>Loading your orders...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !orders.length && <div className={styles.emptyCard}>No orders found yet.</div>}

      <div className={styles.list}>
        {orders.map((order) => {
          const status = (order.status || "").toLowerCase();
          const canCancel = !FINAL_STATUSES.includes(status);
          const canPay = status === "pending_payment";
          const createdAt = order.created_at
            ? new Date(order.created_at).toLocaleString()
            : "N/A";

          return (
            <article key={order.id} className={styles.card}>
              <div className={styles.cardTop}>
                <h3>Order #{order.id}</h3>
                <span className={`${styles.badge} ${styles[status] || styles.defaultStatus}`}>
                  {order.status || "Unknown"}
                </span>
              </div>

              <div className={styles.metaGrid}>
                <p>
                  <strong>Total:</strong> {order.curr || "$"} {order.total || 0}
                </p>
                <p>
                  <strong>Created:</strong> {createdAt}
                </p>
              </div>

              <button
                type="button"
                className={styles.itemsBtn}
                onClick={() => handleToggleItems(order.id)}
              >
                {expandedOrderId === order.id ? "Hide Items" : "Show Items"}
              </button>

              {expandedOrderId === order.id && (
                <div className={styles.itemsBox}>
                  {itemsLoadingId === order.id && <p className={styles.info}>Loading items...</p>}
                  {!itemsLoadingId && !(orderItemsById[order.id] || []).length && (
                    <p className={styles.info}>No items found for this order.</p>
                  )}
                  {!itemsLoadingId &&
                    (orderItemsById[order.id] || []).map((item) => (
                      <div key={item.id} className={styles.itemRow}>
                        <p>
                          <strong>{item.title || item.service_name || "Service Item"}</strong>
                        </p>
                        <p>Provider: {item.provider_name || "-"}</p>
                        <p>
                          {item.hours || 0}h x {order.curr || "$"} {item.price || 0}
                        </p>
                        <p>
                          Item Total: {order.curr || "$"} {item.total || 0}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              <div className={styles.actions}>
                {canCancel && (
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => handleCancel(order.id)}
                    disabled={actionOrderId === order.id}
                  >
                    {actionOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
                {canPay && (
                  <button
                    type="button"
                    className={styles.payBtn}
                    onClick={() => navigate('/checkout', {
                      state: {
                        order_id : order.id,
                        method : "",
                        type : "full",
                        amount : order.total,
                        curr : order.curr
                      }
                    })}
                    disabled={paymentOrderId === order.id}
                  >
                    {paymentOrderId === order.id ? "Processing..." : "Pay Now"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {paymentModalOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3>Pay Order #{paymentModalOrder.id}</h3>

            <label className={styles.fieldLabel}>
              Payment Method
              <select
                value={paymentForm.method}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, method: e.target.value }))}
              >
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="crypto">Crypto</option>
              </select>
            </label>

            <label className={styles.fieldLabel}>
              Payment Type
              <select
                value={paymentForm.type}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="full">Full</option>
                <option value="installments">Installments</option>
              </select>
            </label>

            <label className={styles.fieldLabel}>
              Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </label>

            <label className={styles.fieldLabel}>
              Currency
              <select
                value={paymentForm.curr}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, curr: e.target.value }))}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
              </select>
            </label>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelModalBtn}
                onClick={closePaymentModal}
                disabled={paymentOrderId === paymentModalOrder.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmPayBtn}
                onClick={handlePayNow}
                disabled={paymentOrderId === paymentModalOrder.id}
              >
                {paymentOrderId === paymentModalOrder.id ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
