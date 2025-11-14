import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";

const Notification = () => {
    // Use useState and useEffect inside the functional component
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // UseEffect to handle resize events
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Use a wrapper tag that adjusts based on screen size
    const WrapperTag = isMobile ? "div" : "section";
    const wrapperClass = isMobile
        ? "container-fluid d-md-none px-3 pt-3"
        : "main-content px-3 pt-3";

    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0" style={{ fontSize: "14px" }}>
                <div className="row mx-0 align-items-center">
                    <div className="row justify-content-center mt-2 mb-3">
                        {/* Title Section */}
                        <div className="col-12 col-md-6 col-xl-6 align-items-center d-flex justify-content-start">
                            <h1 className="fw" style={{ fontSize: "30px", fontFamily: "Arial, sans-serif", marginBottom: "10px" }}>Notifications</h1>
                        </div>

                        {/* Links and Search Section */}
                        <div className="col-12 col-md-6 col-xl-6 d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-3 initiate_case_sec_btn">
                            {/* Mark as New & Mark as Read Links */}
                            <div className="d-flex gap-2 w-80">
                                <a
                                    href="#"
                                    className="d-flex align-items-center"
                                    style={{ color: "#336C9D", textDecoration: "none", whiteSpace: "nowrap" }}
                                >
                                    <i className="fa fa-envelope fa-fw me-2"></i> Mark as New
                                </a>

                                <a
                                    href="#"
                                    className="d-flex align-items-center"
                                    style={{ color: "#336C9D", textDecoration: "none", whiteSpace: "nowrap" }}
                                >
                                    <i className="fa fa-envelope-open-o fa-fw me-2"></i> Mark as Read
                                </a>
                            </div>

                            {/* Search Input (Aligned in Same Row) */}
                            <div className="input-group w-auto mt-1 mt-md-0 d-flex flex-md-row align-items-center">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter Notifications"
                                    aria-label="Filter Filings"
                                    style={{
                                        maxWidth: "200px",
                                        minWidth: "150px",
                                        height: "38px",  // Set height to match the icon size
                                        paddingLeft: "10px", // Padding adjustment if needed
                                    }}
                                />
                                <span
                                    className="input-group-text d-flex align-items-center justify-content-center"
                                    style={{
                                        height: "38px",  // Same height as input field
                                        padding: "0 10px", // Adjust padding for better spacing
                                    }}
                                >
                                    <i className="fa fa-search fa-fw"></i>
                                </span>
                            </div>

                        </div>
                    </div>


                    <div className="row justify-content-center mt-4">
                        <form method="post">
                            <div className="col-12 col-md-12 col-xl-12 align-items-center">
                                <div className="card p-2 pagination-parent-pos">
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-striped table-hover mb-5">
                                                <thead>
                                                    <tr>
                                                        <th>Case Number</th>
                                                        <th>Case Title</th>
                                                        <th>Subject/ Document</th>
                                                        <th>Filed/ Submitted By</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>7221458</td>
                                                        <td>Title Example</td>
                                                        <td></td>
                                                        <td>Jayesh</td>
                                                        <td>11/24/2022 08:42 PM PST</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* White space for design purposes */}
                                    <div className="py-4"></div>

                                    {/* Page Navigation */}
                                    <nav aria-label="Page navigation" className="custom-pagination mt-3 pe-3">
                                        <ul className="pagination justify-content-center mb-0">
                                            <li className="page-item disabled">
                                                <Link className="page-link" to="#" aria-disabled="true">Previous</Link>
                                            </li>
                                            <li className="page-item active" aria-current="page">
                                                <Link className="page-link" to="#">1 <span className="visually-hidden">(current)</span></Link>
                                            </li>                                            
                                            <li className="page-item">
                                                <Link className="page-link" to="#">Next</Link>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </form>
                    </div>


                </div>
            </div>
        </WrapperTag>
    );
};

export default Notification;
