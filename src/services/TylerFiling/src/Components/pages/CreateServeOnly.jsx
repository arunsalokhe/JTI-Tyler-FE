import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Trash from '../assets/trash.png';
import Save from '../assets/Save.png';
import Add from '../assets/Add.png';
import CheckMark from '../assets/Checkmark.png';
import Select from "react-select";
import { useFormik } from 'formik';
import LoaderPopup from './LoaderPopup';
import Swal from "sweetalert2";
import * as Yup from "yup";
// import * as pdfjsLib from "pdfjs-dist/build/pdf";

// // Correct way to set the worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//     "pdfjs-dist/build/pdf.worker.mjs",
//     import.meta.url
// ).toString();

import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Try-catch approach for maximum compatibility
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
    ).toString();
} catch (error) {
    // Fallback for IIS/production
    console.log('Falling back to static worker path');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}


const CreateServeOnly = () => {

    const location = useLocation();
    const { filingID } = location.state || {};

    const [selectedOption, setSelectedOption] = useState(""); // Track selected radio button
    const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingCourts, setLoadingCourts] = useState(true);
    const token = sessionStorage.getItem('access_token');
    const [courts, setCourts] = useState([]);
    const [error, setError] = useState(null);
    const [selectedCaseCategoryId, setSelectedCaseCategoryId] = useState(null);
    const [selectedParties, setSelectedParties] = useState([]);
    const [selectedCaseTypeId, setselectedCaseTypeId] = useState(null);
    const [editIndex, setEditIndex] = useState(null); // Track which row is being edited
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [isSaved, setIsSaved] = useState([]);
    const [documentType, setDocumentType] = useState([]);
    const [selectedDocumentType, setSelectedDocumentType] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [securityOptions, setSecurityOptions] = useState([]);
    const [loadingOptionalServices, setLoadingOptionalServices] = useState(false);
    const [optionalServicesOptions, setOptionalServicesOptions] = useState([]);
    const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [removedParties, setRemovedParties] = useState([]);
    const [partiesForApi, setPartiesForApi] = useState([]);
    const [selectedPartiesForAPI, setSelectedPartiesForAPI] = useState([]);
    const [partyTypes, setPartyTypes] = useState([]);
    const [partyList, setPartyList] = useState([]);
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const uploadRefs = useRef([]);
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

    useEffect(() => {
        setLoadingCourts(true);
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

    useEffect(() => {
        if (selectedCaseCategoryId) {
            setLoadingDocumentTypes(true);
            const categoryTypeId = selectedCaseCategoryId.value || selectedCaseCategoryId;

            const baseURL = process.env.REACT_APP_BASE_URL;
            //api for document types categories
            fetch(`${baseURL}/GetFilingCode?categoryId=${categoryTypeId}`)
                .then((response) => response.json())
                .then((data) => {
                    const formattedDocumentTypes = data.map((docType) => ({
                        value: docType.code,
                        label: docType.name,
                        description: docType.description || docType.name,
                        fee: Number(docType.fee) || 0,
                    }));
                    setDocumentType(formattedDocumentTypes);
                    setLoadingDocumentTypes(false);
                })
                .catch((error) => {
                    console.error('Error fetching document types:', error);
                    setLoadingDocumentTypes(false);
                });
        } else {
            setDocumentType([]);
        }

    }, [selectedCaseCategoryId]);

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

    const [userDataList, setUserDataList] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
    });

    useEffect(() => {
        const getUserDetails = async () => {
            const baseURL = process.env.REACT_APP_BASE_URL;
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${baseURL}/GetUserList`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.error(`Failed with status: ${response.status}`);
                    throw new Error("Failed to fetch user details");
                }

                const userData = await response.json();
                console.log("API Response:", userData);

                const { User } = userData.data || {};

                if (Array.isArray(User) && User.length > 0) {
                    const users = User[0];

                    const fullName = `${users.FirstName || ""} ${users.MiddleName || ""} ${users.LastName || ""}`.trim();

                    setUserDataList({
                        firstName: users.FirstName || "",
                        middleName: users.MiddleName || "",
                        lastName: users.LastName || "",
                    });

                    // 🔹 Update Formik's "createdBy" field
                    formik.setFieldValue("createdBy", fullName);

                    console.log("User data:", fullName);
                    setLoading(false);
                } else {
                    setError("No user data available");
                }
            } catch (error) {
                setError(error.message);
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        getUserDetails();
    }, [token]); // 🔹 Runs when token changes


    const formik = useFormik({
        initialValues: {
            selectedCourt: null,
            CaseTrackingID: null,
            caseTitle: '',
            selectedCaseCategoryId: null,
            selectedCaseType: null,
            paymentAccount: null,
            selectedAttorneySec: "471ffa23-2840-4111-aedc-097d855a27f5",
            createdBy: null,
            courtesyemail: "ghorpadesumit471@gmail.com",
            note: "Hello",
            documents: [
                {
                    documentType: "40981",
                    documentDescription: '',
                    fileName: '',
                    fileBase64: '',
                }
            ],
            parties: [],
            selectedParties: [],
        },
        validationSchema: Yup.object().shape({
            selectedCourt: Yup.string().nullable().required('Court selection is required'),
            caseNumber: Yup.string().required('Case number is required'),
            paymentAccount: Yup.string().required('Payment account is required'),
            documents: Yup.array().of(
                Yup.object().shape({
                    documentType: Yup.string().nullable().required('Document type is required'),
                    fileName: Yup.string().nullable().required('File upload is required'),
                })
            ),
            // parties: Yup.array().of(
            //     Yup.object({
            //         roleType: Yup.string().required('Invalid party role option'),
            //         firstName: Yup.string().when('roleType', {
            //             is: '1', // Apply validation only when roleType is '1' for the party
            //             then: (schema) =>
            //                 schema
            //                     .required('First name is required ')
            //                     .min(3, 'First name must be at least 3 characters for party'),
            //             otherwise: (schema) => schema, // No validation for other roleTypes
            //         }),
            //         lastName: Yup.string().when('roleType', {
            //             is: '1', // Apply validation only when roleType is '1' for the party
            //             then: (schema) =>
            //                 schema
            //                     .required('Last name is required')
            //                     .min(3, 'Last name must be at least 3 characters for party'),
            //             otherwise: (schema) => schema, // No validation for other roleTypes
            //         }),
            //         companyName: Yup.string().when('roleType', {
            //             is: '2', // Apply validation only when roleType is '2' for the party
            //             then: (schema) =>
            //                 schema
            //                     .required('Company name is required')
            //                     .min(3, 'Company name must be at least 3 characters for party'),
            //             otherwise: (schema) => schema, // No validation for other roleTypes
            //         }),
            //         selectedAttorney: Yup.string().required('Please Select Attorney'),
            //     })
            // ),

            selectedParties: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.string().required("Party ID is required"),
                        isChecked: Yup.boolean(),
                    })
                )
                .test(
                    'at-least-one-checked',
                    'At least one party must be selected.',
                    (parties) => Array.isArray(parties) && parties.some((party) => party.isChecked === true)
                ),
        }),
        onSubmit: async (values) => {
            setIsSubmitting(true); // 🔹 Show loader before submitting

            console.log("Formik Values Before API Payload:", formik.values);

            const baseURL = process.env.REACT_APP_BASE_URL

            //const apiUrl = 'https://localhost:7207/api/Tyler/ServeFiling';
            const apiUrl = `${baseURL}/ServeFiling`;

            const prepareDocumentsForApi = (documents) => {
                return documents.map((doc) => ({
                    documentType: doc.documentType,
                    documentDescription: doc.documentDescription.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''),
                    fileName: doc.fileName,
                    fileBase64: doc.fileBase64.replace(/^data:application\/pdf;base64,/, ''),
                }));
            };

            const apiPayload = {
                ...formik.values,
                documents: prepareDocumentsForApi(values.documents),
                selectedParties: selectedPartiesForAPIs(formik.values.selectedParties || []),
                parties: preparePartiesForApi(formik.values.parties || []),
            };

            console.log("API Payload:", apiPayload);

            try {
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "accept": "*/*",
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiPayload),
                });

                const responseData = await response.json();
                console.log("API Response:", responseData);

                const errorCode = responseData?.data?.Error?.[0]?.ErrorCode?.Value;
                const errorText = responseData?.data?.Error?.[0]?.ErrorText?.Value || "Unknown Error";

                const envelopeIdObj = responseData?.data?.DocumentIdentification.find(
                    (doc) => doc.Item.Value === "ENVELOPEID"
                );
                const envelopeId = envelopeIdObj ? envelopeIdObj.IdentificationID.Value : "N/A";

                if (errorCode === "0" && errorText === "No Error") {
                    Swal.fire({
                        icon: "success",
                        title: "Filing Successfully Submitted!",
                        html: `<p><strong>Envelope ID:</strong> ${envelopeId}</p>`,
                        confirmButtonText: "Ok",
                        willClose: () => {
                            window.location.reload();
                        },
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Submission Failed",
                        text: `Error: ${errorText}`,
                        confirmButtonText: "Try Again",
                    });
                }
            } catch (error) {
                console.error("API Error:", error);
                Swal.fire({
                    icon: "error",
                    title: "An Error Occurred",
                    text: "Something went wrong while submitting.",
                    confirmButtonText: "Ok",
                });
            } finally {
                setIsSubmitting(false); // 🔹 Hide loader after response
            }
        }
    });

    useEffect(() => {
        if (selectedCaseDetails) {
            formik.setValues({
                ...formik.values,
                selectedCourt: selectedCaseDetails.courtName || null,
                CaseTrackingID: selectedCaseDetails.CaseTrackingID || null,
                caseTitle: selectedCaseDetails.caseTitle || '',
                selectedCaseType: selectedCaseDetails.selectedCaseType || null,
                selectedCaseCategoryId: selectedCaseDetails.selectedCaseCategoryId || null,
            });
        }
    }, [selectedCaseDetails]);

    const searchCase = async (values) => {
        if (!values.caseNumber || !values.selectedCourt) {
            setError("Please enter both Case Number and select a Court.");
            return;
        }

        setLoading(true); // Set loading to true while the request is being processed
        setError(null); // Reset the error message

        try {
            const baseURL = process.env.REACT_APP_BASE_URL
            const response = await fetch(`${baseURL}/GetCase`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    selectedCourt: values.selectedCourt,
                    caseTrackingID: values.caseNumber, // Use case number from Formik values
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            // Extract Case details
            const caseDetails = {
                courtName: responseData.data?.Case?.CaseAugmentation?.CaseCourt?.OrganizationIdentification?.IdentificationID?.Value || "N/A",
                caseNumber: responseData.data?.Case?.CaseDocketID?.Value || "N/A",
                caseTitle: responseData.data?.Case?.CaseTitleText?.Value || "N/A",
                selectedCaseCategoryId: responseData.data?.Case.CaseCategoryText.Value || "N/A",
                selectedCaseType: responseData.data?.Case?.CaseAugmentation1?.CaseTypeText?.Value || "N/A",
                CaseTrackingID: responseData.data?.Case?.CaseAugmentation?.CaseLineageCase?.[0]?.CaseTrackingID?.Value || "N/A"
            };
            console.log("Case Details", caseDetails);

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
            setSelectedCaseDetails(caseDetails); // Set case details for display
            setSelectedParties(mappedParticipants);

        } catch (error) {
            console.error("Error fetching case details:", error);
            setError("Failed to fetch case details. Please try again.");
        } finally {
            setLoading(false); // Reset loading state after API call completes
        }
    };

    const handleDocumentTypeChange = async (selectedOption, index) => {

        // Update document type and description in formik
        formik.setFieldValue(`documents[${index}].documentType`, selectedOption.value);
        formik.setFieldValue(`documents[${index}].documentDescription`, selectedOption.description || "");
        formik.setFieldValue(`documents[${index}].fee`, selectedOption.fee || 0);

        // Determine if both value and description are set, then show the table
        if (selectedOption.value && selectedOption.description) {
            setShowTable(true);
        }

        setSelectedDocumentType(selectedOption);
        // Fetch optional services for the selected document type
        await fetchOptionalServices(selectedOption);

        // Fetch security types for the selected document type
        await fetchSecurityTypes(selectedOption.value, index);
    };

    //to add new documents in new row
    const handleAddDocument = () => {
        const newDocument = {
            documentType: null,
            documentDescription: "",
            fileName: '',
            fileBase64: '',
            securityType: [],
            optionalServicesSelections: [{ Quantity: null, }],

        };
        formik.setFieldValue("documents", [...formik.values.documents, newDocument]);
        setIsSaved([...isSaved, false]);

    };

    //function to add file or documnets 
    // const handleFileUpload = async (event, index) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const base64String = await convertToBase64(file); // Convert file to Base64

    //         // Update formik fields
    //         formik.setFieldValue(`documents[${index}].file`, file); // Save the file
    //         formik.setFieldValue(`documents[${index}].fileName`, file.name); // Update fileName
    //         formik.setFieldValue(`documents[${index}].fileBase64`, base64String); // Update fileBase64

    //         // Auto-save after file upload
    //         handleSave(index);
    //     }
    // };

    const handleFileUpload = async (event, index) => {
        const file = event.target.files[0];

        if (file) {
            const base64String = await convertToBase64(file); // Convert file to Base64
            const fileSizeKB = (file.size / 1024).toFixed(1); // Convert size to KB
            const fileURL = URL.createObjectURL(file); // Create a temporary URL for preview

            try {
                // Load PDF and get page count
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = async function () {
                    const pdfData = new Uint8Array(fileReader.result);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    const pageCount = pdf.numPages;

                    // Update formik fields
                    formik.setFieldValue(`documents[${index}].file`, file); // Save the file
                    formik.setFieldValue(`documents[${index}].fileName`, file.name); // Update fileName
                    formik.setFieldValue(`documents[${index}].fileBase64`, base64String); // Update fileBase64
                    formik.setFieldValue(`documents[${index}].fileSize`, fileSizeKB); // Save file size
                    formik.setFieldValue(`documents[${index}].pageCount`, pageCount); // Save page count
                    formik.setFieldValue(`documents[${index}].fileURL`, fileURL); // Save file URL for preview

                    // Auto-save after file upload
                    handleSave(index);
                };
            } catch (error) {
                console.error("Error reading PDF file:", error);
            }
        }
    };

    // function to convert file to Base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]); // Extract only the Base64 part
            reader.onerror = (error) => reject(error);
        });
    };

    //crud operations for documents
    //handle to edit rows for documents
    const handleEdit = (index) => {
        setEditIndex(index);
        setIsSaved((prevState) => {
            const updatedState = [...prevState];
            updatedState[index] = false; // Allow editing
            return updatedState;
        });
    };

    const handleSave = (index) => {
        setIsSaved((prevState) => {
            const updatedState = [...prevState];
            updatedState[index] = true;
            return updatedState;
        });
        setEditIndex(null);
    };

    const handleCancel = (index) => {
        setEditIndex(null); // Cancel edit
    };

    const handleDelete = (index) => {
        setDeleteIndex(index);
    };

    const handleConfirmDelete = () => {
        const updatedDocuments = formik.values.documents.filter((_, index) => index !== deleteIndex);
        formik.setFieldValue('documents', updatedDocuments); // Update form values
        setDeleteIndex(null) // Confirm deletion and reset the delete state
    };

    const handleCancelDelete = () => {
        setDeleteIndex(null); // Cancel deletion
    };

    //fetch API for security services
    const fetchSecurityTypes = async (filingCode, index) => {
        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const response = await fetch(`${baseURL}/GetDocumentCode?filingcode=${filingCode}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch security types: ${response.status}`);
            }

            const data = await response.json();

            // Format security types
            const formattedSecurityTypes = data.map((securityType) => ({
                value: securityType.code,
                label: securityType.name,
            }));

            // Set the security options for the specific document
            setSecurityOptions((prevOptions) => {
                const newOptions = [...prevOptions];
                newOptions[index] = formattedSecurityTypes; // Store security options for the current document
                return newOptions;
            });
        } catch (error) {
            console.error("Error fetching security types:", error);
        }
    };

    //fetch API for optional services 
    const fetchOptionalServices = async (selectedDocumentType) => {

        if (selectedDocumentType) {
            setLoadingOptionalServices(true);
            try {
                const baseURL = process.env.REACT_APP_BASE_URL;
                const response = await fetch(`${baseURL}/GetCourtOptionalServices?filingcode=${selectedDocumentType.value}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch optional services: ${response.status}`);
                }

                const data = await response.json();
                const formattedOptionalServices = data.map((service) => ({
                    value: service.code,
                    label: service.name,
                    multiplier: service.multiplier || null,
                    fee: Number(service.fee) || 0,
                }));

                setOptionalServicesOptions(formattedOptionalServices);
                setLoadingOptionalServices(false);
            } catch (error) {
                console.error("Error fetching optional services:", error);
            } finally {
                setLoadingOptionalServices(false);
            }
        }

    };

    const handleSelectAllChange = () => {
        // Toggle the selectAll state (check/uncheck)
        const newSelectAll = !selectAll;
        console.log("Toggling Select All:", newSelectAll);

        // Update `isChecked` for all `selectedParties`
        const updatedSelectedParties = selectedParties.map((party) => ({
            ...party,
            isChecked: newSelectAll,
            suffix: party.suffix || "",
            selectedAttorney: party.selectedAttorney || "",
            selectedBarNumbers: party.selectedBarNumbers || [],
        }));

        setSelectedParties(updatedSelectedParties); // Update local state

        // Update Formik state
        formik.setFieldValue("selectedParties", updatedSelectedParties);

        // 🔥 Manually mark field as touched and trigger validation
        formik.setTouched({ ...formik.touched, selectedParties: true });
        formik.validateField("selectedParties"); // Trigger validation for `selectedParties`

        // Update selectAll state
        setSelectAll(newSelectAll);
        console.log("Formik selectedParties:", formik.values.selectedParties);

    };


    // Combine selectedParties and formik.values.selectedParties without duplicates
    const combinedParties = [
        ...formik.values.selectedParties.filter(
            (party) => !removedParties.includes(party.id) // Filter out removed parties
        ),
        ...selectedParties.filter(
            (party) =>
                !formik.values.selectedParties.some((existingParty) => existingParty.id === party.id) &&
                !removedParties.includes(party.id) // Include new and valid parties
        ),
    ];

    //handle to select checkbox
    const handleRowCheckboxChange = (partyId) => {
        console.log("Checkbox Change Triggered for Party ID:", partyId);

        // Update selectedParties state
        const updatedSelectedParties = formik.values.selectedParties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    isChecked: !party.isChecked, // Toggle checkbox state
                    suffix: party.suffix || "", // Ensure suffix is maintained, fallback to empty if undefined
                    selectedAttorney: party.selectedAttorney || "", // Ensure selectedAttorney is maintained
                    selectedBarNumbers: Array.isArray(party.selectedBarNumbers) ? party.selectedBarNumbers : [], // Ensure selectedBarNumbers is an array
                }
                : party
        );
        // setSelectedParties(updatedSelectedParties);

        // Check if the party is part of `selectedParties` but not yet in `formik.values.selectedParties`
        const newParty = selectedParties.find(
            (party) => party.id === partyId && !formik.values.selectedParties.some((p) => p.id === party.id)
        );

        if (newParty) {
            updatedSelectedParties.push({ ...newParty, isChecked: true });
        }


        // Update Formik's parties array with the new `isChecked` state
        const updatedFormikParties = formik.values.parties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    isChecked: !party.isChecked,
                    suffix: party.suffix || "",
                    selectedAttorney: party.selectedAttorney || "",
                    selectedBarNumbers: Array.isArray(party.selectedBarNumbers) ? party.selectedBarNumbers : [],
                }
                : party
        );
        formik.setFieldValue("parties", updatedFormikParties);

        // Update Formik's selectedParties array with the new `isChecked` state
        const updatedFormikSelectedParties = formik.values.selectedParties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    isChecked: !party.isChecked,
                    suffix: party.suffix || "",
                    selectedAttorney: party.selectedAttorney || "",
                    selectedBarNumbers: Array.isArray(party.selectedBarNumbers) ? party.selectedBarNumbers : [],
                }
                : party
        );
        formik.setFieldValue("selectedParties", updatedFormikSelectedParties);

        // Filter selected items
        const selectedItems = updatedSelectedParties.filter((party) => party.isChecked);
        console.log("Currently Selected Items:", selectedItems);

        // Prepare parties for API
        const preparePartiesForApi = (partyList) => {
            return partyList.map((party) => ({
                selectedPartyType: party.selectedPartyType,
                roleType: party.roleType,
                lastName: party.lastName || '',
                firstName: party.firstName || '',
                middleName: party.middleName || 'N/A',
                suffix: party.suffix || '',
                companyName: party.companyName || '',
                address: party.Address || '',
                address2: party.Address2 || '',
                city: party.City || '',
                state: party.State || '',
                zip: party.Zip || '',
                addressUnknown: !party.Address,
                internationalAddress: party.internationalAddress || '',
                saveToAddressBook: true,
                selectedAttorney: party.selectedAttorney || '',
                selectedBarNumbers: party.selectedBarNumbers || [],
            }));
        };

        // Prepare `selectedPartiesForAPI`
        const selectedPartiesForAPIs = selectedItems.map((party) => {
            console.log("Party being processed:", party); // Debug log
            return {
                partyName:
                    String(party.roleType) === '1'
                        ? `${party.firstName || ''}${party.lastName || ''}`.trim()
                        : (party.companyName || `${party.firstName || ''}${party.lastName || ''}`).replace(/\s+/g, ''),
                partyType: party.selectedPartyType || 'Unknown',
                role: party.roleType || 'Unknown',
            };
        });

        // console.log("Selected Parties for API:", selectedPartiesForAPI);

        // Update state
        const preparedParties = preparePartiesForApi(selectedItems);
        //setPartiesForApi(preparedParties);
        setSelectedPartiesForAPI(selectedPartiesForAPIs);
        formik.setFieldValue("selectedParties", updatedSelectedParties); // Set and validate
        // console.log("Updated selectedParties in Formik:", updatedSelectedParties);
        console.log("prepare Parties", preparedParties);
    };

    const selectedPartiesForAPIs = (selectedParties) => {
        return selectedParties.map((party) => ({
            partyName:
                String(party.roleType) === '1'
                    ? `${party.firstName || ''} ${party.lastName || ''}`.trim()
                    : (party.companyName || `${party.firstName || ''} ${party.lastName || ''}`).replace(/\s+/g, ''),
            partyType: party.selectedPartyType || 'Unknown',
            role: party.roleType || 'Unknown',
        }));
    };


    const preparePartiesForApi = (partyList) => {
        return partyList.map((party) => ({
            selectedPartyType: party.selectedPartyType,
            roleType: party.roleType,
            lastName: party.lastName || '',
            firstName: party.firstName || '',
            middleName: party.middleName || 'N/A',
            suffix: party.suffix || '',
            companyName: party.companyName || '',
            address: party.Address || '',
            address2: party.Address2 || '',
            city: party.City || '',
            state: party.State || '',
            zip: party.Zip || '',
            addressUnknown: !party.Address,
            internationalAddress: party.internationalAddress || '',
            saveToAddressBook: true,
            selectedAttorney: "471ffa23-2840-4111-aedc-097d855a27f5", //party.selectedAttorney || '',added hardcoded because we dont have any case number
            selectedBarNumbers: party.selectedBarNumbers || [],
        }));
    };

    useEffect(() => {
        if (formik.values.selectedParties.length > 0) {
            const preparedParties = preparePartiesForApi(formik.values.selectedParties);

            // Ensure Formik's `parties` gets updated
            formik.setFieldValue("parties", preparedParties);
            setPartiesForApi(preparedParties);
            console.log("Updated Formik Parties:", formik.values.parties); // Check if it updates
        }
    }, [formik.values.selectedParties]);


    const PartyRoleMapping = {
        2: "Individual", // Mapping for ItemElementName = 2
        1: "Business" // Mapping for ItemElementName = 1        
    };

    const PartyTypeMapping = {
        "17088": "Plaintiff",
        "6610": "Defendant"
    };

    const paymentAccountOptions = paymentAccounts.map((account) => ({
        value: account.PaymentAccountID,
        label: account.AccountName,
    }));

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };


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
                                    Filing {filingID} - RESERVED{" "}
                                    <i className="fa fa-clock-o fa-fw" aria-hidden="true"></i>
                                </h1>
                            </div>

                            {/* Right Side - Buttons */}
                            <div className="col-md-5 d-flex justify-content-md-end mt-3 mt-md-0">
                                <a
                                    href="#"
                                    className="custom-link me-3"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        //handleShowDiscardButton();
                                    }}
                                >
                                    <i className="fa fa-trash fa-fw"></i> Discard
                                </a>
                                <a
                                    href="#"
                                    className="custom-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        //handleSaveDraft();
                                    }}
                                >
                                    <i className="fa fa-floppy-o fa-fw"></i> Save Draft
                                </a>
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
                                maxWidth: "100%", // Ensures it doesn't overflow
                            }}
                        >
                            <div className="panel-body">
                                <div className="row">
                                    <div className="col-md-12 lh32 d-flex align-items-center gap-2">
                                        <i className="fa fa-info-circle fa-fw"></i>
                                        <span><b>Serve Only</b> - Complete the below filing steps and submit to serve your documents.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- form sections --> */}
                    <div className="row justify-content-center mt-4">
                        {/* 🔹 Loader UI - Displays while submitting */}
                        {isSubmitting && <LoaderPopup message="File Submitting..." />}
                        <form method="post" onSubmit={formik.handleSubmit}>
                            <div className="col-12 col-md-12 col-xl-12 align-items-center">
                                <div className="card p-2">
                                    <div className="card-body">
                                        <div className="row">
                                            {/* <!-- section 1 --> */}
                                            <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        1 . Select Case
                                                        <span className='fw-normal' style={{ fontSize: "16px" }}> - Choose your case, or click add a case to retrieve your case from the court’s system.</span>
                                                    </p>
                                                </div>
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {!selectedCaseDetails && (
                                                        <>
                                                            <div className="form-check form-check-inline">
                                                                <input
                                                                    type="radio"
                                                                    name="caseSourceCode"
                                                                    value="existing"
                                                                    id="gwt-uid-221"
                                                                    tabIndex="0"
                                                                    className="checkbox-fontawesome"
                                                                    checked={selectedOption === "existing"}
                                                                    onChange={() => setSelectedOption("existing")}
                                                                />
                                                                <label className="form-check-label" htmlFor="gwt-uid-221">
                                                                    Serve Only - Existing Court Case
                                                                </label>
                                                            </div>
                                                            <div className="form-check form-check-inline">
                                                                <input
                                                                    type="radio"
                                                                    name="caseSourceCode"
                                                                    value="new"
                                                                    id="gwt-uid-222"
                                                                    tabIndex="0"
                                                                    className="checkbox-fontawesome"
                                                                    checked={selectedOption === "new"}
                                                                    onChange={() => setSelectedOption("new")}
                                                                />
                                                                <label className="form-check-label me-4" htmlFor="gwt-uid-222">
                                                                    Serve Only - Not Associated with a Case
                                                                </label>
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Conditionally Show Court Selection Form */}
                                                    {selectedOption === "existing" && (
                                                        <div className="col-12 col-md-12 col-lg-12 mb-4 mt-4">
                                                            <div className="container">
                                                                {/* Conditionally render form or case details */}
                                                                {!selectedCaseDetails ? (
                                                                    <>
                                                                        {/* Court and Case Number Inputs */}
                                                                        <div className="row mb-3">
                                                                            <label htmlFor="court" className="col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                                                Court<i className="fa fa-asterisk" aria-hidden="true"
                                                                                    style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                            </label>
                                                                            <div className="col-sm-5">
                                                                                <Select
                                                                                    id="court-dropdown"
                                                                                    options={courts}
                                                                                    value={courts.find((court) => court.value === formik.values.selectedCourt) || null}
                                                                                    onChange={(selectedOption) => formik.setFieldValue("selectedCourt", selectedOption?.value || "")}
                                                                                    placeholder={loading ? "Loading courts..." : "Search or select a court"}
                                                                                    isLoading={loading}
                                                                                    isSearchable
                                                                                    noOptionsMessage={() => "No courts found"}
                                                                                />
                                                                                {formik.touched.selectedCourt && formik.errors.selectedCourt && (
                                                                                    <div className="text-danger" style={{ fontSize: "15px", marginTop: "5px" }}>
                                                                                        {formik.errors.selectedCourt}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="row mb-3">
                                                                            <label htmlFor="caseNumber" className="col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                                                Case Number<i className="fa fa-asterisk" aria-hidden="true"
                                                                                    style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                            </label>
                                                                            <div className="col-sm-5">
                                                                                <input
                                                                                    type="text"
                                                                                    id="caseNumber"
                                                                                    name="caseNumber"
                                                                                    value={formik.values.caseNumber}
                                                                                    onChange={formik.handleChange}
                                                                                    onBlur={formik.handleBlur}
                                                                                    placeholder="Enter Case Number"
                                                                                    style={{
                                                                                        padding: "6px",
                                                                                        marginTop: "5px",
                                                                                        width: "100%",
                                                                                        fontSize: "16px",
                                                                                        border: "1px solid #ccc",
                                                                                        borderRadius: "4px",
                                                                                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                                                                                        transition: "all 0.3s ease-in-out",
                                                                                    }}
                                                                                />
                                                                                {formik.touched.caseNumber && formik.errors.caseNumber && (
                                                                                    <div className="text-danger" style={{ fontSize: "15px", marginTop: "5px" }}>
                                                                                        {formik.errors.caseNumber}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="row mb-2">
                                                                            <div className="offset-2 col-sm-5 col-md-6">
                                                                                {/* Search Link */}
                                                                                <Link
                                                                                    onClick={async (e) => {
                                                                                        e.preventDefault();
                                                                                        if (!loading) {
                                                                                            await searchCase(formik.values);
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        display: "inline-block",
                                                                                        padding: "8px 12px",
                                                                                        backgroundColor: loading ? "#ccc" : "#4CAF50", // Gray out when loading
                                                                                        color: "white",
                                                                                        textAlign: "center",
                                                                                        textDecoration: "none",
                                                                                        borderRadius: "4px",
                                                                                        cursor: loading ? "not-allowed" : "pointer", // Disable cursor when loading
                                                                                    }}
                                                                                >
                                                                                    {loading ? "Loading..." : "Search"}
                                                                                </Link>
                                                                                {/* Error Message */}
                                                                                {error && (
                                                                                    <div style={{ color: "red", marginTop: "20px" }}>
                                                                                        <p>{error}</p>
                                                                                    </div>
                                                                                )}
                                                                                <p className="text-secondary">You must first select a court to load available case types.</p>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    // Display Case Details
                                                                    <div style={{ marginTop: "-20px", padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }}>
                                                                        {/* Court Row with Edit Icon */}
                                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                                                            <div style={{ flex: "1", display: "flex", justifyContent: "space-between" }}>
                                                                                <span style={{ fontWeight: "bold", minWidth: "120px", textAlign: "left" }}>Court:</span>
                                                                                <span style={{ flex: "1", textAlign: "left" }}>
                                                                                    {formik.values.selectedCourt || selectedCaseDetails.courtName || "N/A"}
                                                                                </span>
                                                                            </div>
                                                                            <Link
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    setSelectedCaseDetails(null); // Reset to show input fields again
                                                                                    setSelectedParties([]); // Clear selected parties
                                                                                    formik.resetForm(); // Reset form values
                                                                                }}
                                                                                style={{
                                                                                    marginLeft: "20px",
                                                                                    padding: "6px 10px",
                                                                                    color: "#336C9D",
                                                                                    textDecoration: "none",
                                                                                    borderRadius: "4px",
                                                                                    cursor: "pointer",
                                                                                    fontSize: "14px",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                }}
                                                                            >
                                                                                <i className="fa fa-edit fa-fw" style={{ marginRight: "5px" }}></i> Change Case
                                                                            </Link>
                                                                        </div>

                                                                        {/* Divider Line */}
                                                                        <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "15px 0" }} />

                                                                        {/* Case Number Row */}
                                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                                                            <span style={{ fontWeight: "bold", minWidth: "120px", textAlign: "left" }}>Case No.</span>
                                                                            <span style={{ flex: "1", textAlign: "left" }}>{selectedCaseDetails.caseNumber || "N/A"}</span>
                                                                        </div>

                                                                        {/* Divider Line */}
                                                                        <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "15px 0" }} />

                                                                        {/* Case Title Row */}
                                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                            <span style={{ fontWeight: "bold", minWidth: "120px", textAlign: "left" }}>Case Title</span>
                                                                            <span style={{ flex: "1", textAlign: "left" }}>{selectedCaseDetails.caseTitle || "N/A"}</span>
                                                                        </div>
                                                                    </div>

                                                                )}
                                                                {/* Loader Popup */}
                                                                {loading && <LoaderPopup message="Getting your case details..." />}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                            {/* <!-- section 2 --> */}
                                            <div className="col-12 mb-3">
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        2. Add Documents
                                                        <span className="fw-normal" style={{ fontSize: "16px" }}>
                                                            {" "}
                                                            - Define, select, and upload the documents that make up your filing.
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedCaseDetails ? (
                                                        <div className="row mb-3">
                                                            <div className="col-12">
                                                                <div className="table-responsive">
                                                                    <table className="table table-borderless" id="table-list">
                                                                        <thead className="border-bottom">
                                                                            <tr>
                                                                                <th style={{ whiteSpace: "nowrap" }}>Document Type</th>
                                                                                <th style={{ whiteSpace: "nowrap" }}>Document Description</th>
                                                                                <th style={{ whiteSpace: "nowrap" }}>File Name</th>
                                                                                <th style={{ whiteSpace: "nowrap" }}>Actions</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {formik.values.documents.map((document, index) => (
                                                                                <tr key={index} className="border-bottom">
                                                                                    <td>
                                                                                        <div>Service Only</div>
                                                                                    </td>
                                                                                    <td>
                                                                                        {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                                            <div>
                                                                                                {document.documentDescription ? (
                                                                                                    document.documentDescription
                                                                                                ) : (
                                                                                                    <p className="help-block text-danger">
                                                                                                        <i className="fa fa-exclamation-triangle fa-fw" aria-hidden="true"></i>
                                                                                                        <small aria-hidden="true"> Required</small>
                                                                                                    </p>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <input
                                                                                                type="text"
                                                                                                id={`documentName-${index}`}
                                                                                                style={{ height: "36px" }}
                                                                                                value={document.documentDescription}
                                                                                                onChange={(e) =>
                                                                                                    formik.setFieldValue(`documents[${index}].documentDescription`, e.target.value)
                                                                                                }
                                                                                                placeholder="Enter document description"
                                                                                                className="form-control"
                                                                                                required
                                                                                            />
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        {formik.values.documents[index]?.fileName ? (
                                                                                            <div>
                                                                                                <a
                                                                                                    href={formik.values.documents[index]?.fileURL}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="gwt-Anchor gf-subSectionFileLink"
                                                                                                    title={formik.values.documents[index]?.fileName}
                                                                                                >
                                                                                                    {formik.values.documents[index]?.fileName} ({formik.values.documents[index]?.fileSize} kB, {formik.values.documents[index]?.pageCount} pg.)
                                                                                                </a>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div style={{ width: "100%", height: "100%" }}>
                                                                                                <input
                                                                                                    type="file"
                                                                                                    ref={(el) => (uploadRefs.current[index] = el)}
                                                                                                    accept=".pdf"
                                                                                                    id={`file-upload-${index}`}
                                                                                                    onChange={(event) => handleFileUpload(event, index)}
                                                                                                    style={{ display: "none" }}
                                                                                                />
                                                                                                <a
                                                                                                    className="button"
                                                                                                    role="link"
                                                                                                    onClick={() => uploadRefs.current[index]?.click()}
                                                                                                    style={{ cursor: "pointer", color: "#007bff", textDecoration: "none" }}
                                                                                                >
                                                                                                    <i className="fa fa-paperclip fa-fw" aria-hidden="true"></i>
                                                                                                    Click to Upload
                                                                                                </a>
                                                                                                {formik.touched.documents?.[index]?.fileName &&
                                                                                                    formik.errors.documents?.[index]?.fileName && (
                                                                                                        <div className="text-danger">{formik.errors.documents[index].fileName}</div>
                                                                                                    )}
                                                                                            </div>
                                                                                        )}
                                                                                    </td>

                                                                                    <td>
                                                                                        {editIndex === index ? (
                                                                                            <>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="btn btn-success btn-sm me-2"
                                                                                                    onClick={() => handleSave(index)}
                                                                                                >
                                                                                                    Save
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="btn btn-dark btn-sm"
                                                                                                    onClick={() => handleCancel(index)}
                                                                                                >
                                                                                                    Cancel
                                                                                                </button>
                                                                                            </>
                                                                                        ) : deleteIndex === index ? (
                                                                                            <>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="btn btn-danger btn-sm me-2"
                                                                                                    onClick={handleConfirmDelete}
                                                                                                >
                                                                                                    Confirm
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="btn btn-dark btn-sm"
                                                                                                    onClick={handleCancelDelete}
                                                                                                >
                                                                                                    Cancel
                                                                                                </button>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <a
                                                                                                    href="#"
                                                                                                    className="btn btn-dark btn-sm me-2"
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
                                                                                                        handleEdit(index);
                                                                                                    }}
                                                                                                >
                                                                                                    Edit
                                                                                                </a>
                                                                                                <a
                                                                                                    href="#"
                                                                                                    className="btn btn-dark btn-sm"
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
                                                                                                        handleDelete(index);
                                                                                                    }}
                                                                                                >
                                                                                                    Delete
                                                                                                </a>
                                                                                            </>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                <div className="mt-2">
                                                                    <a
                                                                        href="javascript:void(0);"
                                                                        className="gwt-Anchor"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleAddDocument();
                                                                        }}
                                                                        style={{ textDecoration: "none" }}
                                                                    >
                                                                        <i className="fa fa-plus-circle fa-fw" aria-hidden="true"></i> Add Document
                                                                    </a>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="m-0" style={{ fontSize: "15px" }}>
                                                            Select case type / case to load available document types.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* <!-- section 3 --> */}
                                            <div className="col-12 mb-3">
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        3. Filing Party
                                                        <span className="fw-normal" style={{ fontSize: "16px" }}>
                                                            {" "}
                                                            - Choose the party or parties you are filing on behalf of. If using a keyboard,
                                                            select parties with the enter key instead of the spacebar.
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedCaseTypeId ? (
                                                        <>
                                                            {selectedParties.length > 0 ? (
                                                                <div className="table-responsive mb-3">
                                                                    <table className="table table-borderless text-nowrap w-100">
                                                                        <thead>
                                                                            <tr className="fw-bold border-bottom">
                                                                                <th>
                                                                                    <input
                                                                                        name="checkboxItems"
                                                                                        type="checkbox"
                                                                                        checked={selectAll}
                                                                                        onChange={handleSelectAllChange}
                                                                                    />
                                                                                </th>
                                                                                <th>Party Name</th>
                                                                                <th>Party Type</th>
                                                                                <th>Role</th>
                                                                                <th></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {combinedParties.map((party) => (
                                                                                <tr key={party.id} className="border-bottom">
                                                                                    <td>
                                                                                        <input
                                                                                            name={`checkboxItems_${party.id}`}
                                                                                            type="checkbox"
                                                                                            checked={party.isChecked || false}
                                                                                            onChange={() => handleRowCheckboxChange(party.id)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        {party.firstName && party.lastName
                                                                                            ? `${party.firstName} ${party.lastName}`
                                                                                            : "N/A"}
                                                                                    </td>
                                                                                    <td>
                                                                                        {party.roleType === "1"
                                                                                            ? "Individual"
                                                                                            : party.roleType === "2"
                                                                                                ? "Business"
                                                                                                : PartyRoleMapping[party.roleType] || "N/A"}
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

                                                                    {formik.touched.selectedParties && formik.errors.selectedParties && (
                                                                        <div className="text-danger" style={{ fontSize: "15px", marginTop: "5px" }}>
                                                                            {formik.errors.selectedParties}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-muted" style={{ fontSize: "15px" }}>
                                                                    No parties selected yet.
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p style={{ margin: "0", fontSize: "15px" }}>
                                                            Add parties above to load available parties to select..
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* <!-- section 4 --> */}
                                            {/* <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                    <div className="section-case-bg row border mb-3 shadow align-items-center p-2">
                                                        <p className="fw-bold mb-0">4 . New Case Parties - Enter the required parties.</p>
                                                    </div>
                                                    <div className="row mb-3" >
                                                        <label className="col-sm-2 form-label fw-bold mb-0 mt-2">
                                                            <img className="img-responsive" width="25" height="25" src={Add} alt='add' />
                                                            <Link className=" text-decoration-none text-dark" href="#">   Add Party </Link>
                                                        </label>
                                                    </div>
                                                </div> */}
                                            {/* <!-- section 5 --> */}
                                            <div className="col-12 mb-3">
                                                {/* Section Header */}
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        4. Postage & Handling
                                                        <span className="fw-normal" style={{ fontSize: "16px" }}>
                                                            {" "}
                                                            - Mail Service fees paid separately from fees.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Table */}
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    <div className="table-responsive">
                                                        <table
                                                            aria-label="Postage and Handling Fees"
                                                            className="table table-bordered"
                                                        >
                                                            <thead style={{ backgroundColor: "#f5f5f5" }}>
                                                                <tr className="fw-bold">
                                                                    <th scope="col">Service Fees</th>
                                                                    <th scope="col" className="text-end">
                                                                        Estimated
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>Mail Service Fees</td>
                                                                    <td className="text-end">$0.00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Convenience Fee</td>
                                                                    <td className="text-end">$0.00</td>
                                                                </tr>
                                                                <tr className="fw-bold">
                                                                    <td className="text-center">Sub-Total</td>
                                                                    <td className="text-end">$0.00</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Payment Account Selection */}
                                                    <div className="row mb-3 pt-3 align-items-center">
                                                        <div className="col-12 col-md-auto mb-2 mb-md-0">
                                                            <label htmlFor="paymentAccount" className="fw-bold text-nowrap">
                                                                Select Payment Account
                                                            </label>
                                                        </div>
                                                        <div className="col">
                                                            <Select
                                                                id="paymentAccount"
                                                                options={paymentAccountOptions}
                                                                value={
                                                                    paymentAccountOptions.find(
                                                                        (option) => option.value === formik.values.paymentAccount
                                                                    ) || null
                                                                }
                                                                onChange={(selectedOption) =>
                                                                    formik.setFieldValue(
                                                                        "paymentAccount",
                                                                        selectedOption?.value || null
                                                                    )
                                                                }
                                                                isSearchable={true}
                                                                placeholder="Choose payment account"
                                                                styles={{
                                                                    control: (provided) => ({
                                                                        ...provided,
                                                                        minWidth: "100%",
                                                                    }),
                                                                    menu: (provided) => ({
                                                                        ...provided,
                                                                        minWidth: "100%",
                                                                    }),
                                                                    menuList: (provided) => ({
                                                                        ...provided,
                                                                        width: "100%",
                                                                    }),
                                                                }}
                                                            />
                                                            {formik.touched.paymentAccount && formik.errors.paymentAccount && (
                                                                <div className="text-danger mt-1" style={{ fontSize: "15px" }}>
                                                                    {formik.errors.paymentAccount}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- section 6 --> */}
                                            <div className="col-12 mb-3">
                                                {/* Section Header */}
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        5. Review & Submit
                                                        <span className="fw-normal" style={{ fontSize: "16px" }}>
                                                            {" "}
                                                            - Finalize your submission, review, and submit.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Created By */}
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    <div className="row mb-3">
                                                        <div className="col-12 col-md-3 fw-bold">Created by</div>
                                                        <div className="col-12 col-md-9">
                                                            <input
                                                                name="createdBy"
                                                                className="form-control"
                                                                type="text"
                                                                value={formik.values.createdBy}
                                                                readOnly
                                                                style={{
                                                                    backgroundColor: "#e9ecef",
                                                                    cursor: "not-allowed",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Client Matter / Ref No */}
                                                    <div className="row mb-3">
                                                        <div className="col-12 col-md-3 fw-bold">Client Matter/ Reference No.</div>
                                                        <div className="col-12 col-md-9">
                                                            <input className="form-control" type="text" placeholder="" />
                                                        </div>
                                                    </div>

                                                    {/* Checkbox Verification */}
                                                    <div className="row mb-3">
                                                        <div className="col-12 col-md-9 offset-md-3">
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="verifyCheckbox"
                                                                    required
                                                                />
                                                                <label className="form-check-label" htmlFor="verifyCheckbox">
                                                                    I have verified my service information, and understand I am
                                                                    submitting these documents for <strong>SERVICE ONLY</strong>, and
                                                                    that they will not be filed with the Court.{" "}
                                                                    <i
                                                                        className="fa fa-asterisk"
                                                                        aria-hidden="true"
                                                                        style={{
                                                                            color: "red",
                                                                            fontSize: "8px",
                                                                            verticalAlign: "top",
                                                                        }}
                                                                    ></i>
                                                                </label>
                                                            </div>

                                                            <div className="invalid-feedback">
                                                                You must verify your filing information before submitting.
                                                            </div>

                                                            {successMessage && (
                                                                <div className="alert alert-success mt-2">{successMessage}</div>
                                                            )}
                                                            {errorMessage && (
                                                                <div className="alert alert-danger mt-2">
                                                                    You must affirm the above information before submitting filing.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Submit Buttons */}
                                                    <div className="row pt-3 justify-content-center">
                                                        <div className="col-12 col-md-auto d-flex flex-column flex-md-row align-items-center gap-2">
                                                            <button
                                                                type="submit"
                                                                className="btn btn-dark text-white"
                                                                disabled={isSubmitting}
                                                            >
                                                                {isSubmitting ? "Submitting..." : "Submit Service"}
                                                            </button>
                                                            <button type="button" className="btn btn-dark text-white">
                                                                Save Draft
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <!--col-12 end--> */}
                        </form>
                    </div>
                </div>
            </div>
        </WrapperTag>
    )
};

export default CreateServeOnly;