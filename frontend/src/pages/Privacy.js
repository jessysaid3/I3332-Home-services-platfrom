import React from "react";
import styles from "../styles/Legal.module.css";

const Privacy = () => (
  <div className={styles.wrap}>
    <h1>Privacy Policy</h1>
    <p>
      This is a placeholder privacy policy for the HomeServe demo. Replace this
      text with your real policy before production.
    </p>
    <h2>Data we collect</h2>
    <p>
      Account details you provide (name, email), booking information, and
      messages sent through the platform.
    </p>
    <h2>How we use data</h2>
    <p>
      To operate bookings, improve the service, and communicate with you about
      your account.
    </p>
  </div>
);

export default Privacy;
