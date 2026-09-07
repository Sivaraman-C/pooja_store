import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Components/Navbar/Navbar";
// import Footer from "./Components/Footer/Footer";

import Home from "./Pages/Home";
import About from "./Pages/About";
import Shop from "./Pages/Shop";
import LoginSignup from "./Pages/LoginSignup";
import Profile from "./Pages/Profile/Profile";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import Contact from "./Pages/Contact";
import FestivalCalendar from "./Components/FestivalCalendar/FestivalCalendar";
import Menu from "./Pages/Menu";
import Wishlist from "./Pages/Wishlist";

import AdminLayout from "./Components/Admin/AdminLayout/AdminLayout";
import Dashboard from "./Components/Admin/Dashboard/Dashboard";
import Products from "./Components/Admin/Products/Products";
import AddProduct from "./Components/Admin/AddProduct/AddProduct";
import EditProduct from "./Components/Admin/EditProduct/EditProduct";
import Orders from "./Components/Admin/Orders/Orders";
import OrderItems from "./Components/Admin/Orders/OrderItems";
import Categories from "./Components/Admin/Categories/Categories";
import Customers from "./Components/Admin/Customers/Customers";
import Admins from "./Components/Admin/Admins/Admins";
import AdminProfile from "./Components/Admin/AdminProfile/AdminProfile";
import Settings from "./Components/Admin/Settings/Settings";

import "./App.css";
import { CartProvider } from "./Context/CartContext";
import BottomNav from "./Components/BottomNav/BottomNav";

function AdminRoute() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    user = null;
  }

  return ["admin", "super_admin"].includes(user?.role)
    ? <AdminLayout />
    : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = React.useState(() => JSON.parse(localStorage.getItem("user")));

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  return (
    <BrowserRouter>
      <CartProvider>

      <Routes>

        {/* =========================
            CUSTOMER WEBSITE
        ========================== */}

        <Route
          path="/"
          element={
            user ? (
              <>
                <Navbar />
                <Home />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/calendar"
          element={
            <>
              <Navbar />
              <FestivalCalendar />
            </>
          }
        />

        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <Contact />
            </>
          }
        />

        <Route
          path="/shop"
          element={
            <>
              <Navbar />
              <Shop />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <LoginSignup />
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <Navbar />
              <Profile />
            </>
          }
        />

        <Route
          path="/cart"
          element={
            <>
              <Navbar />
              <Cart />
            </>
          }
        />

        <Route
          path="/checkout"
          element={
            <>
              <Navbar />
              <Checkout />
            </>
          }
        />

        <Route
          path="/menu"
          element={
            <>
              <Navbar />
              <Menu />
            </>
          }
        />

        <Route
          path="/wishlist"
          element={
            <>
              <Navbar />
              <Wishlist />
            </>
          }
        />

        <Route
          path="/admin"
          element={<AdminRoute />}
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-items" element={<OrderItems />} />
          <Route path="categories" element={<Categories />} />
          <Route path="customers" element={<Customers />} />
          <Route path="admins" element={<Admins />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Routes>
      {user && <BottomNav />}
      </CartProvider>

    </BrowserRouter>
  );
}

export default App;