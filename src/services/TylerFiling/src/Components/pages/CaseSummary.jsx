import React, { useEffect, useState } from 'react';
import Update from '../assets/Update.png';
import { Link } from 'react-router-dom';
import { useLocation } from "react-router";
import LoaderPopup from './LoaderPopup';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select from "react-select";

const CaseSummary = () => {
    const token = sessionStorage.getItem('access_token');
    const [caseSummary, setCaseSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [show, setShow] = useState(false);
    const [contactList, setContactList] = useState([]);
    const [selectedContactList, setSelectedContactList] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('from-my-firm');
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [searchFilters, setSearchFilters] = useState({
        firstName: '',
        lastName: '',
        firmName: '',
    });
    const handleClose = () => setShow(false);
    const handleShow = (e) => { setShow(true); e.preventDefault(); }
    const [documents, setDocuments] = useState([]);
    const [filingFees, setFilingFees] = useState([]);
    const [envelopeFees, setEnvelopeFees] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [subtotal, setSubTotal] = useState(0);
    const location = useLocation();

    const { id, courtlocation, filingId } = location.state || {};
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

    // Fetch case data when component mounts or court location or case ID changes
    useEffect(() => {
        const fetchData = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            setLoading(true);

            try {
                const response = await fetch(`${baseURL}/GetCase`, {
                    method: 'POST',
                    body: JSON.stringify({
                        selectedCourt: courtlocation,
                        CaseTrackingID: id,
                    }),
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                });

                const data = await response.json();
                setCaseSummary(data); // Set the fetched data
                console.log("case summary", data);
            } catch (error) {
                console.error('Error fetching case data:', error);
            } finally {
                setLoading(false);  // End loading
            }
        };

        fetchData();
    }, [courtlocation, id, token]);

    //party & attorney row function
    const caseParticipants = caseSummary?.data?.Case?.CaseAugmentation1?.CaseParticipant || [];
    const participants = [];

    let currentAttorneys = [];

    caseParticipants.forEach(participant => {
        const roleCode = participant?.CaseParticipantRoleCode?.Value;
        const roleMapping = {
            "17088": "Plaintiff",
            "6610": "Defendant"
        };
        const roleDisplay = roleMapping[roleCode] || roleCode;

        if (roleCode === "ATTY") {
            const personName = `${participant?.Item?.PersonName?.PersonGivenName?.Value || ""} 
            ${participant?.Item?.PersonName?.PersonMiddleName?.Value || ""} 
            ${participant?.Item?.PersonName?.PersonSurName?.Value || ""}`.trim();

            const address = participant?.Item?.PersonAugmentation?.ContactInformation?.[0]?.Items?.[2]?.Item;
            const street = address?.Items?.[0]?.StreetFullText?.Value || "";
            const city = address?.LocationCityName?.Value || "";
            const state = address?.Item1?.Value || "";
            const postalCode = address?.LocationPostalCode?.Value || "";

            const attorneyDetails = `${personName}, ${street}, ${city}, ${state}, ${postalCode}`;

            currentAttorneys.push(attorneyDetails); // Store attorney details temporarily
        } else {
            const partyName = `${participant?.Item?.PersonName?.PersonGivenName?.Value || ""}
            ${participant?.Item?.PersonName?.PersonSurName?.Value || ""}`.trim();

            const newParty = {
                role: roleDisplay,
                party: partyName,
                attorney: currentAttorneys.length > 0 ? currentAttorneys[0] : ""
            };
            participants.push(newParty);
            currentAttorneys = [];
        }
    });

    // Handle any remaining attorneys at the end (if they exist)
    if (currentAttorneys.length > 0 && participants.length > 0) {
        participants[participants.length - 1].attorney = currentAttorneys.length > 0 ? currentAttorneys[0] : "";
    } else if (currentAttorneys.length > 0 && participants.length === 0) {
        participants.push({
            role: "",
            party: "",
            attorney: currentAttorneys.length > 0 ? currentAttorneys[0] : "",
        });
    }

    // Fetch service contacts
    useEffect(() => {
        if (selectedMethod === 'from-my-firm') {
            const getServiceContactList = async () => {
                const baseURL = process.env.REACT_APP_BASE_URL;
                try {
                    const response = await fetch(`${baseURL}/GetServiceContactList`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data?.data?.ServiceContact) {
                            setContactList(data.data.ServiceContact);
                            setErrorMessage(null);
                        } else if (data.error) {
                            setErrorMessage(data.error);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching service contact data:', err);
                    setErrorMessage('Failed to load service contact data.');
                }
            };

            getServiceContactList();
        }
    }, [selectedMethod, token]);

    // Handle input change for search filters in service contact modal popup
    const handleInputFormChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters({ ...searchFilters, [name]: value });
    };

    // Render form content based on selected radio button of service contact modal popup
    const renderFormContent = () => {
        if (selectedMethod === 'from-my-firm') {
            return (
                <>
                    <Form.Group>
                        <Form.Label className='mb-3'>Select the firm contacts you wish to add, then click Add / Attach button.</Form.Label>
                        <table className="table table-responsive">
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contactList.map((contact, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                id={`contact-${index}`}
                                                checked={selectedContacts.some((c) => c.Email === contact.Email)} // FIXED
                                                onChange={(e) => handleCheckboxChange(contact, e.target.checked)}
                                            />
                                        </td>
                                        <td>{`${contact.FirstName} ${contact.LastName}`}</td>
                                        <td>{contact.Email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='row partyAssoc mt-4'>
                            <div className='col-sm-4'>
                                <p className='text-end fw-bold'>Party Association</p>
                            </div>
                            <div className='col-sm-6'>
                                <Select
                                    id="partyAssociation"
                                    value={selectedContacts}
                                    options={participants.map((participant) => {
                                        const partyName = participant?.party?.replace(/\s+/g, " ").trim() || "No Name Provided";
                                        return {
                                            value: participant?.id,
                                            label: partyName
                                        };
                                    })}
                                    onChange={(selectedOptions) => setSelectedContacts(selectedOptions)}
                                />
                            </div>
                        </div>
                    </Form.Group>
                </>
            );
        }

        if (selectedMethod === 'from-public-list') {
            return (
                <>
                    <Form.Group className="mb-3">
                        <Form.Label className='mb-3'>Use this form to search the public contact list by name or firm</Form.Label>
                        <Row>
                            <Col>
                                <Form.Label className='fw-bold'>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lname"
                                    value={searchFilters.lastName}
                                    onChange={handleInputFormChange}
                                />
                            </Col>
                            <Col>
                                <Form.Label className='fw-bold'>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fname"
                                    value={searchFilters.firstName}
                                    onChange={handleInputFormChange}
                                />
                            </Col>
                            <Col>
                                <Form.Label className='fw-bold'>Firm Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firmName"
                                    value={searchFilters.firmName}
                                    onChange={handleInputFormChange}
                                />
                            </Col>
                        </Row>
                        <Button variant="dark" className="mt-4">
                            Search
                        </Button>
                        <div className='mt-4'>
                            <p>Select the public contacts you wish to add, then click Add / Attach button.</p>
                            <table className="table table-responsive">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email Adress</th>
                                        <th>Firm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                            <p className='fw-bold text-center mt-2'>Enter search filters to see public service contact list</p>
                        </div>
                        <div className='row partyAssoc mt-4'>
                            <div className='col-sm-4'>
                                <p className='text-end fw-bold'>Party Association</p>
                            </div>
                            <div className='col-sm-6'>
                                <Select
                                    id="partyAssociation"
                                    value={selectedContacts}
                                    options={participants.map((participant) => {
                                        const partyName = participant?.party?.replace(/\s+/g, " ").trim() || "No Name Provided";
                                        return {
                                            value: participant?.id,
                                            label: partyName
                                        };
                                    })}
                                    onChange={(selectedOptions) => setSelectedContacts(selectedOptions)}
                                />
                            </div>
                        </div>
                    </Form.Group>
                </>
            );
        }

        if (selectedMethod === 'add-new-contact') {
            return (
                <>
                    <Form.Group className="mb-3">
                        <Form.Label className='mb-3'>Complete form below to add a new contact, then click Add / Attach button.</Form.Label>
                        <Row>
                            <Col>
                                <Form.Label className='fw-bold'> First Name</Form.Label>
                                <Form.Control type="text" />
                            </Col>
                            <Col>
                                <Form.Label className='fw-bold'>Last Name</Form.Label>
                                <Form.Control type="text" />
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <Form.Label className='fw-bold'>Email </Form.Label>
                                <Form.Control type="email" />
                            </Col>
                            <Col>
                                <Form.Label className='fw-bold'>Administrative Copy</Form.Label>
                                <Form.Control type="text" />
                            </Col>
                        </Row>
                        <Row className="mt-3 formchecksection">
                            <Col>
                                <Form.Label className='text-end w-100 fw-bold'> Public Contact </Form.Label>
                            </Col>
                            <Col>
                                <Form.Check inline type="radio" name="yes-option" className='fw-bold' label="Yes" />
                                <Form.Check inline type="radio" name="no-option" className='fw-bold' label="No" />
                            </Col>
                        </Row>
                        <Row className="mt-3 formchecksection">
                            <Col>
                                <Form.Label className="text-end w-100 fw-bold"> Firm Contact </Form.Label>
                            </Col>
                            <Col>
                                <Form.Check inline type="radio" name="yes-option" className='fw-bold' label="Yes" />
                                <Form.Check inline type="radio" name="no-option" className='fw-bold' label="No" />
                            </Col>
                        </Row>
                        <div className='row partyAssoc mt-4'>
                            <div className='col-sm-4'>
                                <p className='text-end fw-bold'>Party Association</p>
                            </div>
                            <div className='col-sm-6'>
                                <Select
                                    id="partyAssociation"
                                    value={selectedContacts}
                                    options={participants.map((participant) => {
                                        const partyName = participant?.party?.replace(/\s+/g, " ").trim() || "No Name Provided";
                                        return {
                                            value: participant?.id,
                                            label: partyName
                                        };
                                    })}
                                    onChange={(selectedOptions) => setSelectedContacts(selectedOptions)}
                                />
                            </div>
                        </div>
                    </Form.Group>
                </>
            );
        }
    };

    // Handle checkbox selection in the modal
    const handleCheckboxChange = (contact, isChecked) => {
        setSelectedContacts((prevContacts) => {
            if (isChecked) {
                return [...prevContacts, contact]; // Add contact if checked
            } else {
                return prevContacts.filter((c) => c.Email !== contact.Email); // Remove if unchecked
            }
        });
    };

    // Handle "Add/Attach" button
    const handleAddAttach = () => {
        setSelectedContactList((prevContacts) => [
            ...prevContacts,
            ...selectedContacts
                .filter((contact) => !prevContacts.some((c) => c.Email === contact.Email))
                .map((contact) => ({ ...contact, isChecked: false })) // Add `isChecked`
        ]);
        setSelectedContacts([]); // Clear modal selection
        handleClose();
    };

    const handleTableCheckboxChange = (index) => {
        setSelectedContactList((prevContacts) =>
            prevContacts.map((contact, i) =>
                i === index ? { ...contact, isChecked: !contact.isChecked } : contact
            )
        );
    };

    const handleDetach = () => {
        setSelectedContactList((prevContacts) => prevContacts.filter((contact) => !contact.isChecked));
    };

    //fetch filing details API 
    useEffect(() => {
        if (!filingId) return;

        const fetchFeeFilingDetails = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                const response = await fetch(`${baseURL}/FilingDetails`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ filingId }),
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch fee filing list');
                }
                const feedata = await response.json();
                console.log("API Response:", feedata);

                // Check if data exists
                if (!feedata.data) {
                    console.warn("No fee data found in API response!");
                    return;
                }

                // Extract all fees
                const allFees = [...(feedata.data.FilingFees || []), ...(feedata.data.EnvelopeFees || [])];

                // Separate Grand Total
                const grandTotal = allFees.find(fee => fee.AllowanceChargeReason?.Value === "Grand Total");
                const subTotal = allFees.find(fee => fee.AllowanceChargeReason?.Value === "Filing Court Fees");
                // Filter fees separately (removing Grand Total)
                const filteredFees = allFees.filter(fee =>
                    fee.AllowanceChargeReason?.Value !== "Grand Total" &&
                    fee.AllowanceChargeReason?.Value !== "Filing Court Fees"
                );
                // Convert fees into a formatted structure
                setFilingFees(
                    (feedata.data.FilingFees || [])
                        .filter(fee => fee.Amount?.Value > 0 && fee.AllowanceChargeReason?.Value !== "Filing Court Fees")
                        .map(fee => ({
                            reason: fee.AllowanceChargeReason?.Value || "Unknown Fee",
                            amount: fee.Amount?.Value || 0,
                            currency: fee.Amount?.currencyID || "USD"
                        }))
                );

                setEnvelopeFees(
                    (feedata.data.EnvelopeFees || [])
                        .filter(fee => fee.Amount?.Value > 0 && fee.AllowanceChargeReason?.Value !== "Grand Total")
                        .map(fee => ({
                            reason: fee.AllowanceChargeReason?.Value || "Unknown Fee",
                            amount: fee.Amount?.Value || 0,
                            currency: fee.Amount?.currencyID || "USD"
                        }))
                );

                setSubTotal(subTotal ? subTotal.Amount?.Value : 0);
                setGrandTotal(grandTotal ? grandTotal.Amount?.Value : 0);
                processDocuments(feedata);
            } catch (error) {
                console.error('Error fetching fee filing list:', error.message);
            }
        };
        fetchFeeFilingDetails();
    }, [filingId, token]);

    //to call document description in
    const processDocuments = (data) => {
        if (!data || !data.data || !data.data.FilingLeadDocument) {
            console.error("No FilingLeadDocument found in response");
            return;
        }

        const formatDescription = (text) => {
            if (!text) return "No description available";

            return text
                .replace(/([a-z])([A-Z])/g, "$1 $2")  // lowercase → UPPERCASE
                .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")  // Multiple uppercase before lowercase
                .replace(/\s+/g, " ")  // Remove extra spaces
                .trim();
        };

        const documentDescriptions = data.data.FilingLeadDocument.map(doc => {
            console.log("Original Text:", doc.DocumentDescriptionText?.Value);

            const formattedText = formatDescription(doc.DocumentDescriptionText?.Value);
            console.log("Formatted Text:", formattedText);

            return { description: formattedText };
        });
        console.log("Processed Documents:", documentDescriptions);
        setDocuments(documentDescriptions);
    };


    return (

        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="row mt-3">
                            <div className="d-flex flex-wrap align-items-center justify-content-between initiate_case_sec_btn pe-0">
                                <h1 className="fw-normal mb-2 mb-md-0" style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}>
                                    Case Summary
                                </h1>

                                <div className="d-flex flex-wrap justify-content-end gap-3">
                                    <a href="#" className="fw" style={{ color: '#336C9D', textDecoration: 'none' }}>
                                        <i className="fa fa-file fa-fw me-1" aria-hidden="true"></i> File on Case
                                    </a>
                                    <a href="#" className="fw" style={{ color: '#336C9D', textDecoration: 'none' }}>
                                        <i className="fa fa-folder fa-fw me-1" aria-hidden="true"></i> View Filings
                                    </a>
                                    <a href="#" className="fw" style={{ color: '#336C9D', textDecoration: 'none' }}>
                                        <i className="fa fa-refresh fa-fw me-1" aria-hidden="true"></i> Refresh
                                    </a>
                                    <a href="#" className="fw" style={{ color: '#336C9D', textDecoration: 'none' }}>
                                        <i className="fa fa-print fa-fw me-1" aria-hidden="true"></i> Print
                                    </a>
                                    <a href="#" className="fw" style={{ color: '#336C9D', textDecoration: 'none' }}>
                                        <i className="fa fa-edit fa-fw me-1" aria-hidden="true"></i> Edit
                                    </a>
                                    <a href="#" className="fw" style={{ color: '#336C9D', textDecoration: 'none' }}>
                                        <i className="fa fa-trash fa-fw me-1" aria-hidden="true"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* Case Summary Details Row */}
                        <div className="row mt-2">
                            <div className="col-12 col-md-9 col-lg-9 col-xl-9 py-0 my-2 mx-0 ps-2 pe-0">
                                <p className="text-start mx-0 my-0 px-2 py-3 fs-6 tip_data">
                                    <strong>{caseSummary?.data?.Case?.CaseDocketID?.Value || " "}</strong>:
                                    {caseSummary?.data?.Case?.CaseTitleText?.Value}
                                </p>
                            </div>
                            <div className="col-12 col-md-3 col-lg-3 col-xl-3 py-0 my-2 mx-0 pe-2 ps-1">
                                <p className="text-start mx-0 my-0 text-center py-3 fs-6 tip_data_2">
                                    Last Update {caseSummary?.data?.Case?.ActivityStatus?.StatusDate}
                                </p>
                            </div>
                        </div>

                        <div className="row justify-content-center mt-4">
                            <form method="post">
                                <div className="card mb-3">
                                    <div className="card-title light-grey-bg-color">
                                        <h3 className="fw-bold pt-2 pb-1 px-1 ms-3" style={{ fontSize: "1.1rem" }}> Case Information</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-lg-4 col-md-6">
                                                <dl>
                                                    <dt>Case Number</dt>
                                                    <dd>{caseSummary?.data?.Case?.CaseDocketID?.Value || "N/A"}</dd>
                                                    <dt>Case Type</dt>
                                                    <dd>{caseSummary?.data?.Case?.CaseAugmentation1?.CaseTypeText?.Value || "N/A"}</dd>
                                                </dl>
                                            </div>

                                            {/* Second Column */}
                                            <div className="col-lg-4 col-md-6">
                                                <dl>
                                                    <dt>Court Location</dt>
                                                    <dd>{caseSummary?.data?.Case?.CaseAugmentation?.CaseCourt?.OrganizationIdentification?.IdentificationID?.Value || "N/A"}</dd>
                                                    <dt>Judge</dt>
                                                    <dd>{caseSummary?.data?.Case?.CaseAugmentation?.CaseJudge?.[0]?.JudicialOfficialBarMembership?.JudicialOfficialBarIdentification?.IdentificationID?.Value || "N/A"}</dd>
                                                </dl>
                                            </div>

                                            {/* Third Column */}
                                            <div className="col-lg-4 col-md-6">
                                                <dl>
                                                    <dt>Case Name/Title</dt>
                                                    <dd>{caseSummary?.data?.Case?.CaseTitleText?.Value || "N/A"}</dd>
                                                    <dt>Status</dt>
                                                    <dd>
                                                        {caseSummary?.data?.Case?.ActivityStatus?.StatusText?.Value || "N/A"} -
                                                        {caseSummary?.data?.Case?.ActivityStatus?.StatusDate || "N/A"}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Party Information */}
                                <div className="card mb-3">
                                    <div className="d-flex justify-content-center">
                                        <div className="card-title light-grey-bg-color w-100">
                                            <h3 className="fw-bold pt-2 pb-1 px-1 ms-3" style={{ fontSize: "1.1rem" }}> Party Information</h3>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th scope="col" className="text-nowrap">Role</th>
                                                        <th scope="col" className="text-nowrap">Party</th>
                                                        <th scope="col" className="text-nowrap">Attorney</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {participants.map((participant, index) => (
                                                        <tr key={index}>
                                                            <td className="text-nowrap">{participant.role}</td>
                                                            <td className="text-nowrap">{participant.party}</td>
                                                            <td className="text-nowrap">{participant.attorney}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Service Contacts */}
                                <div className="card mb-3">
                                    <div className="card-title light-grey-bg-color w-100">
                                        <h3 className="fw-bold pt-2 pb-1 px-1 ms-3" style={{ fontSize: "1.1rem" }}>Service Contacts</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "2rem" }}></th>
                                                        <th></th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Bar ID</th>
                                                        <th scope="col">Email Address</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedContactList.map((contact, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={contact.isChecked}
                                                                    onChange={() => handleTableCheckboxChange(index)}
                                                                />
                                                            </td>
                                                            <td></td>
                                                            <td>{`${contact.FirstName} ${contact.LastName}`}</td>
                                                            <td></td>
                                                            <td>{contact.Email}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="d-flex flex-wrap justify-content-start mt-3">
                                            <Link
                                                className="fw-bold me-3"
                                                onClick={handleShow}
                                                style={{
                                                    textDecoration: "none",
                                                    cursor: "pointer",
                                                    color: "#9092f7",
                                                }}
                                            >
                                                <i className="fa fa-plus-circle fa-fw"></i> Add Service Contact
                                            </Link>
                                            {selectedContactList.some((contact) => contact.isChecked) && (
                                                <Link
                                                    onClick={handleDetach}
                                                    style={{
                                                        textDecoration: "none",
                                                        color: "red",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <i className="fa fa-times-circle fa-fw me-1"></i>
                                                    Detach Service Contact
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Fee Filings */}
                                <div className="card mb-3">
                                    <div className="card-title light-grey-bg-color w-100">
                                        <h3 className="fw-bold pt-2 pb-1 px-1 ms-3" style={{ fontSize: "1.1rem" }}>Fee Filings</h3>
                                    </div>
                                    <div className="card-body container-fluid px-3">
                                        <div className="fee-section-item">
                                            <div className="row border mb-3 shadow p-2">
                                                {documents.length > 0 ? (
                                                    documents.map((doc, index) => (
                                                        <p key={index} className="col-12 col-md-6 fw-bold mb-0 text-start">{doc.description}</p>
                                                    ))
                                                ) : (
                                                    <p className="col-12">No documents available</p>
                                                )}
                                                <p className="col-12 col-md-6 fw-bold mb-0 text-end">Estimated Fees</p>
                                            </div>

                                            {filingFees.length > 0 ? (
                                                filingFees.map((fee, index) => (
                                                    <div key={index} className="row p-2 border-bottom">
                                                        <p className="col-6 text-black-50 mb-0 text-start">{fee.reason}</p>
                                                        <p className="col-6 text-black-50 mb-0 text-end">{fee.amount.toFixed(2)} {fee.currency}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No filing fees available</p>
                                            )}

                                            <div className="row p-2">
                                                <p className="col-10 fw-bold mb-0 text-end">Filing Court Fees</p>
                                                <p className="col-2 fw-bold mb-0 text-end">{subtotal.toFixed(2)} USD</p>
                                            </div>
                                        </div>

                                        <div className="fee-section-item">
                                            <div className="row border shadow p-2 border-bottom">
                                                <p className="col-6 fw-bold mb-0 text-start">Service Fees</p>
                                                <p className="col-6 fw-bold mb-0 text-end">Estimated Fees</p>
                                            </div>

                                            {envelopeFees.length > 0 ? (
                                                envelopeFees.map((fee, index) => (
                                                    <div key={index} className="row p-2 border-bottom">
                                                        <p className="col-6 text-black-50 mb-0 text-start">{fee.reason}</p>
                                                        <p className="col-6 text-black-50 mb-0 text-end">{fee.amount.toFixed(2)} {fee.currency}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No envelope fees available</p>
                                            )}

                                            <div className="row p-2 border-bottom">
                                                <p className="col-8 mb-0"></p>
                                                <p className="col-2 fw-bold mb-0 text-end">Grand Total</p>
                                                <p className="col-2 fw-bold mb-0 text-end">{grandTotal.toFixed(2)} USD</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Index */}
                                <div className="card mb-3">
                                    <div className="card-title light-grey-bg-color w-100">
                                        <h3 className="fw-bold pt-2 pb-1 px-1 ms-3" style={{ fontSize: "1.1rem" }}>Document Index</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th className="text-nowrap">Submit/File Date</th>
                                                        <th className="text-nowrap">Filing ID/Env. No.</th>
                                                        <th>Doc. Type</th>
                                                        <th>Doc. Title</th>
                                                        <th>Security</th>
                                                        <th>Status</th>
                                                        <th>Filer</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>11/28/2012 12:38 PM PST</td>
                                                        <td>Imported / 1021065</td>
                                                        <td>Notice of Entry of Dismissal and Proof of Service</td>
                                                        <td>NT_of_Entry_of_DSM.pdf</td>
                                                        <td>Civil Document</td>
                                                        <td>Accepted</td>
                                                        <td>Nolan S Armstrong</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>


                        <div className="row mt-2">
                            <div className="col-12 py-0 my-2 mx-0 ps-2 pe-0">
                                <div
                                    className="tip_data"
                                    style={{
                                        backgroundColor: "#fcf8e3",
                                        border: "1px solid #faebcc",
                                        borderRadius: "4px",
                                        padding: "15px",
                                        textIndent: "10px",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    <span>
                                        <b>
                                            <i className="fa fa-info-circle fa-fw me-1" aria-hidden="true"></i> Important Note:
                                        </b>{" "}
                                        The documents listed above are <strong>NOT</strong> the official docket and are <strong>NOT</strong> comprehensive.
                                        To view the official court record, you must visit the Court or the Court's website.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Full-screen loader */}
                        {loading && (
                            <div className="full-screen-loader">
                                <div className="spinner-border text-light" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        )}

                        {/* Small popup loader */}
                        {loading && <LoaderPopup message="Loading Case History..." />}
                    </div>

                    {/* modal popup for service contact */}
                    <Modal show={show} onHide={handleClose} centered size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title className='fw-bold ms-3'>Add/Attach Service Contact to Case</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <div className=" p-0 mx-0">
                                        <p className=" mx-0 mt-0 mb-3 px-3 py-3 fs-6" style={{ backgroundColor: "#916aab4d" }} >
                                            <i className="fa fa-info-circle" aria-hidden="true"></i> Select a method to add/attach a service contact
                                        </p>
                                    </div>
                                    <div className='formchecksection' style={{ padding: "5px 20px " }}>
                                        <Form.Check inline type="radio" name="method" id="from-my-firm" label="From my firm"
                                            checked={selectedMethod === 'from-my-firm'}
                                            onChange={() => setSelectedMethod('from-my-firm')}
                                        />
                                        <Form.Check inline type="radio" name="method" id="from-public-list" label="From public list"
                                            checked={selectedMethod === 'from-public-list'}
                                            onChange={() => setSelectedMethod('from-public-list')}
                                        />
                                        <Form.Check inline type="radio" name="method" id="add-new-contact" label="Add new contact"
                                            checked={selectedMethod === 'add-new-contact'}
                                            onChange={() => setSelectedMethod('add-new-contact')}
                                        />
                                    </div>
                                </Form.Group>
                                <div className='formContent' style={{ padding: "15px" }}>
                                    {renderFormContent()}
                                </div>

                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" onClick={handleClose}>Cancel</Button>
                            <Button variant="dark" onClick={handleAddAttach} >Add/Attach</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </WrapperTag>
    )
}

export default CaseSummary;