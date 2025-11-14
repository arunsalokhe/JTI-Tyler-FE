import React, { useState, useEffect } from 'react';

const CaseListReport = () => {

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
                            <div className="d-flex align-items-center justify-content-between align-items-center initiate_case_sec_btn pe-0">
                                <h1
                                    className="fw-normal"
                                    style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}
                                > Case List Report
                                </h1>
                            </div>
                        </div>
                        {/* tip data */}
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
                                                <strong>Tip</strong> – Use the form below to select your report criteria,
                                                than click <strong>Run Report</strong>.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form method="post">
                            <div className="row mt-2 gx-3 gy-4">
                                {/* LEFT SIDE: Input Fields */}
                                <div className="col-12 col-md-6">
                                    <div className="row mb-3">
                                        <label htmlFor="account" className="col-sm-4 col-form-label fw-bold">
                                            User
                                        </label>
                                        <div className="col-sm-8">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id=""
                                                placeholder="Account"
                                                defaultValue="Adidas Software"
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="output_type" className="col-sm-4 col-form-label fw-bold">
                                            Case List Option
                                        </label>
                                        <div className="col-sm-8">
                                            <select className=" form-select text-black-50" id="">
                                                <option value={1} selected="">Only my cases </option>
                                                <option value={2}> All cases </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="output_type" className="col-sm-4 col-form-label fw-bold" >
                                            Output Type
                                        </label>
                                        <div className="col-sm-8">
                                            <select className=" form-select text-black-50" id="output_type" >
                                                <option value={1} selected=""> HTML </option>
                                                <option value={2}> CSV </option>
                                                <option value={2}> PDF </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row my-4">
                                        <div className="col-12 text-center">
                                            <button type="submit" className="btn btn-dark btn-md">Run Report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                    </div>
                </div>
            </div>

        </WrapperTag>
    )
}

export default CaseListReport