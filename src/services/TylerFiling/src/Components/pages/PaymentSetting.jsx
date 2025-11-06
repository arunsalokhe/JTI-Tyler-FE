import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import Update from '../assets/Update.png';
import Add from '../assets/Add.png';
import Trash from '../assets/trash.png';
import Edit from '../assets/Edit.png';
import headerImage from "../assets/header.jpg";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";


const PaymentSetting = () => {

    const [accountTypes, setAccountTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [selectedAccount, setSelectedAccount] = useState("");
    const [nickname, setNickname] = useState("");
    const [selectedAccountCodeId, setSelectedAccountCodeId] = useState("");
    const [accountType, setAccountType] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const token = sessionStorage.getItem('access_token');
    const [submitted, setSubmitted] = useState(false);
    const [errorMessages, setErrorMessages] = useState({});
    const cardTypeRef = useRef();
    const cardNumberRef = useRef(null);
    const expMonthRef = useRef(null);
    const expYearRef = useRef(null);
    const cvvRef = useRef(null);
    const nameOnCardRef = useRef(null);
    const address1Ref = useRef(null);
    const address2Ref = useRef(null);
    const cityRef = useRef(null);
    const stateRef = useRef();
    const zipRef = useRef(null);
    const navigate = useNavigate();
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [selectedDeleteAccountID, setSelectedDeleteAccountID] = useState(null);
    const formRef = useRef(null);
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


    const [formData, setFormData] = useState({
        cardType: "",
        cardNumber: "",
        expMonth: "",
        expYear: "",
        cvv: "",
        nameOnCard: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: ""
    });

    useEffect(() => {
        const fetchPaymentAccountTypes = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            setLoading(true); // Ensure loader starts before fetching

            try {
                const response = await fetch(`${baseURL}/GetPaymentAccountTypeList`, {
                    //const response = await fetch("https://localhost:7207/api/Tyler/GetPaymentAccountTypeList", {
                    method: "POST",
                    headers: {
                        "Accept": "*/*",
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({}) // Modify if API requires specific body data
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched Payment Account Types:", data); // Debugging

                // ✅ Filter out "Cash"
                const filteredAccountTypes = (data.data?.PaymentAccountType || []).filter(
                    (account) => account.Description !== "Cash"
                );

                setAccountTypes(filteredAccountTypes);
            } catch (error) {
                console.error("Error fetching payment account types:", error);
                setError(error.message);
            } finally {
                setLoading(false); // Stop loader
            }
        };

        fetchPaymentAccountTypes();
    }, [token]);

    // Validation function
    const validateForm = () => {
        let newErrors = {};

        if (!nickname.trim()) {
            newErrors.nickname = "Nickname is required";
        }

        if (!accountType) {
            newErrors.accountType = "Please select a payment type";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };
    // ✅ Handle account type selection
    const handleAccountTypeChange = (e) => {
        setSelectedAccountCodeId(e.target.value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevState) => {
            if (prevState[name] === value) return prevState; // 🔥 Prevents unnecessary updates
            return { ...prevState, [name]: value };
        });
    };

    useEffect(() => {
        if (cardNumberRef.current) {
            cardNumberRef.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.cardNumber]);
    // Runs every time cardNumber updates
    useEffect(() => {
        if (expMonthRef.current) {
            expMonthRef.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.expMonth]);

    useEffect(() => {
        if (expYearRef.current) {
            expYearRef.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.expYear]);

    useEffect(() => {
        if (cvvRef.current) {
            cvvRef.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.cvv]);

    useEffect(() => {
        if (nameOnCardRef.current) {
            nameOnCardRef.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.nameOnCard]);

    useEffect(() => {
        if (address1Ref.current) {
            address1Ref.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.address1]);

    useEffect(() => {
        if (address2Ref.current) {
            address2Ref.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.address2]);

    useEffect(() => {
        if (cityRef.current) {
            cityRef.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.city]);

    useEffect(() => {
        if (zipRef.current) {
            zipRef.current.focus(); // ✅ Ensures focus remains
        }

    }, [formData.zip]);

    useEffect(() => {
        fetchPaymentAccounts();
    }, []);

    const fetchPaymentAccounts = async () => {
        setLoading(true);
        setError("");
        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const response = await fetch(`${baseURL}/GetPaymentAccountList`, {
                //const response = await fetch("https://localhost:7207/api/Tyler/GetPaymentAccountList", {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Authorization": `Bearer ${token}`, // Make sure token is available
                },
            });

            const responseData = await response.json();
            console.log("API Response:", responseData);

            if (responseData.success && responseData.data.PaymentAccount) {
                setPaymentAccounts(responseData.data.PaymentAccount);
            } else {
                setError("Failed to load payment accounts.");
            }
        } catch (error) {
            console.error("API Error:", error);
            setError("Error fetching payment accounts.");
        } finally {
            setLoading(false);
        }
    };

    const generateAccountToken = () => {
        return Math.floor(100000000 + Math.random() * 900000000).toString(); // Ensures a 9-digit number
    };

    const handleSubmit = async (e) => {
        e.preventDefault();  // ✅ Stops default form submission

        setSubmitted(true);  // ✅ Tracks form submission state

        // Check both HTML validation & custom validation
        if (!formRef.current.checkValidity() || !validateFormCard()) {
            console.log("Form validation failed!");
            return;  // ✅ Stops execution if validation fails
        }

        console.log("Form is valid, submitting...");

        const baseURL = process.env.REACT_APP_BASE_URL;
        setLoading(true); // ✅ Show loader

        const accountToken = generateAccountToken(); // ✅ Generate a new token

        const requestBody = {
            accountName: nickname,
            paymentAccountTypeCodeId: selectedAccountCodeId,
            accountToken: accountToken,
            cardType: formData.cardType,
            cardLast4: formData.cardNumber.slice(-4),
            cardMonth: parseInt(formData.expMonth, 10),
            cardYear: parseInt(formData.expYear, 10),
            cardHolderName: formData.nameOnCard,
            cvv: formData.cvv,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            firmID: "10dae7e8-9f9d-4145-ac64-cf5830303dbb"
        };
        console.log("requestBody", requestBody);

        try {
            const response = await fetch(`${baseURL}/CreatePaymentAccount`, {
                //const response = await fetch("https://localhost:7207/api/Tyler/CreatePaymentAccount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const responseData = await response.json();
            console.log("Payment account Created", responseData);

            if (responseData.data.PaymentAccountID !== "null" && responseData.data.Error?.ErrorCode === "0") {
                alert("Payment Account added successfully!");
                console.log("Navigating to: /settings/paymentSetting");
                navigate("/settings/paymentSetting");
                window.location.reload();
                resetForm(); // ✅ Reset form after success
            } else {
                alert(`Failed to add payment account: ${responseData.data?.Error?.ErrorText || "Unknown error"}`);
            }
        } catch (error) {
            console.error("API Error:", error);
            setErrorMessages(["Failed to create payment account. Please try again later."]);
        }
    };

    // Form Validation
    const validateFormCard = () => {
        let newErrors = {};
        let errorMessages = [];

        if (!formData.cardType) {
            newErrors.cardType = "Card Type is required";
            errorMessages.push("Card Type is a required field.");
        }
        if (!formData.cardNumber || !/^\d{13,19}$/.test(formData.cardNumber)) {
            newErrors.cardNumber = "Enter a valid Card Number";
            errorMessages.push("Card Number is a required field.");
        }
        if (!formData.expMonth || !/^(0[1-9]|1[0-2])$/.test(formData.expMonth)) {
            newErrors.expMonth = "Enter valid MM";
            errorMessages.push("Card Expiration Date Month is a required field.");
        }
        if (!formData.expYear || !/^\d{4}$/.test(formData.expYear)) {
            newErrors.expYear = "Enter valid YYYY";
            errorMessages.push("Card Expiration Date Year is a required field.");
        }
        if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
            newErrors.cvv = "Enter valid CVV";
            errorMessages.push("Card Security Code is a required field.");
        }
        if (!formData.nameOnCard) {
            newErrors.nameOnCard = "Name on Card is required";
            errorMessages.push("Name is a required field.");
        }
        if (!formData.address1) {
            newErrors.address1 = "Address Line 1 is required";
            errorMessages.push("Address Line 1 is a required field.");
        }
        if (!formData.city) {
            newErrors.city = "City is required";
            errorMessages.push("City is a required field.");
        }
        if (!formData.state) {
            newErrors.state = "State is required";
            errorMessages.push("State is a required field.");
        }
        if (!formData.zip || !/^\d{5,6}$/.test(formData.zip)) {
            newErrors.zip = "Enter a valid Zip Code";
            errorMessages.push("Zip Code is a required field.");
        }

        if (errorMessages.length > 0) {
            setErrors(newErrors);
            setErrorMessages(errorMessages);
            return false;
        }

        setErrors({});
        setErrorMessages([]);
        return true;
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Check if both fields are filled
    const isFormValid = nickname.trim() !== "" && selectedAccountCodeId !== "";

    const PaymentModal = ({ isOpen, onClose, formData, handleChange }) => {
        if (!isOpen) return null;

        return (
            <div className="modal" style={{
                display: "block",
                position: "fixed",
                zIndex: 1,
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.4)",
                textAlign: "center" // Centers all content
            }}>
                <div className="modal-content" style={{
                    backgroundColor: "#fff",
                    margin: "5% auto",  // Reduce margin to move modal up
                    padding: "30px",    // Increase padding for more space
                    border: "1px solid #888",
                    width: "70%",       // Increase width (adjust as needed)
                    maxWidth: "900px",  // Set a max width to prevent it from being too large
                    height: "auto",     // Allow it to grow with content
                    minHeight: "500px", // Set a minimum height if needed
                    borderRadius: "0px",
                    boxShadow: "0px 6px 15px rgba(0,0,0,0.2)",
                    textAlign: "center"
                }}>

                    {/* ✅ Modal Header */}
                    <div className="modal-header" style={{
                        backgroundColor: "var(--primary)",
                        color: "var(--bs-white)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px",
                        borderRadius: "5px 5px 0 0"
                    }}>
                        <h2 className="modal-title" style={{ fontSize: "22px", fontWeight: "bold" }}>Enter Information</h2>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetFormPaymentModal} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>
                            &times;
                        </button>
                    </div>

                    {/* ✅ Image Below Header */}
                    <div style={{ marginTop: "10px" }}>
                        <img
                            id="imgHeader"
                            src={headerImage}
                            alt="Tyler Technologies"
                            style={{ borderWidth: "0px", maxWidth: "100%" }}
                        />
                    </div>

                    <div style={{ marginTop: "10px" }}>
                        <span id="lblOnlinePayment" className="SectionHeader" tabIndex="1" style={{ fontSize: "20px", fontWeight: "bold" }}>
                            Payment Information
                        </span>
                    </div>

                    {/* ✅ Modal Body */}
                    <div className="modal-body" style={{
                        display: "flex",
                        justifyContent: "center",  // ✅ Centers horizontally
                        alignItems: "center",      // ✅ Centers vertically
                        height: "100%",            // Ensures full modal height
                    }}>
                        <div id="divPaymentInfo" className="BoxOutline" style={{
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            width: "100%",   // Ensures it fits inside modal-content
                            maxWidth: "600px",
                            textAlign: "left",
                            backgroundColor: "#fff",
                        }}>
                            <div id="divCCHeader" className="ParagraphHeader" tabIndex="5" style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                marginBottom: "5px",
                                textAlign: "left"
                            }}>

                                Cardholder Information
                            </div>
                            <div id="divCCText" tabIndex="5" style={{
                                fontSize: "16px",
                                marginBottom: "20px",
                                textAlign: "left"
                            }}>
                                Enter the information as it appears on the Cardholder Account. The fields marked with a red asterisk (<span aria-hidden="true" style={{ color: "#df0000" }}>*</span>) are required fields.
                            </div>

                            {/* ✅ Form */}
                            <center>
                                <form ref={formRef} id="paymentForm" onSubmit={handleSubmit}>
                                    <table cellSpacing="5px">
                                        <tbody>
                                            {/* Card Type */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="cardType">Card Type</label>
                                                </td>
                                                <td className="Field">
                                                    <select
                                                        ref={cardTypeRef}
                                                        id="cardType"
                                                        name="cardType"
                                                        className="txtMedium"
                                                        value={formData.cardType}  // ✅ Keeps selection
                                                        onChange={handleChange}  // ✅ Unified handler
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="VISA">Visa</option>
                                                        <option value="DISCOVER">Discover</option>
                                                        <option value="MASTERCARD">MasterCard</option>
                                                    </select>
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>

                                            {/* Card Number */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="cardNumber">Card Number</label>
                                                </td>
                                                <td className="Field">
                                                    <input
                                                        id="cardNumber"
                                                        name="cardNumber"
                                                        type="text"
                                                        className="txtMedium"
                                                        autoComplete="off"
                                                        value={formData.cardNumber}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        ref={cardNumberRef}
                                                    />
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>

                                            {/* Expiry Date */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="expMonth">Exp Month</label>
                                                </td>
                                                <td className="Field">
                                                    <input
                                                        id="expMonth"
                                                        name="expMonth"
                                                        type="text"
                                                        placeholder="MM"
                                                        style={{ width: "55px" }}
                                                        value={formData.expMonth}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        ref={expMonthRef}
                                                    />
                                                    <span className="required">*</span>
                                                    <label htmlFor="expYear" style={{ marginLeft: "10px" }}>Exp Year</label>
                                                    <input
                                                        id="expYear"
                                                        name="expYear"
                                                        type="text"
                                                        placeholder="YYYY"
                                                        style={{ width: "70px" }}
                                                        value={formData.expYear}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        ref={expYearRef}
                                                    />
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>

                                            {/* CVV Code */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="cvv">CVV Code</label>
                                                </td>
                                                <td className="Field">
                                                    <input
                                                        id="cvv"
                                                        name="cvv"
                                                        type="text"
                                                        maxLength="6"
                                                        style={{ width: "50px" }}
                                                        value={formData.cvv}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        ref={cvvRef}
                                                    />
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>

                                            {/* Name on Card */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="nameOnCard">Name on Card</label>
                                                </td>
                                                <td className="Field">
                                                    <input
                                                        id="nameOnCard"
                                                        name="nameOnCard"
                                                        type="text"
                                                        maxLength="30"
                                                        className="txtMedium"
                                                        value={formData.nameOnCard}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        ref={nameOnCardRef}
                                                    />
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>

                                            {/* Address Line 1 */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="address1">Address Line 1</label>
                                                </td>
                                                <td className="Field">
                                                    <input
                                                        id="address1"
                                                        name="address1"
                                                        type="text"
                                                        maxLength="30"
                                                        className="txtExtraLarge"
                                                        value={formData.address1}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        ref={address1Ref}
                                                    />
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>

                                            {/* City */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="city">City</label>
                                                </td>
                                                <td className="Field">
                                                    <input
                                                        id="city"
                                                        name="city"
                                                        type="text"
                                                        maxLength="20"
                                                        className="txtLarge"
                                                        value={formData.city}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        ref={cityRef}
                                                    />
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>

                                            {/* State */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="state">State</label>
                                                </td>
                                                <td className="Field">
                                                    <select
                                                        id="state"
                                                        name="state"
                                                        className="txtMedium"
                                                        value={formData.state}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        ref={stateRef}
                                                    >
                                                        <option value="">Select State</option>
                                                        <option value="CA">California</option>
                                                        <option value="NY">New York</option>
                                                        <option value="TX">Texas</option>
                                                    </select>
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>

                                            {/* Zip Code */}
                                            <tr>
                                                <td className="FieldLabel">
                                                    <label htmlFor="zipCode">Zip Code</label>
                                                </td>
                                                <td className="Field">
                                                    <input
                                                        name="zip"
                                                        ref={zipRef}
                                                        value={formData.zip}
                                                        onChange={handleChange}  // ✅ Unified handler
                                                        placeholder="Zip Code"
                                                    />
                                                    <span className="required">*</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </form>
                            </center>

                        </div>
                    </div>

                    {errorMessages.length > 0 && (
                        <div className="error-container" style={{
                            backgroundColor: "#fff",
                            padding: "10px",
                            border: "1px solid #888",
                            borderRadius: "0px",
                            color: "#b30000",
                            width: "70%",
                            maxWidth: "600px",
                            textAlign: "left",
                            margin: "0 auto",
                            boxShadow: "0px 6px 15px rgba(0,0,0,0.2)",   // ✅ Centers it horizontally
                            marginTop: "10px",    // ✅ Adds spacing between modal and error box
                        }}>
                            <strong>There was an error submitting your form. Please check the following:</strong>
                            <ul>
                                {errorMessages.map((msg, index) => (
                                    <li key={index}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}


                    {/* ✅ Modal Footer */}
                    <div className="modal-footer" style={{ marginTop: "20px" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ marginRight: "10px" }}
                            onClick={handleSubmit}  // ✅ Calls handleSubmit manually
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleEditClick = (account) => {
        console.log("Selected Account for Edit:", account); // Debugging
        setSelectedAccount(account);
        setNickname(account.AccountName || ""); // Ensure the field is populated
    };

    const handleUpdatePaymentAccount = async () => {
        if (!nickname.trim()) {
            alert("Please enter a valid payment method name.");
            return;
        }
        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const response = await fetch(`${baseURL}/UpdatePaymentAccount`, {
                //const response = await fetch("https://localhost:7207/api/Tyler/UpdatePaymentAccount", {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json-patch+json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    paymentAccountID: selectedAccount.PaymentAccountID,
                    accountName: nickname,
                }),
            });

            if (response.ok) {
                alert("Payment account updated successfully!");
                // ✅ Close the modal properly
                const modalElement = document.getElementById("edit-modal");
                const modalInstance = Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();

                // ✅ Refresh the list
                fetchPaymentAccounts();

                // ✅ Reload the page to reflect updates
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                const data = await response.json();
                alert(data.message || "Failed to update payment account.");
            }
        } catch (error) {
            console.error("Error updating payment account:", error);
        }
    };

    const handleDeletePaymentAccount = async () => {
        if (!selectedDeleteAccountID) {
            alert("No payment account selected for deletion.");
            return;
        }
        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const response = await fetch(`${baseURL}/RemovePaymentAccount?PaymentAccountID=${selectedDeleteAccountID}`,
                //const response = await fetch(`https://localhost:7207/api/Tyler/RemovePaymentAccount?PaymentAccountID=${selectedDeleteAccountID}`,
                {
                    method: "POST",
                    headers: {
                        "Accept": "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                alert("Payment account deleted successfully!");

                // ✅ Close the Bootstrap modal properly
                const modalElement = document.getElementById("confirmDel-modal");
                const modalInstance = Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();

                // ✅ Refresh the list
                fetchPaymentAccounts();

                // ✅ Reload the page to reflect updates
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                const data = await response.json();
                alert(data.message || "Failed to delete payment account.");
            }
        } catch (error) {
            console.error("Error deleting payment account:", error);
        }
    };

    const resetForm = () => {
        setNickname("");
        setSelectedAccountCodeId("");
        setErrors({});
    };

    const resetFormPaymentModal = () => {
        setFormData({
            cardType: "",
            cardNumber: "",
            expMonth: "",
            expYear: "",
            cvv: "",
            nameOnCard: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zip: ""
        });

        setNickname("");
        setSelectedAccountCodeId("");
        setAccountType("");
        setErrors({});

        window.location.reload();  // ✅ Reload the page after reset
    };


    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="row mt-3">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                                {/* Heading */}
                                <h1
                                    className="fw-normal mb-0"
                                    style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                                >
                                    Payment Settings
                                </h1>

                                {/* Action Links */}
                                <div className="d-flex justify-content-start justify-content-md-end align-items-center gap-3">
                                    {/* Refresh Link */}
                                    <a
                                        href="#"
                                        className="text-decoration-none d-flex align-items-center dashboard-link"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.location.reload();
                                        }}
                                    >
                                        <i className="fa fa-refresh fa-fw mx-1" aria-hidden="true"></i>
                                        <span className="pt-1">Refresh</span>
                                    </a>

                                    {/* Return to Dashboard Link */}
                                    <Link
                                        to="/e-filing/dashboard"
                                        className="text-decoration-none d-flex align-items-center dashboard-link"
                                    >
                                        <i className="fa fa-dashboard fa-fw mx-1"></i>
                                        <span className="pt-1">Return to Dashboard</span>
                                    </Link>
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
                                                <strong>Tip - </strong> Use the edit or delete actions to manage existing payment accounts.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form method="post">
                            <div className="row mt-3">
                                {/* Left Column */}
                                <div className="col-12 col-md-9 col-lg-9">
                                    {/* Card 1 */}
                                    <div className="card border rounded shadow-sm mt-3">
                                        <div className="card-header bg-light border-bottom">
                                            <h6 className="fw-bold mb-0">
                                                Los Angeles Civil, Riverside, Alameda, Placer, Madera, Ventura
                                            </h6>
                                        </div>
                                        <div className="card-body" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                            <p>
                                                Payment methods entered here may be used to pay court filing fees in Los Angeles Civil, San Diego Civil and Probate, Placer, Riverside, Alameda, Madera, etc... Click here for a full list of participating courts.
                                            </p>
                                            <div className="alert p-3" style={{ backgroundColor: "#fcf8e3", border: "1px solid #ffeeba" }}>
                                                <p className="mb-0">
                                                    <strong>
                                                        You have not yet added a payment type to file in the Los Angeles Civil,
                                                        San Diego Civil and Probate, Placer, Riverside, Alameda, Madera, etc...
                                                    </strong>
                                                </p>
                                            </div>
                                            <a className="gwt-Anchor text-decoration-none d-flex align-items-center mt-3" href="javascript:;" data-bs-toggle="modal" data-bs-target="#addPay1-modal">
                                                <i className="fa fa-plus-square fa-fw" aria-hidden="true" style={{ fontSize: "1rem", color: "#336C9D" }}></i>
                                                <b className="ms-2" style={{ color: "#336C9D" }}>Add New Payment Method</b>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Card 2 */}
                                    <div className="card border rounded shadow-sm mt-3">
                                        <div className="card-header bg-light border-bottom">
                                            <h6 className="fw-bold mb-0">eFileCA Courts</h6>
                                        </div>
                                        <div className="card-body" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                            <div className="table-responsive">
                                                {loading && <p>Loading payment accounts...</p>}
                                                {error && <p className="text-danger">{error}</p>}
                                                <table className="table table-bordered">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th scope="col" className="w-25">Nickname</th>
                                                            <th scope="col" className="w-25">Method</th>
                                                            <th scope="col" className="w-25">Expiration Date</th>
                                                            <th scope="col" className="w-25">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paymentAccounts.length > 0 ? (
                                                            paymentAccounts.map((account) => (
                                                                <tr key={account.PaymentAccountID}>
                                                                    <td>{account.AccountName}</td>
                                                                    <td>{account.CardType ? `${account.CardType} ••••${account.CardLast4}` : "N/A"}</td>
                                                                    <td>{account.CardMonth && account.CardYear ? `${account.CardMonth}/${account.CardYear}` : "N/A"}</td>
                                                                    <td>
                                                                        <div className="d-inline-flex align-content-center">
                                                                            <div className="card-text d-flex align-items-center">
                                                                                <i className="fa fa-trash fa-fw text-primary" aria-hidden="true"></i>
                                                                                <a
                                                                                    className="text-decoration-none text-primary ms-2"
                                                                                    href="#"
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#confirmDel-modal"
                                                                                    onClick={() => setSelectedDeleteAccountID(account.PaymentAccountID)}
                                                                                >
                                                                                    Delete
                                                                                </a>
                                                                            </div>
                                                                            <div className="card-text ms-3 d-flex align-content-center">
                                                                                <i className="fa fa-edit fa-fw text-primary mt-1" aria-hidden="true"></i>
                                                                                <a
                                                                                    href="#"
                                                                                    className="text-decoration-none text-primary ms-2"
                                                                                    onClick={() => handleEditClick(account)}
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#edit-modal"
                                                                                >
                                                                                    Edit
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="4" className="text-center">No payment accounts available</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <a className="gwt-Anchor text-decoration-none d-flex align-items-center mt-3" href="javascript:;" data-bs-toggle="modal" data-bs-target="#addPay1-modal">
                                                <i className="fa fa-plus-square fa-fw" aria-hidden="true" style={{ fontSize: "1rem", color: "#336C9D" }}></i>
                                                <b className="ms-2" style={{ color: "#336C9D" }}>Add New Payment Method</b>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Attention */}
                                <div className="col-12 col-md-3 col-lg-3 pe-0">
                                    <div className="card border rounded shadow-sm mt-3 h-100">
                                        <div className="card-header" style={{ backgroundColor: "#fcf8e3" }}>
                                            <h6 className="fw-bold py-1 mb-0" style={{ color: "#8a6d3b" }}>
                                                <i className="fa fa-exclamation-triangle fa-fw me-2" aria-hidden="true"></i>
                                                Attention
                                            </h6>
                                        </div>

                                        <div className="card-body" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                            <p className="text-justify mb-0">
                                                Your payment method will only be charged if your filing is <b>ACCEPTED</b>.
                                                If you see a pending charge before your filing is accepted, this is an authorization placed on the card to ensure funds are available.
                                                <br /><br />
                                                If your filing is <b>CANCELLED</b> or <b>REJECTED</b>, the funds will be released and returned to your payment method according to your financial institution's policies
                                                (typically three (3) to ten (10) business days).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* modal 1 start */}
            <div className="modal fade" id="addPay1-modal" tabIndex={-1} role="dialog" area-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document" >
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">
                                Add a Payment Account
                            </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}> </button>
                        </div>
                        {/* <form onSubmit={handleSubmit}> */}
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Tip Data */}
                                <div className="row">
                                    <div className="col-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data">
                                            <strong>Tip:</strong> Enter your payment details.
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Account Nickname */}
                                <div className="row">
                                    <label className="form-label fw-bold ps-1" htmlFor="nickname">
                                        Payment Account Nickname
                                    </label>
                                </div>
                                <div className="row mb-2">
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter Nickname"
                                        name="nickname"
                                        id="nickname"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                    />
                                </div>
                                {errors.nickname && <p className="text-danger">{errors.nickname}</p>}

                                {/* Payment Account Type */}
                                <div className="row">
                                    <label className="form-label fw-bold ps-1" htmlFor="accountType">
                                        Payment Account Type
                                    </label>
                                </div>
                                <div className="row mb-2">
                                    <select
                                        className="form-select"
                                        name="accountType"
                                        id="accountType"
                                        value={selectedAccountCodeId}  // ✅ Ensure selected value is tracked
                                        onChange={(e) => setSelectedAccountCodeId(e.target.value)}  // ✅ Correctly updates selectedAccountCodeId
                                    >
                                        <option value="">Choose Payment type</option>
                                        {accountTypes
                                            .filter((account) => account.Description !== "Cash") // Hide "Cash"
                                            .map((account) => (
                                                <option key={account.CodeId} value={account.CodeId}>
                                                    {account.Description}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                {errors.accountType && <p className="text-danger">{errors.accountType}</p>}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div>
                            <div className="modal-footer d-flex justify-content-center text-center border-0 mb-2">
                                <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">
                                    Cancel
                                </button>

                                {isFormValid && (
                                    <button
                                        type="button"
                                        className="btn btn-dark px-4"
                                        onClick={() => setIsModalOpen(true)} // Open modal on click
                                    >
                                        Continue
                                    </button>
                                )}
                            </div>

                            {/* Render Modal Only When Needed */}
                            {isModalOpen && (
                                <PaymentModal
                                    isOpen={isModalOpen}
                                    onClose={closeModal}
                                    formData={formData} // ✅ Pass formData as props
                                    handleChange={handleChange} // ✅ Pass function to prevent state reset
                                    validateFormCard={validateFormCard}
                                />
                            )}
                            {/* {isModalOpen && <CardholderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />} */}
                        </div>
                        {/* </form> */}
                        {/* <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-dark px-4"
                                onClick={() => window.open("https://togatest.tylerhost.net/EPayments/Webs/EPayment.aspx", "_blank")}
                            >
                                Continue
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>
            {/* modal 2 start */}
            <div className="modal fade" id="addPay2-modal" tabIndex={-1} role="dialog" area-hidden="true" >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">
                                Add a Payment Account
                            </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Start tip data */}
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data">
                                            <strong>Tip:</strong> Enter your payments details for E-Filing Court.
                                        </p>
                                    </div>
                                </div>
                                {/* End tip data */}
                                <div className="row">
                                    <label className="form-label fw-bold ps-1" htmlFor="nickname">
                                        Payment Account Nickname
                                    </label>
                                </div>
                                <div className="row mb-4">
                                    <   input className="form-control" type="text" name='nickname' id='nickname' placeholder="Enter Nickname" />
                                </div>
                                <div className="row">
                                    <label className="form-label fw-bold ps-1" htmlFor="accountType">
                                        Payment Account Type
                                    </label>
                                </div>
                                <div className="row mb-4">
                                    <select className="form-select" name="accountType" id="accountType">
                                        <option value={1}>Choose Payment type</option>
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="mb-3 form-check">
                                        <input type="checkbox" className="form-check-input" id="check1" />
                                        <label className="form-check-label" htmlFor="check1">
                                            Make this payment method available to all filer on the
                                            account.
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" className="btn btn-dark px-4">
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* modal 3 start */}
            <div className="modal fade" id="confirmDel-modal" tabIndex={-1} role="dialog" area-hidden="true" >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">
                                Confirm Delete
                            </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" >
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Start tip data */}
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data" style={{ textIndent: "1rem" }}>
                                            <strong>Attention:</strong> This will delete your Payment Method!
                                        </p>
                                    </div>
                                </div>
                                {/* End tip data */}
                                <div className="row">
                                    <p className="ps-1">
                                        Are you sure you would like to remove selected Payment Method,
                                        if yes, click confirm.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" className="btn btn-dark px-4" onClick={handleDeletePaymentAccount}>
                                Confirm
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            {/* modal 4 start */}
            <div className="modal fade" id="edit-modal" tabIndex={-1} role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3">Edit Payment Method</h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-12 p-0">
                                        <p className="text-start px-2 py-3 fs-6 tip_data">
                                            <strong>Tip:</strong> Updating an account number or routing number requires adding a new payment account.
                                        </p>
                                    </div>
                                </div>
                                <div className="row">
                                    <label className="form-label fw-bold ps-1" htmlFor="nickname">Payment Method Nickname</label>
                                </div>
                                <div className="row mb-4">
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="nickname"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="Enter Nickname"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center">
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-dark px-4" onClick={handleUpdatePaymentAccount}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </WrapperTag >
    )
}

export default PaymentSetting;