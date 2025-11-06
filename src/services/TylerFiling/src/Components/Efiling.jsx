import React from 'react'
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import "./sidebar.css";
import DashboardImg from "./assets/dashboardImg.png";
import News from "./assets/news.png";
import Edit from "./assets/Edit.png";
import Ok from "./assets/ok.png";
import AlarmImg from "./assets/alarm.png";
import { Outlet } from 'react-router-dom';
import logo from "./assets/efilinglogo.png";

function Efiling() {
    const navigate = useNavigate();
    const location = useLocation();
    const { filingID } = location.state || {};
    const token = sessionStorage.getItem('access_token');

    const handleInitiateCase = async (event) => {
        event.preventDefault(); // Prevent default NavLink navigation

        try {
            const baseURL = process.env.REACT_APP_BASE_URL
            const response = await fetch(`${baseURL}/CreateReserveFiling`, {
                //const response = await fetch("https://localhost:7207/api/Tyler/CreateReserveFiling", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isExistingCase: true,
                    caseNumber: "string",
                    selectedCourt: "fresno:cv",
                    selectedCategory: "string",
                    selectedCaseType: "string",
                    paymentAccount: "string",
                    selectedAttorneySec: "string",
                    createdBy: "string",
                    courtesyemail: "string",
                    note: "string",
                    caseTitle: "string"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            const filingID = data.filingID || "N/A"; // Fallback if no filingID is returned

            // Navigate manually after API call
            navigate("/e-filing/initiateCase", { state: { filingID } });

        } catch (error) {
            console.error("Error calling API:", error);
        }
    };

    const handleExistingCase = async (event) => {
        event.preventDefault(); // Prevent default NavLink navigation

        try {
            const baseURL = process.env.REACT_APP_BASE_URL
            const response = await fetch(`${baseURL}/CreateReserveFiling`, {
                //const response = await fetch("https://localhost:7207/api/Tyler/CreateReserveFiling", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isExistingCase: true,
                    caseNumber: "string",
                    selectedCourt: "fresno:cv",
                    selectedCategory: "string",
                    selectedCaseType: "string",
                    paymentAccount: "string",
                    selectedAttorneySec: "string",
                    createdBy: "string",
                    courtesyemail: "string",
                    note: "string",
                    caseTitle: "string"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            const filingID = data.filingID || "N/A"; // Fallback if no filingID is returned

            // Navigate manually after API call
            navigate("/e-filing/existingCase", { state: { filingID } });

        } catch (error) {
            console.error("Error calling API:", error);
        }
    };

    const handleCreateServeOnly = async (event) => {
        event.preventDefault(); // Prevent default NavLink navigation

        try {
            const baseURL = process.env.REACT_APP_BASE_URL
            const response = await fetch(`${baseURL}/CreateReserveFiling`, {
                //const response = await fetch("https://localhost:7207/api/Tyler/CreateReserveFiling", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isExistingCase: true,
                    caseNumber: "string",
                    selectedCourt: "fresno:cv",
                    selectedCategory: "string",
                    selectedCaseType: "string",
                    paymentAccount: "string",
                    selectedAttorneySec: "string",
                    createdBy: "string",
                    courtesyemail: "string",
                    note: "string",
                    caseTitle: "string"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            const filingID = data.filingID || "N/A"; // Fallback if no filingID is returned

            // Navigate manually after API call
            navigate("/e-filing/createServeOnly", { state: { filingID } });

        } catch (error) {
            console.error("Error calling API:", error);
        }
    };


    return (
        <>
            <aside
                className="sidebar-menu d-none d-md-block"
                style={{
                    flex: '0 0 200px',  // Responsive but fixed base width
                    maxWidth: '250px',   // Same as sidebar max width
                    minWidth: '180px',   // Same as sidebar min width
                    backgroundColor: '#f8f9fa',
                    margin: '0',         // Remove any margin from the aside
                    padding: '0',        // Remove any padding from the aside
                }}
            >
                {/* Sidebar Header: Logo */}
                <div className="mb-3">
                    <img className="img-fluid" src={logo} width="200" height="200" alt="Menu Icon" />
                </div>

                {/* Navigation */}
                <nav aria-label="E-Filing Sub Menu" className="w-100" style={{
                    flex: '0 0 200px',   // Responsive but fixed base width
                    maxWidth: '250px',    // Same as sidebar max width
                    minWidth: '180px',    // Same as sidebar min width
                    backgroundColor: '#f8f9fa',
                    padding: '0',         // Remove padding from the nav to avoid extra space
                    margin: '0',          // Remove margin from the nav
                }}>
                    <ul className="nav nav-pills flex-column w-100 align-items-start e-filing-side-menu" id="e-filing-side-menu" style={{
                        paddingLeft: '0',    // Remove padding from the left of the ul
                        margin: '0',         // Remove margin from the ul
                    }}>
                        {/* Dashboard */}
                        <li className="nav-item w-100">
                            <NavLink to="/e-filing/dashboard" className="nav-link">
                                <i className="fa fa-dashboard fa-fw mx-2"></i>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>

                        {/* Initiate a New Case */}
                        <li className="nav-item w-100">
                            <NavLink to="/e-filing/initiateCase" className="nav-link" onClick={handleInitiateCase}>
                                <i className="fa fa-university fa-fw mx-2"></i>
                                <span>Initiate a New Case</span>
                            </NavLink>
                        </li>

                        {/* File on Existing Case */}
                        <li className="nav-item w-100">
                            <NavLink to="/e-filing/existingCase" className="nav-link" onClick={handleExistingCase}>
                                <i className="fa fa-folder-open fa-fw mx-2"></i>
                                <span>File on Existing Case</span>
                            </NavLink>
                        </li>

                        {/* Create Serve Only */}
                        <li className="nav-item w-100">
                            <NavLink to="/e-filing/createServeOnly" className="nav-link" onClick={handleCreateServeOnly}>
                                <i className="fa fa-paper-plane fa-fw mx-2"></i>
                                <span>Create Serve Only</span>
                            </NavLink>
                        </li>

                        {/* Filing Status */}
                        <li className="nav-item w-100">
                            <NavLink to="/e-filing/filingStatus" className="nav-link">
                                <i className="fa fa-rotate-left fa-fw mx-2"></i>
                                <span>Filing Status</span>
                            </NavLink>
                        </li>

                        {/* Draft History */}
                        <li className="nav-item w-100">
                            <NavLink to="/e-filing/draftHistory" className="nav-link">
                                <i className="fa fa-file fa-fw mx-2"></i>
                                <span>Draft History</span>
                            </NavLink>
                        </li>

                        {/* Notifications */}
                        <li className="nav-item w-100">
                            <NavLink to="/e-filing/notifications" className="nav-link">
                                <i className="fa fa-bell fa-fw mx-2"></i>
                                <span>Notifications</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Recent Cases Section */}
                <div className="mt-4 w-100">
                    <div className="sub-menu px-2">
                        <h6 className="fw-normal text-white text-start">Recent Cases</h6>
                    </div>
                    <div className="px-2 text-center">
                        <p className="fw-normal text-dark" style={{ fontSize: '13px' }}>
                            Click the "Add a Case" button to start your case list.
                        </p>
                    </div>
                    <div className="recent-cases-buttons">
                        <Link to="caseList">
                            <button className="btn btn-dark btn-md" style={{ fontSize: '13px' }}>View All</button>
                        </Link>
                        <button className="btn btn-dark btn-md" style={{ fontSize: '13px' }} data-bs-toggle="modal" data-bs-target="#addCase-modal">
                            Add a Case
                        </button>
                    </div>
                </div>

                {/* Search Cases Section */}
                <div className="search-case mt-3 px-2 w-100" style={{ fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>
                    {/* Search Cases Text */}
                    <p className="text-dark mb-0 fw-bold">Search Cases</p>

                    {/* Search Bar */}
                    <div className="input-group mt-2">
                        <input
                            type="text"
                            className="form-control"
                            id="gwt-uid-53"
                            placeholder="Click or type to select"
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer style={{ marginTop: '80px', marginBottom: '80px', paddingTop: '20px', paddingBottom: '20px' }} className="text-center text-muted w-100">
                    <span>Copyright © E-Filing for Good Cause. All rights reserved.</span>
                    <br />
                    <Link to="#" className="gwt-Anchor">User Agreement</Link>
                    <span> | </span>
                    <Link to="#" target="_blank">Accessibility Statement</Link>
                </footer>
            </aside>



            {/* modal 1 start */}
            <div className="modal fade" id="addCase-modal" tabIndex={-1} role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-3">
                            <h4 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">
                                Add a Case
                            </h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Start tip data */}
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data">
                                            Select a Court and enter a case number to retrieve your case
                                            data from the court.
                                        </p>
                                    </div>
                                </div>
                                {/* End tip data */}
                                <div className="row">
                                    <label className="form-label fw-bold ps-1" htmlFor="courtType">
                                        Court
                                    </label>
                                </div>
                                <div className="row">
                                    <select className="form-select" name="courtType" id="courtType">
                                        <option value={1}>click or type to select</option>
                                        <option value={2}> Court Ex </option>
                                    </select>
                                </div>
                                <div className="row mt-3">
                                    <label className="form-label fw-bold ps-1" htmlFor="caseNum">
                                        Case Number
                                    </label>
                                </div>
                                <div className="row">
                                    <input className="form-control" type="text" name="caseNum" id="caseNum" placeholder="Enter Case Number" defaultValue="" />
                                </div>
                                {/* trigger another modal */}
                                <div className="row mt-3">
                                    <Link className="text-decoration-none fw-bold text-blue text-center" href="#" data-bs-toggle="modal" data-bs-target="#searchCase-modal" >
                                        Advance Case Search
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-outline-dark px-4 cancel" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" className="btn add px-4">
                                Add Case
                            </button>
                        </div>
                    </div>
                </div>
            </div>{/* modal 1 ends  */}
            {/* modal 2 start */}
            <div className="modal fade" id="searchCase-modal" tabIndex={-1} role="dialog" aria-hidden="true" >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document" >
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-3">
                            <h4 className="modal-title fw-bold ms-3" id="searchCase">
                                Add / Search for a Case
                            </h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" > </button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Start tip data */}
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data">
                                            <strong>Tip:</strong> Select a court then enter your
                                            individual or business case search criteria to Query the court.
                                        </p>
                                    </div>
                                </div>
                                {/* End tip data */}
                                <div className="row">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th className="w-50">Filing Court</th>
                                                <th>
                                                    <p className="my-3 ms-3 w-50">Party Type</p>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <select className="form-select" name="courtName" id="courtName">
                                                        <option value={1}>select court</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input type="text" className=" form-control ms-2" name="partyType" id="partyType" placeholder="individual" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th className="w-50">First Name</th>
                                                <th>
                                                    <p className="my-3 ms-3 w-50">Last Name</p>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <input type="text" className=" form-control" name="fName" id="fName" />
                                                </td>
                                                <td>
                                                    <input type="email" className=" form-control ms-2" name="lName" id="lName" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-outline-dark cancel px-4" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" className="btn add px-4">
                                Add / Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Outlet />
            </div>
        </>
    )
}

export default Efiling;