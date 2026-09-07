import React, { useEffect, useState } from "react";
import "./Customers.css";

import API_URL, { bypassHeaders } from "../../../apiConfig";

const Customers = () => {

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentRole = currentUser?.role || "";

    const requestHeaders = {
        "Content-Type": "application/json",
        "x-user-role": currentUser?.role || "",
        ...bypassHeaders
    };

    const fetchCustomers = () => {
        setLoading(true);
        fetch(`${API_URL}/api/customers`, {
            headers: {
                "x-user-role": currentRole,
                ...bypassHeaders
            },
        })
        .then((response) => response.ok ? response.json() : [])
        .then((data) => setCustomers(data))
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCustomers();
    }, [currentRole]);

    const handleEditClick = (customer) => {
        setEditingCustomer(customer.id);
        setFormData({
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            city: customer.city || "",
            state: customer.state || "",
            pincode: customer.pincode || ""
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/customers/${editingCustomer}`, {
                method: "PUT",
                headers: requestHeaders,
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert("Customer updated successfully");
                setEditingCustomer(null);
                fetchCustomers();
            } else {
                alert("Failed to update customer");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteCustomer = async (customer) => {
        if (!window.confirm(`Delete ${customer.name}?`)) return;
        const response = await fetch(`${API_URL}/api/customers/${customer.id}`, {
            method: "DELETE",
            headers: requestHeaders,
        });
        if (response.ok) setCustomers(customers.filter((item) => item.id !== customer.id));
    };

    return (

        <div className="customers-admin">

            <div className="customers-title">
                <div>
                    <p className="customers-eyebrow">CUSTOMER MANAGEMENT</p>
                    <h1>
                        Customers
                        <span className="customers-subtitle">
                            View and manage all registered customer details.
                        </span>
                    </h1>
                </div>
                <div className="customers-count">
                    <strong>{customers.length}</strong>
                    <span>Total customers</span>
                </div>
            </div>

            {editingCustomer && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <h2>Edit Customer Details</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="edit-grid">
                                <div className="field">
                                    <label>Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div className="field">
                                    <label>Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div className="field">
                                    <label>Phone</label>
                                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div className="field">
                                    <label>Pincode</label>
                                    <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                                </div>
                                <div className="field">
                                    <label>City</label>
                                    <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                                </div>
                                <div className="field">
                                    <label>State</label>
                                    <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                                </div>
                                <div className="field full">
                                    <label>Address</label>
                                    <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows="3" />
                                </div>
                            </div>
                            <div className="edit-actions">
                                <button type="button" className="cancel-btn" onClick={() => setEditingCustomer(null)}>Cancel</button>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="customers-table-box">
                {loading ? (
                    <div className="customers-loading">Loading customers...</div>
                ) : customers.length === 0 ? (
                    <div className="customers-empty">
                        <h3>No customers found</h3>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer Info</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>#{customer.id}</td>
                                        <td>
                                            <strong>{customer.name}</strong><br/>
                                            <small>{customer.email}</small>
                                        </td>
                                        <td>{customer.phone || "N/A"}</td>
                                        <td>
                                            {customer.city ? `${customer.city}, ${customer.state}` : "N/A"}<br/>
                                            <small>{customer.pincode}</small>
                                        </td>
                                        <td className="customer-actions">
                                            <button className="edit-btn" onClick={() => handleEditClick(customer)}>Edit</button>
                                            <button className="delete-btn" onClick={() => deleteCustomer(customer)}>Delete</button>
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

export default Customers;
