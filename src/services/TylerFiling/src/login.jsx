import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Components/assets/efilinglogopurple.png"
import { useNavigate } from "react-router";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [email, setEmail] = useState(""); // State to store email
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLoginButtonClick = async (username, password) => {
        // Input validation
        if (!username || !password) {
            setErrorMessage("Username and password are required.");
            setSuccessMessage(null);
            return;
        }
        try {
            //const baseURL = process.env.REACT_APP_BASE_URL;
            const baseURL = import.meta.env.VITE_BASE_URL;
            const response = await fetch("http://192.168.1.49:8022/api/Auth/login", {
            //const response = await fetch(`${baseURL}/Auth/login`, {
            //const response = await fetch("https://localhost:7207/api/Auth/login", {
                method: "POST",
                body: JSON.stringify({
                    id: "0",
                    username: username,
                    password: password,
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            })

            const data = await response.json();
            if (!response.ok || data.success === false) {
                setErrorMessage(data.message || "Login failed. Please try again.");
                setSuccessMessage(null);
            } else {
                setSuccessMessage(data.message || "Login successful!");
                setErrorMessage(null);
                sessionStorage.setItem("access_token", data.access_token);
                // navigate("/tyler-filing");
                navigate("/tyler-filing/dashboard");
 // Redirect to the efiling dashboard page
            }
        }
        catch (error) {
            console.error("Error in login", error);
            setErrorMessage("Failed to login. Please try again.");
            setSuccessMessage(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLoginButtonClick(username, password);
    };

    const handleSendActivationEmail = async () => {
        if (!email) {
            setError("Email is required.");
            return;
        } else if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError(""); // Clear validation errors
        setLoading(true);

        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const response = await fetch(
                `${baseURL}/SelfResendActivationEmail?Email=${encodeURIComponent(email)}`,
                {
                    method: "POST",
                    headers: {
                        accept: "*/*",
                    },
                }
            );

            const data = await response.json();
            setLoading(false);

            if (data.status === 200) {
                if (data.data?.Error?.ErrorCode === "78") {
                    setErrorMessage("User has already been activated.");
                    closeFirstModal(); // Close the first modal
                    setErrorModal(true); // Show Error Modal
                } else if (data.data?.Error?.ErrorCode === "60") {
                    setErrorMessage("Username or Provided Email not found.");
                    closeFirstModal(); // Close the first modal
                    setErrorModal(true); // Show Error Modal
                } else {
                    // Success case - you might want to show a success message
                    console.log("Activation email sent successfully!");
                }
            } else {
                console.log(data.message || "Failed to send activation email.");
            }
        } catch (error) {
            setLoading(false);
            console.log("Network error. Please try again.");
        }
    };

    const closeFirstModal = () => {
        const firstModal = document.getElementById("actEmail-modal");
        if (firstModal) {
            firstModal.classList.remove("show");
            firstModal.style.display = "none";
            document.body.classList.remove("modal-open"); // Removes backdrop effect
        }
    };

    const handleErrorModalClose = () => {
        setErrorModal(false);
        window.location.reload(); // ✅ Refresh the entire page
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);

        // Clear error dynamically if email is valid
        if (validateEmail(newEmail)) {
            setError("");
        }
    };

    return (
        <>
            <section
                className="d-flex justify-content-center flex-column align-items-center px-3"
                style={{
                    minHeight: "100vh",
                    marginTop: "0",
                    paddingTop: "0",
                    boxSizing: "border-box",
                    position: "relative",
                    top: "-40px"
                }}
            >
                {/* 🔒 Login Card */}
                <div className="card mx-auto w-100 mt-0" style={{ maxWidth: "420px" }}>
                    <div className="text-center py-2">
                        <Link className="d-inline-block">
                            <img src={Logo} alt="logo" style={{ maxWidth: "180px", height: "auto" }} />
                        </Link>
                    </div>

                    <div className="card-body px-4" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                        <div className="alert alert-success">
                            <strong>Important!</strong> If you already have an e-filing account, please use your existing login here.
                        </div>

                        <form method="post" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="User Name"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                            {successMessage && <div className="alert alert-success">{successMessage}</div>}

                            <div className="d-grid mt-3">
                                <button type="submit" className="btn btn-dark btn-lg w-100">Login</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 🌐 Links + Sign Up */}
                <div className="w-100 mt-3" style={{ maxWidth: "420px" }}>
                    <div className="text-center" style={{ fontFamily: "Arial", fontSize: "14px", color: "#336C9D" }}>
                        <Link
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#fPass-modal"
                            style={{ color: "#336C9D", textDecoration: "none" }}
                        >
                            <p className="mb-1">Forgot Password/Unlock Account</p>
                        </Link>
                        <Link
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#actEmail-modal"
                            style={{ color: "#336C9D", textDecoration: "none" }}
                        >
                            <p className="mb-0">Re-send Activation Link</p>
                        </Link>
                    </div>

                    {/* Separator */}
                    <div className="my-4 px-4 mx-auto" style={{ maxWidth: "420px" }}>
                        <div className="d-flex align-items-center">
                            <hr className="flex-grow-1" />
                            <span className="mx-2 text-muted">Or</span>
                            <hr className="flex-grow-1" />
                        </div>
                    </div>

                    {/* ✅ Sign Up Button */}
                    <div className="d-grid px-4">
                        <Link
                            to="/register"
                            className="btn btn-lg w-100 text-white"
                            style={{
                                backgroundColor: "#000",
                                border: "none"
                            }}
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </section>

            <div className="modal fade" id="fPass-modal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-3">
                            <h3 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">Forgot Password</h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data"> <strong>Tip:</strong> Please enter your email address to make your reset password request. </p>
                                    </div>
                                </div>
                                <div className="row">
                                    <label className="form-label fw-bold ps-1" htmlFor="youremail">Email</label>
                                </div>
                                <div className="row">
                                    <input className="form-control" type="email" name="youremail" id="youremail" placeholder="@gmail.com" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-dark px-4">Reset Password</button>
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="actEmail-modal" tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-3">
                            <h3 className="modal-title fw-normal ms-3" style={{ fontFamily: "Arial, sans-serif" }}>Re-send Activation Email</h3>
                            <button
                                type="button"
                                className="close modal-close-button"
                                aria-label="Click to close the dialog"
                                data-bs-dismiss="modal">
                                ×
                            </button>
                        </div>

                        <div className="modal-body" style={{ fontFamily: "Arial, sans-serif" }}>
                            <div className="container-fluid">
                                <div className="alert alert-success" style={{ fontFamily: "Arial, sans-serif" }}>
                                    <i className="fa fa-info-circle fa-fw" aria-hidden="true"></i>
                                    &nbsp; Please enter your email address to request your account activation email be resent.
                                </div>

                                <label className="form-label fw-bold ps-1" htmlFor="emailaddress">
                                    Email
                                </label>
                                <input
                                    className={`form-control ${error ? "is-invalid" : ""}`}
                                    type="email"
                                    id="emailaddress"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                                {error && <div className="invalid-feedback">{error}</div>}
                            </div>
                        </div>

                        <div className="modal-footer d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn btn-dark px-4"
                                onClick={handleSendActivationEmail}
                                disabled={loading || !!error || !email} // Enable if email is valid
                            >
                                {loading ? "Sending..." : "Send Activation Email"}
                            </button>
                            <button type="button" className="btn btn-default px-4" data-bs-dismiss="modal">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* ✅ Error Modal (Shown if User Already Activated) */}
            {errorModal && (
                <div className="modal fade show d-block" style={{ fontFamily: "Arial, sans-serif" }} tabIndex={-2} role="dialog">
                    <div className="modal-dialog modal-dialog-centered custom-modal-width"> {/* ✅ Added custom class */}
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title fw-narmal" style={{ fontFamily: "Arial, sans-serif" }} >Error While Resending Activation Email</h3>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={handleErrorModalClose} // ✅ Refresh on close
                                    data-dismiss="modal"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="gwt-HTML" style={{ fontFamily: "Arial, sans-serif" }}>{errorMessage}</div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={handleErrorModalClose}>
                                    Close
                                </button>
                                <button type="button" className="btn btn-dark" onClick={handleErrorModalClose}>
                                    Refresh Browser
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

            )}
        </>
    );
};

export default Login;