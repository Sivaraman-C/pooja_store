import React, { useEffect, useState } from "react";
import "./Orders.css";

import API_URL from "../../../apiConfig";

const OrderItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/orders/items`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch order items");
        return response.json();
      })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Order items error:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="orders-admin">
      <div className="orders-title">
        <div>
          <p>STORE MANAGEMENT</p>
          <h1>Order Items</h1>
        </div>
        <div className="orders-count">{items.length} Items</div>
      </div>

      <div className="orders-table-box">
        {loading ? (
          <div className="orders-loading">Loading order items...</div>
        ) : items.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">◌</div>
            <h3>No order items found</h3>
            <p>Products included in orders will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>#{item.order_id}</strong></td>
                    <td>{item.product_name || `Product #${item.product_id}`}</td>
                    <td>{item.customer_name || "Customer"}</td>
                    <td>{item.quantity}</td>
                    <td>₹{Number(item.price || 0).toLocaleString("en-IN")}</td>
                    <td>₹{Number(item.total || 0).toLocaleString("en-IN")}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItems;