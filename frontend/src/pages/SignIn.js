import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/SignIn.module.css";
import { fetchProfile, loginWithEmail } from "../api/signInApi";

const SignIn = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const auth = await loginWithEmail({ email, password });
      localStorage.setItem("authToken", auth.token);

      const profile = await fetchProfile();

      const userData = {
        id: profile.id,
        name: profile.name,
        role: profile.role,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      const roleRoute =
        profile.role === "provider"
          ? "/worker-dashboard"
          : profile.role === "admin"
          ? "/admin"
          : "/";

      navigate(roleRoute);
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* LEFT PANEL */}
      <div className={styles.leftSide}>
        <Link to="/" className={styles.brand}>
          <div className={styles.homeIconBox}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className={styles.brandName}>HomeServe</span>
        </Link>

        <h1>Welcome back to your trusted home services platform</h1>
        <p>
          Manage bookings, track services, and connect with trusted professionals.
        </p>

        <ul className={styles.statsList}>
          <li>
            <span className={styles.dot}></span> 5,000+ satisfied customers
          </li>
          <li>
            <span className={styles.dot}></span> 1,200+ verified workers
          </li>
          <li>
            <span className={styles.dot}></span> 98% satisfaction rate
          </li>
        </ul>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightSide}>
        <div className={styles.formBox}>
          <h2>Sign In</h2>
          <p className={styles.subtitle}>
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label>Password</label>

                {/* ✅ FIXED LINK */}
                <Link to="/forgot-password" className={styles.forgotPass}>
                  Forgot password?
                </Link>
              </div>

              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* ✅ FIXED (button instead of span) */}
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d={
                        showPassword
                          ? "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                          : "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      }
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className={styles.signInBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "➜ Sign In"}
            </button>
          </form>

          {/* ERROR */}
          {error && (
            <p className={styles.subtitle} role="alert">
              {error}
            </p>
          )}

          {/* SIGN UP */}
          <p className={styles.signupText}>
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;