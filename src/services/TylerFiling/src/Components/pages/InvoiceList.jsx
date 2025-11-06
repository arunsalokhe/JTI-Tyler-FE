import React, { useState, useEffect } from 'react';
import Search from '../assets/search.png';
import Update from '../assets/Update.png';
import { Link } from 'react-router-dom';

const InvoiceList = () => {

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
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="row mt-3">
                            <div className="col-12">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">

                                    {/* Title - Always on Top Left */}
                                    <h1
                                        className="fw-normal mb-2 mb-md-0"
                                        style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                                    >
                                        Invoices
                                    </h1>

                                    {/* Refresh + Search - Right on Desktop, Below on Mobile */}
                                    <div className="input-group" style={{ maxWidth: "400px", minWidth: "250px" }}>
                                        <span
                                            className="input-group-text btn-outline text-dark"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.location.reload();
                                            }}
                                            style={{
                                                textDecoration: "none",
                                                background: "none",
                                                border: "1px solid #ced4da",
                                                whiteSpace: "nowrap",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                fontFamily: "Arial, sans-serif"
                                            }}
                                        >
                                            <i className="fa fa-refresh fa-fw me-2"></i> Refresh
                                        </span>

                                        <input
                                            name="filter"
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter Invoices"
                                        />

                                        <span className="input-group-text">
                                            <i className="fa fa-search fa-fw"></i>
                                        </span>
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
                                    maxWidth: "100%",
                                }}
                            >
                                <div className="panel-body">
                                    <div className="row">
                                        <div className="col-12 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 lh-base">
                                            <i className="fa fa-info-circle fa-fw text-dark"></i>
                                            <span className="text-dark">
                                                <strong>Tip</strong> – Use the edit or delete actions to manage existing payment accounts.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form method="post">
                            <div className="row mt-2 gx-3 gy-4">
                                <div className="col-12">
                                    {/* Card container */}
                                    <div className="card grey_bg_color border-0 pagination-parent-pos">
                                        <div className="card-body">
                                            {/* Title */}
                                            <h6 className="card-title fw-bold">
                                                Los Angeles Civil, San Diego Civil? probate, Riverside, Alameda, Placer, Madera
                                            </h6>
                                        </div>

                                        {/* Optional spacing */}
                                        <div className="py-4"></div>

                                        {/* Pagination */}
                                        <div className="w-100 px-3 pb-3">
                                            <nav aria-label="Pagination" className="custom-pagination">
                                                <ul className="pagination justify-content-center justify-content-md-end flex-wrap mb-0 gap-1">
                                                    <li className="page-item disabled">
                                                        <Link className="page-link" href="#" tabIndex={-1} aria-disabled="true">
                                                            Previous
                                                        </Link>
                                                    </li>
                                                    <li className="page-item active" aria-current="page">
                                                        <Link className="page-link" href="#">
                                                            1 <span className="visually-hidden">(current)</span>
                                                        </Link>
                                                    </li>                                                   
                                                    <li className="page-item">
                                                        <Link className="page-link" href="#">Next</Link>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        
                    </div>
                </div>
            </div>
        </WrapperTag>
    )
}

export default InvoiceList