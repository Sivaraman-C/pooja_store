import React, { useEffect, useState } from "react";
import "./Orders.css";

import API_URL from "../../../apiConfig";

const Orders = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders from:", `${API_URL}/api/orders`);
      const response = await fetch(`${API_URL}/api/orders`);

      if (!response.ok) {
        console.error("Order fetch response not OK:", response.status);
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      console.log("Orders received:", data);

      setOrders(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("Orders error:", error);
    } finally {
      setLoading(false);
    }
  };


  const updateStatus = async (id, status) => {

    try {

      const response = await fetch(`${API_URL}/api/orders/${id}`, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const result = await response.json();

      setOrders((previous) =>
        previous.map((order) =>
          order.id === id
            ? {
                ...order,
                status,
                payment_status: result.payment_status || order.payment_status,
              }
            : order
        )
      );

    } catch (error) {

      console.error(error);

      alert("Unable to update order");

    }

  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        method: "DELETE",
      });
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          "The server returned an invalid response. Please restart the backend."
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete order");
      }

      setOrders((previous) => previous.filter((order) => order.id !== id));
    } catch (error) {
      console.error("DELETE ORDER ERROR:", error);
      alert(error.message || "Unable to delete order");
    }
  };


  return (

    <div className="orders-admin">

      <div className="orders-title">

        <div>
          <p>STORE MANAGEMENT</p>
          <h1>Orders</h1>
        </div>

        <div className="orders-count">
          {orders.length} Orders
        </div>

      </div>


      <div className="orders-table-box">

        {loading ? (

          <div className="orders-loading">
            Loading orders...
          </div>

        ) : orders.length === 0 ? (

          <div className="orders-empty">

            <div className="orders-empty-icon">
              ◫
            </div>

            <h3>
              No orders found
            </h3>

            <p>
              Customer orders will appear here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {orders.map((order) => (

                  <tr key={order.id}>

                    <td>
                      <strong>
                        #{order.id}
                      </strong>
                    </td>

                    <td>
                      {order.customer_name ||
                        order.name ||
                        "Customer"}
                    </td>

                    <td>
                      ₹
                      {Number(
                        order.total || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`payment-badge ${String(order.payment_status || "Pending").toLowerCase()}`}
                      >
                        {order.payment_status || "Pending"}
                      </span>
                    </td>

                    <td>

                      <select
                        className={`order-status ${String(
                          order.status || "Pending"
                        ).toLowerCase()}`}
                        value={
                          order.status ||
                          "Pending"
                        }
                        onChange={(e) =>
                          updateStatus(
                            order.id,
                            e.target.value
                          )
                        }
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Processing">
                          Processing
                        </option>

                        <option value="Shipped">
                          Shipped
                        </option>

                        <option value="Delivered">
                          Delivered
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                    </td>

                    <td>
                      {order.created_at
                        ? new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </td>

                    <td>
                      <button
                        className="delete-order-btn"
                        onClick={() => deleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </td>

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

export default Orders;