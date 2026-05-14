import React from "react";
import styles from "../styles/StatusTracker.module.css";

/**
 * Simple step tracker for booking stages.
 *
 * Props:
 * - steps: string[] (e.g. ["Requested", "Confirmed", "In Progress", "Completed"])
 * - currentStep (number): index of current step (0-based)
 */
const StatusTracker = ({
  steps = ["Requested", "Confirmed", "In Progress", "Completed"],
  currentStep = 0,
}) => {
  return (
    <div className={styles.container}>
      {steps.map((label, index) => {
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={label} className={styles.stepItem}>
            <div
              className={`${styles.circle} ${
                isActive ? styles.circleActive : ""
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`${styles.label} ${
                isCurrent ? styles.labelCurrent : ""
              }`}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`${styles.line} ${
                  index < currentStep ? styles.lineActive : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;

