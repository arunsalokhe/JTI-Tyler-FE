
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoBlack from "./Components/assets/efilinglogo.png"
import * as Yup from "yup";
import { useFormik } from "formik";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [registrationType, setregistrationType] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const securityQuestions = [
        "What is the name of your favorite childhood friend?",
        "What is the middle name of your oldest child?",
        "In what city or town did your mother and father meet?",
        "What school did you attend for sixth grade?",
        "What was the name of your elementary/primary school?",
        "What is the street number of the house you grew up in?",
        "What was the make of your first car?",
        "What is the name of your favorite childhood friend?",
        "What was the name of your first stuffed animal?",
        "What was the last name of your third grade teacher?",
        "What is your maternal grandmother's maiden name?"
    ];

    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSaveAndFinishButtonClick = async (values) => {
        setLoading(true); // Show loader when request starts
        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const response = await fetch(`${baseURL}/RegisterUser`, {
                method: "POST",
                body: JSON.stringify({
                    id: 0,
                    email: values.email,
                    passwordEncrypted: values.passwordEncrypted,
                    securityQuestion: values.securityQuestion,
                    securityAnswer: values.securityAnswer,
                    firstName: values.firstName,
                    middleName: values.middleName,
                    lastName: values.lastName,
                    suffix: values.suffix,
                    organization: values.organization,
                    phoneNo: values.phoneNumber,
                    address1: values.address1,
                    address2: values.address2,
                    city: values.city,
                    state: values.state,
                    zipCode: values.zipCode,
                    countryCode: "US",
                    firmName: "string",
                    isActivated: true,
                    status: 0,
                    recieveFilingStatus: true,
                    ccEmails: "string",
                    registrationType: registrationType,
                    barId: values.barId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            });

            const data = await response.json();

            if (data.status === 200) {
                setSuccessMessage(data.message);
                setErrorMessage(null);
                navigate("/CongratulationsPage");
            } else {
                setErrorMessage(data.data?.Error?.ErrorText || "Something went wrong");
                setSuccessMessage(null);
            }
        } catch (error) {
            setErrorMessage("Network error. Please try again.");
        } finally {
            setLoading(false); // Hide loader when request completes
        }
    };

    const handleFormSubmit = (values) => {
        console.log("✅ handleFormSubmit triggered!");
        console.log("values:", values);
        handleSaveAndFinishButtonClick(values);
    };


    const initialValues = {
        email: "",
        passwordEncrypted: "",
        securityQuestion: "",
        securityAnswer: "",
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        phoneNumber: "",
        organization: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zipCode: ""
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        passwordEncrypted: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
            .matches(/[\W_]/, "Password must contain at least one special character")
            .required("Password is required"),
        securityQuestion: Yup.string()
            .required("Security question is required"),
        securityAnswer: Yup.string()
            .required("Security answer is required"),
        firstName: Yup.string()
            .required("First Name is required"),
        middleName: Yup.string()
            .required("Middle Name is required"),
        lastName: Yup.string()
            .required("Last Name is required"),
        suffix: Yup.string()
            .required("Suffix is required"),
        phoneNumber: Yup.string()
            .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
            .required("Phone number is required"),
        organization: Yup.string()
            .required("Organization is required"),
        address1: Yup.string()
            .required("Address line 1 is required"),
        address2: Yup.string()
            .required("Address line 2 is required"),
        city: Yup.string()
            .required("City is required"),
        state: Yup.string()
            .required("State is required"),
        zipCode: Yup.string()
            .matches(/^\d{5}(-\d{4})?$/, "Invalid zip code format")
            .required("Zip code is required"),
    });

    // Formik Hooks
    // used useFormik() insted of formik component <Formik ... />
    const {
        handleChange,
        handleBlur,  // ✅ Include this
        handleSubmit,
        errors,
        touched,
        values,
    } = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            handleFormSubmit(values);
        },
        validateOnChange: true,
        validateOnMount: true,
    });




    const handleRadioFieldChange = (event) => {
        setregistrationType(event.target.value);
    };

    return (
        <>
            <main>
                <div className="container-fluid px-1 px-md-5 py-1">
                    <div className="form-wrapper border rounded shadow-md p-2 mx-auto" style={{ maxWidth: "800px" }}>

                        <div className="row justify-content-center mb-4">
                            <div className="col-12 col-md-4 text-center text-md-start">
                                <Link href="index.html" className="text-dark text-decoration-none">
                                    <img src={LogoBlack} alt="logo-black" className="img-fluid p-1" width="250" />
                                </Link>
                            </div>
                        </div>

                        <div className="row justify-content-center text-center mb-3">
                            <div className="col-12 col-lg-8">
                                <p><strong>Thank you for choosing E-Filing as your e-filing service provider.</strong></p>
                                <p>Please take full advantage of our <strong>FAST, EASY, SINGLE SCREEN E-FILING</strong> service.</p>
                                <p>If you require any assistance you may use the live chat below or call us at (801) 448-7268.</p>

                                <div className="alert alert-warning mx-auto" style={{ maxWidth: "600px" }}>
                                    <i className="fa fa-bell me-2"></i>
                                    <strong> Attention! </strong> If you already have an e-filing account with another service provider,
                                    simply <a href="">login</a> with your existing username and password.
                                </div>
                            </div>
                        </div>

                        <div className="row justify-content-center">
                            <div className="col-12 col-lg-8">
                                <form method="post" onSubmit={handleSubmit} noValidate>
                                    <div className="row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-emailField-id">Email</label>
                                        <div className="col-12 col-md-8">
                                            <input type="email" className="form-control" id="signUp-emailField-id" name="email"
                                                value={values.email} onChange={handleChange} />
                                            {touched.email && errors.email && <p className="text-danger">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-passwordField-id">Password</label>
                                        <div className="col-12 col-md-8 position-relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control pe-5"
                                                id="signUp-passwordField-id"
                                                name="passwordEncrypted"
                                                value={values.passwordEncrypted}
                                                onChange={handleChange}
                                            />
                                            <span className="position-absolute top-50 end-0 translate-middle-y me-3" style={{ cursor: "pointer" }}
                                                onClick={togglePasswordVisibility}>
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                            {touched.passwordEncrypted && errors.passwordEncrypted && (
                                                <p className="text-danger">{errors.passwordEncrypted}</p>
                                            )}
                                            <p className="help-block text-muted mt-1">
                                                <i className="fa fa-info-circle me-1"></i>
                                                <small>Requires 8 characters, 1 uppercase, and 1 special character.</small>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-securityQuestion-id">Security Question</label>
                                        <div className="col-12 col-md-8">
                                            <select
                                                className="form-control"
                                                id="signUp-securityQuestion-id"
                                                name="securityQuestion"
                                                value={values.securityQuestion}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            >
                                                <option value="">Select a question</option>
                                                {securityQuestions.map((question, index) => (
                                                    <option key={index} value={question}>{question}</option>
                                                ))}
                                            </select>
                                            {touched.securityQuestion && errors.securityQuestion && (
                                                <p className="text-danger">{errors.securityQuestion}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-securityAnswer-id">Security Answer</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-securityAnswer-id" name="securityAnswer"
                                                value={values.securityAnswer} onChange={handleChange} />
                                            {touched.securityAnswer && errors.securityAnswer && (
                                                <p className="text-danger">{errors.securityAnswer}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row mb-4">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-suffix-id">Suffix</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-suffix-id" name="suffix"
                                                value={values.suffix} onChange={handleChange} />
                                            {touched.suffix && errors.suffix && <p className="text-danger">{errors.suffix}</p>}
                                        </div>
                                    </div>

                                    {/* First Name */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-firstName-id">First Name</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-firstName-id" name="firstName"
                                                value={values.firstName} onChange={handleChange} />
                                            {touched.firstName && errors.firstName && <p className="text-danger">{errors.firstName}</p>}
                                        </div>
                                    </div>

                                    {/* Middle Name */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-middleName-id">Middle Name</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-middleName-id" name="middleName"
                                                value={values.middleName} onChange={handleChange} />
                                            {touched.middleName && errors.middleName && <p className="text-danger">{errors.middleName}</p>}
                                        </div>
                                    </div>

                                    {/* Last Name */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-lastName-id">Last Name</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-lastName-id" name="lastName"
                                                value={values.lastName} onChange={handleChange} />
                                            {touched.lastName && errors.lastName && <p className="text-danger">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    {/* Organization */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-organization-id">Organization / Firm</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-organization-id" name="organization"
                                                value={values.organization} onChange={handleChange} />
                                            {touched.organization && errors.organization && <p className="text-danger">{errors.organization}</p>}
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-phoneNumber-id">Phone Number</label>
                                        <div className="col-12 col-md-8">
                                            <input type="tel" className="form-control" id="signUp-phoneNumber-id" name="phoneNumber"
                                                value={values.phoneNumber} onChange={handleChange} />
                                            {touched.phoneNumber && errors.phoneNumber && <p className="text-danger">{errors.phoneNumber}</p>}
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-address-id">Address</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-address-id" name="address1"
                                                value={values.address1} onChange={handleChange} />
                                            {touched.address1 && errors.address1 && <p className="text-danger">{errors.address1}</p>}
                                        </div>
                                    </div>

                                    {/* Address 2 */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-address2-id">Address 2</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-address2-id" name="address2"
                                                value={values.address2} onChange={handleChange} />
                                            {touched.address2 && errors.address2 && <p className="text-danger">{errors.address2}</p>}
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-city-id">City</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-city-id" name="city"
                                                value={values.city} onChange={handleChange} />
                                            {touched.city && errors.city && <p className="text-danger">{errors.city}</p>}
                                        </div>
                                    </div>

                                    {/* State */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-state-id">State</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-state-id" name="state"
                                                value={values.state} onChange={handleChange} />
                                            {touched.state && errors.state && <p className="text-danger">{errors.state}</p>}
                                        </div>
                                    </div>

                                    {/* Zip Code */}
                                    <div className="form-group row mb-3">
                                        <label className="col-12 col-md-4 col-form-label" htmlFor="signUp-zipCode-id">Zip Code</label>
                                        <div className="col-12 col-md-8">
                                            <input type="text" className="form-control" id="signUp-zipCode-id" name="zipCode"
                                                value={values.zipCode} onChange={handleChange} />
                                            {touched.zipCode && errors.zipCode && <p className="text-danger">{errors.zipCode}</p>}
                                        </div>
                                    </div>

                                    {/* Select Account Type Section */}
                                    <div className="d-flex justify-content-center align-items-center min-vh-30 mb-4">
                                        <div className="signup-page-sm-cont card">
                                            <div className="card-header border align-items-center p-3 light-grey-bg-color">
                                                <p className="fw-bold mb-0 ps-5">Select Account Type</p>
                                            </div>
                                            <div className="card-body px-5">
                                                <div className="form-check my-3">
                                                    <input className="form-check-input" type="radio" name="registrationType" checked={registrationType === "FirmAdministrator"} id="FirmAdministrator" value="FirmAdministrator"
                                                        onChange={handleRadioFieldChange} />
                                                    <label className="form-check-label" htmlFor="FirmAdministrator">
                                                        Law Firm Admin (non-attorney) - You are not an attorney, but an administrator of a law firm and intend to add additional staff and attorney users to the account for your firm.
                                                    </label>
                                                </div>
                                                <div className="form-check my-3">
                                                    <input
                                                        className="form-check-input text-dark"
                                                        type="radio"
                                                        checked={registrationType === "FirmAdminNewMember"}
                                                        name="registrationType"
                                                        id="FirmAdminNewMember"
                                                        value="FirmAdminNewMember"
                                                        onChange={handleRadioFieldChange}
                                                    />
                                                    <label className="form-check-label" htmlFor="FirmAdminNewMember">
                                                        Attorney - You are an attorney and have a valid California state Bar ID.
                                                    </label>
                                                </div>
                                                {/* Show Bar ID input only when "Attorney" is selected */}
                                                {registrationType === "FirmAdminNewMember" && (
                                                    <div className="row px-5">
                                                        <label className="col-12 col-md-auto form-label px-3 mb-0 align-text-bottom">
                                                            California Bar ID
                                                        </label>
                                                        <input
                                                            className="col-12 col-md-7 form-control w-50"
                                                            type="text"
                                                            id="barId"
                                                            name="barId"
                                                            placeholder="Please enter Bar ID"
                                                            value={values.barId}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                )}
                                                <div className="form-check my-3">
                                                    <input className="form-check-input" type="radio" checked={registrationType === "Individual"} name="registrationType" id="Individual" value="Individual"
                                                        onChange={handleRadioFieldChange} />
                                                    <label className="form-check-label" htmlFor="Individual">
                                                        Individual/Everyone Else - You are an individual (Self Represented/Pro Se), out-of-state attorney, or legal service
                                                        provider such as a process server, mediator, or legal document assistant and NOT filing on behalf of a California
                                                        attorney. <Link className="text-decoration-none">Learn more</Link> about individual accounts.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alert for Terms of Use */}
                                    <div className="d-flex justify-content-center align-items-center">
                                        <div className="alert alert-warning text-center" style={{ maxWidth: "600px" }}>
                                            By clicking the <strong>Save &amp; Finish</strong> button, you agree to the Odyssey eFileCA
                                            <a target="_blank" href="" className="text-decoration-none"> terms of use</a>,
                                            and to the E-Filing, LLC
                                            <a target="_blank" href="" className="text-decoration-none"> terms of use</a>.
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {errorMessage && (
                                        <div className="row mt-2">
                                            <p className="alert alert-danger"> {errorMessage} </p>
                                        </div>
                                    )}

                                    {/* Success Message */}
                                    {successMessage && (
                                        <div className="row mt-2">
                                            <p className="alert alert-success">
                                                {" "}
                                                {successMessage}{" "}
                                            </p>
                                        </div>
                                    )}

                                    {/* Save and Finish Button */}
                                    <div className="text-center mt-4 mb-5 pb-3">
                                        <button
                                            type="submit"
                                            className="btn btn-dark w-50 fs-5"
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent default to debug
                                                console.log("🟢 Button Clicked!");
                                                handleSubmit(e);
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save and Finish"
                                            )}
                                        </button>
                                    </div>

                                    {/* Loading Overlay */}
                                    {loading && (
                                        <div className="loader-overlay">
                                            <div className="loader"></div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center my-2">
                    <p className="separator"><span>Already have an e-filing account?</span></p>
                    <Link className="btn btn-dark w-80 w-md-50 fs-5 mt-3" to="/">Log in</Link>
                </div>
            </main>

        </>
    );
};

export default Register;
