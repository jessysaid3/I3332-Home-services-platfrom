import React, { useState } from "react";
import "../styles/WorkerVerification.css";

const WorkerVerification = () => {
  const [form, setForm] = useState({
    fullName: "",
    idType: "national_id",
    idNumber: "",
  });
  const [fileName, setFileName] = useState("");
  const [selfieName, setSelfieName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
  };

  const handleSelfieChange = (e) => {
    const file = e.target.files?.[0];
    setSelfieName(file ? file.name : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="verification-page">
      <div className="verification-header">
        <h1>Worker Verification</h1>
        <p>
          Upload your government ID and a selfie to get verified and start
          receiving bookings.
        </p>
      </div>

      <form className="verification-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="fullName">Full name on ID</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter your full legal name"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label htmlFor="idType">ID type</label>
            <select
              id="idType"
              name="idType"
              value={form.idType}
              onChange={handleChange}
            >
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="residency">Residency card</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="idNumber">ID number</label>
            <input
              id="idNumber"
              name="idNumber"
              type="text"
              placeholder="e.g. 123456789"
              value={form.idNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="upload-grid">
          <div className="upload-card">
            <h2>Front of ID</h2>
            <p>Upload a clear photo or scan of the front of your ID.</p>
            <label className="upload-button">
              <span>Choose file</span>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
            </label>
            {fileName && <p className="file-name">{fileName}</p>}
          </div>

          <div className="upload-card">
            <h2>Selfie with ID</h2>
            <p>
              Take a selfie holding your ID next to your face so we can match
              you.
            </p>
            <label className="upload-button">
              <span>Choose file</span>
              <input type="file" accept="image/*" onChange={handleSelfieChange} />
            </label>
            {selfieName && <p className="file-name">{selfieName}</p>}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Submit for review
        </button>

        {submitted && (
          <p className="success-message">
            Your documents have been submitted. Verification usually takes 1–2
            business days.
          </p>
        )}
      </form>
    </div>
  );
};

export default WorkerVerification;

