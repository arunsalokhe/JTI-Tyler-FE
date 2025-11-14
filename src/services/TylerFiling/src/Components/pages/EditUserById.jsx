import React, { useState, useEffect } from 'react';
import Update from "../assets/Update.png"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const EditUserById = () => {
    const token = sessionStorage.getItem('access_token');
    const navigate = useNavigate();

    const baseURL = process.env.REACT_APP_BASE_URL;
    //delete confirmation modal popup
    const [showConfirm, setShowConfirm] = useState(false);
    const handleClose = () => setShowConfirm(false);
    const handleShow = () => setShowConfirm(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const location = useLocation();
    const { attorneyID } = location.state || {};

    const [attorneyDetails, setAttorneyDetails] =
        useState({
            attorneyID: "",
            BarNumber: "",
            FirstName: "",
            MiddleName: "",
            LastName: "",
            FirmID: "",
        });
    const [selectedAttorneyId, setSelectedAttorneyId] = useState(false);

    //fetched information of a particular(single) attorney 
    useEffect(() => {
        const fetchAttorneyDetails = async () => {
            if (!attorneyID) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${baseURL}/GetAttorneyManage`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ attorneyID }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch attorney details");
                }

                const data = await response.json();
                const { Attorney } = data.data.apiResponse;
                const attorneyDetails = data.data.attorneyDetails;

                // Merging Attorney and attorneyDetails into a single state object
                setAttorneyDetails({
                    ...attorneyDetails,
                    BarNumber: Attorney.BarNumber, // From Attorney
                    FirstName: Attorney.FirstName, // From Attorney
                    MiddleName: Attorney.MiddleName, // From Attorney
                    LastName: Attorney.LastName, // From Attorney
                    FirmID: Attorney.FirmID, // From Attorney
                    attorneyID: Attorney.AttorneyID, // Common field
                });

                setSelectedAttorneyId(Attorney.AttorneyID);
                setLoading(false);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAttorneyDetails();
    }, [attorneyID, baseURL, token]);


    //handle to change or update attorney details
    const handleAttorneyInputChange = (e) => {
        const { name, value } = e.target;
        setAttorneyDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value || "",
        }));
    };

    //fetch(API) to update attorneys new details
    const handleSubmitAttorney = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${baseURL}/UpdateAttorney`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(attorneyDetails),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 200) {
                    alert("Attorney updated successfully.");
                    navigate("/accounts/editUserById");

                } else {
                    console.error('show error:', error)
                    alert(data.message || "Failed to update attorney.");
                }
            } else {
                console.error('show error:', error)
                alert(`Error: ${response.statusText}`);
            }
        } catch (err) {
            console.error("Error updating user:", err);
        } finally {
            setLoading(false);
        }
    };

    //handle to delete attorneys on confirm button
    const handleDeleteAttorney = async () => {

        const AttorneyID = selectedAttorneyId;
        try {
            // console.log("Attorney ID:", AttorneyID);
            //const response = await fetch(`https://localhost:7207/api/Tyler/RemoveAttorney?AttorneyID=${AttorneyID}`, {
            const response = await fetch(`${baseURL}/RemoveAttorney?AttorneyID=${AttorneyID}`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorData = await response.json(); // Fetch error details if available
                throw new Error(errorData.message || "Failed to delete attorney");
            }
            const data = await response.json();
            console.log("Deleted attorney:", data);
            alert("Attorney deleted successfully.");
            navigate("/settings/manageUsers");

        } catch (error) {
            console.error("Error deleting user:", error);
            alert(error.message);
        }
    };

    return (
        <div>
            <section className="section-page col-9 col-md-9 col-xl-10 px-lg-10 mt-10">
                <div
                    className="container-fluid"
                    style={{ paddingRight: "40px", paddingLeft: "40px", marginRight: "auto", marginLeft: "auto", paddingTop: "10px" }}
                >
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="row mt-3">
                            <div className="d-flex align-items-center justify-content-between align-items-center initiate_case_sec_btn pe-0">
                                <h1 className="fw-bold">Edit User</h1>
                                <button type="button" className="btn btn-secondary text-dark mb-2 fw-bold" onClick={() => window.location.reload()}  >
                                    <img className="img-responsive mx-2 my-0" width={20} height={20} src={Update} alt='refresh' />
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 m-1">
                                <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data">
                                    <strong>Tip-</strong> Edit your account contact information.
                                </p>
                            </div>
                        </div>
                        <form method="post" onSubmit={handleSubmitAttorney}>
                            <div className="row mt-2">
                                <div className="col-12 col-md-6 col-lg-6 pb-0">
                                    <div className="row mb-3">
                                        <label htmlFor="FirstName" className="col-sm-3 col-form-label fw-bold pe-0 me-0" >First Name </label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='FirstName' id="FirstName"
                                                value={attorneyDetails.FirstName || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="MiddleName" className="col-sm-3 col-form-label fw-bold pe-0 me-0"> Middle Name</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='MiddleName' id="MiddleName"
                                                value={attorneyDetails.MiddleName || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="LastName" className="col-sm-3 col-form-label fw-bold pe-0 me-0" > Last Name </label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='LastName' id="LastName"
                                                value={attorneyDetails.LastName || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="suffix" className="col-sm-3 col-form-label fw-bold pe-0 me-0"> Suffix</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='suffix' id="suffix"
                                                value={attorneyDetails.suffix || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="FirmID" className="col-sm-3 col-form-label fw-bold pe-0 me-0"> Firm </label>
                                        <div className="col-sm-9">
                                            <input type="text" value={attorneyDetails.FirmID || ""} className="form-control border-0" name='FirmID' id="FirmID"
                                                onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="address1" className="col-sm-3 col-form-label fw-bold"> Address 1 </label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='address1' id="address1"
                                                value={attorneyDetails.address1 || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="address2" className="col-sm-3 col-form-label fw-bold"> Address 2 </label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='address2' id="address2"
                                                value={attorneyDetails.address2 || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="city" className="col-sm-3 col-form-label fw-bold"> City</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='city' id="city"
                                                value={attorneyDetails.city || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="state" className="col-sm-3 col-form-label fw-bold"> State </label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='state' id="state"
                                                value={attorneyDetails.state || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="zipCode" className="col-sm-3 col-form-label fw-bold"> Zip</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='zipCode' id="zipCode"
                                                value={attorneyDetails.zipCode || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="phoneNo" className="col-sm-3 col-form-label fw-bold">Contact Number</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name='phoneNo' id="phoneNo"
                                                value={attorneyDetails.phoneNo || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="email" className="col-sm-3 col-form-label fw-bold">Forward Email </label>
                                        <div className="col-sm-9">
                                            <input type="email" className="form-control border-0" name='email' id="email"
                                                value={attorneyDetails.email || ""} onChange={handleAttorneyInputChange} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3"></div>
                                        <div className="col-sm-9">
                                            <div className="form-check py-2 px-4">
                                                <input name='recevie-email' className="form-check-input" type="checkbox" />
                                                <label htmlFor='recevie-email' className="form-check-label">
                                                    Recevie filing status (Accepted/Rejected) Emails
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-6 pe-0 ">
                                    <div className="card border-0 mb-3">
                                        <div className=" card-header background_card_header">
                                            <h6 className=" fw-bold mx-0 my-0 py-2 fs-6 ">
                                                Account Information
                                            </h6>
                                        </div>
                                        <div className=" card-body">
                                            <div className="row mb-3">
                                                <label htmlFor="email-id" className="col-sm-4 col-form-label fw-bold">Email</label>
                                                <div className="col-sm-8">
                                                    <p className="pt-2 mb-0">{attorneyDetails.email || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <label htmlFor="BarNumber" className="col-sm-4 col-form-label fw-bold">
                                                    Bar ID
                                                </label>
                                                <div className="col-sm-8">
                                                    <div className="pt-2 mb-0 "> {attorneyDetails.BarNumber || ""}</div>
                                                </div>
                                            </div>
                                            {/* <div className="row mb-3">
                                                <label htmlFor="created-user" className="col-sm-4 col-form-label fw-bold">
                                                    User Created at
                                                </label>
                                                <div className="col-sm-8">
                                                    <p className="pt-2 mb-0 ">11/24/2022 01:45 AM PST</p>
                                                </div>
                                            </div> */}
                                            <div className="row mb-3">
                                                <label htmlFor="user-type" className="col-sm-4 col-form-label fw-bold">
                                                    User type
                                                </label>
                                                <div className="col-sm-8">
                                                    <p className="pt-2 mb-0 ">INDIVIDUAL</p>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <label htmlFor="user-status" className="col-sm-4 col-form-label fw-bold">
                                                    User Status
                                                </label>
                                                <div className="col-sm-8">
                                                    <p className="pt-2 mb-0"> Active</p>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <label htmlFor="updated-status" className="col-sm-4 col-form-label fw-bold">
                                                    Profile Update Status
                                                </label>
                                                <div className="col-sm-8">
                                                    <p className="pt-2 mb-0">NONE</p>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <label htmlFor="actions" className="col-sm-4 col-form-label fw-bold">
                                                    Action
                                                </label>
                                                <div className="col-sm-8">
                                                    <p className="pt-2 mb-0">
                                                        <Link className=" text-decoration-none">
                                                            View user's filing
                                                        </Link>
                                                    </p>
                                                    <p className="pt-2 mb-0">
                                                        <Link className=" text-decoration-none">
                                                            View user's cases
                                                        </Link>
                                                    </p>
                                                    <p className="pt-2 mb-0">
                                                        <Link className=" text-decoration-none">
                                                            View user's Settings
                                                        </Link>
                                                    </p>
                                                    <p className="pt-2 mb-0">
                                                        <Link className=" text-decoration-none" onClick={handleShow}>
                                                            Delete User
                                                        </Link>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card border-0">
                                        <div className="card-body overflow-auto" style={{ maxHeight: 120 }}>
                                            <div className=" d-flex ">
                                                <label htmlFor="all-staff" className="col-sm-3 col-form-label fw-bold pe-0 me-0 w-auto">
                                                    Authorized for All Staff.
                                                </label>
                                                {/* <ul className="list-group list-group-flush text-center w-75 ms-3 ">
                                                    <li className="list-group-item"> All Staff</li>
                                                    <li className="list-group-item">Item 1</li>
                                                    <li className="list-group-item">Item 2</li>
                                                    <li className="list-group-item">Item 3</li>
                                                </ul> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className=" row mt-5">
                                <div className="col-12 col-md-12 col-lg-12 text-center">
                                    <button type="submit" disabled={loading} className="btn btn-dark w100">
                                        {loading ? "Updating..." : "Save"}
                                    </button>
                                </div>
                            </div>
                            {/* Full-Screen Loader Overlay */}
                            {loading && (
                                <div className="overlay">
                                    <div className="loader">
                                        <div className="spinner-border text-light" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </section>
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
            <Modal show={showConfirm} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className=" p-0 mx-0">
                        <p className=" mx-0 mt-0 mb-3 px-3 py-3 fs-6" style={{ backgroundColor: "#916aab4d" }} >
                            <i className="fa fa-info-circle" aria-hidden="true"></i> Attention, this will DELETE this user from your account!
                        </p>
                    </div>
                    <p style={{ textAlign: "center" }}>Are you sure you would like to delete <strong>{ }</strong> ? If yes, click Confirm.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="dark" onClick={handleDeleteAttorney}>
                        confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default EditUserById;