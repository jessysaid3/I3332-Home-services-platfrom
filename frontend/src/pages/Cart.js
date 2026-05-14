import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { checkoutCart, editCartItem, fetchCartItems, removeCartItem } from "../api/cartApi";

import styles from "../styles/Cart.module.css";



const toDateTimeLocalValue = (value) => {

  if (!value) return "";

  const date = new Date(value);

  const offset = date.getTimezoneOffset();

  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);

};



function Cart() {

  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [removingId, setRemovingId] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [savingId, setSavingId] = useState(null);

  const [editForm, setEditForm] = useState({ start_at: "", end_at: "" });

  const [error, setError] = useState("");



  const loadCart = async () => {

    setIsLoading(true);

    setError("");

    try {

      const data = await fetchCartItems();

      setItems(Array.isArray(data) ? data : []);

    } catch (err) {

      setError(err.message || "Failed to load cart.");

    } finally {

      setIsLoading(false);

    }

  };



  useEffect(() => {

    loadCart();

  }, []);



  const total = useMemo(

    () =>

      items.reduce((sum, item) => {

        const lineTotal = Number(item.hours || 0) * Number(item.rate || 0);

        return sum + lineTotal;

      }, 0),

    [items]

  );



  const handleRemove = async (id) => {

    setRemovingId(id);

    setError("");

    try {

      await removeCartItem(id);

      setItems((prev) => prev.filter((item) => item.id !== id));

    } catch (err) {

      setError(err.message || "Failed to remove item.");

    } finally {

      setRemovingId(null);

    }

  };



  const handleCheckout = async () => {

    setIsCheckingOut(true);

    setError("");

    try {

      const response = await checkoutCart();

      navigate('/checkout', {
        state: {
          order_id : response.order_id,
          method : "",
          type : "full",
          amount : total,
          curr : "USD"
        }
      });

    } catch (err) {

      setError(err.message || "Checkout failed.");

    } finally {

      setIsCheckingOut(false);

    }

  };



  const startEditing = (item) => {

    setEditingId(item.id);

    setEditForm({

      start_at: toDateTimeLocalValue(item.start_at),

      end_at: toDateTimeLocalValue(item.end_at),

    });

    setError("");

  };



  const cancelEditing = () => {

    setEditingId(null);

    setEditForm({ start_at: "", end_at: "" });

  };



  const handleSaveEdit = async (itemId) => {

    if (!editForm.start_at || !editForm.end_at) {

      setError("Please provide both start and end time.");

      return;

    }

    if (new Date(editForm.start_at) >= new Date(editForm.end_at)) {

      setError("End time must be later than start time.");

      return;

    }



    setSavingId(itemId);

    setError("");

    try {

      await editCartItem(itemId, {

        start_at: new Date(editForm.start_at).getTime(),

        end_at: new Date(editForm.end_at).getTime(),

      });

      await loadCart();

      cancelEditing();

    } catch (err) {

      setError(err.message || "Failed to update cart item.");

    } finally {

      setSavingId(null);

    }

  };



  return (

    <div className={styles.wrapper}>

      <div className={styles.headerRow}>

        <h1>My Cart</h1>

        <button type="button" className={styles.backBtn} onClick={() => navigate("/services")}>

          Continue Shopping

        </button>

      </div>



      {isLoading && <p>Loading cart...</p>}

      {error && <p className={styles.error}>{error}</p>}



      {!isLoading && !items.length && (

        <div className={styles.emptyCard}>

          <p>Your cart is empty.</p>

          <button type="button" className={styles.primaryBtn} onClick={() => navigate("/services")}>

            Browse Services

          </button>

        </div>

      )}



      {!!items.length && (

        <div className={styles.layout}>

          <section className={styles.list}>

            {items.map((item) => {

              const lineTotal = Number(item.hours || 0) * Number(item.rate || 0);

              const startText = item.start_at ? new Date(item.start_at).toLocaleString() : "-";

              const endText = item.end_at ? new Date(item.end_at).toLocaleString() : "-";



              return (

                <article key={item.id} className={styles.card}>

                  <div className={styles.cardTop}>

                    <div>

                      <h3>{item.title || item.service_name || "Service"}</h3>

                      <p className={styles.provider}>Provider: {item.provider_name || "-"}</p>

                    </div>

                    <div className={styles.cardActions}>

                      {editingId !== item.id && (

                        <button

                          type="button"

                          className={styles.editBtn}

                          onClick={() => startEditing(item)}

                        >

                          Edit

                        </button>

                      )}

                      <button

                        type="button"

                        className={styles.removeBtn}

                        onClick={() => handleRemove(item.id)}

                        disabled={removingId === item.id || savingId === item.id}

                      >

                        {removingId === item.id ? "Removing..." : "Remove"}

                      </button>

                    </div>

                  </div>

                  {editingId === item.id && (

                    <div className={styles.editBox}>

                      <div className={styles.metaGrid}>

                        <label>

                          <strong>Start Time</strong>

                          <input

                            type="datetime-local"

                            value={editForm.start_at}

                            onChange={(e) =>

                              setEditForm((prev) => ({ ...prev, start_at: e.target.value }))

                            }

                          />

                        </label>

                        <label>

                          <strong>End Time</strong>

                          <input

                            type="datetime-local"

                            value={editForm.end_at}

                            onChange={(e) =>

                              setEditForm((prev) => ({ ...prev, end_at: e.target.value }))

                            }

                          />

                        </label>

                      </div>

                      <div className={styles.editActions}>

                        <button

                          type="button"

                          className={styles.saveBtn}

                          onClick={() => handleSaveEdit(item.id)}

                          disabled={savingId === item.id}

                        >

                          {savingId === item.id ? "Saving..." : "Save"}

                        </button>

                        <button type="button" className={styles.cancelBtn} onClick={cancelEditing}>

                          Cancel

                        </button>

                      </div>

                    </div>

                  )}

                  <div className={styles.metaGrid}>

                    <p>

                      <strong>Start:</strong> {startText}

                    </p>

                    <p>

                      <strong>End:</strong> {endText}

                    </p>

                    <p>

                      <strong>Hours:</strong> {item.hours}

                    </p>

                    <p>

                      <strong>Rate:</strong> {item.curr || "$"} {item.rate}

                    </p>

                  </div>

                  <p className={styles.lineTotal}>

                    Line Total: {item.curr || "$"} {lineTotal.toFixed(2)}

                  </p>

                </article>

              );

            })}

          </section>



          <aside className={styles.summary}>

            <h2>Summary</h2>

            <div className={styles.summaryRow}>

              <span>Items</span>

              <span>{items.length}</span>

            </div>

            <div className={`${styles.summaryRow} ${styles.total}`}>

              <span>Total</span>

              <span>$ {total.toFixed(2)}</span>

            </div>

            <button

              type="button"

              className={styles.primaryBtn}

              onClick={handleCheckout}

              disabled={isCheckingOut}

            >

              {isCheckingOut ? "Processing..." : "Checkout"}

            </button>

          </aside>

        </div>

      )}

    </div>

  );

}



export default Cart;

