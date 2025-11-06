import React from 'react'
import { NavLink, Outlet, Link } from "react-router-dom";
import "./sidebar.css";
import DashboardImg from "./assets/dashboardImg.png";
import News from "./assets/news.png";
import MapEditing from "./assets/MapEditing.png";
import Ok from "./assets/ok.png";
import AlarmImg from "./assets/alarm.png";
import logo from "./assets/efilinglogo.png";

function Settings() {
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

                <nav aria-label="E-Filing Sub Menu">
                    <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="e-filing-side-menu">
                        <li className="nav-item">
                            <NavLink to="/settings/accountInfo" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-building fa-fw mx-2"></i>
                                <span className="pt-1">Account Information</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings/editUser" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-user fa-fw mx-2"></i>
                                <span className="pt-1">Edit User</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings/changePassword" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-key fa-fw mx-2"></i>
                                <span className="pt-1">Change Password</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings/manageUsers" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-users fa-fw mx-2"></i>
                                <span className="pt-1">Manage Users</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings/paymentSetting" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-credit-card-alt fa-fw mx-2"></i>
                                <span className="pt-1">Payment Settings</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings/invoiceList" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-list fa-fw mx-2"></i>
                                <span className="pt-1">Invoice List</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings/userPreferences" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-sliders fa-fw mx-2"></i>
                                <span className="pt-1">User Preferences</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings/servicesContact" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-address-card fa-fw mx-2"></i>
                                <span className="pt-1">Services Contact</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings/partyAddress" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-address-book fa-fw mx-2"></i>
                                <span className="pt-1">Party Address Book</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="col-lg-12 mt-5">
                    <footer className="copyright">
                        <span className="gwt-InlineLabel">Copyright © Altrue E-Filing for Good Cause. All rights reserved.</span>
                        <br />
                        <Link className="gwt-Anchor" target="helpWindow">User Agreement</Link>
                        <span className="gwt-InlineHTML"> | <Link target="_blank">Accessibility Statement</Link></span>
                    </footer>
                </div>
            </aside>
            <div>
                <Outlet />
            </div>
        </>
    )
}

export default Settings;
