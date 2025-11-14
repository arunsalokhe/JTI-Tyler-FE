import React, { useState, useEffect } from 'react';
import Update from "../assets/Update.png"
import { Link } from 'react-router-dom';

const EditUser = () => {

    const token = sessionStorage.getItem('access_token');
    const baseURL = process.env.REACT_APP_BASE_URL;
    const [isSubmitted, setIsSubmitted] = useState(false);
    // User details
    const [userDataList, setUserDataList] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        firmID: "",
        userID: "",
        userStatus: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [createdAt, setCreatedAt] = useState("");
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

    //fetch user details 
    useEffect(() => {
        const getUserDetails = async () => {
            setLoading(true);
            setError(null)
            try {
                const response = await fetch(`${baseURL}/GetUserList`, {
                    //const response = await fetch("https://localhost:7207/api/Tyler/GetUserList", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },

                });
                if (!response.ok) {
                    console.error(`Failed with status: ${response.status}`);
                    throw new Error("Failed to fetch user details");
                }

                const userData = await response.json();
                console.log("API Response:", userData);

                const { User } = userData.data || {};

                if (Array.isArray(User) && User.length > 0) {
                    const users = User[0];

                    const createdDate = userData.data.CreatedAt
                        ? new Date(userData.data.CreatedAt).toISOString().split("T")[0]  // Extract YYYY-MM-DD
                        : "N/A";

                    setCreatedAt(createdDate);

                    setUserDataList({
                        firstName: users.FirstName || "",
                        middleName: users.MiddleName || "",
                        lastName: users.LastName || "",
                        suffix: users.Suffix || "",
                        email: users.Email || "",
                        firmID: users.FirmID || "",
                        userID: users.UserID || "",
                        userStatus: users.IsActive ? "Active" : "Inactive",
                    })
                    console.log("show data", User);
                    setLoading(false);
                } else {
                    setError("No user data available");
                }
            } catch (error) {
                setError(error.message);
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        getUserDetails();
    }, [token, baseURL]);

    //handle to change input field
    const handleInputChange = (e) => {
        setUserDataList(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    //fetch api to update user details
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setIsSubmitted(true);

        const updatedUser = {
            ...userDataList,
            firmID: userDataList.firmID,
            userID: userDataList.userID
        }
        try {
            const response = await fetch(`${baseURL}/UpdateUser`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 200) {
                    alert("user updated successfully.");
                    console.log("show updated user", updatedUser);

                } else {
                    console.error('show error:', error)
                    alert(data.message || "Failed to update attorney.");
                }
            } else {
                console.error('show error:', error)
                alert(`Error: ${response.statusText}`);
            }

            setTimeout(() => {
                setIsSubmitted(false);
            }, 3000);

        } catch (err) {
            setIsSubmitted(false);
            console.error("Error updating user:", err);
        } finally {
            setLoading(false);
        }
    };

    const popupStyle = {
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        backgroundColor: 'white',
        color: 'black',
        borderRadius: '5px',
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
                                > Edit User
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
                                                <strong>Tip</strong> – View and edit information about this user and use the action links for more information.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form method="post" onSubmit={handleSubmit}>
                            <div className="row mt-2 gx-3 gy-4">
                                {/* LEFT SIDE: Input Fields */}
                                <div className="col-12 col-md-6">
                                    {["firstName", "middleName", "lastName", "suffix", "cc_email"].map((field, i) => {
                                        const labelMap = {
                                            firstName: "First Name",
                                            middleName: "Middle Name",
                                            lastName: "Last Name",
                                            suffix: "Suffix",
                                            cc_email: "Forward Email"
                                        };
                                        const inputType = field === "cc_email" ? "email" : "text";
                                        return (
                                            <div className="row mb-3" key={i}>
                                                <label htmlFor={field} className="col-sm-4 col-form-label fw-bold">
                                                    {labelMap[field]}
                                                </label>
                                                <div className="col-sm-8">
                                                    <input
                                                        type={inputType}
                                                        className="form-control"
                                                        style={{ border: "1px solid #ced4da" }}
                                                        name={field}
                                                        id={field}
                                                        value={userDataList[field]}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Checkbox */}
                                    <div className="row">
                                        <div className="offset-sm-3 col-sm-9">
                                            <div className="form-check py-2 px-1">
                                                <input name="recevieEmail" id="recevieEmail" className="form-check-input" type="checkbox" />
                                                <label htmlFor='recevieEmail' className="form-check-label">
                                                    Receive filing status (Accepted/Rejected) Emails
                                                </label>
                                            </div>

                                            {/* Save Button Right Below */}
                                            <div className="text-center mt-3">
                                                <button
                                                    type="submit"
                                                    className="btn btn-dark"
                                                    style={{ maxWidth: "300px", height: "40px", width: "115px" }}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Updating..." : "Save"}
                                                </button>

                                                {/* Popup */}
                                                {isSubmitted && (
                                                    <div style={popupStyle} className="popup mt-2">
                                                        <p style={{ backgroundColor: "#916aab4d", width: "250px", padding: "10px", margin: "10px auto" }}>
                                                            User updated successfully!
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SIDE: User Info Cards */}
                                <div className="col-12 col-md-6">
                                    <div className="card border border-secondary h-100">
                                        <div className="card-header bg-light border-bottom">
                                            <h6 className="fw-bold m-0">User Information</h6>
                                        </div>
                                        <div className="card-body p-3">
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-striped mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ width: "40%" }}>Field</th>
                                                            <th>Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Email</td>
                                                            <td>
                                                                {userDataList.email}
                                                                <br />
                                                                <Link to="#" className="text-decoration-none" data-bs-toggle="modal" data-bs-target="#changeEmail-modal">
                                                                    Change Email
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                        <tr><td>Bar ID</td><td></td></tr>
                                                        <tr><td>User Created at</td><td>{createdAt}</td></tr>
                                                        <tr><td>User Type</td><td>INDIVIDUAL</td></tr>
                                                        <tr><td>User Status</td><td>{userDataList.userStatus}</td></tr>
                                                        <tr><td>Profile Update Status</td><td>NONE</td></tr>
                                                        <tr>
                                                            <td>Action</td>
                                                            <td>
                                                                <Link to="/e-filing/filingStatus" className="d-block text-decoration-none">View user's filing</Link>
                                                                <Link to="/e-filing/caseList" className="d-block text-decoration-none">View user's cases</Link>
                                                                <Link to="/settings/userPreferences" className="d-block text-decoration-none">View user's Settings</Link>
                                                                <Link to="#" className="d-block text-decoration-none" data-bs-toggle="modal" data-bs-target="#changePassword-modal">
                                                                    Unlock/Change User Password
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Loader Overlay */}
                                {loading && (
                                    <div className="overlay">
                                        <div className="loader">
                                            <div className="spinner-border text-light" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* end Form data */}
                    </div>
                </div>
            </div>

            {/* modal 1 start */}
            <div className="modal fade" id="changeEmail-modal" tabIndex={-1} role="dialog" area-hidden="true" >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3" id="changeUpdateEmail">
                                Change / Update Your Email Address
                            </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" > </button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Start tip data */}
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data" style={{ textIndent: "1rem" }}>
                                            <strong>Tip:</strong> First Name, Last Name, and Email Address
                                            are Required.
                                        </p>
                                    </div>
                                </div>
                                {/* End tip data */}
                                {/* row 1 */}
                                <div className="row mb-4">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="newEmail">New Email</label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <input className=" form-control" type="email" name="newEmail" id="newEmail" placeholder="Enter New Email" />
                                    </div>
                                </div>
                                {/* row 2 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="confirm-email"> Confirm Email </label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <input className=" form-control" type="email" name="confirm-email" id="confirm-email" placeholder="Retype Email" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-dark px-4"> Submit Change </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* modal 2 start */}
            <div className="modal fade" id="changePassword-modal" tabIndex={-1} role="dialog" area-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document" >
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3" id="changePasswords">
                                Change Password
                            </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" ></button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Start tip data */}
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data" style={{ textIndent: "1rem" }} >
                                            <strong>Tip:</strong> Are you sure you want to change this
                                            user's password ?
                                        </p>
                                    </div>
                                </div>
                                {/* End tip data */}
                                {/* row 1 */}
                                <div className="row mb-4">
                                    <div className="col-4 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="newPassword"> New Password</label>
                                    </div>
                                    <div className="col-8 px-1">
                                        <input className=" form-control" type="password" name="newPassword" id="newPassword" placeholder="" />
                                    </div>
                                </div>
                                {/* row 2 */}
                                <div className="row mb-2">
                                    <div className="col-4 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="confirmPassword"> Confirm New Password</label>
                                    </div>
                                    <div className="col-8 px-1">
                                        <input className=" form-control" type="password" name="confirmPassword" id="confirmPassword" placeholder="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal" > Cancel </button>
                            <button type="button" className="btn btn-dark px-4"> Change Password</button>
                        </div>
                    </div>
                </div>
            </div>
        </WrapperTag>
    )
}

export default EditUser;