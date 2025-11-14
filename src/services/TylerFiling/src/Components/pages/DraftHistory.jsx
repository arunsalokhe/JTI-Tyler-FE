import { Link, } from 'react-router-dom';
import Update from '../assets/Update.png';
import React, { useState, useEffect } from "react";

const DraftHistory = () => {
    const token = sessionStorage.getItem('access_token');
    const [draftCases, setDraftCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const WrapperTag = isMobile ? "div" : "section";
    const wrapperClass = isMobile
        ? "container-fluid d-md-none px-3 pt-3"
        : "main-content px-3 pt-3";

    useEffect(() => {
        const fetchDraftCases = async () => {
            setLoading(true); // Set loading to true when fetch starts
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                const response = await fetch(`${baseURL}/GetDraftCases`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Fetched data:", data);  // Check what data is returned
                    if (Array.isArray(data.data)) {  // Ensure data is an array
                        setDraftCases(data.data);
                    } else {
                        setError("API response is not an array");
                    }
                } else {
                    setError("Failed to load draft cases.");
                    console.error("Error fetching data:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching draft cases:", error);
                setError("An error occurred while fetching draft cases.");
            } finally {
                setLoading(false);
            }
        };

        fetchDraftCases();
    }, [token]);

    // Pagination logic
    const totalPages = Math.ceil(draftCases.length / itemsPerPage); // Calculate total pages

    // Slice the draft cases for the current page
    const currentItems = draftCases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Function to handle page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0" style={{ fontSize: "14px" }}>
                <div className="row mx-0 align-items-center">

                    <div className="row justify-content-center mt-3 mb-3">
                        <div className="col-12 col-md-6 col-xl-6 align-items-center mb-2 mb-md-0">
                            <h1
                                className="fw-normal"
                                style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                            >
                                Filing Draft
                            </h1>
                        </div>

                        <div className="col-12 col-md-6 col-xl-6 d-flex justify-content-end">
                            <div
                                className="w-100 position-relative"
                                style={{ maxWidth: "100%" }}

                            >
                                <div className="col-12 col-md-6 col-xl-12 d-flex justify-content-end">
                                    <a
                                        href="#"
                                        className="refresh-link d-flex align-items-center"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.location.reload();
                                        }}
                                        style={{
                                            textDecoration: "none",
                                            border: "1px solid #ced4da",
                                            whiteSpace: "nowrap",
                                            padding: "6px 12px",
                                            color: "black",
                                            borderRadius: "5px",
                                            backgroundColor: "transparent", // Keeps background transparent
                                        }}
                                    >
                                        <i className="fa fa-refresh fa-fw me-2"></i> Refresh
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mt-3 px-4">
                        <div
                            className="panel panel-success"
                            style={{
                                backgroundColor: "#DDE3D4",
                                borderColor: "#DDE3D4",
                                padding: "10px",
                                borderRadius: "5px",
                                maxWidth: "100%", // Prevents overflow
                            }}
                        >
                            <div className="panel-body">
                                <div className="row">
                                    <div className="col-md-12 lh32 d-flex align-items-center gap-2">
                                        <span>
                                            <b>Filing view (All Filings)</b> - Click the <b>Filing ID</b> to open filing details or the print link for filing receipt.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row justify-content-center mt-4">
                        <form method="post">
                            <div className="col-12 col-md-12 col-xl-12 align-items-center">
                                <div className="card p-2 pagination-parent-pos">
                                    <div className="card-body">
                                        {/* Table with pagination */}
                                        <div className="table-responsive">
                                            <table className="table table-striped table-hover">
                                                <thead>
                                                    <tr>
                                                        <th className="column-fixed">Filing ID</th>
                                                        <th className="column-fixed">Status</th>
                                                        <th className="column-fixed">Last Changed</th>
                                                        <th className="column-fixed">Case</th>
                                                        <th className="column-fixed">Envelope</th>
                                                        <th className="column-fixed">Lead Document</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="6" className="text-center">
                                                                <div className="spinner-border" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : currentItems && currentItems.length > 0 ? (
                                                        currentItems.map((draft) => (
                                                            <tr key={draft.id}>
                                                                <td>
                                                                    <Link to={`/e-filing/editForm/${draft.filingID}`}
                                                                        state={{
                                                                            caseId: draft.id,
                                                                            filingID: draft.filingID,
                                                                        }}
                                                                    >
                                                                        {draft.filingID || "No Filing ID"}
                                                                    </Link>
                                                                </td>
                                                                <td>Draft</td>
                                                                <td>{draft.draftSavedAt || "No Date"}</td>
                                                                <td></td>
                                                                <td></td>
                                                                <td>
                                                                    {draft.documents && draft.documents.length > 0
                                                                        ? draft.documents[0].fileName
                                                                        : "No Document"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6">No draft cases found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Pagination Controls Below the Table */}
                                    {draftCases.length > 0 && (
                                        <div className="mt-3">
                                            <nav aria-label="Page navigation" className="custom-pagination">
                                                <ul className="pagination justify-content-center mb-0">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            disabled={currentPage === 1}
                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                        >
                                                            Previous
                                                        </button>
                                                    </li>

                                                    {Array.from({ length: totalPages }, (_, index) => (
                                                        <li
                                                            key={index + 1}
                                                            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="page-link"
                                                                onClick={() => handlePageChange(index + 1)}
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        </li>
                                                    ))}

                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            disabled={currentPage === totalPages}
                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                        >
                                                            Next
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </WrapperTag>
    );
};

export default DraftHistory;
