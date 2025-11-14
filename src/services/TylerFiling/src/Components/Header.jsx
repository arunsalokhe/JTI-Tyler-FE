import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Style.css";
import headerIcon from "./assets/california-icon.png";

export default function Header() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);  // Close dropdown if clicked outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = (menu) => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    const handleLogout = () => {
        localStorage.setItem("logoutReason", "manual");
        sessionStorage.clear();
        navigate("/logout", { replace: true });
    };

    return (
        <div className="header py-1 mb-0">
            <div className="container-fluid px-0">
            <div className="row align-items-center justify-content-between mx-0">
                    {/* Left Section: Logo */}
                    <div className="col-auto">
                        <NavLink className="d-flex align-items-center text-dark text-decoration-none">
                            <img
                                className="navbar-brand"
                                src={headerIcon}
                                alt="California Icon"
                                style={{ height: "20px", pointerEvents: "none" }}
                            />
                        </NavLink>
                    </div>

                    {/* Right Section: Navigation for Desktop */}
                    <div className="col d-none d-md-flex justify-content-end">
                        <ul className="nav">
                            <li className="nav-item">
                                <NavLink to="/e-filing" className="nav-link text-white fw small">
                                    <i className="fa fa-leaf fa-fw me-1 small"></i> E-Filing
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/settings" className="nav-link text-white fw small">
                                    <i className="fa fa-cog fa-fw me-1 small"></i> Settings
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/reports" className="nav-link text-white fw small">
                                    <i className="fa fa-tasks fa-fw me-1 small"></i> Reports
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/accounts" className="nav-link text-white fw small">
                                    <i className="fa fa-briefcase fa-fw me-1 small"></i> Account
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/support" className="nav-link text-white fw small">
                                    <i className="fa fa-question-circle fa-fw me-1 small"></i> Support
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <a
                                    href="#"
                                    className="nav-link text-white fw small"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowLogoutModal(true);
                                    }}
                                >
                                    <i className="fa fa-sign-out fa-fw me-1 small"></i> Logout
                                </a>
                            </li>
                        </ul>


                    </div>

                    {/* Mobile Mode: Hamburger Menu */}
                    <div className="col-auto d-md-none">
                        <button
                            className="navbar-toggle"
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-expanded={menuOpen ? "true" : "false"}
                            aria-label="Toggle navigation"
                        >
                            <div className="hamburger-line"></div>
                            <div className="hamburger-line"></div>
                            <div className="hamburger-line"></div>
                        </button>
                    </div>

                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <>
                        {/* Divider Line */}
                        <div className="row d-md-none">
                            <hr style={{ borderColor: "white", margin: "6px 0", width: "100%" }} />
                        </div>

                        <div className="row d-md-none mobile-menu-scroll">
                            <ul className="nav flex-column text-start w-100" ref={dropdownRef}>
                                {[
                                    {
                                        id: "eFiling", icon: "fa-leaf", label: "E-Filing", links: [
                                            { path: "/e-filing/dashboard", label: "Dashboard" },
                                            { path: "/e-filing/initiateCase", label: "Initiate a New Case" },
                                            { path: "/e-filing/existingCase", label: "File on Existing Case" },
                                            { path: "/e-filing/createServeOnly", label: "Create Serve Only" },
                                            { path: "/e-filing/filingStatus", label: "Filing Status" },
                                            { path: "/e-filing/draftHistory", label: "Draft History" },
                                            { path: "/e-filing/notifications", label: "Notifications" }
                                        ]
                                    },
                                    {
                                        id: "settings", icon: "fa-cog", label: "Settings", links: [
                                            { path: "/settings/accountInfo", label: "Account Information" },
                                            { path: "/settings/editUser", label: "Edit User" },
                                            { path: "/settings/changePassword", label: "Change Password" },
                                            { path: "/settings/manageUsers", label: "Manage Users" },
                                            { path: "/settings/paymentSetting", label: "Payment Settings" },
                                            { path: "/settings/invoiceList", label: "Invoice List" },
                                            { path: "/settings/userPreferences", label: "User Preferences" },
                                            { path: "/settings/servicesContact", label: "Services Contact" },
                                            { path: "/settings/partyAddress", label: "Party Address Book" }
                                        ]
                                    },
                                    {
                                        id: "reports", icon: "fa-tasks", label: "Reports", links: [
                                            { path: "/reports/filingActivity", label: "Filing Activity" },
                                            { path: "/reports/filingActivityByCase", label: "Filing Activity by Case" },
                                            { path: "/reports/filingActivityByClient", label: "Filing Activity by Client" },
                                            { path: "/reports/filingActivityByPayment", label: "Filing Activity by Payment Acc" },
                                            { path: "/reports/nonAcceptedFilingActivity", label: "Filing Activity (Non-Accepted)" },
                                            { path: "/reports/CaseListReport", label: "Case List" }
                                        ]
                                    },
                                    {
                                        id: "account", icon: "fa-briefcase", label: "Account", links: [
                                            { path: "/accounts/accountInfo", label: "Account Information" },
                                            { path: "/accounts/manageUsers", label: "Manage Users" },
                                            { path: "/accounts/paymentSetting", label: "Payment Settings" },
                                            { path: "/accounts/invoiceList", label: "Invoice List" },
                                            { path: "/accounts/servicesContact", label: "Services Contact" },
                                            { path: "/accounts/partyAddress", label: "Party Address Book" }
                                        ]
                                    }
                                ].map(({ id, icon, label, links }) => (
                                    <li key={id} className="nav-item position-relative mb-1">
                                        {/* Button */}
                                        <button
                                            className="nav-link fw d-flex align-items-center justify-content-between w-100"
                                            onClick={() => toggleDropdown(id)}
                                            style={{
                                                whiteSpace: "nowrap",
                                                backgroundColor: "transparent",
                                                color: "white",
                                                outline: "none",
                                                boxShadow: "none",
                                            }}
                                        >
                                            <span className="d-flex align-items-center">
                                                <i className={`fa ${icon} fa-fw me-2`}></i>
                                                {label}
                                                <span className="caret"></span>
                                            </span>
                                        </button>

                                        {/* Dropdown Menu (Appears right below the button) */}
                                        {openDropdown === id && (
                                            <ul className="dropdown-menu show position-static w-100">
                                                {links.map(({ path, label }) => (
                                                    <li key={path}>
                                                        <NavLink
                                                            to={path}
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                setOpenDropdown(null);
                                                                setMenuOpen(false);
                                                            }}
                                                        >
                                                            {label}
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}

                                {/* Support & Logout (Always at the Bottom) */}
                                <li className="nav-item position-relative mb-1">
                                    <button
                                        className="nav-link fw d-flex align-items-center justify-content-between w-100"
                                        onClick={() => window.location.href = "/support"}
                                        style={{
                                            whiteSpace: "nowrap",
                                            backgroundColor: "transparent",
                                            color: "white",
                                            outline: "none",
                                            boxShadow: "none",
                                        }}
                                    >
                                        <span className="d-flex align-items-center">
                                            <i className="fa fa-question-circle fa-fw me-1"></i>
                                            Support
                                        </span>
                                    </button>
                                </li>

                                {/* Logout Button (Styled like other buttons) */}
                                <li className="nav-item position-relative">
                                    <button
                                        className="nav-link fw d-flex align-items-center justify-content-between w-100"
                                        onClick={() => setShowLogoutModal(true)}
                                        style={{
                                            whiteSpace: "nowrap",
                                            backgroundColor: "transparent",
                                            color: "white",
                                            outline: "none",
                                            boxShadow: "none",
                                        }}
                                    >
                                        <span className="d-flex align-items-center">
                                            <i className="fa fa-sign-out fa-fw me-1"></i>
                                            Logout
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                    </>
                )}
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Logout</h5>
                                <button className="btn-close" onClick={() => setShowLogoutModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to logout?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
