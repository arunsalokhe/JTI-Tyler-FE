import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Trash from '../assets/trash.png';
import Edit from '../assets/Edit.png';
import Button from 'react-bootstrap/Button';
import { Modal } from 'react-bootstrap';
import { Form, Container, Row, Col } from 'react-bootstrap';

const ServiceContact = () => {
    const token = sessionStorage.getItem('access_token');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [contactList, setContactList] = useState([]);
    const [selectedServiceContact, setSelectedServiceContact] = useState(null);
    const [serviceContactDetails, setServiceContactDetails] = useState(false);
    const [show, setShow] = useState(false);
    const [selectedFirmId, setSelectedFirmId] = useState("");
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const handleCloseMessage = () => setShowConfirm(false);
    const handleShowMessage = (contact) => {
        setSelectedServiceContact(contact);
        setShowConfirm(true);
    };
    const [currentPage, setCurrentPage] = useState(1);
    const contactsPerPage = 3;
    // Calculate the indexes for pagination
    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
    const currentContacts = contactList.slice(indexOfFirstContact, indexOfLastContact);
    // Calculate total pages
    const totalPages = Math.ceil(contactList.length / contactsPerPage);
    // Function to handle page change
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
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

    //function to get the service contact list
    useEffect(() => {
        const getServiceContactList = async () => {

            const baseURL = process.env.REACT_APP_BASE_URL;
            setLoading(true);
            try {
                const response = await fetch(`${baseURL}/GetServiceContactList`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    });

                if (response.ok) {
                    const data = await response.json();
                    const { ServiceContact } = data.data;
                    if (ServiceContact) {
                        setContactList(ServiceContact || []);
                        console.log("list of data:", ServiceContact);

                        const firmId = ServiceContact[0]?.FirmID;
                        setSelectedFirmId(firmId);
                        console.log("First Firm ID:", firmId);


                        setErrorMessage(null);
                        setLoading(false);
                    } else if (data.error) {
                        setErrorMessage(data.error);
                        setSuccessMessage(null);
                    }
                }
            } catch (err) {
                setLoading(false);
                console.error('Error fetching service contact data:', err);
            }
        }
        getServiceContactList();
    }, [token]);

    //handle for create service contact
    // const handleCreateServiceContact = async (values) => {
    //     const baseURL = process.env.REACT_APP_BASE_URL;

    //     try {
    //         console.log('Submitting values:', values);
    //         // const response = await fetch(`${baseURL}/CreateServiceContact`,
    //         const response = await fetch(`https://localhost:7207/api/Tyler/CreateServiceContact`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({
    //                     ...values,
    //                     firmID: values.firmID,
    //                     addByFirmName: values.addByFirmName,
    //                     country: values.country || "US",
    //                 }),

    //             });

    //         const data = await response.json();
    //         if (response.ok && data?.status === 200) {
    //             console.log("Response data:", data);
    //             alert("New Service Contact added successfully", data);
    //             setSuccessMessage(data.message);
    //             setErrorMessage(null);

    //         } else {
    //             setErrorMessage(data?.message || "Failed to add service contact.");
    //         }

    //     } catch (err) {
    //         console.error('Error adding service contact data:', err);
    //     }
    //     window.location.reload();

    // }

    const handleCreateServiceContact = async (values) => {
        const baseURL = process.env.REACT_APP_BASE_URL;

        if (!selectedFirmId) {
            alert("Please select a Firm ID before proceeding.");
            return;
        }

        try {
            console.log("Submitting values:", values, "Selected Firm ID:", selectedFirmId);

            const response = await fetch(`${baseURL}/CreateServiceContact}`,{
            //const response = await fetch(`https://localhost:7207/api/Tyler/CreateServiceContact`, {

                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json-patch+json",
                    "Accept": "*/*"
                },
                body: JSON.stringify({
                    ...values,
                    firmID: selectedFirmId,  // Pass selected Firm ID
                    serviceContactID: values.serviceContactID || "", // Ensure it's always passed
                    addByFirmName: values.addByFirmName || "xtensible", // Default firm name
                    country: values.country || "US", // Default country
                }),
            });

            const data = await response.json();

            if (response.ok && data?.status === 200) {
                console.log("Response data:", data);
                alert("New Service Contact added successfully");

                // Update UI state without reloading
                setSuccessMessage(data.message);
                setErrorMessage(null);

                // Refresh service contact list dynamically
                // getServiceContactList();
                window.location.reload();

            } else {
                setErrorMessage(data?.message || "Failed to add service contact.");
            }

        } catch (err) {
            console.error("Error adding service contact data:", err);
            setErrorMessage("An error occurred while adding the service contact.");
        }
    };

    //fetch API service contact for selectedId function   
    useEffect(() => {
        if (!selectedServiceContact) return;

        const fetchContactDetails = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                const response = await fetch(`${baseURL}/GetServiceContact?ServiceContactID=${selectedServiceContact}`,
                    {
                        method: "POST",
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    });

                if (!response.ok) throw new Error("Failed to fetch contact details");

                const contactData = await response.json();
                console.log("fetch data:", contactData);

                if (contactData.data && contactData.data.ServiceContact) {
                    setServiceContactDetails(contactData.data.ServiceContact);
                } else {
                    console.error("Error: ServiceContact not found in response!");
                }
            } catch (error) {
                console.error('Error editing service contact data:', error);
            }
        };

        fetchContactDetails();
    }, [selectedServiceContact]);

    // Handle opening the modal
    const handleEditServiceContact = (ServiceContactID) => {

        if (!ServiceContactID) {
            console.error(" ServiceContactID is undefined or empty!");
            return;
        }
        setSelectedServiceContact(ServiceContactID);
        setShow(true);
    };

    // handle for input change 
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setServiceContactDetails((prevDetails) => {
            // Check if the field belongs to the Address object
            if (["AddressLine1", "AddressLine2", "City", "State", "ZipCode"].includes(name)) {
                return {
                    ...prevDetails,
                    Address: {
                        ...prevDetails.Address, // Preserve other address fields
                        [name]: value, // Update only the changed field
                    },
                };
            }

            // Handle other (non-address) fields
            return {
                ...prevDetails,
                [name]: type === "checkbox" ? checked : value,
            };
        });
    };

    //update sevice contact API by ID
    const handleUpdateServiceContact = async () => {
        if (!selectedServiceContact) return;
        const baseURL = process.env.REACT_APP_BASE_URL;

        const updateServiceContact = {
            ...serviceContactDetails,
            addByFirmName: serviceContactDetails.addByFirmName || "xten",
            country: serviceContactDetails.country || "US",
            serviceContactID: serviceContactDetails.serviceContactID,

            // Ensure Address fields are included at the root level
            AddressLine1: serviceContactDetails.Address?.AddressLine1 || "",
            AddressLine2: serviceContactDetails.Address?.AddressLine2 || "",
            City: serviceContactDetails.Address?.City || "",
            State: serviceContactDetails.Address?.State || "",
            ZipCode: serviceContactDetails.Address?.ZipCode || "",
        };

        try {
            const response = await fetch(`${baseURL}/UpdateServiceContact}`, {
            //const response = await fetch(`https://localhost:7207/api/Tyler/UpdateServiceContact`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateServiceContact),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Update Response:", data);

            alert(`Service Contact updated: ${data.message}`);
            setSuccessMessage(data.message);
            window.location.reload();
            setErrorMessage(null);
            // window.location.reload();
        } catch (error) {
            console.error('Error updating service contact data:', error);
        }
    };

    //using formik for validation
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            middleName: "",
            firmId: '',
            email: "",
            administrativeCopy: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            phoneNumber: "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            firstName: Yup.string()
                .max(30, 'Must be 30 characters or less')
                .required('First Name is required'),
            lastName: Yup.string()
                .max(30, 'Must be 30 characters or less')
                .required('Last Name is required'),
        }),
        onSubmit: async (values) => {
            console.log("Formik submitted with values:", values);
            handleCreateServiceContact(values);
        },
    });

    //handle to delete service contact on confirm button
    const handleDeleteServiceContact = async () => {
        if (!selectedServiceContact || !selectedServiceContact.ServiceContactID) {
            alert("No service contact selected for deletion.");
            return;
        }

        const ServiceContactID = selectedServiceContact.ServiceContactID; // Ensure correct extraction

        console.log("Deleting ServiceContactID:", ServiceContactID);

        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const response = await fetch(`${baseURL}/RemoveServiceContact?ServiceContactID=${ServiceContactID}`,
            //const response = await fetch(`https://localhost:7207/api/Tyler/RemoveServiceContact?ServiceContactID=${ServiceContactID}`,
                {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error Response:", errorData);
                throw new Error(errorData.message || "Failed to delete service contact");
            }

            const data = await response.json();
            console.log("Deleted service contact:", data);

            if (data.success) {
                alert("Service contact deleted successfully.");
                window.location.reload();
            } else {
                alert("Failed to delete service contact.");
            }
        } catch (error) {
            console.error("Error deleting service contact:", error);
            alert(error.message);
        }
    };


    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="container px-3 px-md-4 mt-3">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                                <h1 className="fw-normal m-0" style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}>
                                    Service Contacts
                                </h1>
                                <a
                                    href="#"
                                    className="refresh-link d-inline-flex align-items-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.location.reload();
                                    }}
                                    style={{
                                        textDecoration: "none",
                                        border: "1px solid #ced4da",
                                        padding: "6px 12px",
                                        color: "black",
                                        borderRadius: "5px",
                                        backgroundColor: "transparent",
                                        whiteSpace: "nowrap",
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
                                                <strong>Tip</strong> – Use Delete or edit actions to manage service contacts.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form method="post">
                            <div className="row mt-2">
                                <div className="col-12 col-md-9 col-lg-9 pb-0 ps-0">
                                    <div className="card grey_bg_color border-0 h-100">
                                        <div className="card-body pagination-parent-pos">
                                            <div className="table-responsive pb-3">
                                                <table className="table table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" className=" w-25"> Name </th>
                                                            <th scope="col" className=" w-25"> Public contact</th>
                                                            <th scope="col" className=" w-25">Email</th>
                                                            <th scope="col" className=" w-25"> Action </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentContacts.map((contact, index) => (
                                                            <tr key={index}>
                                                                <td>{`${contact.FirstName} ${contact.LastName}`}</td>
                                                                <td>{contact.IsPublic ? 'Yes' : 'No'}</td>
                                                                <td>{contact.Email}</td>
                                                                <td>
                                                                    <div className="d-inline-flex align-items-center">
                                                                        {/* Delete Option */}
                                                                        <div className="d-flex align-items-center">
                                                                            <i className="fa fa-trash fa-fw text-primary me-1" aria-hidden="true"></i>
                                                                            <Link
                                                                                className="text-decoration-none btn-link"
                                                                                title="Delete this service contact"
                                                                                onClick={() => handleShowMessage(contact)} // Pass the contact object
                                                                            >
                                                                                Delete
                                                                            </Link>
                                                                        </div>

                                                                        {/* Edit Option */}
                                                                        <div className="d-flex align-items-center ms-3">
                                                                            <i className="fa fa-edit fa-fw text-primary me-1" aria-hidden="true"></i>
                                                                            <Link
                                                                                key={contact.ServiceContactID}
                                                                                className="text-decoration-none btn btn-link"
                                                                                style={{ padding: "0 5px" }}
                                                                                onClick={() => handleEditServiceContact(contact.ServiceContactID)}
                                                                            >
                                                                                Edit
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
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
                                        </div>
                                        <nav aria-label="Pagination Navigation" className="custom-pagination mt-3">
                                            <ul className="pagination flex-wrap justify-content-center justify-content-md-end mb-0">
                                                {/* Previous Button */}
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <Link
                                                        className="page-link"
                                                        tabIndex={-1}
                                                        aria-disabled={currentPage === 1}
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                    >
                                                        Previous
                                                    </Link>
                                                </li>

                                                {/* Page Numbers */}
                                                {Array.from({ length: totalPages }, (_, index) => (
                                                    <li
                                                        key={index + 1}
                                                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                                    >
                                                        <Link className="page-link" onClick={() => handlePageChange(index + 1)}>
                                                            {index + 1}
                                                            {currentPage === index + 1 && (
                                                                <span className="visually-hidden">(current)</span>
                                                            )}
                                                        </Link>
                                                    </li>
                                                ))}

                                                {/* Next Button */}
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <Link
                                                        className="page-link"
                                                        aria-disabled={currentPage === totalPages}
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                    >
                                                        Next
                                                    </Link>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                                <div className="col-12 col-md-3 col-lg-3 pe-0">
                                    <div className="card border mb-3 shadow-sm"> {/* <-- added `border` and `shadow-sm` */}
                                        <div className="card-header background_card_header">
                                            <h6 className="fw-bold mx-0 my-0 py-1 fs-8">
                                                Add new service contact
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <p style={{ textAlign: "justify", fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                                Use the Add Service Contact link to add a new service contact(s) to your firm, or use the Edit link in Actions column to update contact details.
                                            </p>
                                        </div>
                                        <div className="card-footer bg-transparent border-0 pb-2" style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
                                            <Link
                                                className="text-decoration-none text-blue"
                                                data-bs-toggle="modal"
                                                data-bs-target="#addnewContact">
                                                Add Service contact
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* modal 1 start */}
            <Modal
                show={showConfirm}
                onHide={handleCloseMessage}
                centered
                dialogClassName="responsive-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Confirm Delete</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="p-0">
                        <p className="mt-0 mb-3 px-3 py-3 fs-6 rounded" style={{ backgroundColor: "#916aab4d" }}>
                            <i className="fa fa-info-circle me-2" aria-hidden="true"></i>
                            Attention, this will delete your Service Contact!
                        </p>
                    </div>
                    <p className="text-center mb-0">
                        Are you sure you would like to remove the selected service contact? If yes, click Confirm.
                    </p>
                </Modal.Body>

                <Modal.Footer className="d-flex justify-content-between justify-content-md-end">
                    <Button variant="outline-secondary" onClick={handleCloseMessage}>
                        Cancel
                    </Button>
                    <Button variant="dark" onClick={handleDeleteServiceContact}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* edit & update modal */}
            <Modal size="lg" show={show} onHide={handleClose} centered>
                <Modal.Header closeButton style={{ borderBottom: "0" }}>
                    <Modal.Title className="fw-bold">Edit Service Contact</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Container fluid>
                        <p className="bg-light px-3 py-2 rounded text-dark mb-4">
                            <strong>Tip:</strong> First name, Last name and Email address are required.
                        </p>

                        <Form>
                            {/* Name fields */}
                            <Row className="mb-3">
                                <Col xs={12} md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="FirstName"
                                            value={serviceContactDetails.FirstName || ""}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="LastName"
                                            value={serviceContactDetails.LastName || ""}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Middle Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="MiddleName"
                                            value={serviceContactDetails.MiddleName || ""}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Email */}
                            <Row className="mb-3">
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="Email"
                                            value={serviceContactDetails.Email || ""}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Admin Copy */}
                            <Row className="mb-3">
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Administrative Copy</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="AdministrativeCopy"
                                            value={serviceContactDetails.AdministrativeCopy || ""}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Address */}
                            <Row className="mb-3">
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Address Line 1</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="AddressLine1"
                                            value={serviceContactDetails?.Address?.AddressLine1 || ""}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Address Line 2</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="AddressLine2"
                                            value={serviceContactDetails?.Address?.AddressLine2 || ""}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* City, State */}
                            <Row className="mb-3">
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">City</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="City"
                                            value={serviceContactDetails?.Address?.City || ""}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">State</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="State"
                                            value={serviceContactDetails?.Address?.State || ""}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Zip, Phone */}
                            <Row className="mb-3">
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Zip Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="ZipCode"
                                            value={serviceContactDetails?.Address?.ZipCode || ""}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Phone Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="PhoneNumber"
                                            value={serviceContactDetails.PhoneNumber || ""}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Checkbox */}
                            <Row className="mb-3 align-items-center">
                                <Col xs={2} className="text-end">
                                    <Form.Check
                                        type="checkbox"
                                        name="IsPublic"
                                        checked={serviceContactDetails.IsPublic || false}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col xs={10}>
                                    <Form.Label className="mb-0">Make this Contact Public</Form.Label>
                                </Col>
                            </Row>
                        </Form>
                    </Container>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="dark" onClick={handleUpdateServiceContact}>Save</Button>
                </Modal.Footer>
            </Modal>

            {/* modal 3 start */}
            <div className="modal fade" id="addnewContact" tabIndex={-1} role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">
                                Add Service Contact
                            </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"> </button>
                        </div>
                        <form onSubmit={formik.handleSubmit} className="formService" method='post'>
                            <div className="modal-body">
                                <div className="container-fluid">
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                    <div className="row">
                                        <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                            <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data" style={{ textIndent: "1rem" }}>
                                                <strong>Tip:</strong> First name, Last name and Email are required.
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
                                                type="text"
                                                id='firstName'
                                                name='firstName'
                                                value={formik.values.firstName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.firstName && formik.errors.firstName && (
                                                <div className="invalid-feedback">{formik.errors.firstName}</div>
                                            )}
                                        </div>
                                        <div className="col-3 px-1">
                                            <input className=" form-control" type="text" name="middleName" id="middleName"
                                                value={formik.values.middleName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                        <div className="col-3 px-1">
                                            <input className={`form-control ${formik.touched.lastName && formik.errors.lastName ? 'is-invalid' : ''}`}
                                                type="text"
                                                id='lastName'
                                                name='lastName'
                                                value={formik.values.lastName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                            {formik.touched.lastName && formik.errors.lastName && (
                                                <div className="invalid-feedback">{formik.errors.lastName}</div>
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
                                            <input className=" form-control" type="email" name="email" id="email"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                    </div>
                                    {/* row 3 */}
                                    <div className="row mb-2">
                                        <div className="col-3 ps-3">
                                            <label className=" form-label fw-bold" htmlFor="administrativeCopy">
                                                Administrative Copy
                                            </label>
                                        </div>
                                        <div className="col-9 px-1">
                                            <input className=" form-control" type="email" name="administrativeCopy" id="administrativeCopy"
                                                value={formik.values.administrativeCopy}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                    </div>
                                    {/* row 4 */}
                                    <div className="row mb-2">
                                        <div className="col-3 ps-3">
                                            <label className=" form-label fw-bold" htmlFor="addressLine1">
                                                Address
                                            </label>
                                        </div>
                                        <div className="col-9 px-1">
                                            <input className=" form-control" type="text" name="addressLine1" id="addressLine1"
                                                value={formik.values.addressLine1}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                    </div>
                                    {/* row 5 */}
                                    <div className="row mb-2">
                                        <div className="col-3 ps-3">
                                            <label className=" form-label fw-bold" htmlFor="address2">
                                                Address 2
                                            </label>
                                        </div>
                                        <div className="col-9 px-1">
                                            <input className=" form-control" type="text" name="addressLine2" id="addressLine2"
                                                value={formik.values.addressLine2}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                    </div>
                                    {/* row 6 */}
                                    <div className="row mb-2">
                                        <div className="col-3 ps-3">
                                            <label className=" form-label fw-bold" htmlFor="city">
                                                City
                                            </label>
                                        </div>
                                        <div className="col-3 px-1">
                                            <input className=" form-control" type="text" name="city" id="city"
                                                value={formik.values.city}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                        <div className="col-2 px-1 align-content-center pt-1 d-flex justify-content-end">
                                            <label className=" form-label fw-bold pe-3" htmlFor="state">
                                                State
                                            </label>
                                        </div>
                                        <div className="col-4 px-1">
                                            <input className=" form-control" type="text" name="state" id="state"
                                                value={formik.values.state}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                    </div>
                                    {/* row 7 */}
                                    <div className="row mb-2">
                                        <div className="col-3 ps-3">
                                            <label className=" form-label fw-bold" htmlFor="zipCode">
                                                Zip
                                            </label>
                                        </div>
                                        <div className="col-3 px-1">
                                            <input className=" form-control" type="text" name="zipCode" id="zipCode"
                                                value={formik.values.zipCode}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                        <div className="col-2 px-1 align-content-center pt-1 d-flex justify-content-end">
                                            <label className=" form-label fw-bold pe-3" htmlFor="phoneNumber">
                                                Phone No
                                            </label>
                                        </div>
                                        <div className="col-4 px-1">
                                            <input className=" form-control" type="text" name="phoneNumber" id="phoneNumber"
                                                value={formik.values.phoneNumber}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur} />
                                        </div>
                                    </div>
                                    {/* row 8 */}
                                    <div className="row mb-2 mt-2">
                                        <div className="col-3 ps-3"></div>
                                        <div className="col-9 px-1">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    name="IsPublic"
                                                    id="IsPublic"
                                                    checked={formik.values.IsPublic}
                                                    onChange={(e) => formik.setFieldValue("IsPublic", e.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor='IsPublic'>
                                                    Make this Contact Public
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                                <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-dark px-4">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </WrapperTag>
    )
}

export default ServiceContact;