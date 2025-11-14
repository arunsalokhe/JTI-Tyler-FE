import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { useFormik } from 'formik';
import * as Yup from "yup";
import LoaderPopup from './LoaderPopup';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
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


function ExistingCase() {
    const navigate = useNavigate();
    const location = useLocation();
    const { filingID } = location.state || {};
    const token = sessionStorage.getItem('access_token');
    const [courts, setCourts] = useState([]); // Court options
    const [selectedCaseDetails, setSelectedCaseDetails] = useState(null); // For storing the case details after API call
    const [loading, setLoading] = useState(false);
    const [loadingPopup, setLoadingPopup] = useState(false);
    const [loadingCourts, setLoadingCourts] = useState(true); // For court data loading
    const [error, setError] = useState(null);
    const [documentType, setDocumentType] = useState([]);
    const [selectedDocumentType, setSelectedDocumentType] = useState(null);
    //party declaration list
    const [selectAll, setSelectAll] = useState(false);
    const [selectedParties, setSelectedParties] = useState([]);
    const [partyList, setPartyList] = useState([]);
    const [editIndex, setEditIndex] = useState(null); // Track which row is being edited
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [isSaved, setIsSaved] = useState([]); // Track if a row has been saved
    const [selectedPartyType, setSelectedPartyType] = useState(null);
    const [showDiv, setShowDiv] = useState(true);
    const [partyTypes, setPartyTypes] = useState([]);
    const [suffixOptions, setSuffixOptions] = useState([]);
    const [attorneys, setAttorneys] = useState([]);
    const [selectedCaseTypeId, setselectedCaseTypeId] = useState(null);
    const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
    const [securityOptions, setSecurityOptions] = useState([]);
    const [loadingOptionalServices, setLoadingOptionalServices] = useState(false);
    const [optionalServicesOptions, setOptionalServicesOptions] = useState([]);
    //service conatct list 
    const [show, setShow] = useState(false);
    const [contactList, setContactList] = useState([]);
    const [selectedContactList, setSelectedContactList] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('from-my-firm');
    const [selectedContacts, setSelectedContacts] = useState([]); // Contacts selected in the modal
    const [searchFilters, setSearchFilters] = useState({
        firstName: '',
        lastName: '',
        firmName: '',
    });
    const [removedParties, setRemovedParties] = useState([]);
    const [partiesForApi, setPartiesForApi] = useState([]);
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [allowanceCharges, setAllowanceCharges] = useState([]);
    const [caseInitiationFee, setCaseInitiationFee] = useState(null);
    const [otherFees, setOtherFees] = useState([]);
    const [feesCalculationAmount, setFeesCalculationAmount] = useState("0.00 USD");
    const [feesdata, setFeeData] = useState(null);
    const [requestBody, setRequestBody] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [selectedPartiesForAPI, setSelectedPartiesForAPI] = useState([]);
    const [selectedCaseCategoryId, setSelectedCaseCategoryId] = useState(null);
    const [selectedCourtLocation, setSelectedCourtLocation] = useState([]);
    const [selectedCaseTrackingID, setSelectedCaseTrackingID] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const uploadRefs = useRef([]);


    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const WrapperTag = isMobile ? "div" : "section";
    const wrapperClass = isMobile
        ? "container-fluid d-md-none px-3 pt-3"
        : "main-content px-3 pt-3";

    // function to show/hide popup
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // for discard button popup
    const [showDiscardButton, setShowDiscardButton] = useState(false);
    const handleCloseDiscard = () => setShowDiscardButton(false);
    const handleShowDiscardButton = () => setShowDiscardButton(true);

    //handle to reset form on discard button
    const handleDiscardAndRefresh = () => {
        formik.resetForm();
        // window.location.reload(); 
        navigate("/e-filing/filingStatus")
    };

    //fetch court location information
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

    //fetch case document when the selected case type is selected
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

    //for validation purposes (with useformik & yup)
    const formik = useFormik({
        initialValues: {
            selectedCourt: null,
            caseNumber: '',
            paymentAccount: null,
            selectedAttorneySec: null,
            createdBy: null,
            courtesyemail: null,
            note: null,
            documents: [
                {
                    documentType: null,
                    documentDescription: '',
                    fileName: '',
                    fileBase64: '',
                    securityTypes: '',
                    optionalServicesSelections: [
                        { value: '', Quantity: '', fee: '', multiplier: '' }
                    ]
                }
            ],
            parties: partyList,
            selectedParties: [],
        },

        validationSchema: Yup.object().shape({
            selectedCourt: Yup.string().nullable().required('Court selection is required'),
            caseNumber: Yup.string().required('Case number is required'),
            paymentAccount: Yup.string().required('Payment account is required'),
            documents: Yup.array().of(
                Yup.object().shape({
                    documentType: Yup.string().nullable().required('Document type is required'),
                })
            ),
            parties: Yup.array().of(
                Yup.object({
                    roleType: Yup.string().required('Invalid party role option'),
                    firstName: Yup.string().when('roleType', {
                        is: '1', // Apply validation only when roleType is '1' for the party
                        then: (schema) =>
                            schema
                                .required('First name is required ')
                                .min(3, 'First name must be at least 3 characters for party'),
                        otherwise: (schema) => schema, // No validation for other roleTypes
                    }),
                    lastName: Yup.string().when('roleType', {
                        is: '1', // Apply validation only when roleType is '1' for the party
                        then: (schema) =>
                            schema
                                .required('Last name is required')
                                .min(3, 'Last name must be at least 3 characters for party'),
                        otherwise: (schema) => schema, // No validation for other roleTypes
                    }),
                    companyName: Yup.string().when('roleType', {
                        is: '2', // Apply validation only when roleType is '2' for the party
                        then: (schema) =>
                            schema
                                .required('Company name is required')
                                .min(3, 'Company name must be at least 3 characters for party'),
                        otherwise: (schema) => schema, // No validation for other roleTypes
                    }),
                    selectedAttorney: Yup.string().required('Please Select Attorney'),
                })
            ),

            selectedParties: Yup.array().of(
                Yup.object({
                    id: Yup.string().required(),
                    isChecked: Yup.boolean(),
                })
            )
                .test(
                    'at-least-one-checked',
                    'At least one party must be selected.',
                    (parties) => parties && parties.some((party) => party.isChecked === true)
                ),
        }),

        onSubmit: async (values) => {

            if (Object.keys(formik.errors).length > 0) {
                console.log("Form validation failed.");
                return;
            };
            // setLoading(true);
            setShowPopup(true);

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

            // Prepare selected parties for API            
            console.log('Selected Parties:', selectedParties);

            // Generate the request body
            const generatedRequestBody = {
                ...values,
                documents: prepareDocumentsForApi(values.documents),
                parties: partiesForApi,
                selectedParties: selectedPartiesForAPI,
            };

            // Log the generated request body (for debugging)
            console.log('Generated Request Body:', generatedRequestBody);
            setRequestBody(generatedRequestBody);

            // Make API request (replace with actual URL and token)
            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                   const response = await fetch(`${baseURL}/CoreFilingSubsequentCivil`, {
                   //const response = await fetch(`https://localhost:7207/api/Tyler/CoreFilingSubsequentCivil`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(generatedRequestBody),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
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
                            willClose: () => {
                                window.location.reload();  // Reload the page when user clicks "Ok"
                            },
                        });
                    } else {
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
        },
    });

    const generateRequestBody = (values) => {
        const prepareDocumentsForApi = (documents = []) => {
            return documents.map((doc) => ({
                documentType: doc.documentType,
                documentDescription: doc.documentDescription.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''),
                fileName: doc.fileName,
                fileBase64: doc.fileBase64.replace(/^data:application\/pdf;base64,/, ''),
                securityTypes: doc.securityTypes,
                optionalServicesSelections: (doc.optionalServicesSelections || []).map((service) => ({
                    value: service.value,
                    Quantity: service.Quantity,
                })),
            }));
        };

        return {
            ...values,
            documents: prepareDocumentsForApi(values.documents),
            parties: partiesForApi,
            selectedParties: selectedPartiesForAPI,
        };
    };

    //Api for fees-calculation 
    const feesCalculationApiCall = async () => {
        console.log("request Body", requestBody);
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

        // Proceed with API call as before
        try {
            const baseURL = process.env.REACT_APP_BASE_URL;
            const response = await fetch(`${baseURL}/GetSubSequentFeesCalculation`, {
                // const response = await fetch(`https://localhost:7207/api/Tyler/GetSubSequentFeesCalculation`, {
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
            setFeeData(data.data);

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

    // Generate requestBody when form values change
    useEffect(() => {
        const generatedRequestBody = generateRequestBody(formik.values);
        setRequestBody(generatedRequestBody);
    }, [formik.values]);

    // Fetch Party Types When Case Type Changes
    useEffect(() => {
        if (selectedCaseTypeId) {
            const baseURL = process.env.REACT_APP_BASE_URL;
            const caseTypeId = selectedCaseTypeId.value || selectedCaseTypeId; // Adjust for both object and value cases

            fetch(`${baseURL}/GetPartyTypeCode?caseTypeId=${caseTypeId}`)
                .then((response) => response.json())
                .then((data) => {
                    // console.log('Fetched data:', data); // Debugging log
                    const formattedPartyTypes = data.map((partyType) => ({
                        value: partyType.code,
                        label: partyType.name,
                    }));
                    // console.log("Formatted party types:", formattedPartyTypes);
                    setPartyTypes(formattedPartyTypes);
                    setSelectedPartyType(null); // Reset Party Type selection when Case Type changes
                    setShowDiv(true);
                })
                .catch((error) => console.error('Error fetching party types:', error));
        } else {
            setPartyTypes([]); // Clear Party Types if no Case Type is selected
            setShowDiv(false);
        }
    }, [selectedCaseTypeId]);

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

    const PartyRoleMapping = {
        2: "Individual", // Mapping for ItemElementName = 2
        1: "Business" // Mapping for ItemElementName = 1        
    };

    const PartyTypeMapping = {
        "17088": "Plaintiff",
        "6610": "Defendant"
    };

    //handle to select party items
    const handleSelectAllChange = () => {
        // Toggle the selectAll state (check/uncheck)
        const newSelectAll = !selectAll;
        console.log("Toggling Select All:", newSelectAll);

        // Update `isChecked` for all `selectedParties` based on select all toggle
        const updatedSelectedParties = selectedParties.map((party) => ({
            ...party,
            isChecked: newSelectAll, // Set all parties' `isChecked` to `newSelectAll`
            suffix: party.suffix || "", // Ensure these fields retain values
            selectedAttorney: party.selectedAttorney || "",
            selectedBarNumbers: party.selectedBarNumbers || [],
        }));

        setSelectedParties(updatedSelectedParties); // Update local state with the new selection

        // Update Formik's `parties` array with the new `isChecked` value
        const updatedFormikParties = formik.values.parties.map((party) => ({
            ...party,
            isChecked: newSelectAll, // Set all parties' `isChecked` to `newSelectAll`
            suffix: party.suffix || "",
            selectedAttorney: party.selectedAttorney || "",
            selectedBarNumbers: party.selectedBarNumbers || [],
        }));
        formik.setFieldValue("parties", updatedFormikParties); // Sync Formik's parties state

        // Update `isChecked` for Formik's `selectedParties` array
        const updatedFormikSelectedParties = formik.values.selectedParties.map((party) => ({
            ...party,
            isChecked: newSelectAll, // Set all parties' `isChecked` to `newSelectAll`
            suffix: party.suffix || "",
            selectedAttorney: party.selectedAttorney || "",
            selectedBarNumbers: party.selectedBarNumbers || [],
        }));
        formik.setFieldValue("selectedParties", updatedFormikSelectedParties); // Sync Formik's selectedParties state

        // Set the selectAll state to match the new selection status
        setSelectAll(newSelectAll); // Update local `selectAll` state
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
        const selectedPartiesForAPI = selectedItems.map((party) => {
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
        setPartiesForApi(preparedParties);
        setSelectedPartiesForAPI(selectedPartiesForAPI);
        formik.setFieldValue("selectedParties", updatedSelectedParties); // Set and validate
        console.log("Updated selectedParties in Formik:", updatedSelectedParties);
    };

    // Add a new party
    const handleAddParty = () => {
        const newParty = {
            id: `Party${selectedParties.length + 1}`, // Unique ID
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

        setSelectedParties((prevParties) => [...prevParties, newParty]);
        formik.setFieldValue("parties", [...formik.values.parties, newParty]);
        formik.setFieldValue("selectedParties", [...formik.values.selectedParties, newParty]);

        // ✅ Log the updated party lists
        console.log("Added Party:", newParty);
    };

    // Log the selected items whenever `selectedParties` is updated
    useEffect(() => {
        const selectedItems = selectedParties.filter((party) => party.isChecked);

        const mappedParties = selectedItems.map((party) => {
            let partyName = `${party.firstName}${party.lastName}`.trim();

            // Return the mapped party object
            return {
                partyName: partyName, // Name based on roleType
                partyType: party.selectedPartyType, // Business or individual type
                role: party.roleType, // Role of the party (1 or 2, etc.)
            };
        });

        setSelectedPartiesForAPI(mappedParties);

    }, [selectedParties]); // Dependency on selectedParties, updates when this changes

    // Remove a party
    const handleRemoveClick = (id) => {
        //console.log("Removed ID:", id);

        const updatedParties = formik.values.parties.filter((party) => party.id !== id);

        // Update Formik
        formik.setFieldValue('parties', updatedParties);
        formik.setFieldValue('selectedParties', updatedParties);

        // If you're maintaining local state
        setPartyList(updatedParties);

        //console.log("Updated parties after removal:", updatedParties);

        setRemovedParties((prevRemoved) => [...prevRemoved, id]);
    };


    useEffect(() => {
        setPartyList(formik.values.parties || []);
    }, []);


    // Handle role type change
    const handleRoleTypeChange = (id, event) => {
        const newRoleType = event.target.value; // Extract the new roleType value

        // Update Formik's parties array
        const updatedParties = formik.values.parties.map((party) =>
            party.id === id
                ? { ...party, roleType: newRoleType }
                : party
        );
        formik.setFieldValue("parties", updatedParties);

        // Update Formik's selectedParties array
        const updatedSelectedParties = formik.values.selectedParties.map((party) =>
            party.id === id
                ? { ...party, roleType: newRoleType }
                : party
        );
        formik.setFieldValue("selectedParties", updatedSelectedParties);
    };

    // Handle suffix change
    const handleSuffixChange = (partyId, event) => {
        const updatedParties = selectedParties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    suffix: event.target.value,  // Update the suffix
                }
                : party
        );
        setSelectedParties(updatedParties);  // Update local state

        const updatedFormikParties = formik.values.parties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    suffix: event.target.value,  // Update Formik state
                }
                : party
        );
        formik.setFieldValue("parties", updatedFormikParties);  // Update Formik's `parties`

        const updatedFormikSelectedParties = formik.values.selectedParties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    suffix: event.target.value,  // Update Formik's `selectedParties`
                }
                : party
        );
        formik.setFieldValue("selectedParties", updatedFormikSelectedParties);  // Update Formik's `selectedParties`
    };

    // Handle Party Type change
    const handlePartyTypeChange = (id, event) => {
        const newPartyType = event.target.value;
        const partyIndex = formik.values.parties.findIndex((party) => party.id === id);

        if (partyIndex !== -1) {
            // Update party type in both parties and selectedParties arrays
            const updatedParties = formik.values.parties.map((party, index) =>
                index === partyIndex ? { ...party, selectedPartyType: newPartyType } : party
            );

            // Update Formik's 'parties' and 'selectedParties' arrays
            formik.setFieldValue('parties', updatedParties);
            formik.setFieldValue('selectedParties', updatedParties);
        }
    };

    //handle attorney Change
    const handleAttorneyChange = (partyId, selectedOption) => {
        const updatedParties = selectedParties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    selectedAttorney: selectedOption ? selectedOption.value : ""  // Make sure to set it correctly
                }
                : party
        );
        setSelectedParties(updatedParties);  // Update local state

        const updatedFormikParties = formik.values.parties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    selectedAttorney: selectedOption ? selectedOption.value : ""  // Make sure to set it correctly
                }
                : party
        );
        formik.setFieldValue("parties", updatedFormikParties);  // Update Formik's parties field

        const updatedFormikSelectedParties = formik.values.selectedParties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    selectedAttorney: selectedOption ? selectedOption.value : ""  // Ensure attorney is properly updated
                }
                : party
        );
        formik.setFieldValue("selectedParties", updatedFormikSelectedParties);
    };

    //handle to upadte bar number
    const handleBarNumberChange = (partyId, selectedBarNumbers) => {

        const barNumbersValues = selectedBarNumbers.map(option => option.value);

        // Update the local state (selectedParties)
        const updatedSelectedParties = selectedParties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    selectedBarNumbers: barNumbersValues,  // Store only the values (not the full object)
                }
                : party
        );
        setSelectedParties(updatedSelectedParties);  // Update local state

        // Update Formik's parties array with the selected bar numbers (values only)
        const updatedFormikParties = formik.values.parties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    selectedBarNumbers: barNumbersValues,  // Store values only
                }
                : party
        );
        formik.setFieldValue("parties", updatedFormikParties);

        const updatedFormikSelectedParties = formik.values.selectedParties.map((party) =>
            party.id === partyId
                ? {
                    ...party,
                    selectedBarNumbers: barNumbersValues,  // Store values only
                }
                : party
        );
        formik.setFieldValue(updatedFormikSelectedParties);

        // Log the selected bar numbers to verify
        // console.log("Selected Bar Numbers (Values Only):", barNumbersValues);
    };

    //handle to update company 
    const handleCompanyNameChange = (id, value) => {
        const partyIndex = formik.values.parties.findIndex((party) => party.id === id);

        if (partyIndex !== -1) {
            // Update the parties array
            const updatedParties = [...formik.values.parties];
            updatedParties[partyIndex] = {
                ...updatedParties[partyIndex],
                companyName: value,
                firstName: updatedParties[partyIndex].roleType === '2' ? value : updatedParties[partyIndex].firstName,
                lastName: updatedParties[partyIndex].roleType === '2' ? value : updatedParties[partyIndex].lastName,
            };

            formik.setFieldValue('parties', updatedParties);

            // Update the selectedParties array
            const updatedSelectedParties = [...formik.values.selectedParties];
            updatedSelectedParties[partyIndex] = {
                ...updatedSelectedParties[partyIndex],
                companyName: value,
                firstName: updatedSelectedParties[partyIndex].roleType === '2' ? value : updatedSelectedParties[partyIndex].firstName,
                lastName: updatedSelectedParties[partyIndex].roleType === '2' ? value : updatedSelectedParties[partyIndex].lastName,
            };

            formik.setFieldValue('selectedParties', updatedSelectedParties);
        }
    };

    // Handle changes to text fields for individual parties
    const handleInputChange = (id, field, value) => {
        const partyIndex = formik.values.parties.findIndex((party) => party.id === id);

        if (partyIndex !== -1) {
            // Update the specific field in the parties array
            const updatedParties = [...formik.values.parties];
            const updatedParty = { ...updatedParties[partyIndex], [field]: value };

            // Check if the roleType is '2' (Business) and the companyName is being updated
            if (updatedParty.roleType === '2' && field === 'companyName') {
                updatedParty.firstName = value; // Set firstName to companyName
                updatedParty.lastName = value;  // Set lastName to companyName
            }

            updatedParties[partyIndex] = updatedParty; // Apply the updated party back

            formik.setFieldValue('parties', updatedParties); // Update the parties array

            // Update the specific field in the selectedParties array
            const updatedSelectedParties = [...formik.values.selectedParties];
            const updatedSelectedParty = { ...updatedSelectedParties[partyIndex], [field]: value };

            // Ensure selectedParties also reflect the change for business role
            if (updatedSelectedParty.roleType === '2' && field === 'companyName') {
                updatedSelectedParty.firstName = value; // Set firstName to companyName
                updatedSelectedParty.lastName = value;  // Set lastName to companyName
            }

            updatedSelectedParties[partyIndex] = updatedSelectedParty; // Apply the updated party back

            formik.setFieldValue('selectedParties', updatedSelectedParties); // Update the selectedParties array
        }
    };

    // Handler for when a Document Type is selected
    const handleDocumentTypeChange = async (selectedOption, index) => {

        // Update document type and description in formik
        formik.setFieldValue(`documents[${index}].documentType`, selectedOption.value);
        formik.setFieldValue(`documents[${index}].documentDescription`, selectedOption.description || "");
        formik.setFieldValue(`documents[${index}].fee`, selectedOption.fee || 0);

        console.log("selectedOption.fee", selectedOption.fee);

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
            optionalServicesSelections: [{ Quantity: null }],
        };

        const updatedDocuments = [...formik.values.documents, newDocument];
        formik.setFieldValue("documents", updatedDocuments);

        const newIndex = updatedDocuments.length - 1;
        setEditIndex(newIndex); // Set this new document in edit mode

        const updatedIsSaved = [...isSaved];
        updatedIsSaved[newIndex] = false;
        setIsSaved(updatedIsSaved);

        // Optional: reset deleteIndex if you're using one
        setDeleteIndex(null);
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

    //handler for optional services functions
    const handleOptionalServicesChange = (selectedOption, index, serviceIndex) => {
        try {
            // console.log("Selected Option:", selectedOption);
            const currentServices = formik.values.documents[index].optionalServicesSelections || [];
            const updatedServices = [...currentServices];

            // Update the specific service based on serviceIndex
            updatedServices[serviceIndex] = {
                value: selectedOption.value || "",
                label: selectedOption.label,
                multiplier: selectedOption.multiplier,
                fee: Number(selectedOption.fee) || 0,
                Quantity: selectedOption.multiplier ? 1 : null,
            };

            // Update the formik state
            formik.setFieldValue(`documents[${index}].optionalServicesSelections`, updatedServices);
            console.log("updatedServices", updatedServices);
        } catch (error) {
            console.error("Error in handleOptionalServicesChange:", error);
        }

    };

    // Handler for adding new optional service dropdown
    const handleAddOptionalService = (index) => {
        const updatedDocuments = [...formik.values.documents];
        if (!updatedDocuments[index].optionalServicesSelections) {
            updatedDocuments[index].optionalServicesSelections = [];
        }
        updatedDocuments[index].optionalServicesSelections.push({
            value: "",
            label: "",
            multiplier: null,
            Quantity: null,
        });
        formik.setFieldValue("documents", updatedDocuments);
    };

    // Handler for removing optional service dropdown
    const handleRemoveOptionalService = (index, serviceIndex) => {
        const updatedServices = [...formik.values.documents[index].optionalServicesSelections];
        updatedServices.splice(serviceIndex, 1); // Remove the specified service
        formik.setFieldValue(`documents[${index}].optionalServicesSelections`, updatedServices);
    };

    // Handler for when Quantity is updated
    const handleQuantityChange = (quantity, index, serviceIndex) => {

        const updatedServices = [...formik.values.documents[index].optionalServicesSelections];
        updatedServices[serviceIndex].Quantity = quantity;

        // Use Formik's setFieldValue to update the state immutably
        formik.setFieldValue(`documents[${index}].optionalServicesSelections`, updatedServices);
        console.log("handle Quantity Change", updatedServices);
    };

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


    // Map the payment accounts to the format required by react-select
    const paymentAccountOptions = paymentAccounts.map((account) => ({
        value: account.PaymentAccountID,
        label: account.AccountName,
    }));

    // useEffect(() => {
    //     setPartyList(formik.values.parties);
    // }, [formik.values.parties]);


    //extra fees or hidden charges function in fees calculation
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
    ];


    //fetch optional service values/options by Id
    const getServiceNameByID = async (id) => {
        const baseURL = process.env.REACT_APP_BASE_URL
        const response = await fetch(`${baseURL}/GetOptionalServices?ID=${id}`);
        const data = await response.json();
        return data.name || "Unknown Service";
    };

    //function to fetch all extra fees charges or hidden fee charges 
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


    // Fetch suffix options from the API
    useEffect(() => {
        const baseURL = process.env.REACT_APP_BASE_URL;
        const fetchSuffixOptions = async () => {
            try {
                const response = await fetch(`${baseURL}/GetCourtNameSuffixCode`); // Replace with actual API URL
                const data = await response.json();
                setSuffixOptions(data); // Assume `data` is an array of suffix strings
            } catch (error) {
                console.error("Error fetching suffix options:", error);
            }
        };
        fetchSuffixOptions();
    }, []);

    // Fetch attorney data on component mount
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
                        // console.log("list of data:", options);

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

    //fetch APi for search cases
    const searchCase = async (values) => {
        if (!values.caseNumber || !values.selectedCourt) {
            setError("Please enter both Case Number and select a Court.");
            return;
        }

        setLoadingPopup(true); // Set loading to true while the request is being processed
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

            // Extract Court Code
            const courtCode = responseData.data?.Case?.CaseAugmentation?.CaseCourt?.OrganizationIdentification?.IdentificationID?.Value || "N/A";

            let courtLocation = responseData.data?.Case?.CaseAugmentation?.CaseCourt?.OrganizationIdentification?.IdentificationID?.Value || "N/A";
            let caseTrackingID =
                responseData.data?.Case?.CaseAugmentation?.CaseLineageCase?.[0]?.CaseTrackingID?.Value || "N/A";


            setSelectedCourtLocation(courtLocation);
            setSelectedCaseTrackingID(caseTrackingID);

            // Fetch Court Name from API
            const courtName = await fetchCourtName(courtCode);

            formik.setFieldValue("selectedCourt", courtCode);
            formik.setFieldValue("selectedCourtName", courtName);

            console.log("case Name", courtName);

            // Extract Case details
            const caseDetails = {
                //courtName: "Fresno - Civil", // Assuming this is static for now
                courtName,
                caseNumber: responseData.data?.Case?.CaseDocketID?.Value || "N/A",
                caseTitle: responseData.data?.Case?.CaseTitleText?.Value || "N/A",
            };
            console.log("case Details", caseDetails);

            let selectedCaseTypeId = responseData.data?.Case.CaseAugmentation1.CaseTypeText.Value;
            let selectedCaseCategoryId = responseData.data?.Case.CaseCategoryText.Value;

            setselectedCaseTypeId(selectedCaseTypeId);
            setSelectedCaseCategoryId(selectedCaseCategoryId);

            console.log("selected Case CategoryId", selectedCaseCategoryId);

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

        } catch (error) {
            console.error("Error fetching case details:", error);
            setError("Failed to fetch case details. Please try again.");
        } finally {
            setLoadingPopup(false); // Reset loading state after API call completes
        }
    };

    const fetchCourtName = async (courtCode) => {
        if (!courtCode || courtCode === "N/A") return "N/A";  // Return "N/A" if no valid code
        const baseURL = process.env.REACT_APP_BASE_URL

        const url = `${baseURL}/GetCourtName?code=${encodeURIComponent(courtCode)}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "*/*",
                    "Authorization": `Bearer ${token}`
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


    // Fetch service contacts
    useEffect(() => {
        if (selectedMethod === 'from-my-firm') {
            const getServiceContactList = async () => {
                const baseURL = process.env.REACT_APP_BASE_URL;
                try {
                    const response = await fetch(`${baseURL}/GetServiceContactList`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data?.data?.ServiceContact) {
                            setContactList(data.data.ServiceContact);

                        } else if (data.error) {
                            console.error(data.error);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching service contact data:', err);

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
                                                checked={selectedContacts.includes(contact)}
                                                onChange={(e) =>
                                                    handleCheckboxChange(contact, e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td>{`${contact.FirstName} ${contact.LastName}`}</td>
                                        <td>{contact.Email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                            <p className='fw-bold'>Enter search filters to see public service contact list</p>
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
                    </Form.Group>
                </>
            );
        }
    };

    // Handle "Add/Attach" button
    const handleAddAttach = () => {
        setSelectedContactList((prevContacts) => [
            ...prevContacts,
            ...selectedContacts.filter(
                (contact) => !prevContacts.includes(contact)
            ), // Prevent duplicates
        ]);
        setSelectedContacts([]); // Clear modal selection
        handleClose();
    };

    // Handle checkbox selection in the modal
    const handleCheckboxChange = (contact, isChecked) => {
        if (isChecked) {
            setSelectedContacts((prev) => [...prev, contact]);
        } else {
            setSelectedContacts((prev) =>
                prev.filter((c) => c !== contact)
            );
        }
    };

    const handleSaveDraft = async () => {
        // Extract values from form
        const {
            selectedCourt,
            selectedCategory,
            selectedCaseType,
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

        // Prepare request body with JSON values
        const draftRequestBody = {
            isExistingCase: true,
            courtName: formik.values.courtName || selectedCaseDetails?.courtName || "",
            caseNumber: selectedCaseDetails?.caseNumber || "",
            caseTitle: formik.values.caseTitle || selectedCaseDetails?.caseTitle || "",
            selectedCourt: cleanValue(selectedCourt),
            selectedCategory: cleanValue(selectedCaseCategoryId),
            selectedCaseType: cleanValue(selectedCaseType),
            paymentAccount: cleanValue(paymentAccount),
            selectedAttorneySec: cleanValue(selectedAttorneySec),
            createdBy: cleanValue(createdBy),
            courtesyemail: cleanValue(courtesyemail),
            note: cleanValue(note),
            courtLocation: cleanValue(selectedCourtLocation),
            caseTrackingID: cleanValue(selectedCaseTrackingID),
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
            selectedParties: selectedParties.map((party) => ({
                partyName: party.roleType === '1'
                    ? `${party.firstName} ${party.lastName}`.trim()
                    : party.companyName.replace(/\s+/g, ''),
                partyType: party.selectedPartyType,
                role: party.roleType,
            })),
        };

        // Debugging: Log final request body
        console.log("Formik Values:", formik.values);
        console.log("Selected Case Details:", selectedCaseDetails);
        console.log("Final Draft Request Body:", draftRequestBody);

        try {
            const baseURL = process.env.REACT_APP_BASE_URL;

            // API call to save draft
            const response = await fetch(`${baseURL}/SaveDraftInitial`, {
                //const response = await fetch(`https://localhost:7207/api/Tyler/SaveDraftInitial`, {
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
                                        <span><b>File on Existing Case</b> - Complete the below filing steps and submit to file your documents.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- form sections --> */}
                    <div className="row case_form justify-content-center mt-2">
                        <form method="post" onSubmit={formik.handleSubmit}>
                            {/* <!--col-12 --> */}
                            <div className="col-12 col-md-12 col-xl-12 align-items-center">
                                <div className="card p-2">
                                    <div className="card-body">
                                        <div className="row">
                                            {/* <!-- section 1 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        1. Select Court & Case Type -
                                                        <span className='fw-normal' style={{ fontSize: "14px" }}>
                                                            &nbsp;Choose the court location and case type to file your new case.
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    <div className="container-fluid">
                                                        {!selectedCaseDetails ? (
                                                            <>
                                                                {/* Court Dropdown */}
                                                                <div className="row mb-3">
                                                                    <div className="col-12 col-md-2 fw-bold">
                                                                        Court
                                                                        <i className="fa fa-asterisk" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                    </div>
                                                                    <div className="col-12 col-md-5">
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
                                                                            <div className="text-danger mt-1">{formik.errors.selectedCourt}</div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Case Number */}
                                                                <div className="row mb-3">
                                                                    <div className="col-12 col-md-2 fw-bold">
                                                                        Case Number
                                                                        <i className="fa fa-asterisk" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                                    </div>
                                                                    <div className="col-12 col-md-5">
                                                                        <input
                                                                            type="text"
                                                                            id="caseNumber"
                                                                            name="caseNumber"
                                                                            value={formik.values.caseNumber}
                                                                            onChange={formik.handleChange}
                                                                            onBlur={formik.handleBlur}
                                                                            placeholder="Enter Case Number"
                                                                            className="form-control"
                                                                        />
                                                                        {formik.touched.caseNumber && formik.errors.caseNumber && (
                                                                            <div className="text-danger mt-1">{formik.errors.caseNumber}</div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Search Button */}
                                                                <div className="row mb-3">
                                                                    <div className="col-12 col-md-7 offset-md-2">
                                                                        <Link
                                                                            onClick={async (e) => {
                                                                                e.preventDefault();
                                                                                if (!loading) {
                                                                                    await searchCase(formik.values);
                                                                                }
                                                                            }}
                                                                            className={`btn btn-success ${loading ? "disabled" : ""}`}
                                                                            style={{ pointerEvents: loading ? "none" : "auto" }}
                                                                        >
                                                                            {loadingPopup ? "Loading..." : "Search"}
                                                                        </Link>
                                                                        {error && <div className="text-danger mt-2">{error}</div>}
                                                                        <p className="text-secondary mt-2">You must first select a court to load available case types.</p>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            // Case details block
                                                            <div className="p-3 border rounded mt-3">
                                                                {/* Court Row with Change Link */}
                                                                <div className="row mb-3 align-items-center">
                                                                    <div className="col-9 d-flex justify-content-between flex-wrap">
                                                                        <div className="d-flex align-items-center">
                                                                            <strong style={{ minWidth: "90px" }}>Court</strong>
                                                                            <span className="ms-5">{selectedCaseDetails.courtName || "N/A"}</span>
                                                                        </div>
                                                                        <Link
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                setSelectedCaseDetails(null);
                                                                                formik.setFieldValue("selectedCourt", "");
                                                                            }}
                                                                            style={{
                                                                                color: "#336C9D",
                                                                                fontWeight: "500",
                                                                                textDecoration: "none",
                                                                                fontSize: "14px",
                                                                            }}
                                                                        >
                                                                            <i className="fa fa-edit me-1" style={{ fontSize: "13px" }}></i> Change Case
                                                                        </Link>
                                                                    </div>
                                                                </div>

                                                                <hr className="my-2" />

                                                                {/* Case Number */}
                                                                <div className="row mb-2">
                                                                    <div className="col-12 d-flex align-items-center">
                                                                        <strong style={{ minWidth: "90px" }}>Case No.</strong>
                                                                        <span className="ms-5" style={{ color: "#336C9D", fontWeight: "500" }}>
                                                                            {selectedCaseDetails.caseNumber || "N/A"}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <hr className="my-2" />

                                                                {/* Case Title */}
                                                                <div className="row">
                                                                    <div className="col-12 d-flex align-items-center">
                                                                        <strong style={{ minWidth: "90px" }}>Case Title</strong>
                                                                        <span className="ms-5">{selectedCaseDetails.caseTitle || "N/A"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Loader popup */}
                                                        {loadingPopup && <LoaderPopup message="Getting your case details..." />}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <!-- section 2 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        2. Add Documents -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            &nbsp;Define, select, and upload the documents that make up your filing.
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedCaseDetails ? (
                                                        <div className="responsive-table-wrapper">
                                                            {/* Table Header for Desktop */}
                                                            <div className="row fw-bold border-bottom pb-2 mb-2 d-none d-md-flex">
                                                                <div className="col-md-3">Document Type</div>
                                                                <div className="col-md-3">Document Description</div>
                                                                <div className="col-md-3">File Name</div>
                                                                <div className="col-md-3">Actions</div>
                                                            </div>

                                                            {/* Document Rows */}
                                                            {formik.values.documents.map((document, index) => (
                                                                <div className="row mb-4 border-bottom pb-1" key={index}>
                                                                    {/* Document Type */}
                                                                    <div className="col-12 col-md-3 mb-2" style={{ fontSize: "14px" }}>
                                                                        <label className="d-block d-md-none fw-bold">Document Type</label>
                                                                        {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                            <div>{documentType.find((opt) => opt.value === document.documentType)?.label || "N/A"}</div>
                                                                        ) : (
                                                                            <>
                                                                                <Select
                                                                                    id={`documentTypeSelect-${index}`}
                                                                                    options={documentType}
                                                                                    value={documentType.find((opt) => opt.value === document.documentType)}
                                                                                    onChange={(selectedOption) => handleDocumentTypeChange(selectedOption, index)}
                                                                                    onBlur={() => formik.setFieldTouched(`documents[${index}].documentType`, true)}
                                                                                    placeholder="Search or select a document type"
                                                                                    menuPortalTarget={document.body}
                                                                                    styles={{
                                                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                                                                    }}
                                                                                />
                                                                                {formik.touched.documents?.[index]?.documentType &&
                                                                                    formik.errors.documents?.[index]?.documentType && (
                                                                                        <div className="text-danger mt-1 small">
                                                                                            {formik.errors.documents[index].documentType}
                                                                                        </div>
                                                                                    )}
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    {/* Document Description */}
                                                                    <div className="col-12 col-md-3 mb-2" style={{ fontSize: "14px" }}>
                                                                        <label className="d-block d-md-none fw-bold">Document Description</label>
                                                                        {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                            <div>{document.documentDescription || "N/A"}</div>
                                                                        ) : (
                                                                            <input
                                                                                type="text"
                                                                                id={`documentName-${index}`}
                                                                                className="form-control"
                                                                                value={document.documentDescription}
                                                                                onChange={(e) =>
                                                                                    formik.setFieldValue(`documents[${index}].documentDescription`, e.target.value)
                                                                                }
                                                                                placeholder="Document description here..."
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    {/* File Name or Upload */}
                                                                    <div className="col-12 col-md-3 mb-2" style={{ fontSize: "14px" }}>
                                                                        <label className="d-block d-md-none fw-bold">File Name</label>
                                                                        {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                            formik.values.documents[index]?.fileName ? (
                                                                                <a
                                                                                    href={formik.values.documents[index]?.fileURL}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="gwt-Anchor gf-subSectionFileLink"
                                                                                    title={formik.values.documents[index]?.fileName}
                                                                                >
                                                                                    {formik.values.documents[index]?.fileName} ({formik.values.documents[index]?.fileSize} kB,{" "}
                                                                                    {formik.values.documents[index]?.pageCount} pg.)
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-danger">No file uploaded</span>
                                                                            )
                                                                        ) : (
                                                                            <>
                                                                                {/* Hidden File Input */}
                                                                                <input
                                                                                    type="file"
                                                                                    id={`file-upload-${index}`}
                                                                                    accept=".pdf"
                                                                                    onChange={(event) => handleFileUpload(event, index)}
                                                                                    style={{ display: "none" }}
                                                                                />

                                                                                {/* Styled Upload Link */}
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

                                                                                </div>

                                                                                {/* Validation Error */}
                                                                                {formik.touched.documents?.[index]?.fileName && formik.errors.documents?.[index]?.fileName && (
                                                                                    <div className="text-danger small mt-1">{formik.errors.documents[index].fileName}</div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {/* Action Buttons */}
                                                                    {formik.values.documents[index]?.fileName && (
                                                                        <div className="col-12 col-md-3 mb-2" style={{ fontSize: "14px" }}>
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
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-dark btn-sm me-2"
                                                                                        onClick={() => handleEdit(index)}
                                                                                    >
                                                                                        Edit
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-dark btn-sm"
                                                                                        onClick={() => handleDelete(index)}
                                                                                    >
                                                                                        Delete
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                </div>
                                                            ))}

                                                            {/* Add Document Button */}
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
                                                    ) : (
                                                        <p className="text-muted small">
                                                            Select case type / case to load available document types.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* <!-- section 3 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        3. Security & Optional Services -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            {" "}
                                                            Choose a security level, and any needed optional services, for each document.
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedDocumentType ? (
                                                        <>
                                                            {/* Header for desktop */}
                                                            <div className="row fw-bold border-bottom pb-2 mb-2 d-none d-md-flex">
                                                                <div className="col-md-3">Document</div>
                                                                <div className="col-md-2">Security</div>
                                                                <div className="col-md-4">Optional Services</div>
                                                                <div className="col-md-1"></div>
                                                                <div className="col-md-2">Qty</div>
                                                            </div>

                                                            {/* Dynamic Rows */}
                                                            <div className="row">
                                                                {formik.values.documents?.map((document, index) => (
                                                                    <div className="row mb-2 border-bottom pb-1" key={index}>
                                                                        {/* Document Type */}
                                                                        <div className="col-12 col-sm-6 col-md-3 mb-2">
                                                                            <label className="d-block d-md-none fw-bold">Document</label>
                                                                            <p className="mb-0">
                                                                                {documentType.find((option) => option.value === document.documentType)?.label || "No Document Type"}
                                                                            </p>
                                                                        </div>

                                                                        {/* Security Select */}
                                                                        <div className="col-12 col-sm-6 col-md-2 mb-2">
                                                                            <label className="d-block d-md-none fw-bold">Security</label>
                                                                            <Select
                                                                                id={`securitySelect-${index}`}
                                                                                options={securityOptions[index] || []}
                                                                                value={securityOptions[index]?.find((option) => option.value === document.securityTypes)}
                                                                                onChange={(selectedSecurity) =>
                                                                                    formik.setFieldValue(`documents[${index}].securityTypes`, selectedSecurity.value)
                                                                                }
                                                                                placeholder="Select Security"
                                                                            />
                                                                        </div>

                                                                        {/* Optional Services */}
                                                                        <div className="col-12 col-md-4 mb-2">
                                                                            <label className="d-block d-md-none fw-bold">Optional Services</label>
                                                                            {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                <div key={serviceIndex} className="mb-2">
                                                                                    <Select
                                                                                        id={`optionalServices-${index}-${serviceIndex}`}
                                                                                        options={optionalServicesOptions || []}
                                                                                        value={optionalServicesOptions.find((option) => option.value === service.value)}
                                                                                        onChange={(selectedOption) =>
                                                                                            handleOptionalServicesChange(selectedOption, index, serviceIndex)
                                                                                        }
                                                                                        placeholder={loadingOptionalServices ? "Loading..." : "Select Service"}
                                                                                        isDisabled={loadingOptionalServices}
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {/* Add/Remove Buttons */}
                                                                        <div className="col-6 col-md-1 mb-2">
                                                                            <label className="d-block d-md-none fw-bold">Actions</label>
                                                                            <div>
                                                                                <Link
                                                                                    onClick={() => handleAddOptionalService(index)}
                                                                                    style={{ textDecoration: "none", color: "blue", cursor: "pointer" }}
                                                                                >
                                                                                    <i className="fa fa-plus-circle me-1" />
                                                                                </Link>
                                                                            </div>
                                                                            <div>
                                                                                {document.optionalServicesSelections?.map((_, serviceIndex) =>
                                                                                    serviceIndex > 0 ? (
                                                                                        <Link
                                                                                            key={serviceIndex}
                                                                                            onClick={() => handleRemoveOptionalService(index, serviceIndex)}
                                                                                            style={{ textDecoration: "none", color: "red", cursor: "pointer" }}
                                                                                        >
                                                                                            <i className="fa fa-times-circle" />
                                                                                        </Link>
                                                                                    ) : null
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Quantity */}
                                                                        <div className="col-6 col-md-2 mb-2">
                                                                            <label className="d-block d-md-none fw-bold">Qty</label>
                                                                            {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                <div key={serviceIndex} className="mb-2">
                                                                                    {service.multiplier ? (
                                                                                        <input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            value={service.Quantity ?? ""}
                                                                                            onChange={(e) => {
                                                                                                const value = e.target.value;
                                                                                                handleQuantityChange(
                                                                                                    value === "" ? null : Math.max(1, Number(value)),
                                                                                                    index,
                                                                                                    serviceIndex
                                                                                                );
                                                                                            }}
                                                                                            className="form-control form-control-sm"
                                                                                            placeholder="Qty"
                                                                                        />
                                                                                    ) : (
                                                                                        <span className="small">{service.Quantity ?? null}</span>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p style={{ margin: "0", fontSize: "15px" }}>
                                                            Complete document upload to load security and available optional services.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* <!-- section 4 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        4. New Case Parties -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}> Enter the required parties. </span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {formik.values.parties && formik.values.parties.length > 0 && formik.values.parties.map((party, index) => (
                                                        <div key={party.id} className="party-row position-relative border rounded p-3 mb-3">

                                                            {/* Remove button - top right */}
                                                            <div className="position-relative">
                                                                <div className="position-absolute end-0 top-0 mt-2 me-2 z-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            console.log("Clicked remove for party ID:", party.id);
                                                                            handleRemoveClick(party.id);
                                                                        }}
                                                                        className="btn btn-link p-0 text-decoration-none"
                                                                        style={{ color: "#336C9D" }}
                                                                    >
                                                                        <i className="fa fa-times-circle fa-fw" style={{ color: "red" }}></i>
                                                                        <span className="d-none d-md-inline"> Remove Party</span>
                                                                    </button>
                                                                </div>
                                                            </div>


                                                            {/* Responsive Form Fields */}
                                                            <div className="row g-3">
                                                                {/* Party Type */}
                                                                <div className="col-12 col-md-3">
                                                                    <label className="form-label fw-bold">
                                                                        Role <span className="text-danger">*</span>
                                                                    </label>
                                                                    <select
                                                                        className="form-select text-black-50"
                                                                        value={party.selectedPartyType || ""}
                                                                        onChange={(e) => handlePartyTypeChange(party.id, e)}
                                                                        name="partType"
                                                                        onBlur={formik.handleBlur}
                                                                    >
                                                                        <option value="">Select Party Type</option>
                                                                        {partyTypes && partyTypes.length > 0 ? (
                                                                            partyTypes.map((partyType) => (
                                                                                <option key={partyType.value} value={partyType.value}>
                                                                                    {partyType.label}
                                                                                </option>
                                                                            ))
                                                                        ) : (
                                                                            <option value="">No party types available</option>
                                                                        )}
                                                                    </select>
                                                                    {formik.errors.parties?.[index]?.selectedPartyType &&
                                                                        formik.touched.parties?.[index]?.selectedPartyType && (
                                                                            <div className="text-danger" style={{ fontSize: "14px", marginTop: "5px" }}>
                                                                                {formik.errors.parties[index].selectedPartyType}
                                                                            </div>
                                                                        )}
                                                                </div>

                                                                {/* Role Type */}
                                                                <div className="col-12 col-md-3">
                                                                    <label className="form-label fw-bold">Type</label>
                                                                    <select
                                                                        className="form-select text-black-50"
                                                                        value={party.roleType}
                                                                        onChange={(e) => handleRoleTypeChange(party.id, e)}
                                                                    >
                                                                        <option value="1">Individual</option>
                                                                        <option value="2">Business</option>
                                                                    </select>
                                                                </div>

                                                                {party.roleType === "1" ? (
                                                                    <>
                                                                        {/* Individual Fields */}
                                                                        <div className="row g-3 mt-2">
                                                                            <div className="col-12 col-md-3">
                                                                                <label className="form-label fw-bold">
                                                                                    Last Name <i className="fa fa-asterisk text-danger small" />
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    className={`form-control ${formik.touched.parties?.[index]?.lastName && formik.errors.parties?.[index]?.lastName ? 'is-invalid' : ''}`}
                                                                                    name="lastName"
                                                                                    value={party.lastName || ""}
                                                                                    placeholder=""
                                                                                    onChange={(e) => handleInputChange(party.id, "lastName", e.target.value)}
                                                                                    onBlur={formik.handleBlur}
                                                                                />
                                                                                {formik.touched.parties?.[index]?.lastName && formik.errors.parties?.[index]?.lastName && (
                                                                                    <div className="invalid-feedback">{formik.errors.parties[index].lastName}</div>
                                                                                )}
                                                                            </div>

                                                                            <div className="col-12 col-md-3">
                                                                                <label className="form-label fw-bold">
                                                                                    First Name <i className="fa fa-asterisk text-danger small" />
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    className={`form-control ${formik.touched.parties?.[index]?.firstName && formik.errors.parties?.[index]?.firstName ? 'is-invalid' : ''}`}
                                                                                    name="firstName"
                                                                                    value={party.firstName || ""}
                                                                                    placeholder=""
                                                                                    onChange={(e) => handleInputChange(party.id, "firstName", e.target.value)}
                                                                                    onBlur={formik.handleBlur}
                                                                                />
                                                                                {formik.touched.parties?.[index]?.firstName && formik.errors.parties?.[index]?.firstName && (
                                                                                    <div className="invalid-feedback">{formik.errors.parties[index].firstName}</div>
                                                                                )}
                                                                            </div>

                                                                            <div className="col-12 col-md-3">
                                                                                <label className="form-label fw-bold">Middle Name</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    name="middleName"
                                                                                    value={party.middleName || ""}
                                                                                    placeholder=""
                                                                                    onChange={(e) => handleInputChange(party.id, "middleName", e.target.value)}
                                                                                />
                                                                            </div>

                                                                            <div className="col-12 col-md-3">
                                                                                <label className="form-label fw-bold">Suffix</label>
                                                                                <select
                                                                                    className="form-select"
                                                                                    value={party.suffix || ''}
                                                                                    onChange={(e) => handleSuffixChange(party.id, e)}
                                                                                >
                                                                                    <option value="">Select Suffix</option>
                                                                                    {suffixOptions.map((suffix) => (
                                                                                        <option key={suffix.code} value={suffix.code}>{suffix.name}</option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                        </div>

                                                                        <>
                                                                            {/* Shared Address Fields */}
                                                                            <div className="row g-3 mt-2">
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">Address</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="address"
                                                                                        value={party.Address || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "Address", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">Address 2</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="address2"
                                                                                        value={party.Address2 || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "Address2", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="row g-3 mt-2">

                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">City</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="city"
                                                                                        value={party.City || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "City", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">State</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="state"
                                                                                        value={party.State || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "State", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">Zip</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="zip"
                                                                                        value={party.Zip || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "Zip", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            {/* Checkboxes */}
                                                                            <div className="row g-3 mt-2">
                                                                                <div className="col-12 col-md-3">
                                                                                    <div className="form-check mt-4">
                                                                                        <input className="form-check-input" type="checkbox" id={`address_unknown_${party.id}`} />
                                                                                        <label className="form-check-label" htmlFor={`address_unknown_${party.id}`}>Address Unknown</label>
                                                                                    </div>
                                                                                </div>
                                                                                {/* <div className="col-12 col-md-4">
                                                                                <div className="form-check mt-4">
                                                                                    <input className="form-check-input" type="checkbox" id={`international_address_${party.id}`} />
                                                                                    <label className="form-check-label" htmlFor={`international_address_${party.id}`}>International Address</label>
                                                                                </div>
                                                                            </div> */}
                                                                                <div className="col-12 col-md-3">
                                                                                    <div className="form-check mt-4">
                                                                                        <input className="form-check-input" type="checkbox" id={`save_to_addressbook_${party.id}`} />
                                                                                        <label className="form-check-label" htmlFor={`save_to_addressbook_${party.id}`}>Save to Address Book</label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Attorney Fields */}
                                                                            <div className="row g-3 mt-4 align-items-end">
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">
                                                                                        Representing Attorney <i className="fa fa-asterisk text-danger small" />
                                                                                    </label>
                                                                                    <Select
                                                                                        value={
                                                                                            party.selectedAttorney
                                                                                                ? attorneys.find((attorney) => attorney.value === party.selectedAttorney) || null
                                                                                                : null
                                                                                        }
                                                                                        onChange={(selectedOption) => handleAttorneyChange(party.id, selectedOption)}
                                                                                        options={[
                                                                                            { value: '', label: 'Select an attorney...', isDisabled: true },
                                                                                            ...attorneys,
                                                                                        ]}
                                                                                        placeholder="Search and Select Attorney"
                                                                                        isSearchable
                                                                                        isClearable
                                                                                        onBlur={formik.handleBlur}
                                                                                    />
                                                                                    {formik.touched.parties?.[index]?.attorneys && formik.errors.parties?.[index]?.attorneys && (
                                                                                        <div className="text-danger mt-1">{formik.errors.parties[index].attorneys}</div>
                                                                                    )}
                                                                                </div>

                                                                                <div className="col-12 col-md-3">
                                                                                    {Array.isArray(party.selectedBarNumbers) && party.selectedBarNumbers.length > 0 && (
                                                                                        <>
                                                                                            <label className="form-label fw-bold">Added Attorneys</label>
                                                                                            <div>{party.selectedBarNumbers.join(", ")}</div>
                                                                                        </>
                                                                                    )}
                                                                                </div>

                                                                                <div className="col-12 col-md-4">
                                                                                    <label className="form-label fw-bold">Add Another Attorney</label>
                                                                                    <Select
                                                                                        isMulti
                                                                                        value={party.selectedBarNumbers.map(barNumber => ({ value: barNumber, label: barNumber }))}
                                                                                        onChange={(selectedOptions) => handleBarNumberChange(party.id, selectedOptions)}
                                                                                        options={attorneys.map((attorney) => ({
                                                                                            value: attorney.barNumber,
                                                                                            label: attorney.barNumber,
                                                                                        }))}
                                                                                        placeholder="Select Bar Numbers"
                                                                                        isSearchable
                                                                                        isClearable
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </>

                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {/* Business Fields */}
                                                                        <div className="row g-3 mt-2">
                                                                            <div className="col-12 col-md-6">
                                                                                <label className="form-label fw-bold">
                                                                                    Company Name <i className="fa fa-asterisk text-danger small" />
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    className={`form-control ${formik.touched.parties?.[index]?.companyName && formik.errors.parties?.[index]?.companyName ? 'is-invalid' : ''}`}
                                                                                    name="companyName"
                                                                                    value={party.companyName || ""}
                                                                                    placeholder="Enter Company Name"
                                                                                    onChange={(e) => handleCompanyNameChange(party.id, e.target.value)}
                                                                                />
                                                                                {formik.touched.parties?.[index]?.companyName && formik.errors.parties?.[index]?.companyName && (
                                                                                    <div className="invalid-feedback">{formik.errors.parties[index].companyName}</div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <>
                                                                            {/* Shared Address Fields */}
                                                                            {/* Shared Address Fields */}
                                                                            <div className="row g-3 mt-2">
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">Address</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="address"
                                                                                        value={party.Address || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "Address", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">Address 2</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="address2"
                                                                                        value={party.Address2 || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "Address2", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="row g-3 mt-2">

                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">City</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="city"
                                                                                        value={party.City || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "City", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">State</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="state"
                                                                                        value={party.State || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "State", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">Zip</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="zip"
                                                                                        value={party.Zip || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "Zip", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            {/* Checkboxes */}
                                                                            <div className="row g-3 mt-2">
                                                                                <div className="col-12 col-md-3">
                                                                                    <div className="form-check mt-4">
                                                                                        <input className="form-check-input" type="checkbox" id={`address_unknown_${party.id}`} />
                                                                                        <label className="form-check-label" htmlFor={`address_unknown_${party.id}`}>Address Unknown</label>
                                                                                    </div>
                                                                                </div>
                                                                                {/* <div className="col-12 col-md-4">
                                                                                <div className="form-check mt-4">
                                                                                    <input className="form-check-input" type="checkbox" id={`international_address_${party.id}`} />
                                                                                    <label className="form-check-label" htmlFor={`international_address_${party.id}`}>International Address</label>
                                                                                </div>
                                                                            </div> */}
                                                                                <div className="col-12 col-md-3">
                                                                                    <div className="form-check mt-4">
                                                                                        <input className="form-check-input" type="checkbox" id={`save_to_addressbook_${party.id}`} />
                                                                                        <label className="form-check-label" htmlFor={`save_to_addressbook_${party.id}`}>Save to Address Book</label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Attorney Fields */}
                                                                            <div className="row g-3 mt-4 align-items-end">
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">
                                                                                        Representing Attorney <i className="fa fa-asterisk text-danger small" />
                                                                                    </label>
                                                                                    <Select
                                                                                        value={
                                                                                            party.selectedAttorney
                                                                                                ? attorneys.find((attorney) => attorney.value === party.selectedAttorney) || null
                                                                                                : null
                                                                                        }
                                                                                        onChange={(selectedOption) => handleAttorneyChange(party.id, selectedOption)}
                                                                                        options={[
                                                                                            { value: '', label: 'Select an attorney...', isDisabled: true },
                                                                                            ...attorneys,
                                                                                        ]}
                                                                                        placeholder="Search and Select Attorney"
                                                                                        isSearchable
                                                                                        isClearable
                                                                                        onBlur={formik.handleBlur}
                                                                                    />
                                                                                    {formik.touched.parties?.[index]?.attorneys && formik.errors.parties?.[index]?.attorneys && (
                                                                                        <div className="text-danger mt-1">{formik.errors.parties[index].attorneys}</div>
                                                                                    )}
                                                                                </div>

                                                                                <div className="col-12 col-md-3">
                                                                                    {Array.isArray(party.selectedBarNumbers) && party.selectedBarNumbers.length > 0 && (
                                                                                        <>
                                                                                            <label className="form-label fw-bold">Added Attorneys</label>
                                                                                            <div>{party.selectedBarNumbers.join(", ")}</div>
                                                                                        </>
                                                                                    )}
                                                                                </div>

                                                                                <div className="col-12 col-md-4">
                                                                                    <label className="form-label fw-bold">Add Another Attorney</label>
                                                                                    <Select
                                                                                        isMulti
                                                                                        value={party.selectedBarNumbers.map(barNumber => ({ value: barNumber, label: barNumber }))}
                                                                                        onChange={(selectedOptions) => handleBarNumberChange(party.id, selectedOptions)}
                                                                                        options={attorneys.map((attorney) => ({
                                                                                            value: attorney.barNumber,
                                                                                            label: attorney.barNumber,
                                                                                        }))}
                                                                                        placeholder="Select Bar Numbers"
                                                                                        isSearchable
                                                                                        isClearable
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </>

                                                                    </>
                                                                )}

                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Add Party Button */}
                                                    <div className="party-row">
                                                        <label htmlFor="addnewparty" className="form-label fw-bold">
                                                            <Link
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleAddParty();
                                                                }}
                                                                style={{ color: "#9092f7", textDecoration: "none" }}
                                                            >
                                                                <i className="fa fa-plus-circle fa-fw me-1"></i>
                                                                Add Party
                                                            </Link>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <!-- section 5 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                {/* Section Header */}
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}>
                                                        5. Filing Party -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            &nbsp;Choose the parties you are filing on behalf of. If using a keyboard, select parties with the Enter key instead of the spacebar.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Conditional Table */}
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedCaseTypeId ? (
                                                        <div className="row mb-3">
                                                            <div className="table-responsive">
                                                                <table className="table table-bordered align-middle mb-0">
                                                                    <thead className="table-light">
                                                                        <tr className="fw-bold text-nowrap">
                                                                            <th scope="col" className="text-center" style={{ minWidth: "50px" }}>
                                                                                <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
                                                                            </th>
                                                                            <th scope="col" style={{ minWidth: "150px" }}>Party Name</th>
                                                                            <th scope="col" style={{ minWidth: "120px" }}>Role</th>
                                                                            <th scope="col" style={{ minWidth: "120px" }}>Party Type</th>
                                                                            <th scope="col" style={{ minWidth: "50px" }}></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {combinedParties.map((party) => (
                                                                            <tr key={party.id}>
                                                                                <td className="text-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={party.isChecked || false}
                                                                                        onChange={() => handleRowCheckboxChange(party.id)}
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    {party.roleType === "1"
                                                                                        ? `${party.firstName || "N/A"} ${party.lastName || ""}`
                                                                                        : party.roleType === "2"
                                                                                            ? party.companyName || "N/A"
                                                                                            : "N/A"}
                                                                                </td>
                                                                                <td>
                                                                                    {party.selectedPartyType
                                                                                        ? partyTypes.find((type) => type.value === party.selectedPartyType)?.label || "N/A"
                                                                                        : "N/A"}
                                                                                </td>
                                                                                <td>
                                                                                    {party.roleType === "1"
                                                                                        ? "Individual"
                                                                                        : party.roleType === "2"
                                                                                            ? "Business"
                                                                                            : PartyRoleMapping[party.roleType] || "N/A"}
                                                                                </td>
                                                                                <td></td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {formik.touched.selectedParties && formik.errors.selectedParties && (
                                                                <div className="text-danger mt-2">{formik.errors.selectedParties}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p style={{ margin: 0, fontSize: "15px" }}>
                                                            Add parties above to load available parties to select.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* <!-- section 6 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}> 6 . Service Contacts -
                                                        <span className='fw-normal' style={{ fontSize: "14px" }}> &nbsp; Add service contacts to your filing to perform electronic service.</span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    <div className="row mb-3">
                                                        {selectedContactList.length ? (
                                                            <div className="table-responsive">
                                                                <table className="table table-sm table-borderless text-nowrap">
                                                                    <thead className="table-light">
                                                                        <tr className="fw-bold">
                                                                            <th>
                                                                                <input type="checkbox" /> eServe
                                                                            </th>
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
                                                                                <td>
                                                                                    <input type="checkbox" />
                                                                                </td>
                                                                                <td>
                                                                                    <select className="form-select form-select-sm">
                                                                                        <option value="1">No mail</option>
                                                                                    </select>
                                                                                </td>
                                                                                <td>{`${contact.FirstName} ${contact.LastName}`}</td>
                                                                                <td>{contact.Email}</td>
                                                                                <td></td>
                                                                                <td>
                                                                                    <Link
                                                                                        onClick={() =>
                                                                                            setSelectedContactList((prev) =>
                                                                                                prev.filter((c) => c !== contact)
                                                                                            )
                                                                                        }
                                                                                        style={{
                                                                                            textDecoration: "none",
                                                                                            color: "red",
                                                                                            cursor: "pointer",
                                                                                        }}
                                                                                    >
                                                                                        <i
                                                                                            className="fa fa-times-circle fa-fw"
                                                                                            style={{ marginRight: "5px" }}
                                                                                        ></i>
                                                                                    </Link>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <p>
                                                                No service contacts are currently attached to this filing.
                                                                Use the link below to add contacts.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Link
                                                            className="fw-bold"
                                                            onClick={handleShow}
                                                            style={{
                                                                textDecoration: "none",
                                                                cursor: "pointer",
                                                                color: "#9092f7",
                                                            }}
                                                        >
                                                            <i className="fa fa-plus-circle fa-fw"></i>
                                                            Add Service Contact
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <!-- section 7 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0">
                                                        7. Filing Fee -{" "}
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            Select a payment method to pay estimated fees.
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    <div className="container-fluid px-1 px-md-4">
                                                        {/* Fee Table Section */}
                                                        {showTable && (
                                                            <div className="row fee-section-item">
                                                                {formik.values.documents.map((document, index) => (
                                                                    <div key={index} className="col-12 mb-4">
                                                                        <div className="table-responsive">
                                                                            <table className="table table-borderless mb-0">
                                                                                <tbody>
                                                                                    <tr className="info border shadow-sm">
                                                                                        <td className="fw-bold text-start">{document.documentDescription || "Petition"}</td>
                                                                                        <td className="fw-bold text-end">Estimated</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>Court Filing Fee</td>
                                                                                        <td className="text-end">
                                                                                            {typeof document.fee === "number" ? `$${document.fee.toFixed(2)}` : "No Fee"}
                                                                                        </td>
                                                                                    </tr>
                                                                                    {document.optionalServicesSelections?.map((service, i) => (
                                                                                        <tr key={i}>
                                                                                            <td>
                                                                                                {service.label}
                                                                                                {service.Quantity > 1 ? ` (x ${service.Quantity})` : ""}
                                                                                            </td>
                                                                                            <td className="text-end">
                                                                                                {typeof service.fee === "number"
                                                                                                    ? `$${(service.fee * (service.Quantity || 1)).toFixed(2)}`
                                                                                                    : "TBD"}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                    <tr>
                                                                                        <td className="text-end fw-bold">Sub-Total</td>
                                                                                        <td className="text-end fw-bold">
                                                                                            {(() => {
                                                                                                let total = document.fee || 0;
                                                                                                if (document.optionalServicesSelections) {
                                                                                                    total += document.optionalServicesSelections.reduce((acc, s) => {
                                                                                                        const q = typeof s.Quantity === "number" ? s.Quantity : 1;
                                                                                                        return acc + (s.fee || 0) * q;
                                                                                                    }, 0);
                                                                                                }
                                                                                                return `$${total.toFixed(2)}`;
                                                                                            })()}
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Case Initiation Fee */}
                                                                {caseInitiationFee && (
                                                                    <div className="col-12">
                                                                        <div className="row mb-2">
                                                                            <div className="col-6 text-muted">{caseInitiationFee.reason}</div>
                                                                            <div className="col-6 text-end">{caseInitiationFee.amount} USD</div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col-10 text-end">Sub-Total</div>
                                                                            <div className="col-2 fw-bold text-end">{caseInitiationFee.amount} USD</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Service Fees */}
                                                        {showTable && (
                                                            <div className="row mt-4 fee-section-item">
                                                                <div className="col-12 table-responsive">
                                                                    <table className="table">
                                                                        <thead>
                                                                            <tr className="info border shadow-sm">
                                                                                <td className="fw-bold text-start">Service Fees</td>
                                                                                <td className="fw-bold text-end">Estimated</td>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {feesdata?.AllowanceCharge?.filter(
                                                                                (charge) =>
                                                                                    !["Case Initiation Fee", "Filing Fee", "Optional Service Fee"].includes(
                                                                                        charge.AllowanceChargeReason?.Value
                                                                                    ) && charge.Amount?.Value > 0
                                                                            ).length > 0 ? (
                                                                                feesdata.AllowanceCharge.filter(
                                                                                    (charge) =>
                                                                                        !["Case Initiation Fee", "Filing Fee", "Optional Service Fee"].includes(
                                                                                            charge.AllowanceChargeReason?.Value
                                                                                        ) && charge.Amount?.Value > 0
                                                                                ).map((charge, index) => (
                                                                                    <tr key={index}>
                                                                                        <td>{charge.AllowanceChargeReason?.Value || "Unknown Reason"}</td>
                                                                                        <td className="text-end">
                                                                                            {charge.Amount?.Value ? `$${charge.Amount.Value.toFixed(2)}` : "TBD"}
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
                                                                            <tr>
                                                                                <td className="text-end fw-bold">Grand Total</td>
                                                                                <td className="text-end fw-bold">
                                                                                    {feesdata?.FeesCalculationAmount?.Value
                                                                                        ? `$${feesdata.FeesCalculationAmount.Value.toFixed(2)}`
                                                                                        : "$0.00"}
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Payment Account Section */}
                                                        <div className="container-fluid row mt-4 align-items-center">
                                                            <label htmlFor="paymentAccount" className="col-12 col-md-3 col-lg-3 fw-bold mb-2 mb-md-0">
                                                                Select Payment Account
                                                                <i className="fa fa-asterisk fa-fw red small-icon" aria-hidden="false" aria-label="Required"></i>
                                                            </label>

                                                            <div className="col-12 col-md-5 col-lg-4 mb-2 mb-md-0">
                                                                <Select
                                                                    id="paymentAccount"
                                                                    options={paymentAccountOptions}
                                                                    value={paymentAccountOptions.find((option) => option.value === formik.values.paymentAccount) || null}
                                                                    onChange={(selectedOption) => formik.setFieldValue("paymentAccount", selectedOption?.value || null)}
                                                                    isSearchable={true}
                                                                    placeholder="Choose payment account"
                                                                    onBlur={() => formik.setFieldTouched("paymentAccount", true)}
                                                                />
                                                                {formik.touched.paymentAccount && formik.errors.paymentAccount && (
                                                                    <div className="text-danger mt-1 fw-bold">{formik.errors.paymentAccount}</div>
                                                                )}
                                                            </div>

                                                            <div className="col-12 col-md-5 text-md-end">
                                                                <Link
                                                                    className="col-12 col-lg-4 fw-bold ps-0 text-start mt-2 mt-lg-0"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        feesCalculationApiCall();
                                                                    }}
                                                                >
                                                                    <i className="fa fa-calculator fa-fw me-1"></i>
                                                                    Confirm fee calculation
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <!-- section 8 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                {/* Header */}
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}>
                                                        8. Review & Submit -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            &nbsp; Finalize your filing, review, and submit.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Body */}
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {/* Filing for */}
                                                    <div className="row mb-3 align-items-center">
                                                        <label htmlFor="filing-for" className="col-12 col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                            Filing for
                                                        </label>
                                                        <div className="col-12 col-sm-6" style={{ fontSize: "14px" }}>
                                                            <Select
                                                                id="filing-for"
                                                                options={attorneys}
                                                                onChange={(selectedOption) =>
                                                                    formik.setFieldValue("selectedAttorneySec", selectedOption?.value || "")
                                                                }
                                                                placeholder="Search and select an attorney"
                                                                getOptionLabel={(e) => e.label}
                                                                getOptionValue={(e) => e.value}
                                                                isClearable
                                                                isSearchable
                                                                value={
                                                                    formik.values.selectedAttorneySec
                                                                        ? attorneys.find((attorney) => attorney.value === formik.values.selectedAttorneySec)
                                                                        : null
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Created by */}
                                                    <div className="row mb-3 align-items-center">
                                                        <label htmlFor="created-by" className="col-12 col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                            Created by
                                                        </label>
                                                        <div className="col-12 col-sm-6">
                                                            <input
                                                                id="created-by"
                                                                name="createdBy"
                                                                className="form-control"
                                                                type="text"
                                                                value={formik.values.createdBy}
                                                                onChange={formik.handleChange}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Client Matter */}
                                                    <div className="row mb-3 align-items-center">
                                                        <label htmlFor="client-matter" className="col-12 col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                            Client Matter/ Reference No.
                                                        </label>
                                                        <div className="col-12 col-sm-6">
                                                            <input
                                                                id="client-matter"
                                                                name="referNo"
                                                                className="form-control"
                                                                type="text"
                                                                value={formik.values.referNo}
                                                                onChange={formik.handleChange}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Courtesy Email Notice */}
                                                    <div className="row mb-3 align-items-center">
                                                        <label htmlFor="courtesy-email" className="col-12 col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                            Courtesy Email Notice
                                                        </label>
                                                        <div className="col-12 col-sm-6">
                                                            <input
                                                                id="courtesy-email"
                                                                name="courtesyemail"
                                                                className="form-control"
                                                                type="email"
                                                                value={formik.values.courtesyemail}
                                                                onChange={formik.handleChange}
                                                            />
                                                            <p className="form-text text-black-50 mt-1">
                                                                <i className="fa fa-info-circle me-1"></i>
                                                                Accepts Comma Separated list of email addresses
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Note to clerk */}
                                                    <div className="row mb-3 align-items-center">
                                                        <label htmlFor="note-to-clerk" className="col-12 col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                            Note to clerk
                                                        </label>
                                                        <div className="col-12 col-sm-6">
                                                            <textarea
                                                                id="note-to-clerk"
                                                                name="note"
                                                                className="form-control"
                                                                placeholder="Leave a note to clerk here"
                                                                value={formik.values.note}
                                                                onChange={formik.handleChange}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Checkbox */}
                                                    <div className="row mb-3">
                                                        <div className="col-12 col-sm-2"></div>
                                                        <div className="col-12 col-sm-6">
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="checkbox" id="verifyCheckbox" required />
                                                                <label className="form-check-label" htmlFor="verifyCheckbox">
                                                                    I have verified my filing information.
                                                                    <i className="fa fa-asterisk text-danger small ms-1"></i>
                                                                </label>
                                                            </div>
                                                            <div className="invalid-feedback">
                                                                You must verify your filing information before submitting.
                                                            </div>
                                                            {successMessage && <div className="alert alert-success mt-2">{successMessage}</div>}
                                                            {errorMessage && (
                                                                <div className="alert alert-danger mt-2">
                                                                    You must affirm the above information before submitting filing.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Buttons */}
                                                    <div className="row">
                                                        <div className="col-12 d-flex justify-content-center gap-3 pt-3">
                                                            <button
                                                                type="submit"
                                                                disabled={loading}
                                                                className="btn btn-dark text-white"
                                                            >
                                                                {loading ? (
                                                                    <div className="spinner-border spinner-border-sm text-light" role="status">
                                                                        <span className="sr-only">Loading...</span>
                                                                    </div>
                                                                ) : (
                                                                    "Submit Filing"
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-dark text-white"
                                                                onClick={handleSaveDraft}
                                                            >
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
                        {/* Popup for loader */}
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

                {/* <!-- section end--> */}
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
                        <p>Are you sure you would like to discard this filing? If yes, click Confirm.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCloseDiscard}> Cancel</Button>
                        <Button variant="dark" onClick={handleDiscardAndRefresh} > Confirm</Button>
                    </Modal.Footer>
                </Modal>
            </div >
        </WrapperTag >
    );
};

export default ExistingCase;