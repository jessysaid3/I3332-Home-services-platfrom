import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import { useState, useEffect } from "react";

import "./App.css";

import Header from "./components/Header";

import Footer from "./components/Footer";

import Home from "./pages/Home";

import SignIn from "./pages/SignIn";

import SignUp from "./pages/SignUp";

import Services from "./pages/Services";

import Offerings from "./pages/Offerings";

import Checkout from "./pages/Checkout";

import Cart from "./pages/Cart";

import Rating from "./pages/Rating";

import WorkerDashboard from "./pages/WorkerDashboard";

import AdminDashboard from "./pages/AdminDashboard";

import Profile from "./pages/Profile";

import BookingsPage from "./pages/BookingsPage";

import Contact from "./pages/Contact";

import FAQ from "./pages/FAQ";

import WorkerVerification from "./pages/WorkerVerification";

import Privacy from "./pages/Privacy";

import Terms from "./pages/Terms";

import Orders from "./pages/Orders";

import Payments from "./pages/Payments";

import About from "./pages/About";



function AppLayout() {

  const [user, setUser] = useState(null);

  const location = useLocation();

  const hideLayoutForAuth =

    location.pathname === "/signin" || location.pathname === "/signup";



  useEffect(() => {

    // Load user from localStorage on app mount

    const storedUser = localStorage.getItem("user");

    if (storedUser) {

      try {

        setUser(JSON.parse(storedUser));

      } catch (err) {

        console.error("Failed to parse stored user:", err);

        localStorage.removeItem("user");

      }

    }

  }, []);



  return (

    <div className="app">

      {!hideLayoutForAuth && <Header user={user} setUser={setUser} />}

      <main className="main-content">

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/signin" element={<SignIn setUser={setUser} />} />

          <Route path="/signup" element={<SignUp />} />

          <Route path="/services" element={<Services />} />

          <Route path="/offerings" element={<Offerings />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/rating" element={<Rating />} />

          <Route path="/worker-dashboard" element={<WorkerDashboard />} />

          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/bookings" element={<BookingsPage />} />

          <Route path="/history" element={<BookingsPage />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/faq" element={<FAQ />} />

          <Route path="/worker-verification" element={<WorkerVerification />} />

          <Route path="/privacy" element={<Privacy />} />

          <Route path="/terms" element={<Terms />} />

          <Route path="/orders" element={<Orders />} />

          <Route path="/orders/:id" element={<Orders />} />

          <Route path="/payments" element={<Payments />} />

          <Route path="/about" element={<About />} />

        </Routes>

      </main>

      {!hideLayoutForAuth && <Footer />}

    </div>

  );

}

function App() {

  return (

    <Router>

      <AppLayout />

    </Router>

  )

}

export default App;