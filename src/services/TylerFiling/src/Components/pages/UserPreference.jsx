import React, { useState, useEffect } from 'react';

const UserPreference = () => {

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

    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        <div className="row mt-3">
                            <div className="col-12">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">

                                    {/* Title - Always on Top Left */}
                                    <h1
                                        className="fw-normal mb-2 mb-md-0"
                                        style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                                    >
                                        User Preferences
                                    </h1>
                                </div>
                            </div>
                        </div>
                        {/* tip data */}

                        <div className="container mt-3 px-4 mb-4">
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
                                                <strong>Tip</strong> – Adjust these settings to control the behavior of Green Filing for
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* form data */}
                        <div className="col-12 col-md-9">
                            {[
                                "caseNum", "courtsys", "Dcourt", "DPlain", "fList", "screen", "selection",
                                "rate", "timeZone", "emailNotif", "searchPdf", "filingFee", "emailReceipt"
                            ].map((field, i) => {
                                const labelMap = {
                                    caseNum: "Default Case Description",
                                    courtsys: "Default Court System",
                                    Dcourt: "Default Court",
                                    DPlain: "Default Plaintiff",
                                    fList: "Default Filing List",
                                    screen: "Default Screen",
                                    selection: "Default Service Contact Selection",
                                    rate: "Filing Refresh Rate",
                                    timeZone: "User Time Zone",
                                    emailNotif: "Email Notification",
                                    searchPdf: "Convert to text Searchable PDF?",
                                    filingFee: "Auto Calculate Fees",
                                    emailReceipt: "Email Notification Receipted"
                                };

                                return (
                                    <div className="row mb-3" key={i}>
                                        <label htmlFor={field} className="col-sm-4 col-form-label fw-bold">
                                            {labelMap[field]}
                                        </label>
                                        <div className="col-sm-8">
                                            {field === "DPlain" ? (
                                                <>
                                                    <select className="form-select text-black-50" name="plaintiff" id="plaintiff">
                                                        <option value={1}>Select Plaintiff</option>
                                                        <option value={2}></option>
                                                        <option value={2}></option>
                                                    </select>
                                                    <div className="row mb-4 ms-2 mt-2">
                                                        <small>
                                                            Choose the saved contact to use as a default plaintiff whenever you start a new case filing.
                                                        </small>
                                                    </div>
                                                </>
                                            ) : field === "fList" ? (
                                                <>
                                                    <select className="form-select text-black-50" name="fList" id="fList">
                                                        <option value={1}>All filings I have access to</option>
                                                        <option value={2}></option>
                                                        <option value={2}></option>
                                                    </select>
                                                </>
                                            ) : field === "screen" ? (
                                                <>
                                                    <select className="form-select text-black-50" name="screen" id="screen">
                                                        <option value={1}>Dashboard</option>
                                                        <option value={2}>Filing Status</option>
                                                        <option value={2}></option>
                                                    </select>
                                                </>
                                            ) : field === "selection" ? (
                                                <>
                                                    <select className="form-select text-black-50" name="selection" id="selection">
                                                        <option value={1}>Selected</option>
                                                        <option value={2}></option>
                                                        <option value={2}></option>
                                                    </select>
                                                    <div className="row mb-4 ms-2 mt-2">
                                                        <small>
                                                            Select whether service contact should be defaulted as “Selected” or defaulted as “Unselected” during the Filing Process.
                                                        </small>
                                                    </div>
                                                </>
                                            ) : field === "rate" ? (
                                                <>
                                                    <select className="form-select text-black-50" name="rate" id="rate">
                                                        <option value="">Choose</option>
                                                        <option value="" />
                                                    </select>
                                                </>
                                            ) : field === "timeZone" ? (
                                                <>
                                                    <select className="form-select text-black-50" name="timeZone" id="timeZone">
                                                        <option value="">Pacific Time Zone</option>
                                                        <option value="" />
                                                    </select>
                                                </>
                                            ) : field === "emailNotif" ? (
                                                <>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="fStatus" defaultChecked="" />
                                                        <label className="form-check-label" htmlFor="fStatus">
                                                            Receive Filing Status (Accepted/Rejected) Emails
                                                        </label>
                                                    </div>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="fileAttach" defaultChecked="" />
                                                        <label className="form-check-label" htmlFor="fileAttach">
                                                            Include File Stamped Documents Attached
                                                        </label>
                                                    </div>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="Rpdf" />
                                                        <label className="form-check-label" htmlFor="Rpdf">
                                                            Include detailed filing Receipt Attached as PDF
                                                        </label>
                                                    </div>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="Spdf" />
                                                        <label className="form-check-label" htmlFor="Spdf">
                                                            Include Filing Statement Attached as PDF
                                                        </label>
                                                    </div>
                                                </>
                                            ) : field === "searchPdf" ? (
                                                <>
                                                    <select className="form-select text-black-50" name="searchPdf" id="searchPdf">
                                                        <option value="">No, do not auto-convert</option>
                                                        <option value="" />
                                                    </select>
                                                </>
                                            ) : field === "filingFee" ? (
                                                <>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="filingFee" />
                                                        <label className="form-check-label" htmlFor="filingFee">
                                                            Make this card available account-wide to pay filing fees.
                                                        </label>
                                                    </div>
                                                </>
                                            ) : field === "emailReceipt" ? (
                                                <>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="fAccept" />
                                                        <label className="form-check-label" htmlFor="fAccept">
                                                            Filing Accepted
                                                        </label>
                                                    </div>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="fReject" />
                                                        <label className="form-check-label" htmlFor="fReject">
                                                            Filing Rejected
                                                        </label>
                                                    </div>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="fSubmit" />
                                                        <label className="form-check-label" htmlFor="fSubmit">
                                                            Filing Submitted
                                                        </label>
                                                    </div>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="service" />
                                                        <label className="form-check-label" htmlFor="service">
                                                            Service Undeliverable
                                                        </label>
                                                    </div>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="sFailed" />
                                                        <label className="form-check-label" htmlFor="sFailed">
                                                            Filing Submission Failed
                                                        </label>
                                                    </div>
                                                    <div className="form-check mt-1">
                                                        <input className="form-check-input" type="checkbox" defaultValue="" id="receipt" />
                                                        <label className="form-check-label" htmlFor="receipt">
                                                            Filing Receipted
                                                        </label>
                                                    </div>
                                                </>
                                            ) : (
                                                <select
                                                    className="form-select"
                                                    style={{ border: "1px solid #ced4da" }}
                                                    name={field}
                                                    id={field}
                                                >
                                                    <option value="">Select Option</option>
                                                    {/* Add more options as needed */}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Save Button */}
                            <div className="row mb-4 justify-content-center">
                                <div className="col-12 d-flex justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-dark"
                                        style={{ maxWidth: "300px", height: "40px", width: "115px" }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </WrapperTag>
    )
}

export default UserPreference