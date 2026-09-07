import React, { useEffect, useState } from "react";
import API_URL from "../../../apiConfig";
import "./Dashboard.css";

const Dashboard = () => {

  const [stats, setStats] = useState({
    products: 0,
    featured: 0,
    stock: 0,
    status: "Online",
  });

  const [loading, setLoading] = useState(true);


  // =========================
  // FETCH DASHBOARD STATS
  // =========================

  useEffect(() => {

    fetch(`${API_URL}/api/products/stats`)

      .then((res) => {

        if (!res.ok) {
          throw new Error(
            "Failed to fetch dashboard stats"
          );
        }

        return res.json();

      })

      .then((data) => {

        console.log(
          "Dashboard stats:",
          data
        );

        setStats({
          products: Number(data.products) || 0,
          featured: Number(data.featured) || 0,
          stock: Number(data.stock) || 0,
          status: data.status || "Online",
        });

      })

      .catch((err) => {

        console.error(
          "Dashboard stats error:",
          err
        );

        setStats({
          products: 0,
          featured: 0,
          stock: 0,
          status: "Offline",
        });

      })

      .finally(() => {

        setLoading(false);

      });

  }, []);


  return (

    <div className="dashboard">


      {/* =========================
          DASHBOARD TITLE
      ========================== */}

      <div className="dashboard-title">

        <div>

          <p>OVERVIEW</p>

          <h1>
            Welcome to Devaloka
          </h1>

        </div>


        <a
          href="/admin/products/add"
          className="dashboard-add-btn"
        >
          + Add Product
        </a>

      </div>


      {/* =========================
          STATISTICS
      ========================== */}

      <div className="stats-grid">


        {/* TOTAL PRODUCTS */}

        <div className="stat-card">

          <div className="stat-icon">
            ◈
          </div>

          <div>

            <span>
              Total Products
            </span>

            <strong>

              {loading
                ? "..."
                : stats.products}

            </strong>

          </div>

        </div>


        {/* FEATURED PRODUCTS */}

        <div className="stat-card">

          <div className="stat-icon">
            ★
          </div>

          <div>

            <span>
              Featured Products
            </span>

            <strong>

              {loading
                ? "..."
                : stats.featured}

            </strong>

          </div>

        </div>


        {/* TOTAL STOCK */}

        <div className="stat-card">

          <div className="stat-icon">
            ◫
          </div>

          <div>

            <span>
              Total Stock
            </span>

            <strong>

              {loading
                ? "..."
                : stats.stock}

            </strong>

          </div>

        </div>


        {/* STORE STATUS */}

        <div className="stat-card">

          <div className="stat-icon">
            ₹
          </div>

          <div>

            <span>
              Store Status
            </span>

            <strong
              className={
                stats.status === "Online"
                  ? "online"
                  : "offline"
              }
            >

              {loading
                ? "..."
                : stats.status}

            </strong>

          </div>

        </div>

      </div>


      {/* =========================
          QUICK ACTIONS
      ========================== */}

      <div className="dashboard-box">


        <div className="dashboard-box-header">

          <div>

            <p>STORE</p>

            <h2>
              Quick Actions
            </h2>

          </div>

        </div>


        <div className="quick-actions">


          {/* PRODUCTS */}

          <a href="/admin/products">

            <strong>
              Products
            </strong>

            <span>
              Manage your products →
            </span>

          </a>


          {/* ADD PRODUCT */}

          <a href="/admin/products/add">

            <strong>
              Add Product
            </strong>

            <span>
              Add new pooja item →
            </span>

          </a>


          {/* ORDERS */}

          <a href="/admin/orders">

            <strong>
              Orders
            </strong>

            <span>
              Manage customer orders →
            </span>

          </a>


          {/* CATEGORIES */}

          <a href="/admin/categories">

            <strong>
              Categories
            </strong>

            <span>
              Manage categories →
            </span>

          </a>


        </div>

      </div>

    </div>

  );

};

export default Dashboard;