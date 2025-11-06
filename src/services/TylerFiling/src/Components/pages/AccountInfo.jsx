import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';


const AccountInfo = () => {

    const [zipError, setZipError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const [firmData, setFirmData] = useState({
        firmName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
        firmID: ""
    });

    const [errors, setErrors] = useState({
        firmName: "",
        phoneNumber: "",
        addressLine1: "",
        city: "",
        state: "",
        zipCode: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = sessionStorage.getItem("access_token");
    const navigate = useNavigate();
    const [createdAt, setCreatedAt] = useState("");
    const [serviceContactData, setServiceContactData] = useState(null);
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

    useEffect(() => {
        const fetchFirmData = async () => {
            try {
                const baseURL = process.env.REACT_APP_BASE_URL;
                setLoading(true);
                const response = await fetch(`${baseURL}/GetFirm`, {
                    //const response = await fetch("https://localhost:7207/api/Tyler/GetFirm", {
                    method: "POST",
                    headers: {
                        "Accept": "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const data = await response.json();
                if (data.success) {

                    const createdDate = data.data.CreatedAt
                        ? new Date(data.data.CreatedAt).toISOString().split("T")[0]  // Extract YYYY-MM-DD
                        : "N/A";

                    setCreatedAt(createdDate);

                    setFirmData({
                        firmName: data.data.Firm.FirmName || "",
                        phoneNumber: data.data.Firm.PhoneNumber || "",
                        addressLine1: data.data.Firm.Address?.AddressLine1 || "",
                        addressLine2: data.data.Firm.Address?.AddressLine2 || "",
                        city: data.data.Firm.Address?.City || "",
                        state: data.data.Firm.Address?.State || "",
                        zipCode: data.data.Firm.Address?.ZipCode || "",
                        country: "US", // Keep country static if not provided
                        firmID: data.data.Firm.FirmID || ""
                    });
                } else {
                    throw new Error("API returned an error");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFirmData();
    }, []);

    // Handle Input Change
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        let newErrors = { ...errors };

        // Required field validation
        if (["firmName", "addressLine1", "city", "state", "zipCode", "phoneNumber"].includes(id)) {
            newErrors[id] = value.trim() === "" ? "This field is required." : "";
        }

        // Phone number validation (10–11 digits)
        if (id === "phoneNumber") {
            if (!/^\d{0,11}$/.test(value)) {
                return;
            }
            if (value.length < 10 && value.length > 0) {
                newErrors.phoneNumber = "Phone number must be at least 10 digits.";
            } else {
                newErrors.phoneNumber = "";
            }
        }

        // ZIP code validation (5-digit or 5+4 format)
        if (id === "zipCode") {
            if (!/^\d{5}(-\d{4})?$/.test(value) && value !== "") {
                newErrors.zipCode = "Must match pattern: 91001 or 91001-1234";
            } else {
                newErrors.zipCode = "";
            }
        }

        setFirmData({ ...firmData, [id]: value });
        setErrors(newErrors);
    };

    const handleSave = async () => {
        let newErrors = {};

        // Validate required fields
        Object.keys(firmData).forEach((key) => {
            if (["firmName", "addressLine1", "city", "state", "zipCode", "phoneNumber"].includes(key)) {
                if (firmData[key].trim() === "") {
                    newErrors[key] = "This field is required.";
                }
            }
        });

        if (Object.keys(newErrors).length > 0 || errors.phoneNumber || errors.zipCode) {
            setErrors(newErrors);
            alert("Please fill in all required fields correctly.");
            return;
        }

        const baseURL = process.env.REACT_APP_BASE_URL;
        setLoading(true);

        try {
            const response = await fetch(`${baseURL}/UpdateFirm`, {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(firmData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            alert("Firm updated successfully!");
            console.log("Success:", result);

            window.location.reload();
        } catch (error) {
            console.error("Error updating firm:", error);
            alert("Failed to update firm.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <p className="text-danger text-center">Error: {error}</p>;
    }

    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="row mt-3">
                            <div className="d-flex align-items-center justify-content-between align-items-center initiate_case_sec_btn pe-0">
                                <h1 className="fw-normal"
                                    style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}>
                                    Account Information
                                </h1>
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
                                                <strong>Tip</strong> – Edit your account contact information.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form method="post">
                            <div className="row mt-2 gx-3 gy-4">
                                <div className="col-12 col-md-6 col-lg-6 h-100 pb-0">
                                    <div className="row mb-3">
                                        <label htmlFor="firmName" className="col-sm-4 col-form-label fw-bold">
                                            Organization / Firm
                                            <i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="firmName"
                                                value={firmData.firmName}
                                                onChange={handleInputChange}
                                            />
                                            {errors.firmName && <small className="text-danger">{errors.firmName}</small>}
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="phoneNumber" className="col-sm-4 col-form-label fw-bold">
                                            Phone <i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="phoneNumber"
                                                value={firmData.phoneNumber}
                                                onChange={handleInputChange}
                                            />
                                            {phoneError && (
                                                <p className="help-block text-danger" role="alert" aria-relevant="additions removals">
                                                    <i className="fa fa-exclamation-triangle fa-fw small-icon" aria-hidden="true"></i>
                                                    <small aria-hidden="true">{phoneError}</small>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="addressLine1" className="col-sm-4 col-form-label fw-bold">
                                            Address<i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" id="addressLine1" value={firmData.addressLine1} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="addressLine2" className="col-sm-4 col-form-label fw-bold">
                                            Address 2
                                        </label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" id="addressLine2" value={firmData.addressLine2} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="city" className="col-sm-4 col-form-label fw-bold">
                                            City<i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" id="city" value={firmData.city} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="state" className="col-sm-4 col-form-label fw-bold">
                                            State<i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" id="state" value={firmData.state} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="zipCode" className="col-sm-4 col-form-label fw-bold">
                                            ZIP Code<i className="fa fa-asterisk fa-fw red small-icon" id="gwt-uid-307" aria-hidden="false" aria-label="Required"></i>
                                        </label>
                                        <div className="col-sm-8">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="zipCode"
                                                value={firmData.zipCode}
                                                onChange={handleInputChange}
                                            />
                                            {zipError && (
                                                <p className="help-block text-danger" role="alert" aria-relevant="additions removals">
                                                    <i className="fa fa-exclamation-triangle fa-fw" aria-hidden="true"></i>
                                                    <small aria-hidden="true">{zipError}</small>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label className="col-sm-4 col-form-label"></label>
                                        <div className="col-sm-8">
                                            <button
                                                type="button"
                                                className="btn btn-dark"
                                                style={{ maxWidth: "300px", height: "40px", width: "115px" }}
                                                onClick={handleSave}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                {/* MISSING SECTION ADDED BACK */}
                                <div className="col-12 col-md-6 col-lg-6 pe-0">
                                    <div className="card w-100">
                                        <div className="card-header background_card_header py-2">
                                            <h6 className="fw-bold mb-0 fs-6">Account Information</h6>
                                        </div>
                                        <div className="card-body py-3">
                                            <div className="row mb-2">
                                                <label htmlFor="account_created" className="col-sm-4 col-form-label fw-bold">Account Created</label>
                                                <div className="col-sm-8">
                                                    <p className="mb-1">{createdAt}</p>
                                                </div>
                                            </div>
                                            <div className="row mb-2">
                                                <label htmlFor="promo_code" className="col-sm-4 col-form-label fw-bold">Promo Code</label>
                                                <div className="col-sm-8">
                                                    <p className="mb-1">N/A</p>
                                                </div>
                                            </div>
                                            <div className="row mb-0">
                                                <label htmlFor="group_account" className="col-sm-4 col-form-label fw-bold">Group Account</label>
                                                <div className="col-sm-8">
                                                    <p className="mb-0">Enabled</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* END OF MISSING SECTION */}
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </WrapperTag>
    );
};

export default AccountInfo;
