import React, { useEffect, useState } from 'react';
import Update from '../assets/Update.png';
import { useLocation, Link } from 'react-router-dom';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function InitiateCaseSummary() {


    const token = sessionStorage.getItem('access_token');
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const { envelopeId, filingId, courtlocation, matchingFilingId, filingStatus } = location.state || {};
    //for case details
    const [caseDetails, setCaseDetails] = useState(null)
    //for fees values
    const [filingFees, setFilingFees] = useState([]);
    const [envelopeFees, setEnvelopeFees] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [subtotal, setSubTotal] = useState(0);
    const [totalCourtCaseFee, setTotalCourtCaseFees] = useState(0);
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


    //fetch filing details API 
    useEffect(() => {
        const fetchFeeFilingDetails = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            setLoading(true);
            try {
                const response = await fetch(`${baseURL}/GetCaseDetails?envelopeID=${envelopeId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch case details list');
                }
                const data = await response.json();
                // console.log("API Response:", data); 
                setCaseDetails(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching case details list:', error.message);
            }
        };

        fetchFeeFilingDetails();
    }, [token]);

    const handleOpenPDF = (doc) => {
        if (doc.fileBase64) {
            // Decode Base64 string to binary
            const binaryString = atob(doc.fileBase64);

            // Convert binary string to a Uint8Array
            const pdfBytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                pdfBytes[i] = binaryString.charCodeAt(i);
            }

            // Create a Blob from the PDF bytes
            const blob = new Blob([pdfBytes], { type: "application/pdf" });

            // Generate a URL for the Blob
            const url = URL.createObjectURL(blob);

            // Open PDF in a new tab
            window.open(url, "_blank");
        }
    };


    //fetch filing details API 
    useEffect(() => {
        if (!filingId) return;

        const fetchFeeFilingDetails = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            setLoading(true);
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
                // console.log("API Response:", feedata); 
                setLoading(false);
                // Check if data exists
                if (!feedata.data) {
                    console.warn("No fee data found in API response!");
                    return;
                }

                // Extract all fees
                const allFees = [...(feedata.data.FilingFees || []), ...(feedata.data.EnvelopeFees || [])];

                // Separate Grand Total
                const grandTotal = allFees.find(fee => fee.AllowanceChargeReason?.Value === "Grand Total");
                const totalCourtCaseFee = allFees.find(fee => fee.AllowanceChargeReason?.Value === "Total Court Case Fees");
                const subTotal = allFees.find(fee => fee.AllowanceChargeReason?.Value === "Filing Court Fees");

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
                        .filter(fee =>
                            fee.Amount?.Value > 0 &&
                            fee.AllowanceChargeReason?.Value !== "Grand Total" &&
                            fee.AllowanceChargeReason?.Value !== "Total Court Case Fees"
                        )
                        .map(fee => ({
                            reason: fee.AllowanceChargeReason?.Value || "Unknown Fee",
                            amount: fee.Amount?.Value || 0,
                            currency: fee.Amount?.currencyID || "USD"
                        }))
                );


                setTotalCourtCaseFees(totalCourtCaseFee ? totalCourtCaseFee.Amount?.Value : 0);
                setSubTotal(subTotal ? subTotal.Amount?.Value : 0);
                setGrandTotal(grandTotal ? grandTotal.Amount?.Value : 0);
                //   processDocuments(feedata);
            } catch (error) {
                console.error('Error fetching fee filing list:', error.message);
            }
        };
        fetchFeeFilingDetails();

    }, [filingId, token]);

    //API to cancel filing request
    const handleCancelFilingRequest = async (e) => {
        e.preventDefault();
        console.log("Cancelling filing request for courtLocation:", courtlocation, "and filingId:", filingId);
        const baseURL = process.env.REACT_APP_BASE_URL;
        setLoading(true);
        try {
            const response = await fetch(`${baseURL}/CancelFiling?CourtLocation=${courtlocation}&FilingId=${filingId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

            if (!response.ok) {
                throw new Error('Failed to cancel filing request');
            }
            const data = await response.json();
            console.log("API Response:", data);
            setLoading(false);
        } catch (error) {
            console.error('Error canceling filing request:', error.message);
            setLoading(false);
        }
    };

    const handlePrintPDF = async () => {
        const content = document.getElementById("filingDetails"); // Ensure this element exists!

        if (!content) {
            console.error("Element not found: #filingDetails");
            return;
        }

        // Ensure the DOM is fully rendered before capturing
        setTimeout(() => {
            html2canvas(content, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");

                pdf.addImage(imgData, "PNG", 10, 10, 190, 0);

                // Open PDF in a new tab
                const pdfBlob = pdf.output("blob");
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl);
            });
        }, 500); // Small delay to allow rendering
    };

    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="row mt-3">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100">

                                {/* Title Section */}
                                <h1
                                    className="fw-normal mb-3 mb-md-0"
                                    style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                                >
                                    Filing {matchingFilingId} - {filingStatus}
                                    {filingStatus === "Pending" && (
                                        <i className="fa fa-product-hunt fa-fw lightgreen ms-2" aria-hidden="true"></i>
                                    )}
                                </h1>

                                {/* Action Buttons */}
                                <div className="d-flex flex-wrap justify-content-end align-items-center gap-3"
                                    style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}>

                                    {/* Cancel Filings */}
                                    <Link
                                        to="#"
                                        onClick={(e) => handleCancelFilingRequest(e, courtlocation, filingId)}
                                        className="d-flex align-items-center text-decoration-none"
                                        style={{ color: "#a94442", fontWeight: 500 }}
                                    >
                                        <i className="fa fa-ban fa-fw me-1" aria-hidden="true" style={{ color: "#a94442 !important" }}></i>
                                        <span style={{ color: "#a94442" }}>Cancel Filings</span>
                                    </Link>

                                    {/* Refresh */}
                                    <Link
                                        to="#"
                                        onClick={(e) => { e.preventDefault(); window.location.reload(); }}
                                        className="d-flex align-items-center text-decoration-none"
                                        style={{ color: "#336C9D" }}
                                    >
                                        <i className="fa fa-refresh fa-fw me-1" aria-hidden="true"></i>
                                        <span>Refresh</span>
                                    </Link>

                                    {/* Print */}
                                    <Link
                                        to="#"
                                        onClick={handlePrintPDF}
                                        className="d-flex align-items-center text-decoration-none"
                                        style={{ color: "#336C9D" }}
                                    >
                                        <i className="fa fa-print fa-fw me-1" aria-hidden="true"></i>
                                        <span>Print</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="row mt-2">
                            {caseDetails && (
                                <>
                                    {/* Envelope Info */}
                                    <div className="col-12 col-md-8 col-lg-8 col-xl-8 py-0 my-2 mx-0 ps-2 pe-0">
                                        <p className="text-start mx-0 my-0 px-0 py-3 fs-6 tip_data">
                                            <strong className="text-start">
                                                <i className="fa fa-info-circle me-2"></i>Initiate a New Case -
                                            </strong>
                                            Envelope Number {caseDetails.envelopeNo || "N/A"}
                                        </p>
                                    </div>

                                    {/* Last Update */}
                                    <div className="col-12 col-md-4 col-lg-4 col-xl-4 py-0 my-2 mx-0 pe-2 ps-1">
                                        <p className="text-start mx-0 my-0 px-2 py-3 fs-6 tip_data_2">
                                            Last Update {caseDetails.submittedDate}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="row case_form justify-content-center mt-2">
                            <div className="row mt-2 gx-3 gy-4">
                                <div className="col-12">
                                    <div className="card p-2">
                                        <div className="card-body">
                                            <div className="row">
                                                <div id="filingDetails">
                                                    {/* Section 1 */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                1 . Select Court & Case Type -
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Choose the court location and case type to file your new case.
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            {caseDetails && (
                                                                <div className="container">
                                                                    <div className="row mb-3" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                        <p className="col-12 col-md-4 col-form-label fw-bold col-form-label-sm">
                                                                            Court
                                                                        </p>
                                                                        <div className="col-12 col-md-8">
                                                                            {caseDetails.selectedCourt || "N/A"}
                                                                        </div>
                                                                    </div>
                                                                    <div className="row mb-3" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                        <p className="col-12 col-md-4 col-form-label fw-bold col-form-label-sm">
                                                                            Case Type
                                                                        </p>
                                                                        <div className="col-12 col-md-8">
                                                                            {caseDetails.selectedCaseType || "N/A"}
                                                                        </div>
                                                                    </div>
                                                                    <div className="row mb-3" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                        <p className="col-12 col-md-4 col-form-label fw-bold col-form-label-sm">
                                                                            Case Category Type
                                                                        </p>
                                                                        <div className="col-12 col-md-8">
                                                                            {caseDetails.selectedCategory || "N/A"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Section 2 - Add Documents */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                2 . Add Documents -
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Define, select, and upload the documents that make up your filing.
                                                                </span>
                                                            </p>
                                                        </div>

                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            <div className="row container mb-3">
                                                                <div className="col-12">
                                                                    <div className="table-responsive">
                                                                        <table className="table table-borderless">
                                                                            <thead>
                                                                                <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                    <th>Document Type</th>
                                                                                    <th>Document Description</th>
                                                                                    <th>File Name</th>
                                                                                    <th>Status</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {caseDetails?.documents?.length > 0 ? (
                                                                                    caseDetails.documents.map((doc) => (
                                                                                        <tr key={doc.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                            <td>{doc.documentType || "N/A"}</td>
                                                                                            <td>{doc.documentType || "N/A"}</td>
                                                                                            <td>
                                                                                                {doc.fileBase64 && (
                                                                                                    <button
                                                                                                        className="btn btn-link p-0"
                                                                                                        onClick={() => handleOpenPDF(doc)}
                                                                                                    >
                                                                                                        {doc.fileName}
                                                                                                    </button>
                                                                                                )}
                                                                                            </td>
                                                                                            <td>Sent</td>
                                                                                        </tr>
                                                                                    ))
                                                                                ) : (
                                                                                    <tr>
                                                                                        <td colSpan="4" className="text-center">
                                                                                            No documents available.
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 3 - Security & Optional Services */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                3 . Security & Optional Services -
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Choose a security level, and any needed optional services, for each document.
                                                                </span>
                                                            </p>
                                                        </div>

                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            <div className="row container mb-3">
                                                                <div className="col-12">
                                                                    <div className="table-responsive">
                                                                        <table className="table table-borderless">
                                                                            <thead>
                                                                                <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                    <th>Document</th>
                                                                                    <th>Security</th>
                                                                                    <th>Optional Services</th>
                                                                                    <th>Qty</th>
                                                                                    <th></th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {caseDetails?.documents?.length > 0 ? (
                                                                                    caseDetails.documents.map((doc) => (
                                                                                        <tr key={doc.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                            <td>{doc.documentType || "N/A"}</td>
                                                                                            <td>{doc.securityTypes || "N/A"}</td>
                                                                                            <td>
                                                                                                {doc.optionalServices?.map((service) => (
                                                                                                    <div key={service.id}>{service.optionalServiceId}</div>
                                                                                                ))}
                                                                                            </td>
                                                                                            <td>
                                                                                                {doc.optionalServices?.map((service) => (
                                                                                                    <div className="text-center" key={service.id}>
                                                                                                        {service.quantity}
                                                                                                    </div>
                                                                                                ))}
                                                                                            </td>
                                                                                            <td></td>
                                                                                        </tr>
                                                                                    ))
                                                                                ) : (
                                                                                    <tr>
                                                                                        <td colSpan="5" className="text-center">No documents available.</td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 4 - New Case Parties */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                4 . New Case Parties -
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Enter the required parties.
                                                                </span>
                                                            </p>
                                                        </div>

                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            <div className="row container mb-3">
                                                                <div className="col-12">
                                                                    <div className="table-responsive">
                                                                        <table className="table table-borderless">
                                                                            <thead>
                                                                                <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                    <th>Role</th>
                                                                                    <th>Type</th>
                                                                                    <th>Party</th>
                                                                                    <th>Representing Attorney</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {caseDetails?.parties?.length > 0 ? (
                                                                                    caseDetails.parties.map((party) => (
                                                                                        <tr key={party.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                            <td>{party.selectedPartyType}</td>
                                                                                            <td>{party.roleType}</td>
                                                                                            <td>
                                                                                                {`${party.lastName || ""}, ${party.firstName || ""} ${party.middleName || ""}`.trim()}
                                                                                                {party.address && <><br />{party.address}</>}
                                                                                                {party.address2 && <><br />{party.address2}</>}
                                                                                                <br />
                                                                                                {`${party.city || ""}, ${party.state || ""}, ${party.zip || ""}`.trim()}
                                                                                            </td>
                                                                                            <td>{party.selectedAttorney}</td>
                                                                                        </tr>
                                                                                    ))
                                                                                ) : (
                                                                                    <tr>
                                                                                        <td colSpan="4" className="text-center">No parties available.</td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Section 5 - Filing Party */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                5 . Filing Party -
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Choose the party or parties you are filing on behalf of.
                                                                    If using a keyboard, select parties with the enter key instead of the spacebar.
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            <div className="row container mb-3">
                                                                <div className="col-12">
                                                                    <div className="table-responsive">
                                                                        <table className="table table-borderless">
                                                                            <thead>
                                                                                <tr style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                    <th>Party Name</th>
                                                                                    <th>Role</th>
                                                                                    <th>Party Type</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {caseDetails?.selectedParties?.length > 0 ? (
                                                                                    caseDetails.selectedParties.map((parties) => (
                                                                                        <tr key={parties.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                            <td>{parties.partyName}</td>
                                                                                            <td>{parties.partyType}</td>
                                                                                            <td>{parties.role}</td>
                                                                                        </tr>
                                                                                    ))
                                                                                ) : (
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-center">No selected parties available.</td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* <!-- Section 6 - Service Contacts --> */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                6. Service Contacts
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Add service contacts to your filing to perform electronic service.
                                                                </span>
                                                            </p>
                                                        </div>

                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            <div className="row container mb-3">
                                                                <div className="col-12">
                                                                    <div className="table-responsive">
                                                                        <table className="table table-borderless">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Name</th>
                                                                                    <th>Document</th>
                                                                                    <th>eServe</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {/* Add logic here for populating service contacts */}
                                                                            </tbody>
                                                                        </table>
                                                                        <p className="mb-1 mt-3 text-center">
                                                                            No service contacts are currently attached to this filing.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* <!-- Section 7 - Service of Process --> */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                7. Service of Process -
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Serve documents directly to parties at their home or place of business.
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* <!-- Section 8 - Filing Fees --> */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                8. Filing Fees
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Select a payment method to pay estimated fees.
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            <div className="row container mb-3">
                                                                <div className="fee-section-item">
                                                                    <div className="row border mb-3 p-2">
                                                                        <p className="col-6 fw-bold mb-0 text-xl-start">Filings</p>
                                                                        <p className="col-6 fw-bold mb-0 text-xl-end">Estimated Fees</p>
                                                                    </div>
                                                                    <div className="row p-2" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                        {caseDetails && (
                                                                            <>
                                                                                <p className="col-6 mb-0 text-xl-start">
                                                                                    {caseDetails.selectedCaseType || "N/A"}
                                                                                </p>
                                                                            </>
                                                                        )}
                                                                        <p className="col-6 mb-0 text-xl-end">{totalCourtCaseFee} USD</p>
                                                                    </div>
                                                                    {caseDetails && (
                                                                        <>
                                                                            <div className="row p-2">
                                                                                <div className="col-6 text-black-50 mb-0 text-xl-start" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                    {caseDetails.documents.map((doc) => (
                                                                                        <div key={doc.id}>
                                                                                            <p className="text-black-50 mb-3">{doc.documentType}</p>
                                                                                            {doc.optionalServices?.map((service) => (
                                                                                                <p key={service.id} className="text-black-50 mb-3">
                                                                                                    {service.optionalServiceId}
                                                                                                </p>
                                                                                            ))}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                <div className="col-6 text-black-50 mb-0 text-xl-end" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                    {filingFees.length > 0 &&
                                                                                        filingFees.map((fee, index) => (
                                                                                            <p key={index} className="text-black-50 mb-3">
                                                                                                {fee.amount.toFixed(2)} {fee.currency}
                                                                                            </p>
                                                                                        ))}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <div className="fee-section-item">
                                                                    <div className="row border p-2" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                        <p className="col-6 fw-bold mb-0 text-xl-start">Service Fees</p>
                                                                        <p className="col-6 fw-bold mb-0 text-xl-end">Estimated Fees</p>
                                                                    </div>
                                                                    {envelopeFees.length > 0 ? (
                                                                        envelopeFees.map((fee, index) => (
                                                                            <div key={index} className="row p-2" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                <p className="col-6 text-black-50 mb-0 text-xl-start">{fee.reason}</p>
                                                                                <p className="col-6 text-black-50 mb-0 text-xl-end">{fee.amount.toFixed(2)} {fee.currency}</p>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p>No envelope fees available</p>
                                                                    )}
                                                                    <div className="row p-2" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                        <p className="col-8 mb-0 text-xl-end"></p>
                                                                        <div className="col-4 d-flex justify-content-between align-items-center flex-column flex-sm-row">
                                                                            <p className="fw-bold mb-0 text-right">Grand Total</p>
                                                                            <p className="fw-bold mb-0 text-xl-end">{grandTotal.toFixed(2)} USD</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* <!-- Section 9 - Review & Submit --> */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                9. Review & Submit
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Finalize your filing, review, and submit.
                                                                </span>
                                                            </p>
                                                        </div>

                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            <div className="row container mb-3">
                                                                <div className="col-12">
                                                                    <div className="table-responsive">
                                                                        <table className="table">
                                                                            <colgroup>
                                                                                <col />
                                                                            </colgroup>
                                                                            {caseDetails && (
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td className="text-bold col-md-2">
                                                                                            <label htmlFor="note">Clerk Memo</label>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span id="note"></span>{caseDetails.noteToClerk}
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="text-bold col-md-2">
                                                                                            <label htmlFor="submitDate">Filing Submitted</label>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span id="submitDate">{caseDetails.submittedDate}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="text-bold col-md-2">
                                                                                            <label htmlFor="courtDate">Court Received</label>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span id="courtDate">N/A</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="text-bold col-md-2">
                                                                                            <label htmlFor="envNo">Envelope</label>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span id="envNo">{caseDetails.envelopeNo}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="text-bold col-md-2">
                                                                                            <label htmlFor="AttSec">Filing Attorney</label>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span id="AttSec">{caseDetails.selectedAttorneySec}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="text-bold col-md-2">
                                                                                            <label htmlFor="ccEmail">Courtesy Email Notice</label>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span id="ccEmail">{caseDetails.courtesyemail}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="text-bold col-md-2">
                                                                                            <label htmlFor="cretBy">Created by</label>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span id="cretBy">{caseDetails.createdBy}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            )}
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* <!-- Section 10 - Filing Activity Log --> */}
                                                    <div className="col-12 mb-3">
                                                        <div className="section-case-bg border p-2 mb-0">
                                                            <p className="fw-bold mb-0">
                                                                10. Filing Activity Log -
                                                                <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                                    Exchange of messages with the court filing manager.
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="border border-top-0 shadow rounded-bottom p-3">
                                                            <div className="row container mb-3">
                                                                <div className="col-12">
                                                                    <div className="table-responsive">
                                                                        <table className="table table-borderless">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Message Type</th>
                                                                                    <th>Timestamp</th>
                                                                                    <th>Court Response</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {/* Add logic here for populating filing activity log */}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
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
                </div>
            </div>
        </WrapperTag>
    );
}

export default InitiateCaseSummary;