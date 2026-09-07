import React, { useEffect, useState } from "react";
import "./Categories.css";

import API_URL from "../../../apiConfig";

const Categories = () => {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {

        try {

            const response = await fetch(`${API_URL}/api/categories`);

            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }

            const data = await response.json();

            setCategories(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {
        fetchCategories();
    }, []);


    const deleteCategory = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmDelete) return;

        try {

            const response = await fetch(`${API_URL}/api/categories/${id}`, {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Delete failed"
                );
            }

            setCategories((prev) =>
                prev.filter(
                    (category) =>
                        category.id !== id
                )
            );

        } catch (error) {

            console.error(error);

            alert(error.message);

        }

    };


    return (

        <div className="categories-admin">

            <div className="categories-title">

                <div>

                    <p>STORE MANAGEMENT</p>

                    <h1>
                        Categories
                    </h1>

                </div>

                <button className="add-category-btn">
                    + Add Category
                </button>

            </div>


            <div className="categories-table-box">

                {loading ? (

                    <div className="categories-loading">
                        Loading categories...
                    </div>

                ) : categories.length === 0 ? (

                    <div className="categories-empty">

                        <h3>
                            No categories found
                        </h3>

                        <p>
                            Add your first category.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>ID</th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {categories.map(
                                    (category) => (

                                    <tr
                                        key={category.id}
                                    >

                                        <td>
                                            #{category.id}
                                        </td>

                                        <td>
                                            <strong>
                                                {category.name}
                                            </strong>
                                        </td>

                                        <td>
                                            {category.description || "-"}
                                        </td>

                                        <td>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    deleteCategory(
                                                        category.id
                                                    )
                                                }
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

export default Categories;