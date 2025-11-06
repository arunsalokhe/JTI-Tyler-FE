import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ManageUsers = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isChecked, setIsChecked] = useState(false);
    const rowsPerPage = 3;

    //function to get all attorneys list
    const [attorneysList, setAttorneysList] = useState([]);
    const token = sessionStorage.getItem('access_token');

    const [staffList, setStaffList] = useState([]);
    const [currentStaffPage, setCurrentStaffPage] = useState(1);

    // Calculate pagination values
    const totalStaffPages = staffList.length ? Math.ceil(staffList.length / rowsPerPage) : 1;
    const staffIndexOfLastRow = currentStaffPage * rowsPerPage;
    const staffIndexOfFirstRow = staffIndexOfLastRow - rowsPerPage;
    const currentSupportStaff = staffList.slice(staffIndexOfFirstRow, staffIndexOfLastRow);

    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
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



    const handleStaffPageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalStaffPages) {
            setCurrentStaffPage(pageNumber);
        }
    };

    //fetch attorneys list
    useEffect(() => {
        const fetchGetAllAttorneys = async () => {
            setLoading(true);
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                const response = await fetch(`${baseURL}/GetAttorneyManageUserList`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        "Content-Type": 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data?.data?.responseData?.Attorney && Array.isArray(data.data.responseData.Attorney)) {
                        const attorneys = data.data.responseData.Attorney;
                        const attorneyDetails = data.data.attorneyDetails || [];

                        // Merge email by matching AttorneyID
                        const updatedAttorneys = attorneys.map(attorney => {
                            const matchingDetail = attorneyDetails.find(detail => detail.attorneyID === attorney.AttorneyID);
                            return {
                                ...attorney,
                                email: matchingDetail ? matchingDetail.email : "N/A", // Add email or default "N/A"
                            };
                        });

                        setAttorneysList(updatedAttorneys);
                        setLoading(false);
                    } else {
                        setErrorMessage("No attorneys found or unexpected data format.");
                    }
                } else {
                    setErrorMessage(`Error: ${response.statusText}`);
                }
            } catch (error) {
                setLoading(false);
                console.error("Fetch error:", error);
                setErrorMessage("Failed to fetch attorneys.");
            }
        };

        fetchGetAllAttorneys();
    }, [token]);

    useEffect(() => {
        const fetchSupportStaff = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                const response = await fetch(`${baseURL}/GeSupportStaffList`, {
                    method: "GET",
                    headers: {
                        "Content-Type": 'application/json',
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const data = await response.json();
                setStaffList(data);
            } catch (error) {
                console.error("Error fetching support staff:", error);
            }
        };

        fetchSupportStaff();
    }, [token]);

    //handle to edit attorney
    const handleEditAttorney = (attorneyID) => {
        if (!attorneyID) {
            console.error("Invalid attorney ID.");
            return;
        }
        console.log("Navigating to edit page with attorneyID:", attorneyID);
        navigate("/accounts/editUserById", { state: { attorneyID } });
    };

    //function to save new attorneys
    const handleSave = async (values) => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        try {
            console.log("🚀 Starting API call..."); // ✅ Log before request

            const response = await fetch(`${baseURL}/CreateAttorney`, {
                method: "POST",
                body: JSON.stringify({
                    id: 0,
                    barId: values.barId,
                    firstName: values.firstName,
                    middleName: values.middleName || '',
                    lastName: values.lastName,
                    firmID: values.firmId,
                    suffix: values.suffix || '',
                    email: values.email,
                    address1: values.address1,
                    address2: values.address2 || '',
                    city: values.city,
                    state: values.state,
                    zipCode: values.zipCode,
                    phoneNo: values.phoneNo,
                    makeUserLogin: values.makeUserLogin || false,
                    makeServiceContact: values.makeServiceContact || false,
                    makeServiceContactPublic: values.makeServiceContactPublic || false,
                    makeFirmAdmin: values.makeFirmAdmin || false,
                    recFilingStatusEmails: values.recFilingStatusEmails || false,
                    status: values.status || 0
                }),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("✅ Raw Response:", response); // ✅ Log entire response

            if (response.status === 204) {
                console.warn("⚠️ No content received (204). Assuming success.");
                alert("Attorney added successfully!");
                setTimeout(() => window.location.reload(), 500);
                return;
            }

            if (!response.ok) {
                console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
                setErrorMessage(`Error: ${response.statusText}`);
                return;
            }

            const rawText = await response.text(); // ✅ Read response text
            console.log("📄 Raw response text:", rawText); // ✅ Log raw response text

            alert("Attorney added successfully!");
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            console.error("🔥 Error:", error);
            setErrorMessage("A network error occurred. Please try again later.");
        }
    };

    //using formik method
    const formik = useFormik({
        initialValues: {
            barId: '',
            firstName: '',
            middleName: '',
            lastName: '',
            firmId: '',
            suffix: '',
            email: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            zipCode: '',
            phoneNo: '',
            makeUserLogin: false,
            makeServiceContact: false,
            makeServiceContactPublic: false,
            makeFirmAdmin: false,
            recFilingStatusEmails: false,
            status: 0
        },
        validationSchema: Yup.object().shape({
            barId: Yup.string()
                .required('Bar ID is required'),
            firstName: Yup.string()
                .max(20, 'Must be 20 characters or less')
                .required('First Name is required'),
            middleName: Yup.string()
                .max(20, 'Must be 20 characters or less'),
            lastName: Yup.string()
                .max(20, 'Must be 20 characters or less')
                .required('Last Name is required'),
            firmId: Yup.string()
                .required('Firm ID is required'),
        }),

        onSubmit: (values) => {
            // console.log("Formik submitted with values:", values); 
            handleSave(values);
        }

    });

    //handlecancel formik form
    const handleCancel = () => {
        formik.resetForm();
        setErrorMessage(null);
        setSuccessMessage(null);
    }

    //pagination for the table rows
    // Calculate the data for the current page
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = attorneysList.slice(indexOfFirstRow, indexOfLastRow);

    // Calculate total pages
    const totalPages = Math.ceil(attorneysList.length / rowsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
        userCreated: new Date().toISOString(),
        userType: "Staff",
        userStatus: true
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const baseURL = process.env.REACT_APP_BASE_URL;
        try {
            const response = await fetch(`${baseURL}/CreateSupportStaff`, {
                method: "POST",
                headers: {
                    "Accept": "text/plain",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to create support staff");
            }

            alert("Support staff added successfully!");
            setFormData({
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                email: "",
                userCreated: new Date().toISOString(),
                userType: "Staff",
                userStatus: true
            });
            window.location.reload(); // Refresh the page to update the list
        } catch (error) {
            console.error("Error adding support staff:", error);
            alert("Failed to add support staff. Please try again.");
        }
    };

    const filteredRows = currentRows.filter((attorney) =>
        (`${attorney.FirstName} ${attorney.LastName}`)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };

    return (

        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">

                        {/* Header Row */}
                        <div className="row mt-3">
                            <div className="d-flex align-items-center justify-content-between initiate_case_sec_btn pe-0 flex-wrap gap-2">
                                <h1
                                    className="fw-normal m-0"
                                    style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                                >
                                    Manage Users
                                </h1>

                                {/* Refresh & Search */}
                                <div className="d-flex flex-column flex-md-row gap-2 align-items-start align-items-md-center" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                    <Link
                                        to="/"
                                        className="text-decoration-none text-blue d-flex align-items-center text-nowrap"
                                    >
                                        <i className="fa fa-dashboard fa-fw me-2"></i>
                                        <span className="pt-1">Return to Dashboard</span>
                                    </Link>

                                    <div className="input-group" style={{ maxWidth: "400px", minWidth: "250px" }}>
                                        <Link
                                            className="input-group-text btn-outline text-dark"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.location.reload();
                                            }}
                                            style={{
                                                textDecoration: "none",
                                                background: "none",
                                                border: "1px solid #ced4da",
                                                whiteSpace: "nowrap",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                fontFamily: "Arial, sans-serif"
                                            }}
                                        >
                                            <i className="fa fa-refresh fa-fw me-2"></i> Refresh
                                        </Link>

                                        <input
                                            name="filter"
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter Attorneys"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                        />

                                        <span className="input-group-text">
                                            <i className="fa fa-search fa-fw"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tip / Info Box */}
                        <div className="container mt-3 mb-4 px-3 px-md-4">
                            {/* Filtered View Panel */}
                            <div
                                className="panel panel-success mb-4"
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
                                            <span className="text-dark">
                                                <strong>Filtered View (Status: Active) -</strong> Select an attorney to see which support staff are authorized.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Form */}
                            <form>
                                <div className="row manageusers gx-3 gy-4">
                                    {/* Left Column: Table */}
                                    <div className="col-12 col-lg-9">
                                        <div className="card grey_bg_color border-0 h-100">
                                            <div className="card-body pagination-parent-pos">
                                                <div className="table-responsive">
                                                    <table className="table table-striped table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Bar ID</th>
                                                                <th>Email</th>
                                                                <th>Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredRows.length > 0 ? (
                                                                filteredRows.map((attorney) => (
                                                                    <tr key={attorney.AttorneyID}>
                                                                        <td>{`${attorney.FirstName} ${attorney.LastName}`}</td>
                                                                        <td>{attorney.BarNumber}</td>
                                                                        <td>{attorney.email}</td>
                                                                        <td>Active</td>
                                                                        <td>
                                                                            <button
                                                                                type="button"
                                                                                className="editbtn btn btn-link text-primary p-0"
                                                                                onClick={() => handleEditAttorney(attorney.AttorneyID)}
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="5" className="text-center">
                                                                        No data available
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>

                                                    {loading && (
                                                        <div className="overlay position-absolute top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
                                                            <div className="spinner-border text-light" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Pagination */}
                                                <nav className="custom-pagination mt-3">
                                                    <ul className="pagination justify-content-end mb-0 flex-wrap">
                                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                                                Previous
                                                            </button>
                                                        </li>
                                                        {Array.from({ length: totalPages }, (_, index) => (
                                                            <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                                                                <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                                                                    {index + 1}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                                                Next
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Add User Card */}
                                    <div className="col-12 col-lg-3">
                                        <div className="card border rounded shadow-sm h-100">
                                            <div className="card-header bg-light border-bottom">
                                                <h6 className="fw-bold py-2 mb-0">Add New Users</h6>
                                            </div>
                                            <div className="card-body" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                                <p className="mb-3 text-justify" >
                                                    Add a new attorney account, or add new support staff authorized to file on behalf of the selected attorney.
                                                </p>
                                                <p className="mb-0">
                                                    <Link
                                                        className="text-decoration-none text-primary d-block"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addAttorn-modal"
                                                    >
                                                        Add Attorney
                                                    </Link>
                                                    <Link
                                                        className="text-decoration-none text-primary d-block"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addSupp-modal"
                                                    >
                                                        Add Support Staff
                                                    </Link>
                                                </p>

                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>

                        <div className="container-fluid px-3 px-sm-4 px-md-4 px-lg-4">
                            {/* Tip Info Banner */}
                            <div
                                className="panel panel-success mb-4"
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
                                            <span className="text-dark">
                                                <strong>Support Staff -</strong> The selected support staff are authorized to act on the selected attorney above.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form method="post">
                                <div className="row manageusers gx-3 gy-4 mt-2">
                                    {/* Left Column - Table */}
                                    <div className="col-12 col-md-9">
                                        <div className="card grey_bg_color border-0 h-100">
                                            <div className="card-body pagination-parent-pos">
                                                <div className="table-responsive">
                                                    <table className="table table-striped table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th className="w-25">Name</th>
                                                                <th className="w-25">Email</th>
                                                                <th className="w-25">Authorized</th>
                                                                <th className="w-25">Status</th>
                                                                <th className="w-25">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentSupportStaff.length > 0 ? (
                                                                currentSupportStaff.map((staff) => (
                                                                    <tr key={staff.id}>
                                                                        <td>{`${staff.firstName} ${staff.middleName || ""} ${staff.lastName}`}</td>
                                                                        <td>{staff.email}</td>
                                                                        <td></td>
                                                                        <td>{staff.userStatus ? "Active" : "Inactive"}</td>
                                                                        <td>
                                                                            <Link
                                                                                to={`/accounts/edit-support-staff/${staff.id}`}
                                                                                className="text-decoration-none btn btn-link text-primary px-1"
                                                                            >
                                                                                Edit
                                                                            </Link>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="5" className="text-center">No data available</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Pagination */}
                                                {totalStaffPages > 1 && (
                                                    <nav className="custom-pagination mt-3">
                                                        <ul className="pagination d-flex justify-content-end mb-0 flex-wrap">
                                                            {/* Previous Button */}
                                                            <li className={`page-item ${currentStaffPage === 1 ? "disabled" : ""}`}>
                                                                <Link
                                                                    className="page-link"
                                                                    onClick={() => handleStaffPageChange(currentStaffPage - 1)}
                                                                >
                                                                    Previous
                                                                </Link>
                                                            </li>

                                                            {/* Page Numbers */}
                                                            {Array.from({ length: totalStaffPages }, (_, index) => (
                                                                <li
                                                                    key={index}
                                                                    className={`page-item ${currentStaffPage === index + 1 ? "active" : ""}`}
                                                                >
                                                                    <Link
                                                                        className="page-link"
                                                                        onClick={() => handleStaffPageChange(index + 1)}
                                                                    >
                                                                        {index + 1}
                                                                    </Link>
                                                                </li>
                                                            ))}

                                                            {/* Next Button */}
                                                            <li className={`page-item ${currentStaffPage === totalStaffPages ? "disabled" : ""}`}>
                                                                <Link
                                                                    className="page-link"
                                                                    onClick={() => handleStaffPageChange(currentStaffPage + 1)}
                                                                >
                                                                    Next
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Permissions */}
                                    <div className="col-12 col-md-3">
                                        <div className="card border rounded shadow-sm h-100">
                                            <div className="card-header bg-light border-bottom">
                                                <h6 className="fw-bold py-2 mb-0">Support Staff Permissions</h6>
                                            </div>
                                            <div className="card-body" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                                <label className="form-label fw-bold mb-4">
                                                    Authorize all staff for all attorneys
                                                </label>

                                                <div className="form-check form-switch custom-form-switch mb-3 d-flex align-items-center">
                                                    <i
                                                        className={`fa ${isChecked ? "fa-toggle-on text-success" : "fa-toggle-off text-secondary"}`}
                                                        style={{ fontSize: "24px", cursor: "pointer" }}
                                                        onClick={handleToggle}
                                                    />
                                                    <label className="form-check-label fw-bold mb-0 ms-2">
                                                        {isChecked ? "On" : "Off"}
                                                    </label>
                                                </div>

                                                <p className="fw-bold mb-1">Authorizing Users</p>
                                                <p className="text-justify mb-4">
                                                    Select or deselect the support staff you'd like to authorize to file on behalf of the selected attorney then click this Update Authorizations button.
                                                </p>

                                                <button className="btn btn-dark w-100" disabled>
                                                    Update Authorizations
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>

                        {/* modal 1 start */}
                        <div className="modal fade" id="addAttorn-modal" tabIndex={-1} role="dialog" area-hidden="true">
                            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                                <div className="modal-content">
                                    <div className="modal-header border-0 mt-2">
                                        <h3 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">
                                            Add an Attorney
                                        </h3>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                        </button>
                                    </div>
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                    <form onSubmit={formik.handleSubmit} method="post" >
                                        <div className="modal-body">
                                            <div className="container-fluid">
                                                {/* Start tip data */}
                                                <div className="row">
                                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data" style={{ textIndent: "1rem" }}>
                                                            <strong>Tip:</strong> First Name, Last Name, and username Address
                                                            are Required.
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* End tip data */}
                                                {/* row 1 */}
                                                <div className="row mb-2">
                                                    <div className="col-3 px-0 mx-0"></div>
                                                    <div className="col-3 fw-bold px-1">First Name</div>
                                                    <div className="col-3 fw-bold px-1">Middle Name</div>
                                                    <div className="col-3 fw-bold px-1">Last Name</div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-3 px-0 mx-0"></div>
                                                    <div className="col-3 px-1">
                                                        <input className={`form-control ${formik.touched.firstName && formik.errors.firstName ? 'is-invalid' : ''}`}
                                                            type="text" id='firstName'
                                                            name='firstName'
                                                            value={formik.values.firstName}
                                                            onChange={formik.handleChange} />
                                                        {formik.touched.firstName && formik.errors.firstName && (
                                                            <div className="invalid-feedback">{formik.errors.firstName}</div>
                                                        )}
                                                    </div>
                                                    <div className="col-3 px-1">
                                                        <input className=" form-control" type="text" id='middleName' name='middleName' value={formik.values.middleName}
                                                            onChange={formik.handleChange} />
                                                    </div>
                                                    <div className="col-3 px-1">
                                                        <input className={`form-control ${formik.touched.lastName && formik.errors.lastName ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            id='lastName'
                                                            name='lastName'
                                                            value={formik.values.lastName}
                                                            onChange={formik.handleChange} />
                                                        {formik.touched.lastName && formik.errors.lastName && (
                                                            <div className="invalid-feedback">{formik.errors.lastName}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* row 2 */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className=" form-label fw-bold" htmlFor="barId" >
                                                            Bar ID
                                                        </label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input className={`form-control ${formik.touched.barId && formik.errors.barId ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            name="barId"
                                                            id="barId"
                                                            onChange={formik.handleChange} />
                                                        {formik.touched.barId && formik.errors.barId && (
                                                            <div className="invalid-feedback">{formik.errors.barId}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* row 2 */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="suffix">
                                                            Suffix
                                                        </label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input
                                                            className={`form-control ${formik.touched.suffix && formik.errors.suffix ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            name="suffix"
                                                            id="suffix"
                                                            value={formik.values.suffix}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.suffix && formik.errors.suffix && (
                                                            <div className="invalid-feedback">{formik.errors.suffix}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* row 2 */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className=" form-label fw-bold" htmlFor="email">
                                                            Email
                                                        </label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                                            type="email"
                                                            name="email"
                                                            id="email"
                                                            value={formik.values.email}
                                                            onChange={formik.handleChange} />
                                                        {formik.touched.username && formik.errors.email && (
                                                            <div className="invalid-feedback">{formik.errors.email}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* row 3 */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className=" form-label fw-bold" htmlFor="firmId">
                                                            Firm ID
                                                        </label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input className={`form-control ${formik.touched.firmId && formik.errors.firmId ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            name="firmId"
                                                            id="firmId"
                                                            value={formik.values.firmId}
                                                            onChange={formik.handleChange} />
                                                        {formik.touched.firmId && formik.errors.firmId && (
                                                            <div className="text-danger">{formik.errors.firmId}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* row 4 */}
                                                {/* Address 1 */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="address1">
                                                            Address 1
                                                        </label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input
                                                            className={`form-control ${formik.touched.address1 && formik.errors.address1 ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            name="address1"
                                                            id="address1"
                                                            value={formik.values.address1}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.address1 && formik.errors.address1 && (
                                                            <div className="invalid-feedback">{formik.errors.address1}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Address 2 */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="address2">
                                                            Address 2
                                                        </label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input
                                                            className={`form-control ${formik.touched.address2 && formik.errors.address2 ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            name="address2"
                                                            id="address2"
                                                            value={formik.values.address2}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.address2 && formik.errors.address2 && (
                                                            <div className="invalid-feedback">{formik.errors.address2}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* row 6 */}
                                                {/* City & State */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="city">
                                                            City
                                                        </label>
                                                    </div>
                                                    <div className="col-3 px-1">
                                                        <input
                                                            className={`form-control ${formik.touched.city && formik.errors.city ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            name="city"
                                                            id="city"
                                                            value={formik.values.city}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.city && formik.errors.city && (
                                                            <div className="invalid-feedback">{formik.errors.city}</div>
                                                        )}
                                                    </div>
                                                    <div className="col-2 px-1 align-content-center pt-1 d-flex justify-content-end">
                                                        <label className="form-label fw-bold pe-3" htmlFor="state">
                                                            State
                                                        </label>
                                                    </div>
                                                    <div className="col-4 px-1">
                                                        <input
                                                            className={`form-control ${formik.touched.state && formik.errors.state ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            name="state"
                                                            id="state"
                                                            value={formik.values.state}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.state && formik.errors.state && (
                                                            <div className="invalid-feedback">{formik.errors.state}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Zip & Phone */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="zip">
                                                            Zip
                                                        </label>
                                                    </div>
                                                    <div className="col-3 px-1">
                                                        <input
                                                            className={`form-control ${formik.touched.zipCode && formik.errors.zipCode ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            name="zipCode"
                                                            id="zipCode"
                                                            value={formik.values.zipCode}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.zipCode && formik.errors.zipCode && (
                                                            <div className="invalid-feedback">{formik.errors.zipCode}</div>
                                                        )}
                                                    </div>
                                                    <div className="col-2 px-1 align-content-center pt-1 d-flex justify-content-end">
                                                        <label className="form-label fw-bold pe-3" htmlFor="phone">
                                                            Phone No
                                                        </label>
                                                    </div>
                                                    <div className="col-4 px-1">
                                                        <input
                                                            className={`form-control ${formik.touched.phoneNo && formik.errors.phoneNo ? 'is-invalid' : ''}`}
                                                            type="tel"
                                                            name="phoneNo"
                                                            id="phoneNo"
                                                            value={formik.values.phoneNo}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.phoneNo && formik.errors.phoneNo && (
                                                            <div className="invalid-feedback">{formik.errors.phoneNo}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* row 8 */}
                                                <div className="row mb-2 mt-2">
                                                    <div className="col-1 ps-3"></div>
                                                    <div className="col-6 px-1">
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="makeUserLogin"
                                                                name="makeUserLogin"
                                                                checked={formik.values.makeUserLogin}
                                                                onChange={formik.handleChange}
                                                            />
                                                            <label className="form-check-label" htmlFor="makeUserLogin">
                                                                Provide this attorney a login (not required)
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-5 px-1">
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="makeFirmAdmin"
                                                                name="makeFirmAdmin"
                                                                checked={formik.values.makeFirmAdmin}
                                                                onChange={formik.handleChange}
                                                            />
                                                            <label className="form-check-label" htmlFor="makeFirmAdmin">
                                                                Make this user a Firm Administrator
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 9 */}
                                                <div className="row mb-2 mt-2">
                                                    <div className="col-1 ps-3"></div>
                                                    <div className="col-6 px-1">
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="makeServiceContact"
                                                                name="makeServiceContact"
                                                                checked={formik.values.makeServiceContact}
                                                                onChange={formik.handleChange}
                                                            />
                                                            <label className="form-check-label" htmlFor="makeServiceContact">
                                                                Make this user a service contact
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-5 px-1">
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="makeServiceContactPublic"
                                                                name="makeServiceContactPublic"
                                                                checked={formik.values.makeServiceContactPublic}
                                                                onChange={formik.handleChange}
                                                            />
                                                            <label className="form-check-label" htmlFor="makeServiceContactPublic">
                                                                Make this Service contact public
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                                            <button type="button" className="btn btn-outline-dark px-4 cancel" onClick={handleCancel} data-bs-dismiss="modal">
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn add px-4" >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* modal 2 start */}
                        <div className="modal fade" id="addSupp-modal" tabIndex={-1} role="dialog" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                                <div className="modal-content">
                                    <form onSubmit={handleSubmit}>
                                        <div className="modal-header border-0 mt-2">
                                            <h3 className="modal-title fw-bold ms-3">Add Support Staff</h3>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="container-fluid">
                                                <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data" style={{ textIndent: "1rem" }}>
                                                    <strong>Tip:</strong> First Name, Last Name, and Email are Required.
                                                </p>
                                                {/* First Name */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="firstName">First Name</label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input className="form-control" type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required />
                                                    </div>
                                                </div>
                                                {/* Middle Name */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="middleName">Middle Name</label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input className="form-control" type="text" name="middleName" id="middleName" value={formData.middleName} onChange={handleChange} />
                                                    </div>
                                                </div>
                                                {/* Last Name */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="lastName">Last Name</label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input className="form-control" type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required />
                                                    </div>
                                                </div>
                                                {/* Suffix */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="suffix">Suffix</label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input className="form-control" type="text" name="suffix" id="suffix" value={formData.suffix} onChange={handleChange} />
                                                    </div>
                                                </div>
                                                {/* Email */}
                                                <div className="row mb-2">
                                                    <div className="col-3 ps-3">
                                                        <label className="form-label fw-bold" htmlFor="email">Email</label>
                                                    </div>
                                                    <div className="col-9 px-1">
                                                        <input className="form-control" type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
                                                    </div>
                                                </div>
                                                {/* User Type */}
                                                {/* <div className="row mb-2">
                                                <div className="col-3 ps-3">
                                                    <label className="form-label fw-bold" htmlFor="userType">User Type</label>
                                                </div>
                                                <div className="col-9 px-1">
                                                    <input className="form-control" type="text" name="userType" id="userType" value={formData.userType} disabled />
                                                </div>
                                            </div> */}
                                                {/* Status */}
                                                {/* <div className="row mb-2">
                                                <div className="col-3 ps-3">
                                                    <label className="form-label fw-bold">User Status</label>
                                                </div>
                                                <div className="col-9 px-1">
                                                    <select className="form-control" name="userStatus" value={formData.userStatus} onChange={(e) => setFormData({ ...formData, userStatus: e.target.value === "true" })}>
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </div>
                                            </div> */}
                                            </div>
                                        </div>
                                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                                            <button type="button" className="btn btn-outline-dark px-4 cancel" data-bs-dismiss="modal">Cancel</button>
                                            <button type="submit" className="btn add px-4">Save</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WrapperTag >

    )
}

export default ManageUsers;