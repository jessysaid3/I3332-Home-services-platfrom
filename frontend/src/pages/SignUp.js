import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/SignUp.module.css";
import axios from "axios";

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Read role from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlRole = searchParams.get('role');
    if (urlRole === 'provider') {
      setRole('worker'); // Map 'provider' to 'worker' for internal state
    } else if (urlRole === 'admin') {
      setRole('admin'); // Set admin role directly
    }
  }, [location.search]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminPassword: "",
    bio: "",
    address: {
      country: "",
      city: "",
      street: "",
      building: "",
      floor: "",
      apartment: ""
    }
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    terms: ""
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: ""
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let message = "";
    let color = "";

    if (password.length === 0) {
      return { score: 0, message: "", color: "" };
    }

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Set message and color based on score
    if (score <= 2) {
      message = "Weak password";
      color = "#ef4444";
    } else if (score <= 4) {
      message = "Fair password";
      color = "#f59e0b";
    } else {
      message = "Strong password";
      color = "#10b981";
    }

    return { score, message, color };
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Real-time email validation
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
    
    // Password validation and strength calculation
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
      
      if (value && value.length < 8) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
    
    // Confirm password validation
    if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    
    // Full name validation
    if (name === 'fullName') {
      if (value && value.length < 2) {
        setErrors(prev => ({ ...prev, fullName: 'Name must be at least 2 characters' }));
      } else {
        setErrors(prev => ({ ...prev, fullName: '' }));
      }
    }
    
    // Phone validation
    if (name === 'phone') {
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      if (value && !phoneRegex.test(value)) {
        setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      } else if (value && value.length < 10) {
        setErrors(prev => ({ ...prev, phone: 'Phone number must be at least 10 digits' }));
      } else {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  };


  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  // Comprehensive validation
  const newErrors = {};
  
  if (!validateEmail(formData.email)) {
    newErrors.email = 'Please enter a valid email address';
  }
  
  if (!formData.fullName || formData.fullName.length < 2) {
    newErrors.fullName = 'Name must be at least 2 characters';
  }
  
  if (formData.phone) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
  }
  
  if (!formData.password || formData.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }
  
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }
  
  if (role === "worker" && !formData.bio) {
    newErrors.bio = 'Bio is required for workers';
  }
  
  if (role === "admin" && !formData.adminPassword) {
    newErrors.adminPassword = 'Admin password is required';
  }
  
  if (!acceptedTerms) {
    newErrors.terms = 'You must accept the terms and conditions';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(prev => ({ ...prev, ...newErrors }));
    setIsLoading(false);
    return;
  }

  try {
    const response = await axios.post(
      "https://backend.universalsoftwaresolutions.com/api/v1/auth/signup", 
      {
        name: formData.fullName, 
        email: formData.email,
        password: formData.password,
        role: role === "worker" ? "provider" : "client", // ? mapping
        bio: formData.bio,
        adminPassword: formData.adminPassword,
        address: {
            country: formData.address.country,
            city: formData.address.city,
            street: formData.address.street,
            building: formData.address.building,
            floor: Number(formData.address.floor), // ? number
            apartment: formData.address.apartment
          }
        }
      );

    console.log("SUCCESS:", response.data);
    showToast("Account created successfully!", "success");
    setTimeout(() => {
      navigate("/signin");
    }, 1500);

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    showToast(error.response?.data?.message || "Signup failed", "error");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className={styles.authContainer}>
      {/* LEFT PANEL */}
      <div className={styles.authLeft}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className={styles.brandName}>HomeServe</span>
        </Link>

        <div className={styles.heroContent}>
          <h1>
            Join thousands of <br />
            people who trust <br />
            HomeServe daily
          </h1>
          <p>Create a free account to book trusted home services.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.authRight}>
        <div className={styles.formWrapper}>
          <h2>Create Account</h2>
          <p className={styles.subText}>Join HomeServe — it's free!</p>

          <form onSubmit={handleSubmit}>
            {/* ROLE TOGGLE */}
            <div className={styles.roleToggle}>
              <button
                type="button"
                className={role === "client" ? styles.activeRole : ""}
                onClick={() => setRole("client")}
              >
                Client
              </button>

              <button
                type="button"
                className={role === "worker" ? styles.activeRole : ""}
                onClick={() => setRole("worker")}
              >
                Worker
              </button>

              <button
                type="button"
                className={role === "admin" ? styles.activeRole : ""}
                onClick={() => setRole("admin")}
              >
                Admin
              </button>
            </div>

            {/* FULL NAME */}
            <div className={styles.inputGroup}>
              <label>Full Name</label>
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? styles.errorInput : ''}
                />
              </div>
              {errors.fullName && <div className={styles.errorMessage}>{errors.fullName}</div>}
            </div>

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
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? styles.errorInput : ''}
                />
              </div>
              {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
            </div>

            {/* PHONE NUMBER */}
            <div className={styles.inputGroup}>
              <label>Phone Number (Optional)</label>
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? styles.errorInput : ''}
                />
              </div>
              {errors.phone && <div className={styles.errorMessage}>{errors.phone}</div>}
            </div>

            {/* PASSWORD */}
            <div className={styles.inputGroup}>
              <label>Password</label>
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
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
              {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
              {passwordStrength.message && (
                <div className={styles.passwordStrength} style={{ color: passwordStrength.color }}>
                  {passwordStrength.message}
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className={styles.inputGroup}>
              <label>Confirm Password</label>
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
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? styles.errorInput : ''}
                />
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
              {errors.confirmPassword && <div className={styles.errorMessage}>{errors.confirmPassword}</div>}
            </div>

            {/* ADMIN PASSWORD */}
            {role === "admin" && (
              <div className={styles.inputGroup}>
                <label>Admin Secret Password</label>
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
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <input
                    name="adminPassword"
                    type="password"
                    placeholder="Enter admin secret"
                    required
                    value={formData.adminPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

          {/* BIO */}
            {role === "worker" && (
              <div className={styles.inputGroup}>
                <label>Bio</label>
                <input name="bio" placeholder="Tell us about yourself" onChange={handleChange} />
              </div>
            )}

            {/* ADDRESS */}
            <div className={styles.inputGroup}>
              <label>Country</label>
              <input name="address.country" onChange={handleChange} />
            </div>

            <div className={styles.inputGroup}>
              <label>City</label>
              <input name="address.city" onChange={handleChange} />
            </div>

            <div className={styles.inputGroup}>
              <label>Street</label>
              <input name="address.street" onChange={handleChange} />
            </div>

            <div className={styles.inputGroup}>
              <label>Building</label>
              <input name="address.building" onChange={handleChange} />
            </div>

            <div className={styles.inputGroup}>
              <label>Floor</label>
              <input name="address.floor" type="number" onChange={handleChange} />
            </div>

            <div className={styles.inputGroup}>
              <label>Apartment</label>
              <input name="address.apartment" onChange={handleChange} />
            </div>

            {/* TERMS AND CONDITIONS */}
            <div className={styles.termsGroup}>
              <label className={styles.termsLabel}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                  className={styles.termsCheckbox}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className={styles.termsLink}>
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className={styles.termsLink}>
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && <div className={styles.errorMessage}>{errors.terms}</div>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Creating Account...' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
            </button>
          </form>

          <p className={styles.signInLink}>
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>

        {/* TOAST NOTIFICATION */}
        {toast.show && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}