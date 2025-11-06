import React from 'react';
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ViewDocument = () => {
    const location = useLocation();
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const encodedFile = query.get("file");

        if (encodedFile) {
            const decodedFile = atob(decodeURIComponent(encodedFile));

            // Convert to Uint8Array
            const pdfBytes = new Uint8Array(decodedFile.length);
            for (let i = 0; i < decodedFile.length; i++) {
                pdfBytes[i] = decodedFile.charCodeAt(i);
            }

            // Create a Blob from the PDF bytes
            const blob = new Blob([pdfBytes], { type: "application/pdf" });

            // Generate a URL for the Blob
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        }
    }, [location.search]);

  return (
    <div>
         <section className="section-page col-9 col-md-9 col-xl-10 px-lg-10 mt-10">
            <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                <div className="d-flex mt-3 ">
                    <div className="me-auto">
                        <h1 className="fw-bold">View Document</h1>
                    </div>
                    <div className="d-flex initiate_case_sec_btn">
                        <button type="button" className="btn btn-link mx-2 mb-2 fw-bold"> 
                            Download
                        </button>      
                    </div>
                </div>
                <div>
                    {pdfUrl ? (
                    <>
                        <iframe
                            src={pdfUrl}
                            width="100%"
                            height="600px"
                            title="PDF Document"
                        ></iframe>
                        <br />
                        <a href={pdfUrl} download="document.pdf" style={{ fontSize: "18px" }}>
                            📥 Download PDF
                        </a>
                    </>
                    ) : (
                        <p>Loading PDF...</p>
                    )}
                </div>
            </div>
        </section>
    </div>
  )
}


export default ViewDocument
