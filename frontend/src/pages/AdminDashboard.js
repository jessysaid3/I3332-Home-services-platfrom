import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/AdminDashboard.module.css";
import {
  fetchAdminServices,
  fetchAdminUsers,
  updateUserStatus,
  createService,
  deleteService,
} from "../api/adminDashboardApi";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [isCreatingService, setIsCreatingService] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [usersData, servicesData] = await Promise.all([
          fetchAdminUsers(),
          fetchAdminServices(),
        ]);
        setUsers(usersData.items || []);
        setServices(servicesData.items || []);
      } catch (err) {
        setError(err.message || "Failed to load admin dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalBookings = useMemo(
    () => services.reduce((sum, service) => sum + Number(service.offering_count || 0), 0),
    [services]
  );
  const activeWorkers = useMemo(
    () => users.filter((u) => u.role === "provider" && u.status === "active").length,
    [users]
  );
  const pendingVerifications = useMemo(
    () => users.filter((u) => u.status !== "active").length,
    [users]
  );

  const handleUserStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (err) {
      setError(err.message || "Failed to update user status.");
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    
    setIsCreatingService(true);
    setError("");
    try {
      await createService(newServiceName);
      // Refresh the services list from the server
      const servicesData = await fetchAdminServices();
      setServices(servicesData.items || []);
      setNewServiceName("");
    } catch (err) {
      console.error("Failed to create service:", err);
      setError(err.message || "Failed to create service.");
    } finally {
      setIsCreatingService(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    
    try {
      await deleteService(serviceId);
      setServices(services.filter((s) => s.id !== serviceId));
    } catch (err) {
      setError(err.message || "Failed to delete service.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Monitor your platform activity and manage users and services.</p>
        </div>
        <div className={styles.chip}>Today • Overview</div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Active Offerings</span>
          <strong className={styles.statValue}>{totalBookings}</strong>
          <span className={styles.statHint}>Across all service categories</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Workers</span>
          <strong className={styles.statValue}>{activeWorkers}</strong>
          <span className={styles.statHint}>Verified and ready to work</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Verifications</span>
          <strong className={styles.statValue}>{pendingVerifications}</strong>
          <span className={styles.statHint}>Review required</span>
        </div>
      </section>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Users</h2>
            <span className={styles.badge}>{users.length} total</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={
                        user.status === "active"
                          ? styles.statusActive
                          : styles.statusPending
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleUserStatusToggle(user.id, user.status)}
                    >
                      {user.status === "active" ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Services</h2>
            <span className={styles.badge}>{services.length} active</span>
          </div>
          <form onSubmit={handleCreateService} className={styles.createServiceForm}>
            <input
              type="text"
              placeholder="New service name"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className={styles.serviceInput}
              disabled={isCreatingService}
            />
            <button 
              type="submit" 
              className={styles.createButton}
              disabled={isCreatingService || !newServiceName.trim()}
            >
              {isCreatingService ? "Creating..." : "Add Service"}
            </button>
          </form>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Service</th>
                <th>Bookings</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>{service.offering_count}</td>
                  <td>n/a</td>
                  <td>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;