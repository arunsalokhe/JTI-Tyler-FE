import React, { useState, useEffect } from 'react';

const FilingReport = () => {

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
                > Filing Activity Report
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
                        <strong>Tip</strong> – Use the form below to select your report criteria, than click run Report.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* form data */}
            <div className="row form-row justify-content-center mt-4">
              <div className="col-12">
                <form method="post">
                  <div className="card px-3 py-3">
                    <div className="card-body">
                      <div className="row">
                        {/* Left column */}
                        <div className="col-12 col-md-6">

                          {/* Account */}
                          <div className="row mb-3">
                            <label htmlFor="account" className="col-sm-4 col-form-label fw-bold">
                              Account
                            </label>
                            <div className="col-sm-8">
                              <input type="text" className="form-control border border-dark" id="account" placeholder="Account" />
                            </div>
                          </div>

                          {/* Range Type */}
                          <div className="row mb-3">
                            <label htmlFor="range_type" className="col-sm-4 col-form-label fw-bold">
                              Range Type
                            </label>
                            <div className="col-sm-8">
                              <select className="form-select border border-dark text-black" id="range_type">
                                <option value={1}>Current Billing Period</option>
                                <option value={2}>Past Month</option>
                                <option value={3}>Enter Specific Dates</option>
                                <option value={4}>Enter Invoice ID</option>
                                <option value={5}>Last Full Month</option>
                              </select>
                            </div>
                          </div>

                          {/* Court Systems */}
                          <div className="row mb-3">
                            <label className="col-sm-4 col-form-label fw-bold">Court Systems</label>
                            <div className="col-sm-8">
                              {[
                                "All Court Systems", "Orange County", "Placer County Courts",
                                "Los Angeles Civil Courts", "Madera Superior Court", "San Diego Civil",
                                "Los Angeles Civil Courts", "Madera Superior Court", "San Diego Civil"
                              ].map((label, i) => {
                                const id = `court_systems${i + 1}`;
                                return (
                                  <div key={id} className="form-check mb-2">
                                    <input
                                      className="form-check-input border border-dark"
                                      style={{ width: '1.0em', height: '1.0em' }}
                                      type="checkbox"
                                      id={id}
                                      name="court_systems"
                                    />
                                    <label className="form-check-label" htmlFor={id}>
                                      {label}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Start Date */}
                          <div className="row mb-3">
                            <label htmlFor="start_date" className="col-sm-4 col-form-label fw-bold">
                              Start Date
                            </label>
                            <div className="col-sm-8">
                              <input type="date" className="form-control border border-dark" id="start_date" />
                            </div>
                          </div>

                          {/* End Date */}
                          <div className="row mb-3">
                            <label htmlFor="end_date" className="col-sm-4 col-form-label fw-bold">
                              End Date
                            </label>
                            <div className="col-sm-8">
                              <input type="date" className="form-control border border-dark" id="end_date" />
                            </div>
                          </div>

                          {/* Invoice ID */}
                          <div className="row mb-3">
                            <label htmlFor="invoice_id" className="col-sm-4 col-form-label fw-bold">
                              Invoice ID
                            </label>
                            <div className="col-sm-8">
                              <input type="text" className="form-control border border-dark" id="invoice_id" placeholder="Invoice ID" />
                              <div className="form-check mt-2">
                                <input
                                  className="form-check-input border border-dark"
                                  style={{ width: '1.2em', height: '1.2em' }}
                                  type="checkbox"
                                  id="accountoption"
                                />
                                <label className="form-check-label" htmlFor="accountoption">
                                  <small>Include Imported Filing</small>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Output Type */}
                          <div className="row mb-3">
                            <label htmlFor="output_type" className="col-sm-4 col-form-label fw-bold">
                              Output Type
                            </label>
                            <div className="col-sm-8">
                              <select className="form-select border border-dark text-black" id="output_type">
                                <option value={1}>HTML</option>
                                <option value={2}>CSV</option>
                                <option value={3}>PDF</option>
                              </select>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="col-12 text-center mt-4">
                            <button type="submit" className="btn btn-dark px-4">Run Report</button>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>


          </div>
        </div>
      </div>
    </WrapperTag>
  )
}

export default FilingReport;