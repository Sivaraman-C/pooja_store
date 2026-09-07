import React, { useEffect, useState } from "react";
import "./Customers.css";

import API_URL from "../../../apiConfig";

const Customers = () => {

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentRole = currentUser?.role || "";

    const requestHeaders = {
        "Content-Type": "application/json",
        "x-user-role": currentUser?.role || "",
    };

    const updateCustomer = async (customer) => {
        const name = window.prompt("Customer name", customer.name);
        const email = window.prompt("Customer email", customer.email);
        if (!name || !email) return;

        const response = await fetch(`${API_URL}/api/customers/${customer.id}`, {
            method: "PUT",
            headers: requestHeaders,
            body: JSON.stringify({ name, email }),
        });
        if (!response.ok) return;
        setCustomers(customers.map((item) => item.id === customer.id ? { ...item, name, email } : item));
    };

    const deleteCustomer = async (customer) => {
        if (!window.confirm(`Delete ${customer.name}?`)) return;
        const response = await fetch(`${API_URL}/api/customers/${customer.id}`, {
            method: "DELETE",
            headers: requestHeaders,
        });
        if (response.ok) setCustomers(customers.filter((item) => item.id !== customer.id));
    };

    useEffect(() => {

        fetch(`${API_URL}/api/customers`, {
            headers: {
                "x-user-role": currentRole,
            },
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch customers"
                    );
                }

                return response.json();

            })
            .then((data) => {

                console.log(
                    "Customers:",
                    data
                );

                setCustomers(data);

            })
            .catch((error) => {

                console.error(error);

            })
            .finally(() => {

                setLoading(false);

            });

    }, [currentRole]);


    return (

        <div className="customers-admin">

            <div className="customers-title">

                <div>

                    <p className="customers-eyebrow">CUSTOMER MANAGEMENT</p>

                    <h1>
                        Customers
                    <span className="customers-subtitle">
                        Manage customer profiles and account details.
                    </span>
                    </h1>


                <div className="customers-count">
                    <strong>{customers.length}</strong>
                    <span>Total customers</span>
                </div>
                </div>

            </div>


            <div className="customers-table-box">

                {loading ? (

                    <div className="customers-loading">
                        Loading customers...
                    </div>

                ) : customers.length === 0 ? (

                    <div className="customers-empty">

                        <h3>
                            No customers found
                        </h3>

                        <p>
                            Registered customers will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>
                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {customers.map(
                                    (customer) => (

                                    <tr
                                        key={customer.id}
                                    >

                                        <td>
                                            #{customer.id}
                                        </td>

                                        <td>

                                            <div className="customer-info">

                                                <div className="customer-avatar">
                                                    {customer.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                    <div>
                                                        <strong>{customer.name}</strong>
                                                        <small>Customer #{customer.id}</small>
                                                    </div>

                                            </div>

                                        </td>

                                        <td>
                                            {customer.email}
                                        </td>

                                        <td>

                                            <span className="customer-badge">
                                                <i></i>
                                                Customer
                                            </span>

                                        </td>

                                        <td className="customer-actions">
                                            <button onClick={() => updateCustomer(customer)}>Edit</button>
                                            <button onClick={() => deleteCustomer(customer)}>Delete</button>
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