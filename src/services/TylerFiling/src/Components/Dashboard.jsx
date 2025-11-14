import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import user from "./assets/user.png";
import BankDraft from "./assets/bankDraft.png";
import Trash from "./assets/trash.png";
import AlarmImg from "./assets/alarm.png";
import Envelope from "./assets/Envelope.png";
import DeleteImg from "./assets/deleteImg.png";
import './Style.css';

function Dashboard() {

    const token = sessionStorage.getItem('access_token');
    //const [loading, setLoading] = useState(true);
    //const [submittedCount, setSubmittedCount] = useState(0);
    const [draftCount, setDraftCount] = useState(0);
    const [submittedCount, setSubmittedCount] = useState(
        sessionStorage.getItem("submittedCount") || 0
    );
    const [loading, setLoading] = useState(false);

    //API to shows count of pending/rejected/drafts filings
    //  useEffect(() => {
    //     const baseURL = process.env.REACT_APP_BASE_URL;
    //         setLoading(true);

    //             fetch(`${baseURL}/GetFilingList`,{
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify({
    //                     courtlocation: "fresno:cv",
    //                     userId: "28086901-0de1-4335-9141-019d48ab87eb"
    //                 }), 
    //             })
    //             .then((response) => response.json())
    //             .then((data) => {
    //                 const filings = data?.data?.MatchingFiling || [];
    //                 const count = filings.filter(
    //                     (filing) => filing.FilingStatus?.FilingStatusCode === "submitted").length;

    //                 // console.log("Total submitted filings: ", count);

    //                 // Update the state with the fetched data
    //                 setLoading(false);
    //                 setSubmittedCount(count);
    //             })
    //         .catch((error) => console.error("Error fetching data:", error));

    // }, [token]);

    useEffect(() => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        //setLoading(true);

        fetch(`${baseURL}/GetFilingList`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                courtlocation: "fresno:cv",
                userId: "d8cdd3b4-6965-4b4a-8b42-7af925271afc",
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                const filings = data?.data?.MatchingFiling || [];
                const count = filings.filter(
                    (filing) => filing.FilingStatus?.FilingStatusCode === "submitted"
                ).length;

                // Store new count in sessionStorage
                sessionStorage.setItem("submittedCount", count);

                // Update state with the new count
                setSubmittedCount(count);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });

    }, [token]);

    useEffect(() => {
        const fetchDraftCount = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                const response = await fetch(`${baseURL}/GetDraftsCount`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                if (data.success) {
                    setDraftCount(data.count); // Update state with count from API
                } else {
                    console.error("Error fetching draft count:", data.message);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };

        fetchDraftCount();
    }, []);

    const handleDiscardAllDrafts = async () => {
        if (!window.confirm("Are you sure you want to delete all drafts? This action cannot be undone.")) return;

        try {
            const baseURL = process.env.REACT_APP_BASE_URL;
            const response = await fetch(`${baseURL}/DiscardAllDrafts`, {
                //const response = await fetch("https://localhost:7207/api/Tyler/DiscardAllDrafts", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            if (response.ok) {
                alert("All drafts deleted successfully.");
                window.location.reload(); // Refresh the page
            } else {
                alert(data.message || "Error deleting drafts.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to delete drafts.");
        }
    };


    return (
        <div>
            {/* Mobile Layout */}
            <div className="container-fluid d-md-none px-3 pt-3">
                {/* Mobile Header */}
                <div className="row">
                    <div className="col-12 text-start">
                        <h1 className="skip" id="header-h1" tabIndex="0">Dashboard</h1>
                    </div>
                </div>

                {/* Start New Filing (Mobile View) */}
                <div className="row g-3 mt-2">
                    <div className="col-12 mb-3" style={{ fontFamily: "Arial, sans-serif" }}>
                        <div className="card border">
                            <div className="card-header bg-transparent">
                                <h3 className="fw-bold">Start New Filing</h3>
                            </div>
                            <div className="card-body">
                                <p>
                                    Select a new filing option button below to get started. If you are new to the system, be sure to complete the following tasks.
                                </p>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        <i className="fa fa-check-square-o fa-fw fa-lg" aria-hidden="true"></i>&nbsp;
                                        <Link to="/settings/paymentSetting" className="text-decoration-none">Add Payment Account</Link>
                                    </li>
                                    <li className="mb-2">
                                        <i className="fa fa-check-square-o fa-fw fa-lg" aria-hidden="true"></i>&nbsp;
                                        <Link to="/settings/manageUsers" className="text-decoration-none">Add Filing Attorney(s)</Link>
                                    </li>
                                </ul>
                                <div className="text-center d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt-3">
                                    <Link to="/tyler-filing/initiateCase" className="btn btn-dark">
                                        Initiate a New Case
                                    </Link>
                                    <Link to="/tyler-filing/existingCase" className="btn btn-dark">
                                        File on Existing Case
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Info Cards Section (stacked in mobile) */}
                <div className="row g-3 mt-2">
                    {/* Pending */}
                    <div className="col-12 mb-3">
                        <div className="card p-0 bg-white">
                            <div className="card-header text-white"
                                style={{ backgroundColor: "#6B7C4A", borderColor: "#6B7C4A", color: "#fff", fontWeight: "bold" }}>
                                <div className="row align-items-center mx-0">
                                    <div className="col-3 text-center">
                                        <i className="fa fa-user fa-5x"></i>
                                    </div>
                                    <div className="col-9 text-end">
                                        <span className="huge" style={{ fontSize: "40px" }}>{submittedCount}</span>
                                        <div className="pending-text">Pending</div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer text-end">
                                <Link to="/tyler-filing/filingStatus" style={{ color: "#6B7C4A", textDecoration: "none" }}>
                                    <i className="fa fa-arrow-circle-right"></i> View All
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Drafts */}
                    <div className="col-12 mb-3">
                        <div
                            className="card p-0 border-0 shadow"
                            style={{ borderColor: "#ffad33" }} // Yellow Panel Border
                        >
                            {/* Card Header - Yellow Background */}
                            <div
                                className="card-header"
                                style={{
                                    backgroundColor: "#FFB953",  // Light Yellow Panel Color
                                    borderColor: "#FFAD31",  // Border Color
                                    color: "#000000",  // Black Text
                                    padding: "10px 15px",
                                    borderBottom: "1px solid transparent",
                                    borderTopLeftRadius: "3px",
                                    borderTopRightRadius: "3px",
                                    fontWeight: "bold"
                                }}
                            >
                                <div className="row align-items-center">
                                    {/* Left Icon */}
                                    <div className="col-3 text-center">
                                        <i className="fa fa-pencil-square-o fa-5x"></i>
                                    </div>
                                    {/* Right Count and Label */}
                                    <div className="col-9 text-end">
                                        <div>
                                            <span className="huge" style={{ fontSize: "40px" }}>{draftCount}</span>
                                        </div>
                                        <div className="pending-text">Drafts</div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer with Buttons */}
                            <div className="card-footer d-flex justify-content-between">
                                {/* Discard All Link */}
                                <a
                                    href="javascript:void(0);"
                                    onClick={handleDiscardAllDrafts}
                                    style={{ color: "#000000", textDecoration: "none", cursor: "pointer" }}
                                >
                                    <i className="fa fa-trash fa-fw" aria-hidden="true"></i> Discard All
                                </a>

                                {/* View All Link */}
                                <Link to="/tyler-filing/draftHistory" style={{ color: "#000000", textDecoration: "none" }}>
                                    <i className="fa fa-arrow-circle-right"></i> View All
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Rejected */}
                    <div className="col-12 mb-3">
                        <div
                            className="card p-0 border-0 shadow"
                            style={{ borderColor: "#912125" }} // Dark Red Border
                        >
                            {/* Card Header - Dark Red Background */}
                            <div
                                className="card-header"
                                style={{
                                    backgroundColor: "#A8262B",  // Dark Red Color
                                    borderColor: "#912125",  // Border Color
                                    color: "white",  // White Text
                                    padding: "10px 15px",
                                    borderBottom: "1px solid transparent",
                                    borderTopLeftRadius: "3px",
                                    borderTopRightRadius: "3px"
                                }}
                            >
                                <div className="row align-items-center">
                                    {/* Left Icon */}
                                    <div className="col-3 text-center">
                                        <i className="fa fa-ban fa-5x"></i>
                                    </div>
                                    {/* Right Count and Label */}
                                    <div className="col-9 text-end">
                                        <div>
                                            <span className="huge" style={{ fontSize: "40px", fontWeight: "bold" }}>2</span>
                                        </div>
                                        <div className="pending-text">Rejected</div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer with Buttons */}
                            <div className="card-footer d-flex justify-content-between">
                                {/* Discard All Link */}
                                <a
                                    href="javascript:;"
                                    style={{ color: "#A8262B", textDecoration: "none" }}
                                >
                                    <i className="fa fa-trash fa-fw" aria-hidden="true"></i> Discard All
                                </a>
                                {/* View All Link */}
                                <Link to="/tyler-filing/filingStatus" style={{ color: "#A8262B", textDecoration: "none" }}>
                                    <i className="fa fa-arrow-circle-right"></i> View All
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="col-12 mb-3">
                        <div
                            className="card p-0 border-0 shadow"
                            style={{ borderColor: "#235167 !important" }} // Light Blue Border
                        >
                            {/* Card Header - Light Blue Background */}
                            <div
                                className="card-header"
                                style={{
                                    backgroundColor: "#d9edf7",  // Light Blue Panel Color
                                    borderColor: "#235167 !important",  // Border Color
                                    color: "#31708f",  // Darker Blue Text
                                    padding: "10px 15px",
                                    borderBottom: "1px solid transparent",
                                    borderTopLeftRadius: "3px",
                                    borderTopRightRadius: "3px",
                                    fontWeight: "bold"
                                }}
                            >
                                <div className="row align-items-center">
                                    {/* Left Icon */}
                                    <div className="col-3 text-center">
                                        <i className="fa fa-bell fa-5x"></i>
                                    </div>
                                    {/* Right Count and Label */}
                                    <div className="col-9 text-end">
                                        <div>
                                            <span className="huge" style={{ fontSize: "40px", color: "#235167" }}>0</span>
                                        </div>
                                        <div className="pending-text">Notifications</div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer with Buttons */}
                            <div className="card-footer text-end">
                                {/* Mark as Read Link */}
                                {/* <a
                                                                        href="javascript:;"
                                                                        style={{ color: "#31708f", textDecoration: "none" }}
                                                                    >
                                                                        <i className="fa fa-envelope-open-o fa-fw" aria-hidden="true"></i> Mark Read
                                                                    </a> */}
                                {/* View All Link */}
                                <Link to="/tyler-filing/notifications" style={{ color: "#31708f", textDecoration: "none" }}>
                                    <i className="fa fa-arrow-circle-right"></i> View All
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="d-none d-md-block">
                <section className="dashboard-page px-lg-4 mt-2">
                    <div className="container-fluid" style={{ paddingRight: "40px", paddingLeft: "60px" }}>
                        {/* Desktop Header */}
                        <div className="row">
                            <div className="col-12">
                                <h1 style={{ fontSize: "35px", fontFamily: "Arial, sans-serif" }}>Dashboard</h1>
                            </div>
                        </div>

                        {/* Start New Filing (Desktop View) */}
                        <div className="row g-3 mt-0">
                            <div className="col-12 col-md-6 mb-3" style={{ paddingRight: "20px", fontFamily: "Arial, sans-serif" }}>
                                <div className="card border">
                                    <div className="card-header bg-transparent">
                                        <h3 className="fw-bold">Start New Filing</h3>
                                    </div>
                                    <div className="card-body">
                                        <p className="dashboard-paragraph">
                                            Select a new filing option button below to get started. If you are new to the system, be sure to complete the following tasks.
                                        </p>
                                        <ul className="list-unstyled mb-4">  {/* Added margin-bottom */}
                                            <li className="mb-2 d-flex align-items-center">
                                                <i className="fa fa-check-square-o fa-fw fa-sm" aria-hidden="true"></i>
                                                <Link to="/settings/paymentSetting" className="text-decoration-none small-link-list ms-2">
                                                    Add Payment Account
                                                </Link>
                                            </li>
                                            <li className="mb-2 d-flex align-items-center">
                                                <i className="fa fa-check-square-o fa-fw fa-sm" aria-hidden="true"></i>
                                                <Link to="/settings/manageUsers" className="text-decoration-none small-link-list ms-2">
                                                    Add Filing Attorney(s)
                                                </Link>
                                            </li>
                                        </ul>

                                        <div className="text-center">
                                            <Link to="/tyler-filing/initiateCase" className="btn btn-dark mx-2">Initiate a New Case</Link>
                                            <Link to="/tyler-filing/existingCase" className="btn btn-dark mx-2">File on Existing Case</Link>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Info Cards in Grid */}
                            <div className="col-md-6">
                                <div className="row g-3">
                                    {/* Pending */}
                                    <div className="col-6" style={{ width: "47%" }}>
                                        <div
                                            className="card p-0 bg-white panel-green"
                                            style={{
                                                border: "1px solid #6B7C4A",
                                                borderRadius: "4px"
                                            }}
                                        >
                                            <div
                                                className="card-header text-white"
                                                style={{
                                                    backgroundColor: "#6B7C4A",
                                                    borderColor: "#6B7C4A",
                                                    fontWeight: "bold",
                                                    borderBottom: "1px solid #6B7C4A"
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center px-2">
                                                    {/* Left Icon */}
                                                    <div>
                                                        <i className="fa fa-user fa-4x"></i>
                                                    </div>

                                                    {/* Right Count + Label */}
                                                    <div className="text-end">
                                                        <span className="huge d-block" style={{ fontSize: "35px" }}>
                                                            {submittedCount}
                                                        </span>
                                                        <div className="pending-text">Pending</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className="card-footer text-end"
                                                style={{
                                                    borderTop: "1px solid #6B7C4A", // Footer border
                                                    paddingTop: "8px",
                                                    fontSize: "0.85rem"
                                                }}
                                            >
                                                <Link
                                                    to="/tyler-filing/filingStatus"
                                                    style={{ color: "#6B7C4A", textDecoration: "none" }}
                                                >
                                                    <i className="fa fa-arrow-circle-right"></i> View All
                                                </Link>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Drafts */}
                                    <div className="col-6" style={{ width: "47%" }}>
                                        <div
                                            className="card p-0 bg-white"
                                            style={{
                                                border: "1px solid #FFB953",
                                                borderRadius: "4px"
                                            }}
                                        >
                                            {/* Header */}
                                            <div
                                                className="card-header"
                                                style={{
                                                    backgroundColor: "#FFB953",
                                                    borderColor: "#FFB953",
                                                    fontWeight: "bold",
                                                    borderBottom: "1px solid #FFB953",
                                                    color: "#000"
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center px-2">
                                                    {/* Left Icon */}
                                                    <div>
                                                        <i className="fa fa-pencil-square-o fa-4x"></i>
                                                    </div>

                                                    {/* Right Count + Label */}
                                                    <div className="text-end">
                                                        <span className="huge d-block" style={{ fontSize: "35px" }}>
                                                            {draftCount}
                                                        </span>
                                                        <div className="pending-text">Drafts</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div
                                                className="card-footer d-flex justify-content-between"
                                                style={{
                                                    borderTop: "1px solid #FFB953",
                                                    paddingTop: "8px",
                                                    fontSize: "0.85rem"
                                                }}
                                            >
                                                {/* Discard All Link */}
                                                <a
                                                    href="javascript:void(0);"
                                                    onClick={handleDiscardAllDrafts}
                                                    style={{ color: "#000000", textDecoration: "none", cursor: "pointer" }}
                                                >
                                                    <i className="fa fa-trash fa-fw" aria-hidden="true"></i> Discard All
                                                </a>

                                                {/* View All Link */}
                                                <Link
                                                    to="/tyler-filing/draftHistory"
                                                    style={{ color: "#000000", textDecoration: "none" }}
                                                >
                                                    <i className="fa fa-arrow-circle-right"></i> View All
                                                </Link>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                                <div className="row g-3 mt-1">
                                    {/* Rejected */}
                                    <div className="col-6" style={{ width: "47%" }}>
                                        <div
                                            className="card p-0 bg-white"
                                            style={{
                                                border: "1px solid #A8262B",
                                                borderRadius: "4px"
                                            }}
                                        >
                                            {/* Header */}
                                            <div
                                                className="card-header"
                                                style={{
                                                    backgroundColor: "#A8262B",
                                                    borderColor: "#A8262B",
                                                    fontWeight: "bold",
                                                    borderBottom: "1px solid #A8262B",
                                                    color: "#fff"
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center px-2">
                                                    {/* Left Icon */}
                                                    <div>
                                                        <i className="fa fa-ban fa-4x"></i>
                                                    </div>

                                                    {/* Right Count + Label */}
                                                    <div className="text-end">
                                                        <span className="huge d-block" style={{ fontSize: "35px", fontWeight: "bold" }}>
                                                            2
                                                        </span>
                                                        <div className="pending-text">Rejected</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div
                                                className="card-footer d-flex justify-content-between"
                                                style={{
                                                    borderTop: "1px solid #A8262B",
                                                    paddingTop: "8px",
                                                    fontSize: "0.85rem"
                                                }}
                                            >
                                                {/* Discard All Link */}
                                                <a
                                                    href="javascript:;"
                                                    style={{ color: "#A8262B", textDecoration: "none", cursor: "pointer" }}
                                                >
                                                    <i className="fa fa-trash fa-fw" aria-hidden="true"></i> Discard All
                                                </a>

                                                {/* View All Link */}
                                                <Link
                                                    to="/tyler-filing/filingStatus"
                                                    style={{ color: "#A8262B", textDecoration: "none" }}
                                                >
                                                    <i className="fa fa-arrow-circle-right"></i> View All
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notifications */}
                                    <div className="col-6" style={{ width: "47%" }}>
                                        <div
                                            className="card p-0 bg-white"
                                            style={{
                                                border: "1px solid #d9edf7",
                                                borderRadius: "4px"
                                            }}
                                        >
                                            {/* Header */}
                                            <div
                                                className="card-header"
                                                style={{
                                                    backgroundColor: "#d9edf7",
                                                    borderColor: "#d9edf7",
                                                    fontWeight: "bold",
                                                    borderBottom: "1px solid #d9edf7",
                                                    color: "#31708f"
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center px-2">
                                                    {/* Left Icon */}
                                                    <div>
                                                        <i className="fa fa-bell fa-4x"></i>
                                                    </div>

                                                    {/* Right Count + Label */}
                                                    <div className="text-end">
                                                        <span className="huge d-block" style={{ fontSize: "35px", color: "#235167" }}>
                                                            0
                                                        </span>
                                                        <div className="pending-text">Notifications</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div
                                                className="card-footer text-end"
                                                style={{
                                                    borderTop: "1px solid #d9edf7",
                                                    paddingTop: "8px",
                                                    fontSize: "0.85rem"
                                                }}
                                            >
                                                {/* View All Link */}
                                                <Link
                                                    to="/tyler-filing/notifications"
                                                    style={{ color: "#31708f", textDecoration: "none" }}
                                                >
                                                    <i className="fa fa-arrow-circle-right"></i> View All
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="row g-4 mt-4">
                            {/* === Left Section: Help Articles (Desktop Only) === */}
                            <div className="col-12 col-md-6 d-none d-md-block">
                                <div className="card border h-100" style={{ fontFamily: "Arial, sans-serif" }}>
                                    <div
                                        className="card-header"
                                        style={{
                                            color: "#000",
                                            fontWeight: "bold",
                                            fontSize: "15px",
                                            lineHeight: "20px",
                                            backgroundColor: "#e0e0e0",
                                        }}
                                    >
                                        Help Articles on Getting Started
                                    </div>

                                    <div className="card-body">
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item" style={{ fontSize: "14px" }}>
                                                <i className="fa fa-file-text" style={{ fontSize: "16px" }}></i>&nbsp;&nbsp;
                                                <a href="#" target="help" className="text-decoration-none" style={{ color: "#336C9D", fontSize: "14px" }}>
                                                    Add and Manage Payment Accounts
                                                </a>
                                            </li>
                                            <li className="list-group-item" style={{ fontSize: "14px" }}>
                                                <i className="fa fa-book" style={{ fontSize: "16px" }}></i>&nbsp;&nbsp;
                                                <a href="#" target="help" className="text-decoration-none" style={{ color: "#336C9D", fontSize: "14px" }}>
                                                    Pro Se and Self-Represented Litigant E-Filing Guide
                                                </a>
                                            </li>
                                            <li className="list-group-item" style={{ fontSize: "14px" }}>
                                                <i className="fa fa-gavel" style={{ fontSize: "16px" }}></i>&nbsp;&nbsp;
                                                <a href="#" target="help" className="text-decoration-none" style={{ color: "#336C9D", fontSize: "14px" }}>
                                                    Initiate a New Case
                                                </a>
                                            </li>
                                            <li className="list-group-item" style={{ fontSize: "14px" }}>
                                                <i className="fa fa-file" style={{ fontSize: "16px" }}></i>&nbsp;&nbsp;
                                                <a href="#" target="help" className="text-decoration-none" style={{ color: "#336C9D", fontSize: "14px" }}>
                                                    File on an Existing Case
                                                </a>
                                            </li>
                                            <li className="list-group-item" style={{ fontSize: "14px" }}>
                                                <i className="fa fa-user-plus" style={{ fontSize: "16px" }}></i>&nbsp;&nbsp;
                                                <a href="#" target="help" className="text-decoration-none" style={{ color: "#336C9D", fontSize: "14px" }}>
                                                    Add an Attorney or Staff Person from the Firm Account
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>

                            {/* === Right Section: Unread Notifications === */}
                            <div className="col-12 col-md-6" style={{ width: "47%" }}>
                                <div className="card border h-100" style={{ fontFamily: "Arial, sans-serif" }}>
                                    <div
                                        className="card-header"
                                        style={{
                                            color: "#000",
                                            fontWeight: "bold",
                                            fontSize: "15px",
                                            lineHeight: "20px",
                                            backgroundColor: "#e0e0e0",
                                        }}
                                    >
                                        Last 15 Unread Notifications
                                    </div>

                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-striped table-hover mb-0" style={{ width: "100%" }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ fontSize: "13px" }}>Case Number</th>
                                                        <th style={{ fontSize: "13px" }}>Documents</th>
                                                        <th style={{ fontSize: "13px" }}>Filed By</th>
                                                        <th style={{ fontSize: "13px" }}>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td colSpan="4" className="text-center">No unread Notifications.</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="card-footer text-start" style={{ backgroundColor: "#e0e0e0" }}>
                                        <a href="#eFiling_NotificationList" className="custom-link" style={{ color: "#336C9D", fontSize: "14px" }}>
                                            View All Notifications
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    {/* Full-Screen Loader Overlay */}
                    {loading && (
                        <div className="overlay">
                            <div className="loader">
                                <div className="spinner-border text-light" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>

    );
}

export default Dashboard;