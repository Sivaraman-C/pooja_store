import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from '../../Assets/Logo1.png'
import LogoutPopup from "../../LogoutPopup/LogoutPopup";
import "./AdminLayout.css";

const handleAdminProfileClick = (navigate) => {
  navigate("/admin/profile");
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isSuperAdmin = currentUser?.role === "super_admin";
  const userName = currentUser?.name || "Administrator";
  const userRole = currentUser?.role === "super_admin" ? "Super Admin" : "Admin";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
  const [showLogoutPopup, setShowLogoutPopup] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <div className='nav-logo'>
                <img src={Logo} alt="Logo" />
            </div>
          <span>ADMIN PANEL</span>
        </div>

        <nav className="admin-nav">

          <NavLink to="/admin" end>
            <span>▦</span>
            Dashboard
          </NavLink>

          <NavLink to="/admin/products">
            <span>▤</span>
            Products
          </NavLink>

          <NavLink to="/admin/orders">
            <span>◫</span>
            Orders
          </NavLink>

          <NavLink to="/admin/order-items">
            <span>◌</span>
            Order Items
          </NavLink>

          <NavLink to="/admin/categories">
            <span>◈</span>
            Categories
          </NavLink>

          <NavLink to="/admin/customers">
            <span>♙</span>
            Customers
          </NavLink>

          {isSuperAdmin && (
            <NavLink to="/admin/admins">
              <span>♙</span>
              Add Admin
            </NavLink>
          )}

          <NavLink to="/admin/settings">
            <span>⚙</span>
            Settings
          </NavLink>

        </nav>

        <div className="admin-sidebar-bottom">

          <NavLink to="/">
            <span>←</span>
            View Store
          </NavLink>

          <button onClick={() => setShowLogoutPopup(true)}>
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {showLogoutPopup && (
        <LogoutPopup
          onCancel={() => setShowLogoutPopup(false)}
          onConfirm={() => {
            setShowLogoutPopup(false);
            handleLogout();
          }}
        />
      )}


      <main className="admin-main">

        <header className="admin-header">

          <div>
            <h3>Admin Dashboard</h3>
          </div>

          <button
            type="button"
            className="admin-user"
            onClick={() => handleAdminProfileClick(navigate)}
            aria-label="Open admin profile"
          >
            <div className="admin-avatar">
              {userInitials}
            </div>

            <div>
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </div>
          </button>

        </header>


        <div className="admin-content">
          <Outlet />
        </div>

      </main>

    </div>
  );
};

export default AdminLayout;