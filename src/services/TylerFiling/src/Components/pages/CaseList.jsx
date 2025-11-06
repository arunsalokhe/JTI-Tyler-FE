import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Search from '../assets/search.png';

const CaseList = () => {
    const token = sessionStorage.getItem('access_token');
    const [caseLists, setCaseLists] = useState(null);
    const [loading, setLoading] = useState(false);
    const [caseDocketIds, setCaseDocketIds] = useState([]);
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

    const body = useMemo(() => ({
        CaseNumber: '17CECG00689',
    }), []);

    // useEffect(() => {
    //     const baseURL = process.env.REACT_APP_BASE_URL
    //     const fetchCases = async () => {
    //         try {
    //             //const response = await fetch(`${baseURL}/GetCaseList_Business`, {
    //             const response = await fetch('https://localhost:7207/api/Tyler/GetCaseList_Business', {
    //                 method: 'POST',
    //                 headers: {
    //                     'accept': '*/*',
    //                     "Authorization": `Bearer ${token}`,
    //                 }
    //             });

    //             const result = await response.json();

    //             if (result.success && result.data?.Case) {
    //                 const docketIds = result.data.Case.map(c => c.CaseDocketID?.Value).filter(Boolean);
    //                 setCaseDocketIds(docketIds);
    //             } else {
    //                 console.error('API response not successful:', result);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching cases:', error);
    //         }
    //     };

    //     fetchCases();
    // }, []);

    //this one use once case created
    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true);
    //         const baseURL = process.env.REACT_APP_BASE_URL;

    //         try {
    //             //const response = await fetch(`${baseURL}/GetCaseList`, {
    //             const response = await fetch('https://localhost:7207/api/Tyler/GetCaseList_Business', {
    //                 method: "POST",
    //                 //body: JSON.stringify(body),
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     "Content-type": "application/json; charset=UTF-8",
    //                 },
    //             });

    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! Status: ${response.status}`);
    //             }

    //             const data = await response.json();
    //             console.log("response:", data);
    //             setCaseLists(data);
    //         } catch (error) {
    //             console.error("Error fetching case list:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, [token, body]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const baseURL = process.env.REACT_APP_BASE_URL;

            try {
                const response = await fetch(`${baseURL}/GetCaseList`, {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        "Content-type": "application/json; charset=UTF-8",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("response:", data);
                setCaseLists(data);
            } catch (error) {
                console.error("Error fetching case list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, body]);

    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="container-fluid px-4 mt-3">
                    {/* Header & Search Bar */}
                    <div className="row align-items-center justify-content-between mb-3">
                        <div className="col-12 col-md-6 mb-2 mb-md-0">
                            <h1 className="fw-normal" style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}>
                                Case Lists
                            </h1>
                        </div>
                        <div className="col-12 col-md-6 d-flex justify-content-md-end">
                            <div className="w-100 position-relative" style={{ maxWidth: "100%" }}>
                                <div className="input-group" style={{ height: "32px", flexWrap: "nowrap" }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Filter Filings"
                                        aria-label="Filter Filings"
                                        style={{ flex: "1 1 auto", minWidth: "0" }}
                                    />
                                    <span className="input-group-text d-flex align-items-center justify-content-center">
                                        <i className="fa fa-search fa-fw"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <div
                                className="panel panel-success"
                                style={{
                                    backgroundColor: "#DDE3D4",
                                    borderColor: "#DDE3D4",
                                    padding: "10px",
                                    borderRadius: "5px",
                                }}
                            >
                                <div className="panel-body">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>
                                            <b>Filtered view ( All Cases )</b> - Click a case number to view case details, or click DELETE to remove the case.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Form */}
                    <div className="row justify-content-center mt-3">
                        <div className="col-12">
                            <form method="post">
                                <div className="card p-2 pagination-parent-pos">
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-striped table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Case Number</th>
                                                        <th>Case Title</th>
                                                        <th>Court Name</th>
                                                        <th>Client Matter No.</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {caseLists?.data?.Case?.map(item => {
                                                        const caseCourt =
                                                            item.CaseAugmentation?.CaseCourt?.OrganizationIdentification?.IdentificationID?.Value || "Unknown Court";
                                                        return (
                                                            <tr key={item.CaseTrackingID?.Value}>
                                                                <td>
                                                                    <Link
                                                                        className="mt-3"
                                                                        to="/e-filing/caseSummary"
                                                                        state={{
                                                                            id: item.CaseTrackingID?.Value,
                                                                            courtlocation: caseCourt
                                                                        }}
                                                                    >
                                                                        {item.CaseDocketID?.Value}
                                                                    </Link>
                                                                </td>
                                                                <td>{item.CaseTitleText?.Value}</td>
                                                                <td>{caseCourt}</td>
                                                                <td>{item.CaseTrackingID?.Value}</td>
                                                                <td></td>
                                                            </tr>
                                                        );
                                                    })}
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
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </WrapperTag>
    )
}

export default CaseList;