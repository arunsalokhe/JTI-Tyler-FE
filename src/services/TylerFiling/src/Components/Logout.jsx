import React, { useEffect, useState } from 'react';
import LogoBlack from './assets/efilinglogopurple.png';
import { Link } from 'react-router-dom';

const Logout = () => {
    const [logoutReason, setLogoutReason] = useState("session");

    useEffect(() => {
        const reason = localStorage.getItem("logoutReason");
        if (reason) {
            setLogoutReason(reason);
            localStorage.removeItem("logoutReason"); // Clear after use
        }
    }, []);

    return (
        <div className="logout-page container pt-0 pb-5">
            <div className="logout-container shadow p-4 rounded bg-white">
                {/* Logo Section */}
                <div className="row mb-4">
                    <div className="col d-flex justify-content-center">
                        <img
                            className="logoimg img-fluid"
                            src={LogoBlack}
                            alt="altrue"
                            style={{ maxWidth: "180px", height: "auto" }}
                        />
                    </div>
                </div>

                {/* Logout Message Section */}
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8 text-center">
                        <h4 className="mb-3">
                            {logoutReason === "session" ? (
                                <>
                                    <i className="fa fa-clock-o" aria-hidden="true"></i> Session Timed Out
                                </>
                            ) : (
                                <>
                                    <i className="fa fa-sign-out" aria-hidden="true"></i> Goodbye, for now.
                                </>
                            )}
                        </h4>
                        <p style={{ fontSize: "14px" }}>
                            {logoutReason === "session"
                                ? "We're sorry, due to inactivity, we've timed out your e-filing session for your security. Please choose an option below to continue."
                                : "You have successfully logged out. Please choose an option below to continue."}
                        </p>
                    </div>
                </div>

                {/* Buttons Section */}
                <div className="row justify-content-center mt-4">
                    <div className="col-12 col-sm-6 col-md-4 d-flex flex-column align-items-center gap-3">
                        <Link to="/e-filing" className="btn btn-dark w-100">
                            Return to Home
                        </Link>
                        <Link to="/" className="btn btn-dark w-100">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Logout;
