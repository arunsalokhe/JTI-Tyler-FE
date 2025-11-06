import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Trash from '../assets/trash.png';
import Select from 'react-select';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import LoaderPopup from './LoaderPopup';
import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Correct way to set the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
).toString();

function EditForm() {
    const token = sessionStorage.getItem('access_token');
    const navigate = useNavigate();
    const location = useLocation();

    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
    const [selectedCaseTypeId, setselectedCaseTypeId] = useState(null);
    const [selectedCaseCategoryId, setSelectedCaseCategoryId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [cases, setCases] = useState([]);
    const [loadingCases, setLoadingCases] = useState(false);
    // Security types for selected document type
    const [securityOptions, setSecurityOptions] = useState([]);
    const [documentType, setDocumentType] = useState([]);
    const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
    const [loadingOptionalServices, setLoadingOptionalServices] = useState(false);
    const [optionalServicesOptions, setOptionalServicesOptions] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    // State for Party Types
    const [selectedCaseType, setSelectedCaseType] = useState(null);
    const [selectedParties, setSelectedParties] = useState([]);
    const [selectedPartiesForAPI, setSelectedPartiesForAPI] = useState([]);
    const [partiesForApi, setPartiesForApi] = useState([]);
    const [partyTypes, setPartyTypes] = useState([]);
    const [removedParties, setRemovedParties] = useState([]);
    const [localParties, setLocalParties] = useState([]);
    const [selectedPartyType, setSelectedPartyType] = useState(null);
    const [suffixOptions, setSuffixOptions] = useState([]);
    const [attorneys, setAttorneys] = useState([]);
    const [error, setError] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [isSaved, setIsSaved] = useState([]);

    //service conatct list 
    const [show, setShow] = useState(false);
    const [contactList, setContactList] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedContactList, setSelectedContactList] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('from-my-firm');
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [searchFilters, setSearchFilters] = useState({
        firstName: '',
        lastName: '',
        firmName: '',
    });
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // for discard button popup
    const [showDiscardButton, setShowDiscardButton] = useState(false);
    const handleCloseDiscard = () => setShowDiscardButton(false);
    const handleShowDiscardButton = () => setShowDiscardButton(true);

    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [allowanceCharges, setAllowanceCharges] = useState([]);
    const [caseInitiationFee, setCaseInitiationFee] = useState(null);
    const [otherFees, setOtherFees] = useState([]);
    const [feesCalculationAmount, setFeesCalculationAmount] = useState("0.00 USD");
    const [feedata, setFeeData] = useState(null);
    const [feesdata, setFeesData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const { caseId, filingID } = location.state || {};
    const [draftValues, setDraftValues] = useState({
        documents: [], parties: [], selectedParties: []
    });
    const [validationSchema, setValidationSchema] = useState();
    const [loadingCount, setLoadingCount] = useState(0);

    const startLoading = () => setLoadingCount((prev) => prev + 1);
    const stopLoading = () => setLoadingCount((prev) => Math.max(0, prev - 1));
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



    //API to fetch filing draft details by Id
    useEffect(() => {
        const baseURL = process.env.REACT_APP_BASE_URL;

        if (!caseId) return;

        const fetchCaseDetails = async () => {
            startLoading();
            try {
                const response = await fetch(`${baseURL}/GetCaseDraftDetails/${caseId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Get Case Draft Details", data.selectedCategory);

                const formattedParties = Array.isArray(data.parties)
                    ? data.parties.map((party) => ({
                        id: party.id,
                        selectedPartyType: party.selectedPartyType,
                        roleType: party.roleType,
                        lastName: party.lastName || "",
                        firstName: party.firstName || "",
                        middleName: party.middleName || "",
                        suffix: party.suffix || "",
                        companyName: party.companyName || "",
                        address: party.address || "",
                        address2: party.address2 || "",
                        city: party.city || "",
                        state: party.state || "",
                        zip: party.zip || "",
                        addressUnknown: party.addressUnknown || false,
                        internationalAddress: party.internationalAddress || "",
                        saveToAddressBook: party.saveToAddressBook || false,
                        selectedAttorney: party.selectedAttorney || "",
                        envelopeNo: party.envelopeNo || "",
                        selectedBarNumbers: party.selectedBarNumbers || [],
                    }))
                    : [];

                const formattedSelectedParties = Array.isArray(data.selectedParties)
                    ? data.selectedParties.map((party) => ({
                        partyName: party.partyName,
                        partyType: party.partyType,
                        role: party.role,
                    }))
                    : [];

                // Process all documents to calculate file size, page count, and optional service fees
                const processedDocuments = await Promise.all(
                    (data.documents || []).map(async (doc) => {
                        const selectedDocType = documentType.find(
                            (option) => String(option.value) === String(doc.documentType)
                        );

                        // Initialize document with base values
                        let processedDoc = {
                            id: doc.id,
                            caseId: doc.caseId,
                            documentType: selectedDocType?.value || doc.documentType,
                            documentDescription: doc.documentDescription || "",
                            fileName: doc.fileName || "",
                            fileBase64: doc.fileBase64 || "",
                            securityTypes: doc.securityTypes || "",
                            fee: doc.fee || 0.00,
                            optionalServicesSelections: doc.optionalServices?.map((service) => ({
                                value: service.optionalServiceId,
                                label: service.label || "",
                                fee: service.fee || 0,
                                multiplier: service.multiplier ?? false,
                                Quantity: service.multiplier
                                    ? Math.max(1, service.quantity || 1) // If multiplier exists, use at least 1
                                    : 0, // Keep original value or set null
                            })) || [],
                        };

                        // let processedDoc = {
                        //     id: doc.id,
                        //     caseId: doc.caseId,
                        //     documentType: selectedDocType?.value || doc.documentType,
                        //     documentDescription: doc.documentDescription || "",
                        //     fileName: doc.fileName || "",
                        //     fileBase64: doc.fileBase64 || "",
                        //     securityTypes: doc.securityTypes || "",
                        //     fee: doc.fee || 0.00,
                        //     optionalServicesSelections: doc.optionalServices?.map(service => ({
                        //         value: service.optionalServiceId,
                        //         Quantity: service.quantity || 1,
                        //         fee: (service.fee * (service.quantity || 1)).toFixed(2), // Calculate fee based on quantity
                        //         label: service.label
                        //     })) || []
                        // };

                        // If fileBase64 exists, calculate file size and number of pages
                        if (doc.fileBase64) {
                            const { fileSize, numPages } = await processBase64PDF(doc.fileBase64);
                            processedDoc = { ...processedDoc, fileSize, numPages };
                        }

                        return processedDoc;
                    })
                );

                setDraftValues({
                    Id: data.id || null,
                    selectedCourt: data.selectedCourt || "",
                    selectedCategory: data.selectedCategory || "",
                    selectedCaseType: data.selectedCaseType || "",
                    courtLocation: data.courtLocation || "",
                    caseTrackingID: data.caseTrackingID || "",
                    paymentAccount: data.paymentAccount || "",
                    noteToClerk: data.noteToClerk || "",
                    createdBy: data.createdBy || "",
                    selectedAttorneySec: data.selectedAttorneySec || "",
                    courtesyemail: data.courtesyemail || "",
                    caseNumber: data.caseNumber || "",
                    caseTitle: data.caseTitle || "",
                    courtLocation: data.courtLocation || "",
                    caseTrackingID: data.caseTrackingID,
                    isExistingCase: true,
                    documents: processedDocuments,
                    parties: formattedParties,
                    selectedParties: formattedSelectedParties,
                });

                setLoading(false);
            } catch (err) {
                setError(err.message);
            } finally {
                stopLoading();
            }
        };

        fetchCaseDetails();
    }, [caseId]);  // ✅ Now fetch runs ONLY when caseId changes



    // Function to process base64 PDF
    const processBase64PDF = async (base64) => {
        try {
            const binaryData = atob(base64);
            const byteArray = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                byteArray[i] = binaryData.charCodeAt(i);
            }

            // Calculate File Size (KB)
            const fileSize = (byteArray.length / 1024).toFixed(2);

            // Load PDF using pdf.js
            const loadingTask = pdfjsLib.getDocument({ data: byteArray });
            const pdf = await loadingTask.promise;

            return { fileSize, numPages: pdf.numPages };
        } catch (error) {
            console.error("Error processing PDF:", error);
            return { fileSize: "N/A", numPages: "N/A" };
        }
    };


    // Fetch court location 
    useEffect(() => {
        setLoading(true);
        const baseURL = process.env.REACT_APP_BASE_URL;
        // court location api
        fetch(`${baseURL}/GetCourtLocations`)
            .then((response) => response.json())
            .then((data) => {
                const formattedCourts = data.map((court) => ({
                    value: court.code,
                    label: court.name,
                }));
                setCourts(formattedCourts);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching court data:', error);
                setLoading(false);
            });
    }, []);

    // Fetch court type categories on component
    useEffect(() => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        // court categories api
        fetch(`${baseURL}/GetCategoty`)
            .then((response) => response.json())
            .then((data) => {
                const formattedCategories = data.map((cat) => ({
                    value: cat.code,
                    label: cat.name,
                }));
                setCategories(formattedCategories);
            })
            .catch((error) => console.error('Error fetching categories:', error));
    }, []);

    // Fetch cases when the selected category changes
    useEffect(() => {
        if (draftValues?.selectedCategory) {

            setLoadingCases(true);

            const baseURL = process.env.REACT_APP_BASE_URL;
            // case type api
            fetch(`${baseURL}/GetCaseType?categoryId=${draftValues.selectedCategory}`)
                .then((response) => response.json())
                .then((data) => {
                    const formattedCases = data.map((c) => ({
                        value: c.code,
                        label: c.name,
                    }));
                    setCases(formattedCases);
                })
                .catch((error) => {
                    console.error("Error fetching cases:", error);
                    setLoading(false);
                });
        }
    }, [draftValues.selectedCategory]);


    // Fetch document of case type when the selected category changes
    useEffect(() => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        const categoryId = selectedCaseCategoryId || draftValues.selectedCategory;

        if (!categoryId) {
            setDocumentType([]);
            return;
        }
        setLoadingDocumentTypes(true);

        // Construct API URL
        let apiUrl = `${baseURL}/GetFilingCode?categoryId=${categoryId}`;

        if (selectedCaseTypeId) {
            apiUrl += `&caseTypeId=${selectedCaseTypeId}`;
        }

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const formattedDocumentTypes = data.map((docType) => ({
                    value: String(docType.code),
                    label: docType.name,
                    description: docType.description || docType.name,
                    fee: Number(docType.fee) || 0,
                }));
                setDocumentType(formattedDocumentTypes);

            })
            .catch((error) => {
                console.error("Error fetching document types:", error);
            })
            .finally(() => {
                setLoadingDocumentTypes(false);
            });

    }, [selectedCaseCategoryId, draftValues.selectedCategory, selectedCaseTypeId]);

    // Runs when searched case category OR draft category OR case type changes


    // Fetch security options
    useEffect(() => {
        if (!draftValues.documents?.length) return;

        draftValues.documents.forEach((document, index) => {
            if (document.documentType) {
                fetchSecurityOptions(document.documentType, index);
            }
        });
    }, [draftValues.documents]);

    //security API
    const fetchSecurityOptions = async (filingCode, index) => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        try {
            const response = await fetch(`${baseURL}/GetDocumentCode?filingcode=${filingCode}`);
            if (!response.ok) throw new Error(`Failed to fetch security types`);

            const data = await response.json();
            const formattedSecurityTypes = data.map((securityType) => ({
                value: String(securityType.code),
                label: securityType.name,
            }));

            setSecurityOptions((prev) => ({
                ...prev,
                [index]: formattedSecurityTypes,
            }));

        } catch (error) {
            console.error("Error fetching security types:", error);
        }
    };

    //fetch api for optional services of court
    useEffect(() => {
        if (!draftValues.documents?.length) return;

        draftValues.documents.forEach((document, index) => {
            if (document.documentType) {
                fetchOptionalServices(document.documentType, index);
            }
        });
    }, [draftValues.documents]);

    //api for optional services of court
    const fetchOptionalServices = async (filingCode, index) => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        setLoadingOptionalServices(true);
        try {
            const response = await fetch(`${baseURL}/GetCourtOptionalServices?filingcode=${filingCode}`);
            if (!response.ok) throw new Error(`Failed to fetch optional services`);

            const data = await response.json();
            const formattedOptionalServices = data.map((service) => ({
                value: String(service.code),
                label: service.name,
                multiplier: service.multiplier || false,
                fee: Number(service.fee) || 0,
            }));

            setOptionalServicesOptions((prev) => ({
                ...prev,
                [index]: formattedOptionalServices,
            }));


        } catch (error) {
            console.error("Error fetching optional services:", error);
        } finally {
            setLoadingOptionalServices(false);
        }
    };

    // Fetch Party Types When Case Type Changes
    useEffect(() => {
        const caseTypeId = selectedCaseTypeId?.value || selectedCaseTypeId || draftValues?.selectedCaseType;

        if (caseTypeId) {
            const baseURL = process.env.REACT_APP_BASE_URL;

            fetch(`${baseURL}/GetPartyTypeCode?caseTypeId=${caseTypeId}`)
                .then((response) => response.json())
                .then((data) => {
                    const formattedPartyTypes = data.map((partyType) => ({
                        value: partyType.code,
                        label: partyType.name,
                    }));
                    setPartyTypes(formattedPartyTypes);
                    setSelectedPartyType(null); // Reset Party Type selection
                })
                .catch((error) => console.error('Error fetching party types:', error));
        } else {
            setPartyTypes([]); // Clear Party Types if no Case Type is selected
        }
    }, [selectedCaseTypeId, draftValues?.selectedCaseType]);


    // Fetch suffix options from the API
    useEffect(() => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        const fetchSuffixOptions = async () => {
            try {
                const response = await fetch(`${baseURL}/GetCourtNameSuffixCode`);
                const data = await response.json();
                setSuffixOptions(data); // Assume `data` is an array of suffix strings
            } catch (error) {
                console.error("Error fetching suffix options:", error);
            }
        };
        fetchSuffixOptions();
    }, []);


    // Fetch attorney data or list
    useEffect(() => {
        const fetchGetAllAttorneys = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                const response = await fetch(`${baseURL}/GetAttorneyList`,
                    {
                        method: "POST",
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            "Content-Type": 'application/json',
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    // console.log("Response data:", data);

                    // Extract the attorneys array
                    if (data?.data?.Attorney && Array.isArray(data.data.Attorney)) {
                        const options = data.data.Attorney.map((attorney) => ({
                            value: attorney.AttorneyID,
                            label: `${attorney.FirstName} ${attorney.MiddleName ? attorney.MiddleName + ' ' : ''}${attorney.LastName} 
                        (Bar No: ${attorney.BarNumber})`,
                            barNumber: attorney.BarNumber,
                        }));
                        setAttorneys(options);

                    } else {
                        setError("No attorneys found or unexpected data format.");
                    }
                } else {
                    setError(`Error: ${response.statusText}`);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setError("Failed to fetch attorneys.");
            }

        }
        fetchGetAllAttorneys();
    }, [token]);

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

    // Fetch payment accounts with token authentication
    useEffect(() => {
        const fetchPaymentAccounts = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                const response = await fetch(`${baseURL}/GetPaymentAccountList`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch payment accounts");
                }

                const data = await response.json();
                // console.log("API Response:", data);
                if (data && data.data && Array.isArray(data.data.PaymentAccount)) {
                    setPaymentAccounts(data.data.PaymentAccount);  // Set the PaymentAccount array
                } else {
                    console.error("Invalid data structure: PaymentAccount is not an array inside 'data'");
                }
            } catch (error) {
                console.error("Error fetching payment accounts:", error);
            }
        };

        fetchPaymentAccounts();
    }, [token]);

    const paymentAccountOptions = paymentAccounts.map((account) => ({
        value: account.PaymentAccountID,
        label: account.AccountName,
    }));


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Update both Formik & Draft Values
        formik.setFieldValue(name, value);
        formik.setFieldTouched(name, true);
        setDraftValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle Dropdown Changes
    const handleSelectChange = (selectedOption, field) => {
        const value = selectedOption ? selectedOption.value : "";

        console.log("Selected value before state update:", value);


        // Update Formik state
        formik.setFieldValue(field, value);
        formik.setFieldTouched(field, true);

        // Update draftValues state
        setDraftValues((prev) => ({
            ...prev,
            [field]: value, // Ensure it updates here
        }));

        console.log("Selected value after state update:", value);
    };




    //handle to change document
    const handleDocumentTypeChange = async (selectedOption, index) => {
        if (!selectedOption) return;

        console.log("Selected Document Type:", selectedOption); // Debugging

        // Update `draftValues`
        setDraftValues((prev) => ({
            ...prev,
            documents: prev.documents.map((doc, i) =>
                i === index
                    ? {
                        ...doc,
                        documentType: String(selectedOption.value), // Ensure it's stored as a string
                        documentDescription: selectedOption.label || "",
                        fee: selectedOption.fee || 0,
                    }
                    : doc
            ),
        }));

        // Update Formik values
        formik.setFieldValue(`documents[${index}].documentType`, String(selectedOption.value));
        formik.setFieldValue(`documents[${index}].documentDescription`, selectedOption.label || "");
        formik.setFieldValue(`documents[${index}].fee`, selectedOption.fee || 0);

        // Fetch related services if a document type is selected
        if (selectedOption.value) {
            await fetchSecurityOptions(String(selectedOption.value), index);
            await fetchOptionalServices(String(selectedOption.value), index);
        }
    };


    useEffect(() => {
        if (document?.fileBase64 && document?.fileName) {
            setUploadedFile(document.fileName);
        }
    }, [document]);


    // function to convert file to Base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]); // Extract only the Base64 part
            reader.onerror = (error) => reject(error);
        });
    };

    // file upload functionality
    const handleFileChange = async (event, index) => {
        if (!event?.target?.files?.[0]) {
            console.error("No file selected");
            return;
        }

        const file = event.target.files[0];
        try {
            const base64String = await convertToBase64(file);
            const fileSizeKB = (file.size / 1024).toFixed(1); // Convert size to KB
            const fileURL = URL.createObjectURL(file);

            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = async function () {
                try {
                    const pdfData = new Uint8Array(fileReader.result);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    const pageCount = pdf.numPages;

                    // Update draft state (which updates Formik via enableReinitialize)
                    setDraftValues((prev) => {
                        const updatedDocs = [...prev.documents];
                        updatedDocs[index] = {
                            ...updatedDocs[index],
                            fileName: file.name,
                            fileBase64: base64String,
                            fileSize: fileSizeKB,
                            pageCount: pageCount,
                            fileURL: fileURL,
                        };
                        return { ...prev, documents: updatedDocs };
                    });

                    handleAutoSave(index); // Auto-save if needed
                } catch (error) {
                    console.error("Error processing PDF:", error);
                }
            };
        } catch (error) {
            console.error("Error converting file to Base64:", error);
        }
    };


    //handle to view pdf files
    const handleOpenPDF = (document) => {
        if (document.fileBase64) {
            const binaryString = atob(document.fileBase64);
            const pdfBytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                pdfBytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            // Open in new tab
            const newTab = window.open(url, "_blank");

            // Revoke URL after opening (to free memory)
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    };

    //handle for autoSave file
    const handleAutoSave = (index) => {
        setIsSaved((prevState) => {
            const updatedState = [...prevState];
            updatedState[index] = true;
            return updatedState;
        });

        setEditIndex(null);
        // console.log(`Auto-saved document at index ${index}`);
    };


    //handle to edit rows for documents
    const handleEdit = (index, e) => {
        e.preventDefault();
        setEditIndex(index);
        setIsSaved((prevState) => {
            const updatedState = [...prevState];
            updatedState[index] = false;
            return updatedState;
        });
    };

    // Handle saving
    const handleSave = (index, e) => {
        e.preventDefault();
        setIsSaved((prevState) => {
            const updatedState = [...prevState];
            updatedState[index] = true;
            return updatedState;
        });
        setEditIndex(null);
    };

    // Handle canceling edit
    const handleCancel = (e) => {
        e.preventDefault();
        setEditIndex(null);
    };

    // Handle deleting a document
    const handleDelete = (index, e) => {
        e.preventDefault();
        setDeleteIndex(index);
    };

    // Confirm delete
    const handleConfirmDelete = () => {
        const updatedDocuments = formik.values.documents.filter((_, i) => i !== deleteIndex);
        // Update formik state
        formik.setFieldValue("documents", updatedDocuments);

        // Update draftValues state
        setDraftValues((prev) => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== deleteIndex),
        }));

        setDeleteIndex(null);
    };

    // Cancel delete
    const handleCancelDelete = (e) => {
        e.preventDefault();
        setDeleteIndex(null);
    };

    const handleAddDocument = () => {
        const newDocument = {
            documentType: "",
            documentDescription: "",
            fileName: "",
            fileBase64: "",
            securityType: [],
            optionalServicesSelections: [{ Quantity: null, }],

        };
        setDraftValues(prev => ({
            ...prev,
            documents: [...prev.documents, newDocument]
        }));
    };

    const handleOptionalServiceChange = (selectedOption, docIndex, serviceIndex) => {
        setDraftValues((prev) => {
            const updatedDocs = prev.documents.map((doc, i) =>
                i === docIndex
                    ? {
                        ...doc,
                        optionalServicesSelections: doc.optionalServicesSelections.map((service, sIndex) =>
                            sIndex === serviceIndex
                                ? {
                                    ...service,
                                    value: selectedOption.value || "",
                                    label: selectedOption.label,
                                    multiplier: selectedOption.multiplier,
                                    fee: Number(selectedOption.fee) || 0,
                                    Quantity: service.Quantity ?? (selectedOption.multiplier ? 1 : null), // If no cost, hide it
                                }
                                : service
                        ),
                    }
                    : doc
            );
            return { ...prev, documents: updatedDocs };
        });
    };

    // Function to add an optional service to a document
    const handleAddOptionalService = (docIndex) => {
        setDraftValues((prev) => ({
            ...prev,
            documents: prev.documents.map((doc, i) =>
                i === docIndex
                    ? {
                        ...doc,
                        optionalServicesSelections: [
                            ...(doc.optionalServicesSelections || []),
                            { value: "", label: "", multiplier: null, Quantity: null },
                        ],
                    }
                    : doc
            ),
        }));
    };

    // Function to remove an optional service from a document
    const handleRemoveOptionalService = (docIndex, serviceIndex) => {
        setDraftValues((prev) => ({
            ...prev,
            documents: prev.documents.map((doc, i) =>
                i === docIndex
                    ? {
                        ...doc,
                        optionalServicesSelections: doc.optionalServicesSelections.filter((_, idx) => idx !== serviceIndex),
                    }
                    : doc
            ),
        }));
    };

    // Function to handle quantity input changes
    const handleQuantityChange = (quantity, docIndex, serviceIndex) => {
        setDraftValues((prev) => ({
            ...prev,
            documents: prev.documents.map((doc, i) =>
                i === docIndex
                    ? {
                        ...doc,
                        optionalServicesSelections: doc.optionalServicesSelections.map((service, sIndex) =>
                            sIndex === serviceIndex
                                ? {
                                    ...service,
                                    Quantity: quantity,
                                }
                                : service
                        ),
                    }
                    : doc
            ),
        }));
    };


    //parties to store locally so table won't get affected
    useEffect(() => {
        if (Array.isArray(draftValues?.parties)) {
            // Deep copy each party so changes do not reflect in draftValues
            setLocalParties(draftValues.parties.map(party => ({ ...party })));
        }
    }, [draftValues.parties]);

    //handle to update parties fields
    const updatePartyField = (id, field, value) => {
        setDraftValues(prev => {
            const updateParty = party => party.id === id ? { ...party, [field]: value } : party;
            return {
                ...prev,
                parties: prev.parties.map(updateParty),
                selectedParties: prev.selectedParties.map(updateParty)
            };
        });
        // Update Formik state for validation
        formik.setFieldValue(`parties.${id}.${field}`, value);
        formik.setFieldTouched(`parties.${id}.${field}`, true);
    };

    // Handle Party Type change
    const handlePartyTypeChange = (id, event) => {
        updatePartyField(id, "selectedPartyType", event.target.value);
    };

    //handle to add new party
    const handleAddParty = () => {
        const newParty = {
            id: Date.now(),
            roleType: "1",
            selectedPartyType: "",
            firstName: "",
            lastName: "",
            companyName: "",
            isChecked: false,
            suffix: "",
            selectedAttorney: "",
            selectedBarNumbers: [],
            Address: "",
            Address2: "",
            City: "",
            State: "",
            Zip: "",
            internationalAddress: "",
        };

        setDraftValues(prev => ({
            ...prev,
            parties: [...prev.parties, newParty],
        }));
        formik.setFieldValue("parties", [...formik.values.parties, newParty]);
        formik.setFieldValue("selectedParties", [...formik.values.selectedParties, newParty]);
    };

    // Remove a party
    const handleRemoveClick = (id) => {
        setDraftValues(prev => {
            return {
                ...prev,
                parties: prev.parties.filter(p => p.id !== id),
                selectedParties: prev.selectedParties.filter(p => p.id !== id)
            };
        });
    };

    //handle attorney Change
    const handleAttorneyChange = (partyId, selectedOption) => {
        const value = selectedOption ? selectedOption.value : "";
        setDraftValues((prev) => ({
            ...prev,
            parties: prev.parties.map((party) =>
                party.id === partyId
                    ? { ...party, selectedAttorney: selectedOption ? selectedOption.value : "" }
                    : party
            ),
            selectedParties: prev.selectedParties.map((party) =>
                party.id === partyId
                    ? { ...party, selectedAttorney: selectedOption ? selectedOption.value : "" }
                    : party
            ),
        }));
        formik.setFieldValue(`parties.${partyId}.selectedAttorney`, value);
    };


    // Handle Bar Number Selection
    const handleBarNumberChange = (id, selectedOptions) => {
        const selectedBarNumbers = selectedOptions.map(option => option.value);

        setDraftValues((prev) => ({
            ...prev,
            parties: prev.parties.map((party) =>
                party.id === id ? { ...party, selectedBarNumbers } : party
            ),
        }));
    };

    // Sync selectedParties whenever parties change
    useEffect(() => {
        setDraftValues(prev => ({
            ...prev,
            selectedParties: prev.parties.map(party => ({
                id: party.id,
                partyName: party.roleType === "2" ? party.companyName : `${party.firstName} ${party.lastName}`.trim(),
                partyType: party.selectedPartyType === "17088" ? "Plantiff" : "Defendant",
                role: party.roleType,

            }))
        }));
    }, [draftValues.parties]);

    // Handle role type change
    const handleRoleTypeChange = (id, event) => {
        const newRoleType = event.target.value;

        setDraftValues(prev => {
            const updateParty = (party) =>
                party.id === id
                    ? {
                        ...party,
                        roleType: newRoleType,
                        firstName: newRoleType === "2" ? "" : party.firstName,
                        lastName: newRoleType === "2" ? "" : party.lastName,
                        companyName: newRoleType === "1" ? "" : party.companyName
                    }
                    : party;

            return {
                ...prev,
                parties: prev.parties.map(updateParty),
                selectedParties: prev.selectedParties.map(updateParty),
            };
        });
        formik.setFieldValue(`parties.${id}.roleType`, newRoleType);
    };

    //handle to change input
    const handlePartyInputChange = (id, field, value) => {
        setDraftValues((prev) => {
            const updatedParties = prev.parties.map((party) => {
                if (party.id === id) {
                    const updatedParty = { ...party, [field]: value };

                    if (updatedParty.roleType === '2' && field === 'companyName') {
                        updatedParty.firstName = value;
                        updatedParty.lastName = value;
                    }

                    return updatedParty;
                }
                return party;
            });

            const updatedSelectedParties = prev.selectedParties.map((party) =>
                party.id === id
                    ? {
                        ...party,
                        [field]: value,
                        ...(field === "companyName" && updatedParties.find(p => p.id === id)?.roleType === "2"
                            ? { firstName: value, lastName: value }
                            : {})
                    }
                    : party
            );

            return {
                ...prev,
                parties: updatedParties,
                selectedParties: prev.caseNumber ? prev.selectedParties : updatedSelectedParties,
            };
        });
    };

    // Handle suffix change
    const handleSuffixChange = (id, event) => {
        const newSuffix = event.target.value;

        setDraftValues((prev) => ({
            ...prev,
            parties: prev.parties.map((party) =>
                party.id === id ? { ...party, suffix: newSuffix } : party
            ),
        }));
    };

    //company name hanfler
    const handleCompanyNameChange = (id, value) => {
        setDraftValues((prev) => {
            const updatedParties = prev.parties.map((party) =>
                party.id === id
                    ? {
                        ...party,
                        companyName: value,
                        firstName: party.roleType === "2" ? value : party.firstName,
                        lastName: party.roleType === "2" ? value : party.lastName
                    }
                    : party
            );

            return {
                ...prev,
                parties: updatedParties,
                selectedParties: prev.selectedParties.map((party) =>
                    party.id === id
                        ? {
                            ...party,
                            companyName: value,
                            firstName: party.roleType === "2" ? value : party.firstName,
                            lastName: party.roleType === "2" ? value : party.lastName
                        }
                        : party
                ),
            };
        });
    };

    // Handle individual row checkbox change
    const handleRowCheckboxChange = (id) => {
        setDraftValues(prev => {
            const updatedSelectedParties = prev.selectedParties.map(party =>
                party.id === id ? { ...party, isChecked: !party.isChecked } : party
            );
            formik.setFieldValue("selectedParties", updatedSelectedParties);
            return {
                ...prev,
                selectedParties: updatedSelectedParties
            };
        });
    };

    // Handle "Select All" checkbox change
    const handleSelectAllChange = () => {
        setDraftValues((prev) => {
            const updatedSelectAll = !selectAll;
            setSelectAll(updatedSelectAll);

            const updatedParties = prev.selectedParties.map((party) => ({
                ...party,
                isChecked: updatedSelectAll,
            }));
            formik.setFieldValue("selectedParties", updatedParties);
            return { ...prev, selectedParties: updatedParties };
        });
    };


    //select all for subsequent selectedParties
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        const updatedParties = combinedParties.map((party) => ({
            ...party,
            isChecked: newSelectAll,
        }));

        setSelectedParties(updatedParties);
        formik.setFieldValue("selectedParties", updatedParties);
        formik.setTouched({ selectedParties: true });

        console.log("Toggling Select All:", newSelectAll);
        console.log("Updated Selected Parties:", updatedParties);

    };

    // Automatically update API data when `selectedParties` changes
    useEffect(() => {
        if (!selectedParties || selectedParties.length === 0) return;

        const selectedItems = selectedParties.filter((party) => party.isChecked);

        const mappedParties = selectedItems.map((party) => ({
            partyName: party.roleType === '1'
                ? `${party.firstName || ''}${party.lastName || ''}`.trim().replace(/\s/g, '')
                : (party.companyName || '').replace(/\s/g, ''),
            partyType: party.selectedPartyType,
            role: party.roleType,
        }));

        setSelectedPartiesForAPI(mappedParties);
        console.log("Mapped parties for API:", mappedParties);
    }, [selectedParties]);

    // Handle individual row checkbox for parties
    const handleRowCheckboxParties = (partyId) => {
        console.log("Checkbox Change Triggered for Party ID:", partyId);

        setSelectedParties((prevSelected) => {
            let updatedSelectedParties = prevSelected.map((party) =>
                party.id === partyId ? { ...party, isChecked: !party.isChecked } : party
            );

            // Ensure newly selected parties are added
            if (!updatedSelectedParties.some((p) => p.id === partyId)) {
                const newParty = draftValues.parties.find((party) => party.id === partyId);
                if (newParty) {
                    updatedSelectedParties.push({ ...newParty, isChecked: true });
                }
            }

            // **Filter only selected parties**
            const selectedItems = updatedSelectedParties.filter((party) => party.isChecked);

            // **Prepare selected parties for API**
            const selectedPartiesForAPI = selectedItems.map((party) => ({
                partyName: party.roleType === '1'
                    ? `${party.firstName || ''} ${party.lastName || ''}`.trim()
                    : (party.companyName || `${party.firstName || ''} ${party.lastName || ''}`).trim(),
                partyType: party.selectedPartyType || 'Unknown',
                role: party.roleType || 'Unknown',
            }));

            // **Prepare full party details for API**
            const preparePartiesForApi = (partyList) => partyList.map((party) => ({
                selectedPartyType: party.selectedPartyType,
                roleType: party.roleType,
                lastName: party.lastName || '',
                firstName: party.firstName || '',
                middleName: party.middleName || 'N/A',
                suffix: party.suffix || '',
                companyName: party.companyName || '',
                address: party.address || '',
                address2: party.address2 || '',
                city: party.city || '',
                state: party.state || '',
                zip: party.zip || '',
                addressUnknown: !party.address,
                internationalAddress: party.internationalAddress,
                saveToAddressBook: true,
                selectedAttorney: party.selectedAttorney,
                selectedBarNumbers: party.selectedBarNumbers || [],
            }));

            const preparedParties = preparePartiesForApi(selectedItems);

            // **Update State Properly**
            setSelectedPartiesForAPI(selectedPartiesForAPI);
            setPartiesForApi(preparedParties);

            // **Update Formik AFTER setting state**
            setTimeout(() => {
                formik.setFieldValue("selectedParties", selectedItems);
                formik.setTouched({ selectedParties: true });
                console.log("Formik selectedParties:", formik.values.selectedParties);
            }, 0);

            return updatedSelectedParties;
        });

        // **Update Draft Values Correctly**
        setDraftValues((prev) => ({
            ...prev,
            selectedParties: prev.selectedParties.map((party) =>
                party.id === partyId ? { ...party, isChecked: !party.isChecked } : party
            ),
        }));
    };


    // Combine selectedParties and draftValues.selectedParties without duplicates
    const combinedParties = [
        ...draftValues.selectedParties.map((party) => {
            const matchingParty = draftValues.parties.find((p) => p.id === party.id);
            return matchingParty ? { ...party, ...matchingParty } : party;
        }),
        ...selectedParties.filter(
            (party) =>
                !draftValues.selectedParties.some((existingParty) => existingParty.id === party.id) &&
                !removedParties.includes(party.id)
        ),

    ];

    //functionality for fees calculation
    const requiredFees = [
        "Filing Fee",
        "Total Service Fees",
        "Total Service Tax Fees",
        "Convenience Fee",
        "Total Provider Service Fees",
        "Total Provider Tax Fees",
        "Total Court Service Fees",
        "Total Mail Service Fees",
        "Total Redaction Fees",
        "Case Initiation Fee",
        "Party Fee",
        "Optional Service Fee",
        "Redaction Fee",
        "Total Provider"
    ];

    //fetch optional service values/options by Id
    const getServiceNameByID = async (id) => {
        const baseURL = process.env.REACT_APP_BASE_URL
        const response = await fetch(`${baseURL}/GetOptionalServices?ID=${id}`);
        const data = await response.json();
        return data.name || "Unknown Service";
    };

    // Fetch initial fee data or fee charges
    useEffect(() => {
        const fetchCharges = async () => {
            if (!feedata) return;

            const filteredCharges = feedata?.AllowanceCharge?.filter((charge) =>
                requiredFees.includes(charge.AllowanceChargeReason?.Value)
            );

            if (!filteredCharges || !Array.isArray(filteredCharges)) {
                setAllowanceCharges([]);
                setCaseInitiationFee(null);
                setOtherFees([]);
                return;
            }

            // Group charges by "Optional Service Fee" ID to handle quantity
            const groupedCharges = {};
            for (const charge of filteredCharges) {
                const id = charge.ID?.Value || "Unknown";
                if (charge.AllowanceChargeReason?.Value === "Optional Service Fee" && id) {
                    if (!groupedCharges[id]) {
                        groupedCharges[id] = { ...charge, quantity: 0 };
                    }
                    groupedCharges[id].quantity += charge.MultiplierFactorNumeric || 1;
                }
            }

            // Fetch all service names for "Optional Service Fee" before resolving charges
            const serviceNames = {};
            const optionalServiceIds = Object.keys(groupedCharges);

            // Fetch service names for all the "Optional Service Fee" IDs
            await Promise.all(
                optionalServiceIds.map(async (id) => {
                    const serviceName = await getServiceNameByID(id);
                    serviceNames[id] = serviceName;
                })
            );

            // Resolve charges and calculate amounts
            const charges = filteredCharges.map((charge) => {
                const isOptionalService = charge.AllowanceChargeReason?.Value === "Optional Service Fee";
                const quantity = groupedCharges[charge.ID?.Value]
                    ? groupedCharges[charge.ID?.Value].quantity
                    : charge.MultiplierFactorNumeric || 1;

                const calculatedAmount = (charge.Amount?.Value || 0) * quantity;

                const serviceName = isOptionalService
                    ? serviceNames[charge.ID?.Value] || "Unknown Service"
                    : charge.AllowanceChargeReason?.Value;

                // Format the reason with quantity if applicable
                const formattedReason = quantity > 1
                    ? `${serviceName} (x ${quantity.toFixed(2)})`
                    : serviceName;

                // Skip the charge if the amount is 0.00 USD
                if (calculatedAmount === 0) {
                    return null; // Don't include this charge in the final result
                }

                return {
                    reason: formattedReason,
                    amount: `${calculatedAmount.toFixed(2)}`,
                };
            });


            const filteredChargesWithoutZero = charges.filter((charge) => charge !== null);

            // Filter out duplicate charges (charges with the same reason)
            const uniqueCharges = filteredChargesWithoutZero.filter(
                (charge, index, self) =>
                    self.findIndex((c) => c.reason === charge.reason) === index
            );

            // Separate out Case Initiation Fee from others
            const initiationFee = uniqueCharges.find(
                (fee) => fee.reason === "Case Initiation Fee"
            );
            // console.log("Case Initiation Fee:", initiationFee);
            const other = uniqueCharges.filter(
                (fee) => fee.reason !== "Case Initiation Fee"
            );

            setAllowanceCharges(uniqueCharges);
            setCaseInitiationFee(initiationFee);
            setOtherFees(other);
            setFeesCalculationAmount(feedata?.FeesCalculationAmount?.Value || "0.00 USD");
        };

        fetchCharges();

    }, [feedata]);


    //fetch APi for search cases
    useEffect(() => {

        if (!draftValues.selectedCourt || !draftValues.caseTrackingID) return;
        // console.log("court:",draftValues.selectedCourt);
        // console.log("tracking id",draftValues.caseTrackingID)
        const searchCase = async () => {

            setError(null);
            startLoading();
            const baseURL = process.env.REACT_APP_BASE_URL

            try {
                const response = await fetch(`${baseURL}/GetCase`, {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        selectedCourt: draftValues.selectedCourt,
                        caseTrackingID: draftValues.caseTrackingID,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();
                console.log("get case response:", responseData);

                //  // Extract Court Code
                const courtCode = responseData.data?.Case?.CaseAugmentation?.CaseCourt?.OrganizationIdentification?.IdentificationID?.Value || "N/A";

                // Fetch Court Name from API
                const courtName = await fetchCourtName(courtCode);

                //  formik.setFieldValue("selectedCourt", courtCode);
                // formik.setFieldValue("selectedCourtName", courtName);

                //  console.log("case Name", courtName);

                // Extract Case details
                const caseDetails = {
                    courtName,
                    caseNumber: responseData.data?.Case?.CaseDocketID?.Value || "N/A",
                    caseTitle: responseData.data?.Case?.CaseTitleText?.Value || "N/A",
                };
                // console.log("case Details", caseDetails);

                let selectedCaseTypeId = responseData.data?.Case.CaseAugmentation1.CaseTypeText.Value;
                let selectedCaseCategoryId = responseData.data?.Case.CaseCategoryText.Value;

                setselectedCaseTypeId(selectedCaseTypeId);
                setSelectedCaseCategoryId(selectedCaseCategoryId);

                const caseParticipants = responseData.data?.Case?.CaseAugmentation1?.CaseParticipant || [];

                // Separate attorneys and non-attorneys
                const attorneys = caseParticipants.filter(
                    participant => participant?.CaseParticipantRoleCode?.Value === "ATTY"
                );

                const nonAttorneys = caseParticipants.filter(
                    participant => participant?.CaseParticipantRoleCode?.Value && participant?.CaseParticipantRoleCode?.Value !== "ATTY"
                );

                // Assign attorneys sequentially to non-attorneys
                const mappedParticipants = nonAttorneys.map((participant, index) => {
                    const firstName = participant?.Item?.PersonName?.PersonGivenName?.Value || "N/A";
                    const lastName = participant?.Item?.PersonName?.PersonSurName?.Value || "N/A";
                    const middleName = participant?.Item?.PersonName?.PersonMiddleName?.Value || "N/A";
                    const selectedPartyType = participant?.CaseParticipantRoleCode?.Value;
                    const roleType = participant?.ItemElementName;
                    //const selectedPartyType = participant?.ItemElementName === 2 ? "Individual" : "N/A";

                    let assignedAttorney = null;
                    if (attorneys.length > 0) {
                        // Assign the first available attorney
                        assignedAttorney = attorneys.shift(); // Removes the first attorney from the list
                    }

                    // Extract selectedAttorney from PersonOtherIdentification
                    const selectedAttorney = participant?.Item?.PersonOtherIdentification?.find(
                        identification => identification?.Item?.Value === "CASEPARTYID"
                    )?.IdentificationID?.Value || "N/A"; // Default to "N/A" if not found

                    return {
                        id: `Party${index + 1}`,
                        firstName,
                        lastName,
                        middleName,
                        roleType,
                        selectedPartyType,
                        isChecked: false,
                        assignedAttorney: assignedAttorney
                            ? `${assignedAttorney?.Item?.PersonName?.PersonGivenName?.Value || ""} 
                        ${assignedAttorney?.Item?.PersonName?.PersonSurName?.Value || ""}`.trim()
                            : null,
                        selectedAttorney // Include the selectedAttorney
                    };
                });

                // Set case details and participants for display
                setSelectedCaseDetails(caseDetails);
                setSelectedParties(mappedParticipants);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching case details:", error);
                setError("Failed to fetch case details. Please try again.");
            } finally {
                stopLoading(); // Stop loading for this API
            }
        }
        searchCase();

    }, [draftValues.selectedCourt, draftValues.caseTrackingID]);


    //fetch court name 
    const fetchCourtName = async (courtCode) => {
        if (!courtCode || courtCode === "N/A") return "N/A";  // Return "N/A" if no valid code
        const baseURL = process.env.REACT_APP_BASE_URL

        const url = `${baseURL}/GetCourtName?code=${encodeURIComponent(courtCode)}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.courtName || "N/A";
        } catch (error) {
            console.error("Error fetching court name:", error);
            return "N/A";
        }
    };

    const PartyRoleMapping = {
        2: "Individual", // Mapping for ItemElementName = 2
        1: "Business" // Mapping for ItemElementName = 1        
    };

    const PartyTypeMapping = {
        "17088": "Plaintiff",
        "6610": "Defendant"
    };


    //payload to calculate fees 
    const prepareFeeCalculationPayload = () => {
        if (!draftValues) {
            console.error("Invalid draftValues structure", draftValues);
            return null;
        }
        return {
            ...draftValues,
            documents: draftValues.documents.map(doc => ({
                documentType: doc.documentType,
                documentDescription: doc.documentDescription.replace(/\s+/g, ''),
                fileName: doc.fileName,
                fileBase64: doc.fileBase64.replace(/^data:application\/pdf;base64,/, ''),
                securityTypes: doc.securityTypes,
                optionalServicesSelections: doc.optionalServicesSelections.map((service) => ({
                    value: service.value,
                    Quantity: service.Quantity,
                })) || [],
            })),
            parties: draftValues.parties.map(party => ({
                selectedPartyType: party.selectedPartyType,
                roleType: party.roleType,
                lastName: party.lastName,
                firstName: party.firstName,
                middleName: party.middleName || "",
                suffix: party.suffix || "",
                companyName: party.companyName,
                address: party.address,
                address2: party.address2 || "",
                city: party.city,
                state: party.state,
                zip: party.zip,
                addressUnknown: !party.address,
                internationalAddress: party.internationalAddress,
                saveToAddressBook: true,
                selectedAttorney: party.selectedAttorney,
                selectedBarNumbers: party.selectedBarNumbers || []
            })),
            selectedParties: draftValues.selectedParties.map(party => ({
                partyName: party.partyName.replace(/\s+/g, ''),
                partyType: party.partyType,
                role: party.role
            }))
        };
    };

    //fees API of initiate case
    const feesCalculationApiCall = async () => {
        const requestPayload = prepareFeeCalculationPayload();

        if (!requestPayload || !requestPayload.parties || !requestPayload.selectedParties || requestPayload.parties.length === 0) {
            console.error("draftValues is not available! Cannot proceed.");
            Swal.fire({
                icon: "error",
                title: "Missing Data",
                text: "Please wait until the draft is loaded before calculating fees.",
                confirmButtonText: "OK",
            });
            return;
        }


        console.log("Generated Payload:", requestPayload);

        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const loadingPopup = Swal.fire({
                title: "Calculating Fees",
                html: "Please wait...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await fetch(`${baseURL}/GetFeesCalculation`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error("Failed to send API request");
            }

            const data = await response.json();
            console.log("API Response:", data);
            setFeeData(data.data);

            // Handle API response
            const errorArray = data?.data?.Error || [];
            if (Array.isArray(errorArray) && errorArray.length > 0 && errorArray[0]?.ErrorCode?.Value === "0") {
                Swal.fire({
                    icon: "success",
                    title: "Fees Calculation Successful",
                    html: `<p>Total Fees: <strong>${data?.data?.FeesCalculationAmount?.Value.toFixed(2)}</strong></p>`,
                    confirmButtonText: "OK",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Fees Calculation Failed",
                    text: errorArray[0]?.ErrorText?.Value || "An unexpected error occurred.",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Error in API call:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to calculate fees. Please try again.",
                confirmButtonText: "OK",
            });
        }
    };

    //payload to calculate fees of subsequent file
    const prepareFeesCalculationBody = () => {
        if (!draftValues) {
            console.error("Invalid draftValues structure", draftValues);
            return null;
        }

        return {
            selectedCourt: draftValues.selectedCourt,
            caseNumber: draftValues.caseTrackingID,
            paymentAccount: draftValues.paymentAccount,
            documents: draftValues.documents.map(doc => ({
                documentType: doc.documentType,
                documentDescription: doc.documentDescription.replace(/\s+/g, ''),
                fileName: doc.fileName,
                fileBase64: doc.fileBase64.replace(/^data:application\/pdf;base64,/, ''),
                securityTypes: doc.securityTypes,
                optionalServicesSelections: doc.optionalServicesSelections.map((service) => ({
                    value: service.value,
                    Quantity: service.Quantity,

                })) || [],
            })),
            parties: partiesForApi,
            selectedParties: selectedPartiesForAPI,

        };
    };

    //function to fetch all extra fees charges or hidden fee charges of existing/SubSequent
    useEffect(() => {
        const fetchFeeCharges = async () => {
            if (!feesdata) {
                return;
            }

            const filteredCharges = feesdata?.AllowanceCharge?.filter((charge) =>
                requiredFees.includes(charge.AllowanceChargeReason?.Value)
            );

            if (!filteredCharges || !Array.isArray(filteredCharges)) {
                setAllowanceCharges([]);
                setCaseInitiationFee(null);
                setOtherFees([]);
                return;
            }

            // Group charges by "Optional Service Fee" ID to handle quantity
            const groupedCharges = {};
            for (const charge of filteredCharges) {
                const id = charge.ID?.Value || "Unknown";
                if (charge.AllowanceChargeReason?.Value === "Optional Service Fee" && id) {
                    if (!groupedCharges[id]) {
                        groupedCharges[id] = { ...charge, quantity: 0 };
                    }
                    groupedCharges[id].quantity += charge.MultiplierFactorNumeric || 1;
                }
            }

            // Fetch all service names for "Optional Service Fee" before resolving charges
            const serviceNames = {};
            const optionalServiceIds = Object.keys(groupedCharges);

            // Fetch service names for all the "Optional Service Fee" IDs
            await Promise.all(
                optionalServiceIds.map(async (id) => {
                    const serviceName = await getServiceNameByID(id);
                    serviceNames[id] = serviceName;
                })
            );

            // Resolve charges and calculate amounts
            const charges = filteredCharges.map((charge) => {
                const isOptionalService = charge.AllowanceChargeReason?.Value === "Optional Service Fee";
                const quantity = groupedCharges[charge.ID?.Value]
                    ? groupedCharges[charge.ID?.Value].quantity
                    : charge.MultiplierFactorNumeric || 1;

                const calculatedAmount = (charge.Amount?.Value || 0) * quantity;

                const serviceName = isOptionalService
                    ? serviceNames[charge.ID?.Value] || "Unknown Service"
                    : charge.AllowanceChargeReason?.Value;

                // Format the reason with quantity if applicable
                const formattedReason = quantity > 1
                    ? `${serviceName} (x ${quantity.toFixed(2)})`
                    : serviceName;

                if (calculatedAmount === 0) {
                    return null;
                }
                return {
                    reason: formattedReason,
                    amount: `${calculatedAmount.toFixed(2)}`,
                };
            });

            const filteredChargesWithoutZero = charges.filter((charge) => charge !== null);

            // Filter out duplicate charges (charges with the same reason)
            const uniqueCharges = filteredChargesWithoutZero.filter(
                (charge, index, self) =>
                    self.findIndex((c) => c.reason === charge.reason) === index
            );

            // Separate out Case Initiation Fee from others
            const initiationFee = uniqueCharges.find(
                (fee) => fee.reason === "Case Initiation Fee"
            );

            setAllowanceCharges(uniqueCharges);
            setCaseInitiationFee(initiationFee);
            setOtherFees(uniqueCharges.filter((fee) => fee.reason !== "Case Initiation Fee"));
            setFeesCalculationAmount(feesdata?.FeesCalculationAmount?.Value || "0.00 USD");
        }

        fetchFeeCharges();
    }, [feesdata]);

    //fees Api of existing/SubSequent
    const feesCalculationApiSubSequent = async () => {
        const requestBody = prepareFeesCalculationBody();

        if (!requestBody || !requestBody.parties || !requestBody.selectedParties || requestBody.parties.length === 0) {
            console.error("Request body is not fully populated!");
            Swal.fire({
                icon: 'error',
                title: 'Missing Data',
                text: 'Ensure all required fields are filled before calculating fees.',
                confirmButtonText: 'OK',
            });
            return;
        }

        const loadingPopup = Swal.fire({
            title: 'Calculating Fees',
            html: 'Please wait...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        console.log("Generated Payload of subsequent:", requestBody);
        // Proceed with API call as before
        const baseURL = process.env.REACT_APP_BASE_URL;

        try {

            const response = await fetch(`${baseURL}/GetSubSequentFeesCalculation`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to send API request');
            }

            const data = await response.json();
            console.log('API Response:', data);
            setFeesData(data.data);

            // Handle successful response
            const errorArray = data?.data?.Error || [];
            if (
                Array.isArray(errorArray) &&
                errorArray.length > 0 &&
                errorArray[0]?.ErrorCode?.Value === '0'
            ) {
                Swal.fire({
                    icon: 'success',
                    title: 'Fees Calculation Successful',
                    html: `<p>Total Fees: <strong>${data?.data?.FeesCalculationAmount?.Value.toFixed(2)}</strong></p>`,
                    confirmButtonText: 'OK',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Fees Calculation Failed',
                    text: errorArray[0]?.ErrorText?.Value || 'An unexpected error occurred.',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error in API call:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to calculate fees. Please try again.',
                confirmButtonText: 'OK',
            });
        } finally {
            loadingPopup.close();
        }
    };

    //function to call core API
    const submitCoreFilingNewCivil = async () => {
        setLoading(true); // Start loader before making API request
        setShowPopup(true);
        const baseURL = process.env.REACT_APP_BASE_URL;

        const finalRequestBody = {
            ...draftValues,
            note: draftValues.noteToClerk || "",
            ...prepareFeeCalculationPayload(draftValues),
        };

        try {
            // Fixed template literal for URL and Authorization header
            const response = await fetch(`${baseURL}/CoreFilingNewCivil`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalRequestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            alert('Form submitted successfully!');

            const errorArray = data?.data?.Error;
            const envelopeID = data?.data?.DocumentIdentification?.find(doc => doc.Item?.Value === 'ENVELOPEID')?.IdentificationID?.Value;

            setLoading(false);
            setShowPopup(false);

            if (Array.isArray(errorArray) && errorArray.length > 0) {
                const firstError = errorArray[0]; // Take the first error in the array

                // Check if the error indicates "No Error"
                if (
                    firstError.ErrorCode?.Value === '0' &&
                    firstError.ErrorText?.Value === 'No Error'
                ) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Form Submitted Successfully!',
                        html: ` <p><strong>ENVELOPE ID:</strong> ${envelopeID}</p>`,
                        confirmButtonText: 'Ok',
                        willClose: async () => {
                            try {
                                await handleDiscardDraft(); // Wait for the draft to be discarded
                                navigate('/e-filing/draftHistory'); // Navigate after successful discard
                            } catch (error) {
                                console.error("Error discarding draft:", error);
                            }
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: firstError.ErrorText?.Value || 'An error occurred.',
                        confirmButtonText: 'Ok',
                    });
                }
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    html: `<p>${data.message || 'Operation completed successfully!'}</p>
                        <p><strong>ENVELOPEID:</strong> ${envelopeID}</p>`,
                    confirmButtonText: 'Ok',
                    willClose: () => {
                        window.location.reload();
                    },
                });
            }

        } catch (error) {
            console.error('Error submitting the form:', error);
            setShowPopup(false);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while submitting the form. Please try again.',
                confirmButtonText: 'Ok',
            });
        }
    }

    //function to call subsequent API
    const submitCoreFilingSubsequentCivil = async () => {
        setLoading(true); // Start loader before making API request
        setShowPopup(true);
        const baseURL = process.env.REACT_APP_BASE_URL;

        // Function to prepare documents for API
        const prepareDocumentsForApi = (documents) => {
            return documents.map((doc) => ({
                documentType: doc.documentType,
                documentDescription: doc.documentDescription.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''),
                fileName: doc.fileName,
                fileBase64: doc.fileBase64.replace(/^data:application\/pdf;base64,/, ''),
                securityTypes: doc.securityTypes,
                optionalServicesSelections: doc.optionalServicesSelections.map((service) => ({
                    value: service.value,
                    Quantity: service.Quantity,
                })),
            }));
        };

        const finalRequestBody = {
            selectedCourt: draftValues.selectedCourt || "",
            caseNumber: draftValues.caseTrackingID || "",
            paymentAccount: draftValues.paymentAccount || "",
            selectedAttorneySec: draftValues.selectedAttorneySec || "",
            createdBy: draftValues.createdBy || "",
            courtesyemail: draftValues.courtesyemail || "",
            note: draftValues.noteToClerk || "",
            documents: prepareDocumentsForApi(draftValues.documents),
            parties: partiesForApi,
            selectedParties: selectedPartiesForAPI,
        };

        console.log("Final API Request Body:", finalRequestBody);
        // console.log("Draft Values Before Submission:", draftValues);

        try {
            const response = await fetch(`${baseURL}/CoreFilingSubsequentCivil`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalRequestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            alert('Form submitted successfully!');
            const errorArray = data?.data?.Error;
            const envelopeID = data?.data?.DocumentIdentification?.find(doc => doc.Item?.Value === 'ENVELOPEID')?.IdentificationID?.Value;

            setLoading(false);
            setShowPopup(false); // Hide the popup

            if (Array.isArray(errorArray) && errorArray.length > 0) {
                const firstError = errorArray[0];

                if (firstError.ErrorCode?.Value === '0' && firstError.ErrorText?.Value === 'No Error') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Form Submitted Successfully!',
                        html: `<p><strong>ENVELOPE ID:</strong> ${envelopeID}</p>`,
                        confirmButtonText: 'Ok',
                        willClose: async () => {
                            try {
                                await handleDiscardDraft(); // Wait for the draft to be discarded
                                navigate('/e-filing/draftHistory'); // Navigate after successful discard
                            } catch (error) {
                                console.error("Error discarding draft:", error);
                            }
                        }
                    });
                }
                else {
                    console.log('show error:', errorArray)
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: firstError.ErrorText?.Value || 'An error occurred.',
                        confirmButtonText: 'Ok',
                    });
                }
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    html: `<p>${data.message || 'Operation completed successfully!'}</p>
                    <p><strong>ENVELOPEID:</strong> ${envelopeID}</p>`,
                    confirmButtonText: 'Ok',
                    willClose: () => {
                        window.location.reload();  // Reload the page when user clicks "Ok"
                    },
                });
            }
        } catch (error) {
            setLoading(false);
            setShowPopup(false); // Hide the popup
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while submitting the form. Please try again.',
                confirmButtonText: 'Ok',
            });
        }

    }

    //form validations with useFormik 
    const schemaWithCaseNumber = Yup.object().shape({
        selectedCourt: Yup.string().nullable().required("Court selection is required"),
        caseNumber: Yup.string().required("Case number is required"),
        paymentAccount: Yup.string().required("Payment account is required"),
        documents: Yup.array().of(
            Yup.object().shape({
                documentType: Yup.string().nullable().required("Document type is required"),
            })
        ),
        parties: Yup.array().of(
            Yup.object({
                roleType: Yup.string().required("Invalid party role option"),
                firstName: Yup.string().when("roleType", {
                    is: "1",
                    then: (schema) => schema.required("First name is required").min(3, "Must be at least 3 characters"),
                    otherwise: (schema) => schema,
                }),
                lastName: Yup.string().when("roleType", {
                    is: "1",
                    then: (schema) => schema.required("Last name is required").min(3, "Must be at least 3 characters"),
                    otherwise: (schema) => schema,
                }),
                companyName: Yup.string().when("roleType", {
                    is: "2",
                    then: (schema) => schema.required("Company name is required").min(3, "Must be at least 3 characters"),
                    otherwise: (schema) => schema,
                }),
                selectedAttorney: Yup.string().required("Please Select Attorney"),
            })
        ),
        selectedParties: Yup.array()
            .of(
                Yup.object({
                    id: Yup.string().required(),
                    isChecked: Yup.boolean(),
                })
            )
            .test("at-least-one-checked", "At least one party must be selected.", (parties) =>
                parties && parties.some((party) => party.isChecked === true)
            ),
    });

    // Schema when caseNumber is NOT available
    const schemaWithoutCaseNumber = Yup.object().shape({
        selectedCourt: Yup.string().required("Court is required"),
        selectedCategory: Yup.string().required("Category is required"),
        selectedCaseType: Yup.string().required("Case Type is required"),
        paymentAccount: Yup.string().required("Payment Account is required"),
        selectedAttorneySec: Yup.string().required("Attorney Section is required"),
        documents: Yup.array().of(
            Yup.object().shape({
                documentType: Yup.string().required("Document Type is required"),
            })
        ),
        parties: Yup.array().of(
            Yup.object({
                roleType: Yup.string().required("Role type is required"),
                companyName: Yup.string().when("roleType", {
                    is: "2",
                    then: (schema) => schema.required("Company name is required").min(3, "Must be at least 3 characters"),
                    otherwise: (schema) => schema,
                }),
                firstName: Yup.string().when("roleType", {
                    is: "1",
                    then: (schema) => schema.required("First name is required").min(3, "Must be at least 3 characters"),
                    otherwise: (schema) => schema,
                }),
                lastName: Yup.string().when("roleType", {
                    is: "1",
                    then: (schema) => schema.required("Last name is required").min(3, "Must be at least 3 characters"),
                    otherwise: (schema) => schema,
                }),
                selectedAttorney: Yup.string().required("Please Select Attorney"),
            })
        ),
        selectedParties: Yup.array()
            .of(
                Yup.object({
                    id: Yup.string().required(),
                    isChecked: Yup.boolean(),
                })
            )
            .test("at-least-one-checked", "At least one party must be selected.", (parties) =>
                parties && parties.some((party) => party.isChecked === true)
            ),
    });

    // validation schema condition 
    useEffect(() => {
        if (draftValues?.caseNumber) {
            setValidationSchema(schemaWithCaseNumber);
        } else {
            setValidationSchema(schemaWithoutCaseNumber);
        }
    }, [draftValues?.caseNumber]);

    // useEffect(() => {
    //     console.log("📌 Updated Draft Values:", draftValues);
    // }, [draftValues]);

    //useFormik for form submission 
    const formik = useFormik({
        initialValues: {
            noteToClerk: "",
            selectedCourt: null,
            selectedCategory: null,
            selectedCaseType: null,
            paymentAccount: "",
            selectedAttorneySec: null,
            documents: [
                {
                    documentType: null,
                    documentDescription: '',
                    fileName: '',
                    fileBase64: '',
                    securityTypes: '',
                    optionalServicesSelections: [
                        { value: '', Quantity: '', fee: '' }
                    ]
                }
            ],
            parties: [],
            selectedParties: [],
            ...draftValues,
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            console.log(" Formik onSubmit Triggered");
            console.log("Formik Errors:", formik.errors);
            console.log("Formik isValid:", formik.isValid);
            console.log("Formik Touched Fields:", formik.touched);
            setLoading(true);

            try {
                if (values.caseNumber) {
                    console.log("Calling submitCoreFilingSubsequentCivil() API...");
                    await submitCoreFilingSubsequentCivil(values);
                } else {
                    console.log("Calling submitCoreFilingNewCivil() API...");
                    await submitCoreFilingNewCivil(values);
                }
                console.log("API call successful");
            } catch (error) {
                console.error(" API call failed:", error);
            } finally {
                setLoading(false);
            }
        },
    });


    //handle confirm button to discard changes in draft form
    const handleDiscardDraft = async () => {

        const baseURL = process.env.REACT_APP_BASE_URL;
        const draftId = draftValues.Id;

        try {
            const response = await fetch(`${baseURL}/DiscardDraft/${draftId}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            console.log("API response:", response);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const message = await response.text();
            //alert('Draft discarded successfully', message);
            setShowDiscardButton(true);
            navigate('/e-filing/draftHistory');

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSaveDraft = async () => {
        // Extract values from form
        const {
            selectedCourt,
            selectedCategory,
            selectedCaseType,
            courtLocation,
            caseTrackingID,
            paymentAccount,
            selectedAttorneySec,
            createdBy,
            courtesyemail,
            note,
            documents,
            parties,
            selectedParties,
            caseNumber, // Ensure caseNumber is included
            caseTitle,  // Ensure caseTitle is included
            courtName,  // Ensure courtName is included
        } = formik.values;

        // Ensure required fields are present
        if (!selectedCourt) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Court selection is required.',
                confirmButtonText: 'Ok',
            });
            return;
        }

        // Function to replace null/undefined with empty string
        const cleanValue = (value) => (value === null || value === undefined ? "" : value);

        const selectedPartiesForAPI = selectedParties?.map((party) => ({
            partyName:
                party.roleType === '1'
                    ? `${cleanValue(party.firstName)} ${cleanValue(party.lastName)}`.trim()
                    : (party.companyName ? cleanValue(party.companyName).replace(/\s+/g, '') : ''),
            partyType: cleanValue(party.selectedPartyType) || "Unknown", // Default value if missing
            role: cleanValue(party.roleType) || "Unknown", // Default value if missing
        })) || [];


        // Prepare request body with JSON values
        const draftRequestBody = {
            isExistingCase: true,
            caseId: caseId,
            filingID: filingID,
            courtName: formik.values.courtName || selectedCaseDetails?.courtName || "",
            caseNumber: selectedCaseDetails?.caseNumber || "",
            caseTitle: formik.values.caseTitle || selectedCaseDetails?.caseTitle || "",
            selectedCourt: cleanValue(selectedCourt),
            selectedCategory: cleanValue(selectedCategory),
            selectedCaseType: cleanValue(selectedCaseType),
            courtLocation: cleanValue(courtLocation),
            caseTrackingID: cleanValue(caseTrackingID),
            paymentAccount: cleanValue(paymentAccount),
            selectedAttorneySec: cleanValue(selectedAttorneySec),
            createdBy: cleanValue(createdBy),
            courtesyemail: cleanValue(courtesyemail),
            note: cleanValue(note),
            documents: documents?.map(doc => ({
                documentType: cleanValue(doc.documentType),
                documentDescription: cleanValue(doc.documentDescription),
                fileName: cleanValue(doc.fileName),
                fileBase64: cleanValue(doc.fileBase64),
                securityTypes: cleanValue(doc.securityTypes),
                fee: typeof doc.fee === "number" ? doc.fee.toFixed(2) : "0.00",
                optionalServicesSelections: doc.optionalServicesSelections?.map(opt => ({
                    value: cleanValue(opt.value),
                    Quantity: cleanValue(opt.Quantity),
                    fee: typeof opt.fee === "number" && typeof opt.Quantity === "number"
                        ? (opt.fee * opt.Quantity).toFixed(2) // Multiply fee by quantity
                        : "0.00",
                    label: cleanValue(opt.label),
                    multiplier: cleanValue(opt.multiplier),
                })) || []
            })) || [],
            parties: parties?.map(party => ({
                selectedPartyType: cleanValue(party.selectedPartyType),
                roleType: cleanValue(party.roleType),
                lastName: cleanValue(party.lastName),
                firstName: cleanValue(party.firstName),
                middleName: cleanValue(party.middleName),
                suffix: cleanValue(party.suffix),
                companyName: cleanValue(party.companyName),
                address: cleanValue(party.Address),
                address2: cleanValue(party.Address2),
                city: cleanValue(party.City),
                state: cleanValue(party.State),
                zip: cleanValue(party.Zip),
                addressUnknown: party.addressUnknown || false,
                internationalAddress: cleanValue(party.internationalAddress),
                saveToAddressBook: party.saveToAddressBook || false,
                selectedAttorney: cleanValue(party.selectedAttorney),
                selectedBarNumbers: party.selectedBarNumbers?.map(bar => cleanValue(bar)) || [""]
            })) || [],
            selectedParties: selectedPartiesForAPI,
            // selectedParties: selectedParties?.map((party) => ({
            //     partyName: party.roleType === '1'
            //         ? `${party.firstName} ${party.lastName}`.trim()
            //         : (party.companyName ? party.companyName.replace(/\s+/g, '') : ''),
            //     partyType: party.selectedPartyType,
            //     role: party.roleType,
            // })) || [],

        };

        // Debugging: Log final request body
        console.log("Formik Values:", formik.values);
        console.log("Selected Case Details:", selectedCaseDetails);
        console.log("Final Draft Request Body:", draftRequestBody);

        try {
            const baseURL = process.env.REACT_APP_BASE_URL;

            // API call to save draft
            const response = await fetch(`${baseURL}/SaveDraft`, {
                //const response = await fetch(`https://localhost:7207/api/Tyler/savedraft`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(draftRequestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            navigate("/e-filing/draftHistory");

            Swal.fire({
                icon: 'success',
                title: 'Draft Saved Successfully!',
                text: data.message || 'Your draft has been saved successfully.',
                confirmButtonText: 'Ok',
            });

        } catch (error) {
            console.error('Error saving draft:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error Saving Draft',
                text: error.message || 'An error occurred. Please try again.',
                confirmButtonText: 'Ok',
            });
        }
    };

    useEffect(() => {
        console.log("DraftValues selectedCategory:", draftValues.selectedCategory);
        console.log("Formik selectedCategory:", formik.values.selectedCategory);
        console.log("Dropdown Selected Object:", categories.find(cat => cat.value === formik.values.selectedCategory));
    }, [formik.values.selectedCategory, draftValues, categories]);




    return (
        <WrapperTag className={wrapperClass}>
            <div className="container-fluid p-0">
                <div className="row mx-0 align-items-center">

                    {/* ✅ Title - Always Left */}
                    <div className="container px-3 px-md-4 mt-3">
                        <div className="row align-items-center">
                            {/* Left Side - Title */}
                            <div className="col-md-7">
                                <h1 className="fw-normal" style={{ fontSize: "30px", fontFamily: "Arial, sans-serif" }}>
                                    Filing {filingID} - Draft<i className="fa fa-pencil-square fa-fw" style={{ color: "#ffcc00", fontSize: "1em" }} aria-hidden="true"></i>
                                </h1>
                            </div>
                            {/* Right Side - Buttons */}
                            <div className="col-md-5 d-flex justify-content-md-end mt-3 mt-md-0">
                                <a
                                    href="#"
                                    className="custom-link me-3"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleShowDiscardButton();
                                    }}
                                >
                                    <i className="fa fa-trash fa-fw"></i> Discard
                                </a>
                                <a
                                    href="#"
                                    className="custom-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSaveDraft();
                                    }}
                                >
                                    <i className="fa fa-floppy-o fa-fw"></i> Save Draft
                                </a>
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
                                            <div className="col-md-12 lh32 d-flex align-items-center gap-2">
                                                <i className="fa fa-info-circle fa-fw"></i>
                                                <span>
                                                    <b>{draftValues.caseNumber ? "File on Existing Case" : "Initiate a New Case"}</b> – Complete the below filing steps and submit to file your documents.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* <!-- form sections --> */}
                            <div className="row case_form justify-content-center mt-2">
                                <form onSubmit={formik.handleSubmit}>
                                    {/* <!--col-12 --> */}
                                    <div className="col-12 col-md-12 col-xl-12">
                                        <div className="card p-2">
                                            <div className="card-body">
                                                <div className="row">
                                                    {/* <!-- section 1 --> */}
                                                    {draftValues.caseNumber ? (
                                                        <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                            <div className="section-case-bg row border mb-3 shadow align-items-center p-2">
                                                                <p className="fw-bold mb-0">1 . Select Court & Case Type -
                                                                    <span className='fw-normal' style={{ fontSize: "14px" }}>
                                                                        Choose the court location and case type to file your new case.</span>
                                                                </p>
                                                            </div>
                                                            <div className="container">
                                                                <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                                                        <span style={{ fontWeight: "bold", minWidth: "120px", textAlign: "left" }}>Court:</span>
                                                                        <span style={{ flex: "1", textAlign: "left" }}>
                                                                            {courts.length > 0 && draftValues.courtLocation
                                                                                ? courts.find((court) => court.value === draftValues.courtLocation)?.label || "N/A"
                                                                                : "N/A"}
                                                                        </span>
                                                                        <Link onClick={(e) => { e.preventDefault(); setSelectedCaseDetails(null); }}
                                                                            style={{
                                                                                marginLeft: "20px", padding: "6px 10px", backgroundColor: "#f44336",
                                                                                color: "white", borderRadius: "4px", cursor: "pointer", fontSize: "14px",
                                                                            }}
                                                                        ><i className="fa fa-edit fa-fw" style={{ marginRight: "5px" }}></i>
                                                                            Change Case
                                                                        </Link>
                                                                    </div>
                                                                    <hr style={{ borderTop: "1px solid #ddd" }} />
                                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                                                        <span style={{ fontWeight: "bold", minWidth: "120px", textAlign: "left" }}>Case No.</span>
                                                                        <span style={{ flex: "1", textAlign: "left" }}>{draftValues?.caseNumber || "N/A"}</span>
                                                                    </div>
                                                                    <hr style={{ borderTop: "1px solid #ddd" }} />
                                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                        <span style={{ fontWeight: "bold", minWidth: "120px", textAlign: "left" }}>Case Title</span>
                                                                        <span style={{ flex: "1", textAlign: "left" }}>{draftValues?.caseTitle || "N/A"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                            <div className="section-case-bg row border mb-3 shadow p-2">
                                                                <p className="fw-bold mb-0">1 . Select Court & Case Type -
                                                                    <span className='fw-normal' style={{ fontSize: "14px" }}> Choose the court location and case type to file your new case.</span></p>
                                                            </div>
                                                            <div className="row mb-3">
                                                                <label htmlFor="court-dropdown" className="col-sm-2 col-form-label fw-bold col-form-label-sm">Court
                                                                    <i className="fa fa-asterisk" aria-hidden="true" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                </label>
                                                                <div className="col-sm-5">
                                                                    <Select
                                                                        id="court-dropdown"
                                                                        options={courts}
                                                                        value={courts.find((court) => court.value === formik.values.selectedCourt) || null}
                                                                        onChange={(selectedOption) => handleSelectChange(selectedOption, "selectedCourt")}
                                                                        isSearchable
                                                                        onBlur={() => formik.setFieldTouched('selectedCourt', true)}
                                                                    />
                                                                    {formik.touched.selectedCourt && formik.errors.selectedCourt && (
                                                                        <div className="text-danger">{formik.errors.selectedCourt}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="row mb-3">
                                                                <label htmlFor="category-select" className="col-sm-2 col-form-label fw-bold col-form-label-sm">Category
                                                                    <i className="fa fa-asterisk" aria-hidden="true" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                </label>
                                                                <div className="col-sm-5">
                                                                    <Select
                                                                        id="category-dropdown"
                                                                        options={categories}
                                                                        value={categories.find(cat => cat.value === formik.values.selectedCategory) || null} // ✅ Bind to Formik
                                                                        onChange={(selectedOption) => handleSelectChange(selectedOption, "selectedCategory")}
                                                                        placeholder="Search or select a category"
                                                                        onBlur={() => formik.setFieldTouched('selectedCategory', true)}
                                                                    />
                                                                    {formik.touched.selectedCategory && formik.errors.selectedCategory && (
                                                                        <div className="text-danger">{formik.errors.selectedCategory}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="row mb-2">
                                                                <label htmlFor="case-select" className="col-sm-2 col-form-label fw-bold col-form-label-sm">Case Type
                                                                    <i className="fa fa-asterisk" aria-hidden="true" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                </label>
                                                                <div className="col-sm-5">
                                                                    <Select
                                                                        id="case-type-dropdown"
                                                                        options={cases}
                                                                        value={cases.find((caseType) => caseType.value === formik.values.selectedCaseType) || null}
                                                                        onChange={(selectedOption) => handleSelectChange(selectedOption, "selectedCaseType")}
                                                                        placeholder="Search or select a case type"
                                                                        onBlur={() => formik.setFieldTouched('selectedCaseType', true)}
                                                                    />
                                                                    {formik.touched.selectedCaseType && formik.errors.selectedCaseType && (
                                                                        <div className="text-danger">{formik.errors.selectedCaseType}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* <!-- section 2 --> */}
                                                    <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                        <div className="section-case-bg row border mb-3 shadow  p-2">
                                                            <p className="fw-bold mb-0">2 . Add Documents -
                                                                <span className='fw-normal' style={{ fontSize: "14px" }}> Define, select, and upload the documents that make up your filing.</span>
                                                            </p>
                                                        </div>
                                                        <div className="row mb-3">
                                                            <div className="col-sm-12">
                                                                <table className="table table-borderless table-responsive " id="table-list">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Document Type</th>
                                                                            <th>Document Description</th>
                                                                            <th>File Name</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {draftValues.documents && draftValues.documents.length > 0 ? (
                                                                            draftValues.documents.map((document, index) => (
                                                                                <tr key={index}>
                                                                                    <td>
                                                                                        {editIndex === index || !document.documentType ? (
                                                                                            <Select
                                                                                                options={documentType}
                                                                                                value={documentType.find((option) => String(option.value) === String(document.documentType)) || null}
                                                                                                onChange={(selectedOption) => handleDocumentTypeChange(selectedOption, index)}
                                                                                                isLoading={loadingDocumentTypes}
                                                                                                placeholder="Select document type"
                                                                                                onBlur={() => formik.setFieldTouched(`documents[${index}].documentType`, true)}
                                                                                            />
                                                                                        ) : (
                                                                                            <div>
                                                                                                {documentType.find((option) => String(option.value) === String(document.documentType))?.label || "N/A"}
                                                                                            </div>
                                                                                        )}
                                                                                        {formik.touched.documents?.[index]?.documentType &&
                                                                                            formik.errors.documents?.[index]?.documentType ? (
                                                                                            <div className="text-danger mt-1">{formik.errors.documents[index].documentType}</div>
                                                                                        ) : null}
                                                                                    </td>
                                                                                    <td>
                                                                                        {editIndex === index || !document.documentDescription ? (
                                                                                            <input
                                                                                                type="text"
                                                                                                style={{ height: "36px" }}
                                                                                                value={document.documentDescription || ""}
                                                                                                onChange={(e) => {
                                                                                                    const newDocs = [...draftValues.documents];
                                                                                                    newDocs[index].documentDescription = e.target.value;
                                                                                                    setDraftValues({ ...draftValues, documents: newDocs });
                                                                                                }}
                                                                                                placeholder="Enter document description"
                                                                                            />
                                                                                        ) : (
                                                                                            <div>{document.documentDescription || "N/A"}</div>
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                                            draftValues.documents[index]?.fileName ? (
                                                                                                <a
                                                                                                    href={formik.values.documents[index]?.fileURL}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="gwt-Anchor gf-subSectionFileLink"
                                                                                                    title={draftValues.documents[index]?.fileName}
                                                                                                >
                                                                                                    {draftValues.documents[index]?.fileName} ({draftValues.documents[index]?.fileSize} kB, {draftValues.documents[index]?.pageCount} pg.)
                                                                                                </a>
                                                                                            ) : (
                                                                                                <span className="text-danger">No file uploaded</span>
                                                                                            )
                                                                                        ) : (
                                                                                            <>
                                                                                                {draftValues.documents[index]?.fileName ? (
                                                                                                    <Link
                                                                                                        onClick={(e) => {
                                                                                                            e.preventDefault();
                                                                                                            handleOpenPDF(formik.values.documents[index]);
                                                                                                        }}
                                                                                                    >
                                                                                                        {draftValues.documents[index].fileName} ({draftValues.documents[index]?.fileSize}KB, {draftValues.documents[index]?.numPages})
                                                                                                    </Link>
                                                                                                ) : (
                                                                                                    <input
                                                                                                        id={`file-upload-${index}`}
                                                                                                        type="file"
                                                                                                        accept=".pdf"
                                                                                                        onChange={(event) => handleFileChange(event, index)}
                                                                                                        className={formik.errors.documents?.[index]?.fileName ? "input-error" : ""}
                                                                                                    />
                                                                                                )}
                                                                                                {formik.touched.documents?.[index]?.fileName && formik.errors.documents?.[index]?.fileName && (
                                                                                                    <div className="text-danger">{formik.errors.documents[index].fileName}</div>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                    </td>

                                                                                    <td>
                                                                                        {editIndex === index ? (
                                                                                            <>
                                                                                                <button
                                                                                                    type='button'
                                                                                                    className="btn btn-success"
                                                                                                    style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                                    onClick={(e) => handleSave(index, e)}
                                                                                                >
                                                                                                    Save
                                                                                                </button>
                                                                                                <button type='button' className="btn btn-dark"
                                                                                                    style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                                    onClick={(e) => handleCancel(e)}
                                                                                                >
                                                                                                    Cancel
                                                                                                </button>
                                                                                            </>
                                                                                        ) : deleteIndex === index ? (
                                                                                            <>
                                                                                                <button type='button' className="btn btn-danger" onClick={handleConfirmDelete}
                                                                                                    style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                                >
                                                                                                    Confirm
                                                                                                </button>
                                                                                                <button className="btn btn-dark" onClick={handleCancelDelete}
                                                                                                    style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                                >
                                                                                                    Cancel
                                                                                                </button>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <button type='button' className="btn btn-dark" onClick={(e) => handleEdit(index, e)}
                                                                                                    style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                                >
                                                                                                    Edit
                                                                                                </button>
                                                                                                <button type='button'
                                                                                                    style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                                    className="btn btn-dark" onClick={(e) => handleDelete(index, e)}
                                                                                                >
                                                                                                    Delete
                                                                                                </button>
                                                                                            </>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan="4">No documents available</td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                                <div style={{ marginTop: "10px" }}>
                                                                    <button type="button" className="btn btn-dark text-white" onClick={handleAddDocument}>
                                                                        + Add Document
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* <!-- section 3 --> */}
                                                    <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                        <div className="section-case-bg row border mb-3 shadow p-2">
                                                            <p className="fw-bold mb-0">3 . Security & Optional Services -
                                                                <span className='fw-normal' style={{ fontSize: "14px" }}>
                                                                    Choose a security level, and any needed optional services, for each document.</span></p>
                                                        </div>
                                                        <div className="row mb-3" >
                                                            <table className="table table-borderless table-responsive justify-content-center">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="w-25">Document</th>
                                                                        <th className="w-25">Security</th>
                                                                        <th className="w-25">Optional Services</th>
                                                                        <th></th>
                                                                        <th className="w-25">Qty</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {draftValues.documents?.map((document, index) => (
                                                                        <tr key={index}>
                                                                            <td style={{ height: "90px", verticalAlign: "top" }}>
                                                                                <div className="document-label" style={{ display: "flex", alignItems: "center" }}>
                                                                                    <p>
                                                                                        {documentType.find((option) => option.value === document.documentType)?.label || "No Document Type"}
                                                                                    </p>
                                                                                </div>
                                                                            </td>
                                                                            {/* Security Type Dropdown */}
                                                                            <td style={{ height: "90px", verticalAlign: "top" }}>
                                                                                <Select
                                                                                    id={`securitySelect-${index}`}
                                                                                    options={securityOptions[index] || []}
                                                                                    value={securityOptions[index]?.find(
                                                                                        (option) => String(option.value) === String(document.securityTypes)
                                                                                    ) || null}
                                                                                    onChange={(selectedSecurity) => {
                                                                                        setDraftValues((prev) => {
                                                                                            const updatedDocs = [...prev.documents];
                                                                                            updatedDocs[index].securityTypes = selectedSecurity.value;
                                                                                            return { ...prev, documents: updatedDocs };
                                                                                        });
                                                                                    }}
                                                                                    placeholder="Select Security Type"
                                                                                />
                                                                            </td>
                                                                            {/* Optional Services Dropdowns */}
                                                                            <td style={{ verticalAlign: "top" }}>
                                                                                {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                    <div key={serviceIndex} style={{ marginBottom: "10px" }}>
                                                                                        <Select
                                                                                            id={`optionalServices-${index}-${serviceIndex}`}
                                                                                            options={optionalServicesOptions[index] || []}
                                                                                            value={optionalServicesOptions[index]?.find(
                                                                                                (option) => option.value === service.value
                                                                                            ) || null}
                                                                                            onChange={(selectedOption) =>
                                                                                                handleOptionalServiceChange(selectedOption, index, serviceIndex)
                                                                                            }
                                                                                            placeholder="Select Optional Service"
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </td>
                                                                            {/* Add/Remove Optional Services */}
                                                                            <td style={{ verticalAlign: "top" }}>
                                                                                <div style={{ height: "38px" }}>
                                                                                    <Link
                                                                                        onClick={() => handleAddOptionalService(index)}
                                                                                        style={{ textDecoration: "none", color: "blue", marginLeft: "10px", cursor: "pointer" }}
                                                                                    >
                                                                                        <i className="fa fa-plus-circle fa-fw" style={{ marginRight: "5px" }}></i>
                                                                                    </Link>
                                                                                </div>
                                                                                <div>
                                                                                    {document.optionalServicesSelections?.map((_, serviceIndex) =>
                                                                                        serviceIndex > 0 ? (
                                                                                            <Link
                                                                                                key={serviceIndex}
                                                                                                onClick={() => handleRemoveOptionalService(index, serviceIndex)}
                                                                                                style={{ textDecoration: "none", color: "red", marginLeft: "10px", cursor: "pointer" }}
                                                                                            >
                                                                                                <i className="fa fa-times-circle fa-fw" style={{ marginRight: "5px", height: "48px" }}></i>
                                                                                            </Link>
                                                                                        ) : null
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            {/* Quantity Input Field */}
                                                                            <td style={{ verticalAlign: "top" }}>
                                                                                {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                    <div key={serviceIndex} style={{ marginBottom: "10px", height: "38px" }}>
                                                                                        {service.multiplier ? (  // Show input only if multiplier is true
                                                                                            <input
                                                                                                name="quantity-multiplier"
                                                                                                type="number"
                                                                                                min="1"
                                                                                                value={service.Quantity > 0 ? service.Quantity : ""}
                                                                                                onChange={(e) => {
                                                                                                    const value = e.target.value;
                                                                                                    handleQuantityChange(value === "" ? 1 : Math.max(1, Number(value)), index, serviceIndex);
                                                                                                }}
                                                                                                className="form-control"
                                                                                                placeholder="Enter Quantity"
                                                                                            />
                                                                                        ) : (
                                                                                            <span></span> // Display "0" when quantity is hidden
                                                                                        )} {/* Hides input if multiplier is false/missing */}
                                                                                    </div>
                                                                                ))}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                    {/* <!-- section 4 --> */}
                                                    <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                        <div className="section-case-bg row border mb-3 shadow p-2">
                                                            <p className="fw-bold mb-0">4 . New Case Parties - <span className='fw-normal' style={{ fontSize: "14px" }}>
                                                                Enter the required parties. </span></p>
                                                        </div>
                                                        {Array.isArray(draftValues.parties) &&
                                                            draftValues.parties.map((party, index) => (
                                                                <div key={party.id} className="party-row">
                                                                    <table className="table table-borderless table-responsive">
                                                                        <thead>
                                                                            <tr className="align-bottom fw-bold">
                                                                                <th>Role<i className="fa fa-asterisk" aria-hidden="true"
                                                                                    style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i></th>
                                                                                <th>Type</th>
                                                                                <th></th>
                                                                                <th>
                                                                                    <Link
                                                                                        onClick={(e) => { e.preventDefault(); handleRemoveClick(party.id); }}
                                                                                        style={{ color: "#336C9D", cursor: "pointer", textDecoration: "none" }}>
                                                                                        <i className="fa fa-times-circle fa-fw" style={{ color: "red" }}></i>
                                                                                        Remove Party
                                                                                    </Link>
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>
                                                                                    <div>
                                                                                        <select
                                                                                            className="form-select"
                                                                                            value={party.selectedPartyType}
                                                                                            onChange={(e) => handlePartyTypeChange(party.id, e)}
                                                                                            style={{ width: '250px', padding: '5px' }}>
                                                                                            <option value="">Select Party Type</option>
                                                                                            {partyTypes.map((partyType) => (
                                                                                                <option key={partyType.value} value={(partyType.value)}>
                                                                                                    {partyType.label}
                                                                                                </option>
                                                                                            ))}
                                                                                        </select>
                                                                                        {formik.touched.parties?.[index]?.selectedPartyType && formik.errors.parties?.[index]?.selectedPartyType && (
                                                                                            <div className="error-text">{formik.errors.parties[index].selectedPartyType}</div>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                                <td>
                                                                                    <select
                                                                                        className="form-select text-black-50"
                                                                                        style={{ width: "250px", padding: "5px" }}
                                                                                        value={party.roleType}
                                                                                        onChange={(e) => handleRoleTypeChange(party.id, e)}>
                                                                                        <option value="1">Individual</option>
                                                                                        <option value="2">Business</option>
                                                                                    </select>
                                                                                </td>
                                                                            </tr>
                                                                            {/* Conditional Fields Based on Role Type */}
                                                                            {party.roleType === "1" ? (
                                                                                <>
                                                                                    {/* Individual Fields */}
                                                                                    <tr className="align-bottom fw-bold">
                                                                                        <td>Last Name<i className="fa fa-asterisk" aria-hidden="true"
                                                                                            style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i></td>
                                                                                        <td>First Name<i className="fa fa-asterisk" aria-hidden="true"
                                                                                            style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i></td>
                                                                                        <td>Middle Name</td>
                                                                                        <td>Suffix</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.lastName}
                                                                                                placeholder="Enter Last Name"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "lastName", e.target.value)}
                                                                                            />
                                                                                            {formik.touched.parties?.[index]?.lastName && formik.errors.parties?.[index]?.lastName && (
                                                                                                <div className="error-text-danger mt-1">{formik.errors.parties[index].lastName}</div>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.firstName}
                                                                                                placeholder="Enter First Name"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "firstName", e.target.value)}
                                                                                            />
                                                                                            {formik.touched.parties?.[index]?.firstName && formik.errors.parties?.[index]?.firstName && (
                                                                                                <div className="error-text-danger mt-1">{formik.errors.parties[index].firstName}</div>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.middleName}
                                                                                                placeholder="Enter Middle Name"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "middleName", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <select
                                                                                                className="form-select text-black-50"
                                                                                                style={{ width: '150px', padding: '5px' }}
                                                                                                value={party.suffix}
                                                                                                onChange={(e) => handleSuffixChange(party.id, e)}>
                                                                                                <option value="">Select Suffix</option>
                                                                                                {suffixOptions.map((suffix) => (
                                                                                                    <option key={suffix.code} value={suffix.code}>
                                                                                                        {suffix.name}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="align-bottom fw-bold">
                                                                                        <td>Address</td>
                                                                                        <td>Address 2</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                name='address'
                                                                                                value={party.address}
                                                                                                placeholder="Enter Address"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "address", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                name='address2'
                                                                                                value={party.address2}
                                                                                                placeholder="Enter Address 2"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "address2", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="align-bottom fw-bold">
                                                                                        <td>City</td>
                                                                                        <td>State</td>
                                                                                        <td>Zip</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                name='cityName'
                                                                                                value={party.city}
                                                                                                placeholder="Enter City"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "city", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                name='state'
                                                                                                value={party.state}
                                                                                                placeholder="Enter State"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "state", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                name='zip'
                                                                                                value={party.zip}
                                                                                                placeholder="Enter Zip"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "zip", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="fw-bold">
                                                                                        <td style={{ "padding": "15px" }}>
                                                                                            <div className="form-check">
                                                                                                <input className="form-check-input" type="checkbox" value="" id="address_unknown" />
                                                                                                <label className="form-check-label" htmlFor="address_unknown">Address Unknown</label>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td style={{ "padding": "15px" }}>
                                                                                            <div className="form-check">
                                                                                                <input className="form-check-input" type="checkbox" value="" id="international_address" />
                                                                                                <label className="form-check-label" htmlFor="international_address">International Address</label>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td style={{ "padding": "15px" }}>
                                                                                            <div className="form-check">
                                                                                                <input className="form-check-input" type="checkbox" value="" id="save_to_addressbook" />
                                                                                                <label className="form-check-label" htmlFor="save_to_addressbook">Save to Address book</label>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="align-bottom fw-bold">
                                                                                        <td>Representing Attorney
                                                                                            <i className="fa fa-asterisk" aria-hidden="true"
                                                                                                style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                                        </td>
                                                                                        {Array.isArray(party.selectedBarNumbers) && party.selectedBarNumbers.length > 0 ? (
                                                                                            <td>Added Attorneys: </td>
                                                                                        ) : (
                                                                                            <td></td>
                                                                                        )}
                                                                                        <td>Add Another Attorney</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <Select
                                                                                                value={party.selectedAttorney ? attorneys.find((attorney) =>
                                                                                                    attorney.value === party.selectedAttorney) || null
                                                                                                    : null
                                                                                                }
                                                                                                style={{ width: '250px', padding: '5px' }}
                                                                                                onChange={(selectedOption) => handleAttorneyChange(party.id, selectedOption)}
                                                                                                options={[
                                                                                                    { value: '', label: 'Select an attorney...', isDisabled: true },
                                                                                                    ...attorneys,
                                                                                                ]}
                                                                                                placeholder="Search and Select Attorney"
                                                                                                isSearchable={true}
                                                                                                isClearable={true}
                                                                                                onBlur={formik.handleBlur}
                                                                                            />
                                                                                            {formik.touched.parties?.[index]?.selectedAttorney &&
                                                                                                formik.errors.parties?.[index]?.selectedAttorney && (
                                                                                                    <div className="text-danger mt-1" style={{ fontSize: "15px", marginTop: "5px" }}>
                                                                                                        {formik.errors.parties[index].selectedAttorney}
                                                                                                    </div>
                                                                                                )}
                                                                                        </td>
                                                                                        <td>
                                                                                            {Array.isArray(party.selectedBarNumbers) && party.selectedBarNumbers.length > 0 && (
                                                                                                <p>
                                                                                                    {party.selectedBarNumbers.join(", ")}
                                                                                                </p>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>
                                                                                            <Select
                                                                                                value={party.selectedBarNumbers.map((barNumber) => ({
                                                                                                    value: barNumber,
                                                                                                    label: barNumber,
                                                                                                }))} // Format the value to match the Select component's value format
                                                                                                onChange={(selectedOptions) => handleBarNumberChange(party.id, selectedOptions)}
                                                                                                options={attorneys.map((attorney) => ({
                                                                                                    value: attorney.barNumber,
                                                                                                    label: attorney.barNumber,
                                                                                                }))}
                                                                                                placeholder="Select Bar Numbers"
                                                                                                isMulti
                                                                                                isSearchable={true}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    {/* Business Fields */}
                                                                                    <tr className="align-bottom fw-bold">
                                                                                        <td>Company Name
                                                                                            <i className="fa fa-asterisk" aria-hidden="true"
                                                                                                style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <input
                                                                                                className={`form-control ${[party.id]}`}
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.companyName}
                                                                                                placeholder="Enter company name"
                                                                                                onChange={(e) => handleCompanyNameChange(party.id, e.target.value)}
                                                                                            />
                                                                                            {formik.touched.parties?.[index]?.companyName && formik.errors.parties?.[index]?.companyName && (
                                                                                                <div className="text-danger mt-1">{formik.errors.parties[index].companyName}</div>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="align-bottom fw-bold">
                                                                                        <td>Address</td>
                                                                                        <td>Address 2</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.address}
                                                                                                placeholder="Enter Address"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "address", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.address2}
                                                                                                placeholder="Enter Address 2"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "address2", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="align-bottom fw-bold">
                                                                                        <td>City</td>
                                                                                        <td>State</td>
                                                                                        <td>Zip</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.city}
                                                                                                placeholder="Enter City"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "city", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.state}
                                                                                                placeholder="Enter State"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "state", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <input
                                                                                                className="form-control"
                                                                                                style={{ width: "250px", padding: "5px" }}
                                                                                                type="text"
                                                                                                value={party.zip}
                                                                                                placeholder="Enter Zip"
                                                                                                onChange={(e) => handlePartyInputChange(party.id, "zip", e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="fw-bold">
                                                                                        <td style={{ "padding": "15px" }}>
                                                                                            <div className="form-check">
                                                                                                <input className="form-check-input" type="checkbox" value="" id="address_unknown" />
                                                                                                <label className="form-check-label" htmlFor="address_unknown">Address Unknown</label>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td style={{ "padding": "15px" }}>
                                                                                            <div className="form-check">
                                                                                                <input className="form-check-input" type="checkbox" value="" id="international_address" />
                                                                                                <label className="form-check-label" htmlFor="international_address">International Address</label>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td style={{ "padding": "15px" }}>
                                                                                            <div className="form-check">
                                                                                                <input className="form-check-input" type="checkbox" value="" id="save_to_addressbook" />
                                                                                                <label className="form-check-label" htmlFor="save_to_addressbook">Save to Address book</label>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr className="align-bottom fw-bold">
                                                                                        <td>Representing Attorney
                                                                                            <i className="fa fa-asterisk" aria-hidden="true"
                                                                                                style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                                        </td>
                                                                                        {Array.isArray(party.selectedBarNumbers) && party.selectedBarNumbers.length > 0 ? (
                                                                                            <td>Added Attorneys: </td>
                                                                                        ) : (
                                                                                            <td></td>
                                                                                        )}
                                                                                        <td>Add Another Attorney</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <Select
                                                                                                value={
                                                                                                    party.selectedAttorney
                                                                                                        ? attorneys.find((attorney) => attorney.value === party.selectedAttorney) || null
                                                                                                        : null
                                                                                                } // Map stored value to label for display
                                                                                                style={{ width: '250px', padding: '5px' }}
                                                                                                onChange={(selectedOption) => handleAttorneyChange(party.id, selectedOption)}
                                                                                                options={[
                                                                                                    { value: '', label: 'Select an attorney...', isDisabled: true },
                                                                                                    ...attorneys,
                                                                                                ]}
                                                                                                placeholder="Search and Select Attorney"
                                                                                                isSearchable={true}
                                                                                                isClearable={true}
                                                                                                onBlur={formik.handleBlur}
                                                                                            />
                                                                                            {formik.touched.parties?.[index]?.selectedAttorney &&
                                                                                                formik.errors.parties?.[index]?.selectedAttorney && (
                                                                                                    <div className="text-danger mt-1" style={{ fontSize: "15px", marginTop: "5px" }}>
                                                                                                        {formik.errors.parties[index].selectedAttorney}
                                                                                                    </div>
                                                                                                )}
                                                                                        </td>
                                                                                        <td>
                                                                                            {Array.isArray(party.selectedBarNumbers) && party.selectedBarNumbers.length > 0 && (
                                                                                                <p>
                                                                                                    {party.selectedBarNumbers.join(", ")}
                                                                                                </p>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>
                                                                                            <Select
                                                                                                value={party.selectedBarNumbers.map((barNumber) => ({
                                                                                                    value: barNumber,
                                                                                                    label: barNumber,
                                                                                                }))} // Format the value to match the Select component's value format
                                                                                                onChange={(selectedOptions) => handleBarNumberChange(party.id, selectedOptions)}
                                                                                                options={attorneys.map((attorney) => ({
                                                                                                    value: attorney.barNumber,
                                                                                                    label: attorney.barNumber,
                                                                                                }))}
                                                                                                placeholder="Select Bar Numbers"
                                                                                                isMulti
                                                                                                isSearchable={true}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                </>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ))}
                                                        {/* Add Party Button */}
                                                        <div className="party-row">
                                                            <label className="form-label fw-bold">
                                                                <Link
                                                                    onClick={(e) => { e.preventDefault(); handleAddParty() }}
                                                                    style={{ color: "#9092f7", textDecoration: "none" }}
                                                                > <i className="fa fa-plus-circle fa-fw" style={{ marginRight: "5px" }}></i>
                                                                    Add Party
                                                                </Link>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {/* <!-- section 5 --> */}
                                                    <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                        <div className="section-case-bg row border mb-3 shadow align-items-center p-2">
                                                            <p className="fw-bold mb-0"> 5 . Filing Party -
                                                                <span className='fw-normal' style={{ fontSize: "14px" }}> Choose the party or parties you are filing on behalf of.
                                                                </span>
                                                            </p>
                                                        </div>
                                                        {draftValues.caseNumber ? (
                                                            <>
                                                                {combinedParties.length > 0 && (
                                                                    <div className="row mb-3">
                                                                        <table className="table table-borderless table-responsive justify-content-center">
                                                                            <thead>
                                                                                <tr className="fw-bold">
                                                                                    <td>
                                                                                        <input
                                                                                            name='checkboxItems'
                                                                                            type="checkbox"
                                                                                            checked={selectAll}
                                                                                            onChange={handleSelectAll}
                                                                                        />
                                                                                    </td>
                                                                                    <td>Party Name</td>
                                                                                    <td>Party Type</td>
                                                                                    <td>Role</td>
                                                                                    <td></td>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {combinedParties.map((party) => (
                                                                                    <tr key={party.id}>
                                                                                        <td>
                                                                                            <input
                                                                                                name={`checkboxItems_${party.id}`}
                                                                                                type="checkbox"
                                                                                                checked={selectedParties.find((p) => p.id === party.id)?.isChecked || false}
                                                                                                onChange={() => handleRowCheckboxParties(party.id)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>{party.firstName && party.lastName ? `${party.firstName} ${party.lastName}` : "N/A"}</td>
                                                                                        <td>
                                                                                            {party.roleType === "1"
                                                                                                ? "Individual"
                                                                                                : party.roleType === "2"
                                                                                                    ? "Business"
                                                                                                    : PartyRoleMapping[party.roleType] || "N/A"
                                                                                            }
                                                                                        </td>
                                                                                        <td>
                                                                                            {party.selectedPartyType
                                                                                                ? partyTypes.find((type) => type.value === party.selectedPartyType)?.label ||
                                                                                                PartyTypeMapping[party.selectedPartyType] ||
                                                                                                "N/A"
                                                                                                : "N/A"}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                        {formik.errors.selectedParties && typeof formik.errors.selectedParties === "string" && (
                                                                            <div className="text-danger mt-1" style={{ fontSize: "15px", marginTop: "5px" }}>
                                                                                {formik.errors.selectedParties}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="row mb-3">
                                                                    <table className="table table-borderless table-responsive justify-content-center">
                                                                        <thead>
                                                                            <tr className="fw-bold">
                                                                                <td>
                                                                                    <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
                                                                                </td>
                                                                                <td>Party Name</td>
                                                                                <td> Role </td>
                                                                                <td>Party Type</td>
                                                                                <td></td>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {draftValues.selectedParties && draftValues.selectedParties.length > 0 ? (
                                                                                draftValues.selectedParties.map((party) => (
                                                                                    <tr key={party.id}>
                                                                                        <td>
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={party.isChecked || false}
                                                                                                onChange={() => handleRowCheckboxChange(party.id)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>{party.partyName || "N/A"}</td>
                                                                                        <td>{party.partyType}</td>
                                                                                        <td>{party.role === "1" ? "Individual" : party.role === "2" ? "Business" : "N/A"}</td>
                                                                                    </tr>
                                                                                ))
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan="4">No selected parties found.</td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                    {formik.errors.selectedParties && typeof formik.errors.selectedParties === "string" && (
                                                                        <div className="text-danger mt-1" style={{ fontSize: "15px", marginTop: "5px" }}>
                                                                            {formik.errors.selectedParties}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {/* <!-- section 6 --> */}
                                                    <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                        <div className="section-case-bg row border mb-3 shadow p-2">
                                                            <p className="fw-bold mb-0"> 6 . Service Contacts -
                                                                <span className='fw-normal' style={{ fontSize: "14px" }}> Add service contacts to your filing to perform electronic service.</span>
                                                            </p>
                                                        </div>
                                                        <div className="row mb-3" >
                                                            {selectedContactList.length ? (
                                                                <table className="table table-borderless table-responsive justify-content-center">
                                                                    <thead>
                                                                        <tr className="fw-bold">
                                                                            <th> <input type="checkbox" /> eServe</th>
                                                                            <th>Mail Service (add'l fees apply)</th>
                                                                            <th>Name</th>
                                                                            <th>Email Address</th>
                                                                            <th>Party</th>
                                                                            <th>Action</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {selectedContactList.map((contact, index) => (
                                                                            <tr key={index}>
                                                                                <td><input type="checkbox" /></td>
                                                                                <td>
                                                                                    <select>
                                                                                        <option value="1">No mail</option>
                                                                                    </select>
                                                                                </td>
                                                                                <td>{`${contact.FirstName} ${contact.LastName}`}</td>
                                                                                <td>{contact.Email}</td>
                                                                                <td></td>
                                                                                <td>
                                                                                    <Link
                                                                                        onClick={() => setSelectedContactList((prevContacts) =>
                                                                                            prevContacts.filter((c) => c !== contact))}
                                                                                        style={{ textDecoration: "none", color: "red", cursor: "pointer" }}
                                                                                    >
                                                                                        <i className="fa fa-times-circle fa-fw" style={{ marginRight: "5px" }}></i>
                                                                                    </Link>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <p> No service contacts are currently attached to this filing.
                                                                    Use link below to add contacts.</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Link className='fw-bold' onClick={handleShow} style={{
                                                                textDecoration: "none",
                                                                textDecorationLine: "none", cursor: "pointer", color: "#9092f7"
                                                            }} >
                                                                <i className="fa fa-plus-circle fa-fw"></i>
                                                                Add Service Contact</Link>
                                                        </div>
                                                    </div>
                                                    {/* <!-- section 7 --> */}
                                                    <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                        <div className="section-case-bg row border mb-3 shadow p-2">
                                                            <p className="fw-bold mb-0"> 7 . Filing Fee -
                                                                <span className='fw-normal' style={{ fontSize: "14px" }}> Select a payment method to pay estimated fees.</span>  </p>
                                                        </div>
                                                        {draftValues.caseNumber ? (
                                                            <>
                                                                <div className="row fee-section-item">
                                                                    {draftValues.documents?.map((document, index) => (
                                                                        <div key={index} >
                                                                            <table aria-label="Filing Fees for Document Petition" className="table table-borderless">
                                                                                <colgroup>
                                                                                    <col />
                                                                                </colgroup>
                                                                                <tbody>
                                                                                    {/* First row with document description */}
                                                                                    <tr className="info border mb-3 shadow p-2">
                                                                                        <td className='fw-bold mb-0 text-xl-start'>
                                                                                            {document.documentDescription || "Petition"}
                                                                                        </td>
                                                                                        <td className="fw-bold mb-0 text-xl-end">Estimated</td>
                                                                                    </tr>

                                                                                    {/* Row for "Court Filing Fee" */}
                                                                                    <tr className="mb-3 p-2">
                                                                                        <td aria-label="Court Filing Fee">Court Filing Fee</td>
                                                                                        <td aria-label="Estimated Court Filing Fee" className="text-right w150">
                                                                                            {typeof document.fee === "number"
                                                                                                ? `$${document.fee.toFixed(2)}`
                                                                                                : "No Fee"}
                                                                                        </td>
                                                                                    </tr>
                                                                                    {/* Rows for Optional Services */}
                                                                                    {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                        <tr key={serviceIndex}>
                                                                                            <td aria-label={service.label}>
                                                                                                {service.label}
                                                                                                {service.multiplier && service.Quantity > 0
                                                                                                    ? ` (x ${service.Quantity})` // Show quantity if multiplier is true and Quantity > 0
                                                                                                    : ""}
                                                                                            </td>
                                                                                            <td aria-label={`Estimated ${service.label}`}
                                                                                                className="text-right w150"
                                                                                            >
                                                                                                {typeof service.fee === "number"
                                                                                                    ? `$${(service.fee * (service.Quantity || 1)).toFixed(2)}`
                                                                                                    : "TBD"}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                    {/* Row for Sub-Total */}
                                                                                    <tr>
                                                                                        <td aria-label="Sub-Total" className="text-right text-bold">Sub-Total</td>
                                                                                        <td aria-label="Estimated Sub-Total" className="text-right text-bold">
                                                                                            {(() => {
                                                                                                let total = document.fee || 0;
                                                                                                if (document.optionalServicesSelections) {
                                                                                                    total += document.optionalServicesSelections.reduce((acc, service) => {
                                                                                                        if (typeof service.fee === "number") {
                                                                                                            // Ensure Quantity is at least 1
                                                                                                            const quantity = service.Quantity !== null && service.Quantity !== undefined
                                                                                                                ? service.Quantity
                                                                                                                : 1;
                                                                                                            return acc + service.fee * quantity;
                                                                                                        }
                                                                                                        return acc;
                                                                                                    }, 0);
                                                                                                }
                                                                                                return `$${total.toFixed(2)}`;
                                                                                            })()}
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    ))}

                                                                    {caseInitiationFee && (
                                                                        <div className="row mb-3 p-2">
                                                                            <p className="col-6 text-black-50 mb-0 text-xl-start">{caseInitiationFee.reason}</p>
                                                                            <p className="col-6 text-black-50 mb-0 text-xl-end">{caseInitiationFee.amount} USD</p>
                                                                        </div>
                                                                    )}
                                                                    {caseInitiationFee && (
                                                                        <div className="row mb-3 p-2">
                                                                            <p className="col-10 mb-0 text-xl-end"> Sub-Total </p>
                                                                            <p className="col-2 fw-bold mb-0 text-xl-end">{caseInitiationFee.amount} USD</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="fee-section-item" style={{ marginTop: '20px' }}>
                                                                    <table className="table">
                                                                        <thead>
                                                                            <tr className="info border mb-3 shadow p-2">
                                                                                <td className="fw-bold mb-0 text-xl-start" style={{ borderBottom: "none" }} >Service Fees</td>
                                                                                <td className="fw-bold mb-0 text-xl-end" style={{ borderBottom: "none" }}  >Estimated</td>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {/* Filter and iterate through AllowanceCharge array */}
                                                                            {feesdata?.AllowanceCharge &&
                                                                                feesdata.AllowanceCharge.filter(
                                                                                    (charge) =>
                                                                                        ![
                                                                                            "Case Initiation Fee",
                                                                                            "Filing Fee",
                                                                                            "Optional Service Fee",
                                                                                        ].includes(charge.AllowanceChargeReason?.Value) &&
                                                                                        charge.Amount?.Value > 0
                                                                                ).length > 0 ? (
                                                                                feesdata.AllowanceCharge.filter(
                                                                                    (charge) =>
                                                                                        ![
                                                                                            "Case Initiation Fee",
                                                                                            "Filing Fee",
                                                                                            "Optional Service Fee",
                                                                                        ].includes(charge.AllowanceChargeReason?.Value) &&
                                                                                        charge.Amount?.Value > 0
                                                                                ).map((charge, index) => (
                                                                                    <tr key={index}>
                                                                                        <td aria-label={charge.AllowanceChargeReason?.Value || "Reason"}>
                                                                                            {charge.AllowanceChargeReason?.Value || "Unknown Reason"}
                                                                                        </td>
                                                                                        <td
                                                                                            aria-label={`Estimated ${charge.AllowanceChargeReason?.Value || "Unknown Reason"}`}
                                                                                            className="text-right w150"
                                                                                        >
                                                                                            {charge.Amount && typeof charge.Amount.Value === "number"
                                                                                                ? `$${charge.Amount.Value.toFixed(2)}`
                                                                                                : "TBD"}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan="2" className="text-center">
                                                                                        No allowance charges available
                                                                                    </td>
                                                                                </tr>
                                                                            )}

                                                                            {/* Grand Total row */}
                                                                            <tr>
                                                                                <td aria-label="Grand Total" className="text-right text-bold">Grand Total</td>
                                                                                <td aria-label="Estimated Grand Total" className="text-right text-bold">
                                                                                    {feesdata?.FeesCalculationAmount && typeof feesdata.FeesCalculationAmount.Value === "number"
                                                                                        ? `$${feesdata.FeesCalculationAmount.Value.toFixed(2)}`
                                                                                        : "$0.00"}
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="container-fluid px-5" >
                                                                {/* <!-- fee item --> */}
                                                                <div className="row fee-section-item">
                                                                    <div className="row border mb-3 shadow p-2">
                                                                        {selectedCaseType && (
                                                                            <p className="col-6 fw-bold mb-0 text-xl-start"> {selectedCaseType.label}</p>
                                                                        )}
                                                                        <p className="col-6 fw-bold mb-0 text-xl-end" > Estimated Fees  </p>
                                                                    </div>
                                                                    {caseInitiationFee && (
                                                                        <div className="row p-2">
                                                                            <p className="col-6 text-black-50 mb-0 text-xl-start">{caseInitiationFee.reason}</p>
                                                                            <p className="col-6 text-black-50 mb-0 text-xl-end">{caseInitiationFee.amount} USD</p>
                                                                        </div>
                                                                    )}
                                                                    {caseInitiationFee && (
                                                                        <div className="row p-2">
                                                                            <p className="col-10 mb-0 text-xl-end" > Sub-Total  </p>
                                                                            <p className="col-2 fw-bold mb-0 text-xl-end" > {caseInitiationFee.amount} USD  </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {/* <!-- fee item --> */}
                                                                <div className="row fee-section-item">
                                                                    <div className="row border shadow p-2" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                        <p className="col-6 fw-bold mb-0 text-xl-start" > Service Fees  </p>
                                                                        <p className="col-6 fw-bold mb-0 text-xl-end" > Estimated Fees  </p>
                                                                    </div>
                                                                    {otherFees && otherFees.length > 0 ? (
                                                                        otherFees.map((fee, index) => (
                                                                            <div className="row p-2" key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                                <p className="col-6 text-black-50 mb-0 text-xl-start">{fee.reason}</p>
                                                                                <p className="col-6 text-black-50 mb-0 text-xl-end">{fee.amount} USD</p>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p>No other fees available</p>
                                                                    )}
                                                                    <div className="row p-2" style={{ borderBottom: "1px solid #dee2e6" }}>
                                                                        <p className="col-8 mb-0 text-xl-end" > </p>
                                                                        <p className="col-2 fw-bold mb-0 text-right" > Grand Total  </p>
                                                                        <p className="col-2 fw-bold mb-0 text-xl-end" > {feesCalculationAmount} USD  </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        )}

                                                        <div className="container-fluid row mt-3 mb-3">
                                                            <label htmlFor='paymentAccount' className="col-6 col-lg-3 fw-bold pe-0">Select Payment Account
                                                                <i className="fa fa-asterisk" aria-hidden="true" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i> </label>
                                                            <div className="col-6 col-lg-3">
                                                                <Select
                                                                    id="paymentAccount"
                                                                    options={paymentAccountOptions}
                                                                    value={paymentAccountOptions.find((option) => option.value === draftValues?.paymentAccount) || null} // Match by value
                                                                    onChange={(selectedOption) => handleSelectChange(selectedOption, "paymentAccount")} // Store only value
                                                                    isSearchable
                                                                    placeholder="Choose payment account"
                                                                />
                                                                {formik.touched.paymentAccount && formik.errors.paymentAccount && (
                                                                    <div className="text-danger">{formik.errors.paymentAccount}</div>
                                                                )}
                                                            </div>
                                                            <Link
                                                                className="col-6 col-lg-3 text-end fw-bold ps-0"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    draftValues.caseNumber ? feesCalculationApiSubSequent() : feesCalculationApiCall();
                                                                }}
                                                            >
                                                                <i className="fa fa-calculator fa-fw" style={{ marginRight: '5px' }}></i>
                                                                Confirm fee calculation
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    {/* <!-- section 8 --> */}
                                                    <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                        <div className="section-case-bg row border mb-3 shadow  p-2">
                                                            <p className="fw-bold mb-0"> 8 . Review & Submit -
                                                                <span className='fw-normal' style={{ fontSize: "14px" }}> Finalize your filing, review, and submit.</span> </p>
                                                        </div>
                                                        <div className="row mb-3" >
                                                            <table className="table table-borderless table-responsive justify-content-center">
                                                                <tbody>
                                                                    <tr>
                                                                        <td className="fw-bold" style={{ width: "20%" }}>Filing for</td>
                                                                        <td style={{ width: "60%" }}>
                                                                            <Select
                                                                                options={attorneys}
                                                                                onChange={(selectedOption) => handleSelectChange(selectedOption, "selectedAttorneySec")}
                                                                                placeholder="Search and select an attorney"
                                                                                getOptionLabel={(e) => e.label}
                                                                                getOptionValue={(e) => e.value}
                                                                                isClearable
                                                                                isSearchable
                                                                                value={attorneys.find((attorney) => attorney.value === draftValues?.selectedAttorneySec) || null}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="fw-bold">Created by</td>
                                                                        <td>
                                                                            <input
                                                                                name="createdBy"
                                                                                className="form-control"
                                                                                type="text"
                                                                                value={draftValues.createdBy}
                                                                                onChange={handleInputChange}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="fw-bold">Client Matter/ Reference No.</td>
                                                                        <td>
                                                                            <input
                                                                                name="referNo"
                                                                                className="form-control"
                                                                                type="text"
                                                                                value={draftValues.referNo}
                                                                                onChange={handleInputChange}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="fw-bold">Courtesy Email Notice</td>
                                                                        <td>
                                                                            <input
                                                                                name="courtesyemail"
                                                                                className="form-control"
                                                                                type="email"
                                                                                value={draftValues.courtesyemail}
                                                                                onChange={handleInputChange}
                                                                            />
                                                                            <p className="form-text text-black-50">
                                                                                <i className="fa fa-info-circle" style={{ marginRight: "5px" }}></i>
                                                                                Accepts Comma Separated list of email addresses
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="fw-bold">Note to clerk</td>
                                                                        <td>
                                                                            <textarea
                                                                                name="noteToClerk"
                                                                                className="form-control"
                                                                                placeholder="Leave a note to clerk here"
                                                                                value={draftValues.noteToClerk}
                                                                                onChange={handleInputChange}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td></td>
                                                                        <td>
                                                                            <div className="form-check">
                                                                                <input className="form-check-input" type="checkbox" id="verifyCheckbox" required />
                                                                                <label className="form-check-label" htmlFor="verifyCheckbox"> I have verified my filing information.
                                                                                    <i className="fa fa-asterisk" aria-hidden="true" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i></label>
                                                                            </div>
                                                                            <div className="invalid-feedback">
                                                                                You must verify your filing information before submitting.
                                                                            </div>
                                                                            {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                                                            {errorMessage && <div className="alert alert-danger">You must affirm the above
                                                                                information before submitting filing.</div>}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td></td>
                                                                        <td>
                                                                            <div className="row d-flex pt-3">
                                                                                <div className="align-self-end ml-auto">
                                                                                    <button type="submit" disabled={loading} className="col-4 btn btn-default bg-dark text-white me-2">
                                                                                        {loading ? (
                                                                                            <div className="spinner-border spinner-border-sm text-light" role="status">
                                                                                                <span className="sr-only">Loading...</span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            "Submit Filing"
                                                                                        )}
                                                                                    </button>
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
                                                                                    {loadingCount > 0 && (
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
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <!--col-12 end--> */}
                                </form>
                                {showPopup && (
                                    <div style={{
                                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        zIndex: 9999,
                                    }}
                                    >
                                        <div style={{
                                            padding: "20px",
                                            backgroundColor: "white",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
                                        }}
                                        >
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="sr-only">Submitting...</span>
                                            </div>
                                            <p style={{ marginTop: "10px", fontWeight: "bold" }}>Submitting Form...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                        {/* <!-- end title --> */}
                    </div>

                </div>
                {/* <!--section end--> */}
                {/* modal for service contact */}
                <div>
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

                                </div>

                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" onClick={handleClose}>Cancel</Button>
                            <Button variant="dark"  >Add/Attach</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                {/* Modal for discard button */}
                <Modal show={showDiscardButton} onHide={handleCloseDiscard}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className=" p-0 mx-0">
                            <p className=" mx-0 mt-0 mb-3 px-3 py-3 fs-6" style={{ backgroundColor: "#916aab4d" }} >
                                <i className="fa fa-info-circle" aria-hidden="true"></i> Select a method to add/attach a service contact
                            </p>
                        </div>
                        <p style={{ textAlign: "center" }}>Are you sure you would like to discard this filing? <br /> If yes, click Confirm.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCloseDiscard}> Cancel</Button>
                        <Button variant="dark" onClick={handleDiscardDraft} > Confirm</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </WrapperTag>
    )
}

export default EditForm;