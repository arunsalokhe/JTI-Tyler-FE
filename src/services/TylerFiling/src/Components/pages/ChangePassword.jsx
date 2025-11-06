import React, { useState, useEffect } from 'react';

const ChangePassword = () => {
    const token = sessionStorage.getItem('access_token');
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
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

    const handleChangePassword = async (e) => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        e.preventDefault();

        const requestBody = {
            oldPassword,
            newPassword,
        };
        if (newPassword !== confirmPassword) {
            setErrorMessage("New Password and Retype Password do not match!");
            return;
        }
        try {
            const response = await fetch(`${baseURL}/ChangePassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok) {
                setErrorMessage("Password changed successfully!");
            } else {
                setErrorMessage(data.message || "Failed to change password");
            }
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        }
    };


    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="row mt-3">
                            <div className="d-flex align-items-center justify-content-between align-items-center initiate_case_sec_btn pe-0">
                                <h1
                                    className="fw-normal"
                                    style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                                > Change Password
                                </h1>
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
                                                <strong>Tip</strong> – Enter your old password, then create and confirm a new password.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Row */}
                        <div className="row mt-3 gx-4 gy-4">
                            {/* Left Side: Form */}
                            <div className="col-12 col-md-6">
                                <form role="form">
                                    {/* Old Password */}
                                    <div className="form-group row mb-3 align-items-center">
                                        <label htmlFor="oldPass" className="col-sm-4 col-form-label text-start text-sm-end">
                                            Old Password <i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="oldPass"
                                                required
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="form-group row mb-3 align-items-center">
                                        <label htmlFor="newPass" className="col-sm-4 col-form-label text-start text-sm-end">
                                            New Password <i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="newPass"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Retype Password */}
                                    <div className="form-group row mb-4 align-items-center">
                                        <label htmlFor="reTypePass" className="col-sm-4 col-form-label text-start text-sm-end">
                                            Retype new Password <i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="reTypePass"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="row">
                                        <div className="col-sm-8 offset-sm-4">
                                            <button type="button" className="btn btn-dark" style={{ width: "180px" }} onClick={handleChangePassword}>
                                                Change Password
                                            </button>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            {/* Right Side: Attention Card */}
                            <div className="col-12 col-lg-3" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                <div className="card shadow-sm border" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="card-header d-flex align-items-center"
                                        style={{ backgroundColor: "#faebcc", color: "#8a6d3b", borderBottom: "1px solid #f8e1a1" }}
                                    >
                                        <i className="fa fa-bell fa-fw me-2"></i>
                                        <h6 className="fw-bold my-0" style={{ fontSize: "16px" }}>Attention</h6>
                                    </div>
                                    <div className="card-body">
                                        <p className="text-muted mb-0" style={{ textAlign: "justify" }}>
                                            Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, and 1 digit or special character.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WrapperTag>


    )
}

export default ChangePassword;