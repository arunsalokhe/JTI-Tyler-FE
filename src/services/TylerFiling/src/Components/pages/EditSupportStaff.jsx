import React, { useState, useEffect } from 'react';
import Update from "../assets/Update.png"
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const EditSupportStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const token = sessionStorage.getItem('access_token');
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({
        id: id,
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        userCreated: "",
        userType: "Staff",
        userStatus: true,
    });

    useEffect(() => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        const fetchUser = async () => {
            try {
                const response = await fetch(`${baseURL}/GetSupportStaffById/${id}`, {
                //const response = await fetch(`https://localhost:7207/api/Tyler/GetSupportStaffById/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setUser(data.data);
                //console.log("data", data);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };

        fetchUser();
    }, [id, token]); // Added token to dependencies to avoid stale token issues


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const baseURL = process.env.REACT_APP_BASE_URL;
            const response = await fetch(`${baseURL}/UpdateSupportStaff/${id}`, {
            //const response = await fetch(`https://localhost:7207/api/Tyler/UpdateSupportStaff/${id}`, {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(user),
            });

            const textResponse = await response.text(); // Read response as text first
            console.log("🔍 Raw API Response:", textResponse); // Log raw response

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(textResponse); // Try parsing JSON
            } catch (parseError) {
                console.error("❌ JSON Parsing Error:", parseError);
                return;
            }

            if (response.ok && jsonResponse.success) {
                alert(jsonResponse.data || "User Updated Successfully!");
                window.location.reload();
            } else {
                alert("Failed to update user: " + jsonResponse.message);
            }
        } catch (error) {
            console.error("❌ Network Error:", error);
            alert("An error occurred while updating the user.");
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return; // Ensure user is selected

        try {
            const baseURL = process.env.REACT_APP_BASE_URL;
            const response = await fetch(`${baseURL}/DeleteUser/${selectedUser.id}`, {
            //const response = await fetch(`https://localhost:7207/api/Tyler/DeleteUser/${selectedUser.id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert("User deleted successfully!");
                navigate("/settings/manageUsers");
                setUsers(users.filter(user => user.id !== selectedUser.id)); // Remove from UI
                handleClose(); // Close modal
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("An error occurred while deleting the user.");
        }
    };


    const handleShow = (user) => {
        setSelectedUser(user);
        setShowConfirm(true);
    };

    const handleClose = () => {
        setShowConfirm(false);
        setSelectedUser(null);
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
                        <form method="post" onSubmit={handleSubmit}>
                            <div className="row mt-2">
                                <div className="col-12 col-md-6 col-lg-6 pb-0">
                                    <div className="row mb-3">
                                        <label htmlFor="firstName" className="col-sm-3 col-form-label fw-bold">First Name</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name="firstName" id="firstName"
                                                value={user.firstName || ""} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="middleName" className="col-sm-3 col-form-label fw-bold">Middle Name</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name="middleName" id="middleName"
                                                value={user.middleName || ""} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="lastName" className="col-sm-3 col-form-label fw-bold">Last Name</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name="lastName" id="lastName"
                                                value={user.lastName || ""} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="suffix" className="col-sm-3 col-form-label fw-bold">Suffix</label>
                                        <div className="col-sm-9">
                                            <input type="text" className="form-control border-0" name="suffix" id="suffix"
                                                value={user.suffix || ""} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="email" className="col-sm-3 col-form-label fw-bold">Email</label>
                                        <div className="col-sm-9">
                                            <input type="email" className="form-control border-0" name="email" id="email"
                                                value={user.email || ""} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className=" row mt-5">
                                        <div className="col-12 col-md-12 col-lg-12 text-center">
                                            <button type="submit" disabled={loading} className="btn btn-dark w100">
                                                {loading ? "Updating..." : "Save"}
                                            </button>
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
                                                    <p className="pt-2 mb-0">{user.email || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <label htmlFor="created-user" className="col-sm-4 col-form-label fw-bold">
                                                    User Created at
                                                </label>
                                                <div className="col-sm-8">
                                                    <div className="pt-2 mb-0 "> {user.userCreated || ""}</div>
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
                                                    <p className="pt-2 mb-0 ">Staff</p>
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
                                                        <Link className=" text-decoration-none" onClick={() => handleShow(user)}>
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
            <Modal show={showConfirm} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="p-0 mx-0">
                        <p className="mx-0 mt-0 mb-3 px-3 py-3 fs-6" style={{ backgroundColor: "#916aab4d" }}>
                            <i className="fa fa-info-circle" aria-hidden="true"></i> Attention, this will DELETE this user from your account!
                        </p>
                    </div>
                    <p style={{ textAlign: "center" }}>
                        Are you sure you would like to delete <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>? If yes, click Confirm.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="dark" onClick={handleDelete}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default EditSupportStaff;
