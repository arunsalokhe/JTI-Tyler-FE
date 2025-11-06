import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import "./sidebar.css";
import DashboardImg from "./assets/dashboardImg.png";
import News from "./assets/news.png";
import MapEditing from "./assets/MapEditing.png";
import Ok from "./assets/ok.png";
import AlarmImg from "./assets/alarm.png";
import logo from "./assets/efilinglogo.png";


function Reports() {

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
                            <NavLink to="/reports/filingActivity" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-file-text fa-fw mx-2"></i>
                                <span className="pt-1">Filing Activity</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports/filingActivityByCase" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-folder fa-fw mx-2"></i>
                                <span className="pt-1">Filing Activity by Case</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports/filingActivityByClient" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-user fa-fw mx-2"></i>
                                <span className="pt-1">Filing Activity by Client</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports/filingActivityByPayment" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-credit-card-alt fa-fw mx-2"></i>
                                <span className="pt-1">Filing Activity by Payment Acc</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports/nonAcceptedFilingActivity" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-area-chart fa-fw mx-2"></i>
                                <span className="pt-1">Filing Activity (Non-Accepted)</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports/CaseListReport" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-list-alt fa-fw mx-2"></i>
                                <span className="pt-1">Case List</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports/newCaseListReport" className={({ isActive }) => `nav-link d-flex align-items-center px-0 ${isActive ? 'active' : ''}`}>
                                <i className="fa fa-folder-open fa-fw mx-2"></i>
                                <span className="pt-1">New Cases List</span>
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
            </aside >
            <div>
                <Outlet />
            </div>
        </>
    );
}
export default Reports;
