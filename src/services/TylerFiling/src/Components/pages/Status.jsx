import { Link, useNavigate } from 'react-router-dom';
import Update from '../assets/Update.png';
import Search from '../assets/search.png';
import moment from 'moment-timezone';
import React, { useState, useEffect, useRef } from "react";


const Status = ({ currentFiling }) => {
    const [courtLocation, setCourtLocation] = useState("");
    const [userId, setUserId] = useState("");
    const [drafts, setDrafts] = useState([]);
    const [filings, setFilings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const filingsPerPage = 20;
    const token = sessionStorage.getItem('access_token');
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");
    const [searchText, setSearchText] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [caseData, setCaseData] = useState([]);
    const [filingLoading, setFilingLoading] = useState(true);
    const [caseLoading, setCaseLoading] = useState(true);
    const [filteredFilings, setFilteredFilings] = useState(currentFiling);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null); // Reference for detecting outside clicks
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const WrapperTag = isMobile ? "div" : "section";
    const wrapperClass = isMobile
        ? "container-fluid d-md-none px-3 pt-3"
        : "main-content px-3 pt-3";


    const filingsListStatus = [
        "All Filings",
        "My Filings",
        "Draft",
        "Pending",
        "Accepted",
        "Rejected",
        "Serving",
        "Invoice: Balance Due",
        "cancelled"
    ];

    const [filteredStatuses, setFilteredStatuses] = useState(filingsListStatus); // Dropdown list    

    const handleSelectStatus = (status) => {
        setSearchText(status);
        setSelectedStatus(status);
        setShowDropdown(false);
        setHighlightedIndex(-1);
    };

    // Close the popup if clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e) => {
        if (!showDropdown) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prevIndex) =>
                prevIndex < filteredStatuses.length - 1 ? prevIndex + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : filteredStatuses.length - 1
            );
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault();
            setSearchText(filteredStatuses[highlightedIndex]);
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    };


    useEffect(() => {
        if (searchText) {
            const filtered = filingsListStatus.filter((status) =>
                status.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredStatuses(filtered);
            setShowDropdown(true);
        } else {
            setFilteredStatuses(filingsListStatus);
            setShowDropdown(false);
        }
    }, [searchText]);

    // Filter filings whenever selectedStatus changes
    useEffect(() => {
        if (selectedStatus === "All Filings" || !selectedStatus) {
            setFilteredFilings(filings);
        } else {
            setFilteredFilings(
                filings.filter((filing) => {
                    if (selectedStatus === "Pending") {
                        return filing.FilingStatus?.FilingStatusCode === "submitted" ||
                            filing.FilingStatus?.FilingStatusCode === "Pending";
                    }
                    return filing.FilingStatus?.FilingStatusCode === selectedStatus;
                })
            );
        }
        setCurrentPage(1); // Reset to first page after filtering
    }, [selectedStatus, filings]);


    useEffect(() => {
        const savedDrafts = JSON.parse(localStorage.getItem("drafts")) || [];
        setDrafts(savedDrafts);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            setFilingLoading(true); // Start loading
            try {
                const response = await fetch(`${baseURL}/GetFilingList`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        courtlocation: "fresno:cv",
                        userId: userId,
                    }),
                });

                if (!response.ok) throw new Error("Failed to fetch filings");

                const data = await response.json();
                console.log("Fetched Filings:", data);

                if (data?.data?.MatchingFiling) {
                    setFilings(data.data.MatchingFiling);
                    setFilteredFilings(data.data.MatchingFiling);
                } else {
                    setFilings([]);
                    setFilteredFilings([]);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setFilings([]);
                setFilteredFilings([]);
            } finally {
                setFilingLoading(false); // Stop loading
            }
        };

        fetchData();
    }, [token]);

    useEffect(() => {
        const fetchCaseUserList = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            setCaseLoading(true); // Start loading
            try {
                const response = await fetch(`${baseURL}/GetCaseUserList`, {
                    //const response = await fetch("https://localhost:7207/api/Tyler/GetCaseUserList", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch case user list");

                const data = await response.json();
                console.log("Fetched Case Data:", data);
                setCaseData(data || []);
            } catch (error) {
                console.error("Error fetching case data:", error);
                setCaseData([]);
            } finally {
                setCaseLoading(false); // Stop loading
            }
        };

        fetchCaseUserList();
    }, [token]);


    // Calculate total pages
    const totalPages = filteredFilings?.length ? Math.ceil(filteredFilings.length / filingsPerPage) : 0;
    // Calculate the data for the current page
    const indexOfLastRow = currentPage * filingsPerPage;
    const indexOfFirstRow = indexOfLastRow - filingsPerPage;
    // Ensure filteredFilings is always an array before using .slice()
    const currentFilings = Array.isArray(filteredFilings) ? filteredFilings.slice(indexOfFirstRow, indexOfLastRow) : [];

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        navigate(`/e-filing/filingStatus?page=${pageNumber}`); // Update the URL with the new page number
    };

    const formatDate = (dateString) => {
        return moment(dateString).tz('America/Los_Angeles').format('MM/DD/YYYY hh:mm A z');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false); // 👈 Hide the dropdown
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row justify-content-center mt-3 mb-3">
                        <div className="col-12 col-md-6 col-xl-6 align-items-center mb-2 mb-md-0">
                            <h1
                                className="fw-normal"
                                style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                            >
                                Filing Status
                            </h1>
                        </div>

                        <div className="col-12 col-md-6 col-xl-6 d-flex justify-content-end">
                            <div
                                className="w-100 position-relative"
                                style={{ maxWidth: "100%" }}
                                ref={dropdownRef}
                            >
                                <div className="input-group" style={{ height: "32px", flexWrap: "nowrap" }}>
                                    {/* Refresh Button */}
                                    <a
                                        href="#"
                                        className="input-group-text btn-outline text-dark d-flex align-items-center px-2 px-sm-3"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.location.reload();
                                        }}
                                        style={{
                                            textDecoration: "none",
                                            background: "none",
                                            border: "1px solid #ced4da",
                                            whiteSpace: "nowrap",
                                            fontSize: "14px",
                                        }}
                                    >
                                        <i className="fa fa-refresh fa-fw me-1 me-sm-2"></i>
                                        <span className="d-none d-sm-inline">Refresh</span>
                                    </a>

                                    {/* Search Input */}
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Filter Filings"
                                        value={searchText}
                                        aria-label="Filter Filings"
                                        onChange={(e) => {
                                            setSearchText(e.target.value);
                                            setShowDropdown(true);
                                            setHighlightedIndex(-1);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onKeyDown={handleKeyDown}
                                        style={{ flex: "1 1 auto", minWidth: "0" }}
                                    />

                                    {/* Search Icon */}
                                    <span className="input-group-text d-flex align-items-center justify-content-center">
                                        <i className="fa fa-search fa-fw"></i>
                                    </span>
                                </div>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <ul
                                        className="dropdown-menu show"
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            backgroundColor: "#fff",
                                            border: "1px solid #ccc",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                            zIndex: 1050,
                                            marginTop: "2px",
                                            width: "100%",
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {filteredStatuses.length > 0 ? (
                                            filteredStatuses.map((status, index) => (
                                                <li
                                                    key={index}
                                                    className={`dropdown-item ${index === highlightedIndex ? "bg-primary text-white" : ""
                                                        }`}
                                                    style={{
                                                        padding: "8px 12px",
                                                        cursor: "pointer",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                    onMouseEnter={() => setHighlightedIndex(index)}
                                                    onClick={() => handleSelectStatus(status)}
                                                >
                                                    {status}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="dropdown-item text-muted" style={{ padding: "8px 12px" }}>
                                                No results found
                                            </li>
                                        )}
                                    </ul>
                                )}
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
                                maxWidth: "100%", // Prevents overflow
                            }}
                        >
                            <div className="panel-body">
                                <div className="row">
                                    <div className="col-md-12 lh32 d-flex align-items-center gap-2">
                                        <span>
                                            <b>Filing view (All Filings)</b> - Click the <b>Filing ID</b> to open filing details or the print link for filing receipt.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row justify-content-center mt-4" style={{ fontSize: "14px" }}>
                        <form method="post">
                            <div className="col-12 col-md-12 col-xl-12 align-items-center">
                                <div className="card p-2 pagination-parent-pos">
                                    <div className="card-body" style={{ fontSize: "14px" }}>
                                        {/* Table with pagination */}
                                        <div className="table-responsive">
                                            <table className="table table-striped table-hover">
                                                <thead>
                                                    <tr>
                                                        {/* <th className="column-fixed">Filing ID</th> */}
                                                        <th className="column-fixed">Filing ID</th>
                                                        <th className="column-fixed">Status</th>
                                                        <th className="column-fixed">Last Changed</th>
                                                        <th className="column-fixed">Case</th>
                                                        <th className="column-fixed">Envelope</th>
                                                        <th className="column-fixed">Lead Document</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filingLoading || caseLoading ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center">
                                                                Loading...
                                                            </td>
                                                        </tr>
                                                    ) : error ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center">
                                                                Error: {error}
                                                            </td>
                                                        </tr>
                                                    ) : currentFilings.length > 0 ? (
                                                        currentFilings.map((filing, index) => {
                                                            const envelopeId = filing.DocumentIdentification?.find(
                                                                (doc) => doc.Item?.Value === "ENVELOPEID"
                                                            )?.IdentificationID?.Value;

                                                            console.log(`Filing Envelope ID: ${envelopeId}`);

                                                            // Find the matching case with the same envelopeId
                                                            const matchingCase = caseData.find((caseItem) => {
                                                                //console.log(`Checking Case Envelope ID: ${caseItem.envelopeNo}`);
                                                                return caseItem.envelopeNo === envelopeId;
                                                            });

                                                            // Debugging Log: Check if matching case was found
                                                            console.log("Matching Case Found:", matchingCase);

                                                            return (
                                                                <tr key={index}>
                                                                    {/* Filing ID from Filing API */}
                                                                    {/* <td>
                                                                      {filing.DocumentIdentification?.find(
                                                                          (doc) => doc.Item?.Value === "FILINGID"
                                                                      )?.IdentificationID?.Value || " "}
                                                                  </td> */}

                                                                    {/* Filing ID from Case API (if matched by envelopeId) */}
                                                                    <td>
                                                                        <Link
                                                                            className="mt-3 text-decoration-none text-primary"
                                                                            to="/e-filing/initiateCaseSummary"
                                                                            state={{
                                                                                envelopeId: envelopeId || " ",
                                                                                filingId:
                                                                                    filing.DocumentIdentification?.find(
                                                                                        (doc) => doc.Item?.Value === "FILINGID"
                                                                                    )?.IdentificationID?.Value || "N/A",
                                                                                matchingFilingId: matchingCase ? matchingCase.filingID || "No Filing ID Found" : "No Match",
                                                                                filingStatus: filing.FilingStatus?.FilingStatusCode === "submitted"
                                                                                    ? "Pending"
                                                                                    : filing.FilingStatus?.FilingStatusCode || "Unknown Status", // Pass "Pending" if submitted
                                                                            }}
                                                                        >
                                                                            {matchingCase ? matchingCase.filingID || "No Filing ID Found" : "No Match"}
                                                                        </Link>
                                                                    </td>

                                                                    {/* Filing Status */}
                                                                    <td>
                                                                        {filing.FilingStatus?.FilingStatusCode === "submitted" ? (
                                                                            <>
                                                                                Pending <i aria-hidden="true" alt="Service In Process" className="fa fa-envelope theme" title="Service In Process"></i>
                                                                            </>
                                                                        ) : (
                                                                            filing.FilingStatus?.FilingStatusCode || " "
                                                                        )}
                                                                    </td>


                                                                    {/* Last Changed */}
                                                                    <td>
                                                                        {filing.DocumentReceivedDate?.Item?.Value
                                                                            ? formatDate(filing.DocumentReceivedDate.Item.Value)
                                                                            : " "}
                                                                    </td>

                                                                    {/* Case Number */}
                                                                    <td>
                                                                        {filing.CaseNumber?.Value && filing.CaseNumber?.Value !== "New" ? (
                                                                            <Link
                                                                                className="text-decoration-none text-primary"
                                                                                to="/e-filing/caseSummary"
                                                                                state={{
                                                                                    id: filing.CaseTrackingID?.Value,
                                                                                    courtlocation: filing.OrganizationIdentificationID?.Value,
                                                                                    filingId:
                                                                                        filing.DocumentIdentification?.find(
                                                                                            (doc) => doc.Item?.Value === "FILINGID"
                                                                                        )?.IdentificationID?.Value || "N/A",
                                                                                }}
                                                                            >
                                                                                {filing.CaseNumber?.Value}
                                                                            </Link>
                                                                        ) : (
                                                                            <span>New</span>
                                                                        )}
                                                                    </td>

                                                                    {/* Envelope ID (with Link) */}
                                                                    <td className="column-fixed">
                                                                        <Link
                                                                            className="mt-3 text-decoration-none text-primary"
                                                                            to="/e-filing/initiateCaseSummary"
                                                                            state={{
                                                                                envelopeId: filing.DocumentIdentification?.find(doc => doc.Item?.Value === "ENVELOPEID")?.IdentificationID?.Value || " ",
                                                                                filingId: filing.DocumentIdentification?.find(doc => doc.Item?.Value === "FILINGID")?.IdentificationID?.Value || "N/A",
                                                                                courtlocation: filing.OrganizationIdentificationID?.Value,
                                                                            }}
                                                                        >
                                                                            {envelopeId || " "}
                                                                        </Link>
                                                                    </td>

                                                                    {/* Lead Document */}
                                                                    <td>{filing.FilingCode?.Value || " "}</td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center">No filings found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Full-Screen Loader Overlay */}
                                    {filingLoading || caseLoading && (
                                        <div className="overlay">
                                            <div className="loader">
                                                <div className="spinner-border text-light" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Add margin at the bottom of the table to prevent overlap */}
                                    <div style={{ marginBottom: '60px' }}></div>

                                    {/* Pagination Controls Below the Table */}
                                    {Array.isArray(filteredFilings) && filteredFilings.length > 0 && totalPages > 1 && (
                                        <nav aria-label="Page navigation" className="custom-pagination mt-3">
                                            <ul className="pagination justify-content-center mb-0" style={{ gap: '6px' }}>

                                                {/* Previous */}
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        type="button" // ✅ Prevent form submit
                                                        className="page-link"
                                                        disabled={currentPage === 1}
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        style={{
                                                            color: currentPage === 1 ? '#6c757d' : '#000',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                        }}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>

                                                {/* Page Numbers */}
                                                {Array.from({ length: totalPages }, (_, index) => {
                                                    const page = index + 1;
                                                    const isActive = currentPage === page;
                                                    return (
                                                        <li key={page} className="page-item">
                                                            <button
                                                                type="button" // ✅ Prevent form submit
                                                                className="page-link"
                                                                onClick={() => handlePageChange(page)}
                                                                style={{
                                                                    backgroundColor: isActive ? '#6f2da8' : 'transparent',
                                                                    color: isActive ? '#fff' : '#000',
                                                                    borderRadius: '6px',
                                                                    border: 'none',
                                                                    fontWeight: isActive ? 600 : 400,
                                                                    padding: '4px 10px',
                                                                    minWidth: '32px',
                                                                    textAlign: 'center',
                                                                }}
                                                            >
                                                                {page}
                                                            </button>
                                                        </li>
                                                    );
                                                })}

                                                {/* Next */}
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        type="button" // ✅ Prevent form submit
                                                        className="page-link"
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        style={{
                                                            color: currentPage === totalPages ? '#6c757d' : '#000',
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                        }}
                                                    >
                                                        Next
                                                    </button>
                                                </li>

                                            </ul>
                                        </nav>

                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </WrapperTag>
    )
};

export default Status;