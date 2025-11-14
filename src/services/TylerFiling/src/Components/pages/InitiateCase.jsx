import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Trash from '../assets/trash.png';
import Save from "../assets/Save.png";
import Select from 'react-select';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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

function InitiateCase() {
    const navigate = useNavigate();
    const location = useLocation();

    const { filingID } = location.state || {};

    const [courts, setCourts] = useState([]); // Court options
    const [selectedCourt, setSelectedCourt] = useState(null); // Selected court
    const [loading, setLoading] = useState(false); // Loading state for courts

    const [categories, setCategories] = useState([]); // Categories for dropdown
    const [cases, setCases] = useState([]); // Cases for dropdown
    const [selectedCategory, setSelectedCategory] = useState(null); // Selected category
    const [loadingCases, setLoadingCases] = useState(false); // Loading state for cases
    const [securityTypes, setSecurityTypes] = useState([]); // Security types for selected document type
    const [securityOptions, setSecurityOptions] = useState([]);

    const [documentType, setDocumentType] = useState([]); // Document type options    
    const [selectedDocumentType, setSelectedDocumentType] = useState(null); // Selected document type
    const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
    const [documentName, setDocumentName] = useState('');
    const [loadingOptionalServices, setLoadingOptionalServices] = useState(false);
    const [optionalServicesSelections, setOptionalServicesSelections] = useState([]);
    const [optionalServicesOptions, setOptionalServicesOptions] = useState([]);

    // State for Party Types
    const [selectedCaseType, setSelectedCaseType] = useState(null);
    const [partyTypes, setPartyTypes] = useState([]);
    const [selectedPartyType, setSelectedPartyType] = useState(null);
    const [selectedParties, setSelectedParties] = useState([]);
    const [showDiv, setShowDiv] = useState(true);
    const [partyList, setPartyList] = useState([{
        id: 1, roleType: "1", suffix: "", selectedPartyType: '', selectedAttorney: null,
        selectedBarNumbers: [], firstName: "", lastName: "", middleName: "",
        companyName: "", Address: "", Address2: "", City: "", State: "", Zip: "", selected: false, internationalAddress: "",
    },
    {
        id: 2, roleType: "1", suffix: "", selectedPartyType: '', selectedAttorney: null,
        selectedBarNumbers: [], firstName: "", lastName: "", middleName: "", companyName: "", Address: "",
        Address2: "", City: "", State: "", Zip: "", selected: false, internationalAddress: "",
    }]);
    const [suffixOptions, setSuffixOptions] = useState([]);
    const [attorneys, setAttorneys] = useState([]);
    const [error, setError] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [editIndex, setEditIndex] = useState(null); // Track which row is being edited
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [isSaved, setIsSaved] = useState([]);
    const token = sessionStorage.getItem('access_token');

    //service conatct list 
    const [show, setShow] = useState(false);
    const [contactList, setContactList] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedContactList, setSelectedContactList] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('from-my-firm');
    const [selectedContacts, setSelectedContacts] = useState([]); // Contacts selected in the modal
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

    //handle to reset form on discard button
    const handleDiscardAndRefresh = () => {
        formik.resetForm();
        // window.location.reload();
        navigate("/e-filing/filingStatus")
    };
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [allowanceCharges, setAllowanceCharges] = useState([]);
    const [caseInitiationFee, setCaseInitiationFee] = useState(null);
    const [otherFees, setOtherFees] = useState([]);
    const [feesCalculationAmount, setFeesCalculationAmount] = useState("0.00 USD");
    const [feedata, setFeeData] = useState(null);
    const [selectedAttorneySec, setSelectedAttorneySec] = useState(null);
    const [requestBody, setRequestBody] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
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


    // Fetch categories on component mount
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
        if (selectedCategory) {
            setLoadingCases(true);

            const baseURL = process.env.REACT_APP_BASE_URL;
            // case type api
            fetch(`${baseURL}/GetCaseType?categoryId=${selectedCategory.value}`)
                .then((response) => response.json())
                .then((data) => {
                    const formattedCases = data.map((c) => ({
                        value: c.code,
                        label: c.name,
                    }));
                    setCases(formattedCases);
                    setLoadingCases(false);
                    setSelectedCaseType(null);
                    setPartyTypes([]);
                    setSelectedPartyType(null);
                    setShowDiv(false);
                })
                .catch((error) => {
                    console.error('Error fetching cases:', error);
                    setLoadingCases(false);
                });

        }

    }, [selectedCategory]);

    // Fetch document of case type when the selected category changes
    useEffect(() => {
        if (selectedCategory) {
            setLoadingDocumentTypes(true);

            const baseURL = process.env.REACT_APP_BASE_URL;
            //api for document types categories
            fetch(`${baseURL}/GetFilingCode?categoryId=${selectedCategory.value}`)
                .then((response) => response.json())
                .then((data) => {
                    const formattedDocumentTypes = data.map((docType) => ({
                        value: docType.code,
                        label: docType.name,
                    }));
                    setDocumentType(formattedDocumentTypes);
                    setLoadingDocumentTypes(false);
                })
                .catch((error) => {
                    console.error('Error fetching document types:', error);
                    setLoadingDocumentTypes(false);
                });
        } else {
            setDocumentType([]); // Clear document types if no category is selected
        }

    }, [selectedCategory]);


    //fetch api for optional services of court
    useEffect(() => {
        if (selectedDocumentType) {
            setLoadingOptionalServices(true);

            const baseURL = process.env.REACT_APP_BASE_URL;
            // api for optional services of court
            fetch(`${baseURL}/GetCourtOptionalServices?filingcode=${selectedDocumentType.value}`)
                .then((response) => response.json())
                .then((data) => {
                    const formattedOptionalServices = data.map((service) => ({
                        value: service.code,
                        label: service.name,
                        multiplier: service.multiplier || false, //default property
                    }));
                    // setOptionalServices(formattedOptionalServices);
                    setOptionalServicesOptions(formattedOptionalServices);
                    setLoadingOptionalServices(false);
                })
                .catch((error) => {
                    console.error('Error fetching optional services:', error);
                    setLoadingOptionalServices(false);
                });
        } else {
            setOptionalServicesOptions([]); // Clear optional services if no document type is selected
        }
    }, [selectedDocumentType]);

    // Fetch Party Types When Case Type Changes
    useEffect(() => {
        if (selectedCaseType) {

            const baseURL = process.env.REACT_APP_BASE_URL;
            //  party types based on case type api
            fetch(`${baseURL}/GetPartyTypeCode?caseTypeId=${selectedCaseType.value}`)
                .then((response) => response.json())
                .then((data) => {
                    const formattedPartyTypes = data.map((partyType) => ({
                        value: partyType.code,
                        label: partyType.name,
                    }));
                    setPartyTypes(formattedPartyTypes);
                    setSelectedPartyType(null); // Reset Party Type selection when Case Type changes
                    setShowDiv(true);
                })
                .catch((error) => console.error('Error fetching party types:', error));
        } else {
            setPartyTypes([]); // Clear Party Types if no Case Type is selected
            setShowDiv(false);
        }

    }, [selectedCaseType]);

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

    //handle for court selection
    const handleCourtChange = (selectedOption) => {
        setSelectedCourt(selectedOption);
        const courtValue = selectedOption ? selectedOption.value : null;
        formik.setFieldValue('selectedCourt', courtValue);
        // console.log('Selected Court:', courtValue);
    };

    // Handle category selection
    const handleCategoryChange = (selectedOption) => {
        setSelectedCategory(selectedOption);
        const categoryValue = selectedOption ? selectedOption.value : null;
        formik.setFieldValue('selectedCategory', categoryValue);
        setSelectedDocumentType(null); // Reset document type when category changes
        setDocumentName(''); // Clear document name when category changes
        setSecurityTypes([]);
        setOptionalServicesOptions([]);

        //console.log('Selected Category:', categoryValue);
    };

    // Handle Case Type Selection
    const handleCaseTypeChange = (selectedOption) => {
        setSelectedCaseType(selectedOption);
        const caseTypeValue = selectedOption ? selectedOption.value : null;
        setSelectedPartyType(null); // Reset Party Type when Case Type changes
        formik.setFieldValue('selectedCaseType', caseTypeValue);
        // console.log("Selected Case Value:", caseTypeValue);
    };

    // Handle document type selection & security type selection
    const handleDocumentTypeChange = async (selectedOption, index) => {
        try {
            // Update Formik field values
            formik.setFieldValue(`documents[${index}].documentType`, selectedOption?.value);
            formik.setFieldValue(`documents.${index}.documentDescription`, selectedOption?.label || "");

            // Update selectedDocumentType globally
            setSelectedDocumentType(selectedOption);
            setOptionalServicesSelections([null]);

            // Fetch security options only if a valid document type is selected
            if (selectedOption?.value) {
                const baseURL = process.env.REACT_APP_BASE_URL;

                const response = await fetch(`${baseURL}/GetDocumentCode?filingcode=${selectedOption.value}`);
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
                    newOptions[index] = formattedSecurityTypes;
                    return newOptions;
                });
            }
        } catch (error) {
            console.error("Error fetching security types:", error);

        }
    };

    // file upload functionality
    // const handleFileChange = async (event, index) => {
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

    const handleFileChange = async (event, index) => {
        const file = event.target.files[0];

        if (file) {
            const base64String = await convertToBase64(file);
            const fileSizeKB = (file.size / 1024).toFixed(1); // Convert size to KB
            const fileURL = URL.createObjectURL(file);

            try {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = async function () {
                    const pdfData = new Uint8Array(fileReader.result);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    const pageCount = pdf.numPages;

                    // Update Formik state
                    formik.setFieldValue(`documents[${index}].file`, file);
                    formik.setFieldValue(`documents[${index}].fileName`, file.name);
                    formik.setFieldValue(`documents[${index}].fileBase64`, base64String);
                    formik.setFieldValue(`documents[${index}].fileSize`, fileSizeKB);
                    formik.setFieldValue(`documents[${index}].pageCount`, pageCount);
                    formik.setFieldValue(`documents[${index}].fileURL`, fileURL);

                    handleSave(index);
                };
            } catch (error) {
                console.error("Error processing PDF:", error);
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
        formik.setFieldValue('documents', updatedDocuments);
        setDeleteIndex(null) // Confirm deletion and reset the delete state
    };

    const handleCancelDelete = () => {
        setDeleteIndex(null); // Cancel deletion
    };

    // Handle selection of an Optional Service
    const handleOptionalServiceChange = (selectedOption, index, serviceIndex) => {
        try {
            // console.log("Selected Option:", selectedOption);
            const currentServices = formik.values.documents[index].optionalServicesSelections || [];
            const updatedServices = [...currentServices];

            // Update the specific service based on serviceIndex
            updatedServices[serviceIndex] = {
                value: selectedOption.value || "",
                label: selectedOption.label,
                multiplier: selectedOption.multiplier,
                // fee: Number(selectedOption.fee) || 0,
                Quantity: selectedOption.multiplier ? 1 : null,
            };

            // Update the formik state
            formik.setFieldValue(`documents[${index}].optionalServicesSelections`, updatedServices);
        } catch (error) {
            console.error("Error in handleOptionalServiceChange:", error);
        }
    };

    // Handle adding a new Optional Service dropdown
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

    // Handle removal of an Optional Service dropdown
    const handleRemoveOptionalService = (index, serviceIndex) => {
        const updatedServices = [...formik.values.documents[index].optionalServicesSelections];
        updatedServices.splice(serviceIndex, 1); // Remove the specified service
        formik.setFieldValue(`documents[${index}].optionalServicesSelections`, updatedServices);
    };

    // Handle to add quantity for optional services dropdown 
    const handleQuantityChange = (quantity, index, serviceIndex) => {

        const updatedServices = [...formik.values.documents[index].optionalServicesSelections];
        updatedServices[serviceIndex].Quantity = quantity;

        // Use Formik's setFieldValue to update the state immutably
        formik.setFieldValue(`documents[${index}].optionalServicesSelections`, updatedServices);
    };

    // Handle Party Type change
    const handlePartyTypeChange = (id, event) => {
        const newPartyType = event.target.value;
        const partyIndex = formik.values.parties.findIndex((party) => party.id === id);

        if (partyIndex !== -1) {
            // Update both parties and selectedParties to reflect the new party type
            const updatedParties = [...formik.values.parties];
            updatedParties[partyIndex] = {
                ...updatedParties[partyIndex],
                selectedPartyType: newPartyType,
            };

            formik.setFieldValue('parties', updatedParties); // Update the parties array

            const updatedSelectedParties = [...formik.values.selectedParties];
            updatedSelectedParties[partyIndex] = {
                ...updatedSelectedParties[partyIndex],
                selectedPartyType: newPartyType,
            };

            formik.setFieldValue('parties', updatedParties);
            formik.setFieldValue('selectedParties', updatedSelectedParties); // Update the selectedParties array
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

    //handle for bar number 
    const handleBarNumberChange = (id, selectedOptions) => {
        const selectedBarNumbers = selectedOptions.map(option => option.value); // Extract values (bar numbers)
        const partyIndex = formik.values.parties.findIndex((party) => party.id === id);

        if (partyIndex !== -1) {
            // Update the selected bar numbers for the party
            formik.setFieldValue(`parties[${partyIndex}].selectedBarNumbers`, selectedBarNumbers);
        }
    };

    // formik validation for filing form submission
    const initialValues = {
        selectedCourt: null,
        selectedCategory: null,
        selectedCaseType: null,
        paymentAccount: null,
        selectedAttorneySec: null,
        createdBy: null,
        courtesyemail: null,
        note: null,
        documents: [
            {
                id: 1,
                documentType: null,
                documentDescription: '',
                fileName: '',
                fileBase64: '',
                securityTypes: '',
                optionalServicesSelections: [
                    { value: '', Quantity: '' }
                ]
            }
        ],
        parties: partyList,
        selectedParties: partyList,
    };

    const validationSchema = Yup.object().shape({
        selectedCourt: Yup.string().required('Please select the Court'),
        selectedCategory: Yup.string().required('Please select the category'),
        selectedCaseType: Yup.string().required('Please select the case type'),
        paymentAccount: Yup.string().required('Payment account is required'),
        documents: Yup.array().of(
            Yup.object().shape({
                documentType: Yup.string().required('At least upload one document'),
            })
        ),
        parties: Yup.array().of(
            Yup.object({
                roleType: Yup.string().required('Role type is required'),
                companyName: Yup.string().when('roleType', {
                    is: '2', // Apply validation only when roleType is '2'
                    then: (schema) => schema.required('Company name is required').min(3, 'Company name must be at least 3 characters'),
                    otherwise: (schema) => schema, // No validation for other roleTypes
                }),
                firstName: Yup.string().when('roleType', {
                    is: '1', // Apply validation only when roleType is '1'
                    then: (schema) => schema.required('First name is required').min(3, 'First name must be at least 3 characters'),
                    otherwise: (schema) => schema, // No validation for other roleTypes
                }),
                lastName: Yup.string().when('roleType', {
                    is: '1', // Apply validation only when roleType is '1'
                    then: (schema) => schema.required('Last name is required').min(3, 'Last name must be at least 3 characters'),
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
    });

    // used useFormik() insted of formik component <Formik ... />
    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            console.log('Form Submitted:', values);

            setLoading(true);
            setShowPopup(true);

            const prepareDocumentsForApi = (documents) => {
                return documents.map((doc) => ({
                    documentType: doc.documentType,
                    documentDescription: doc.documentDescription.replace(/\s+/g, ''), // Remove all spaces from description
                    fileName: doc.fileName,
                    fileBase64: (doc.fileBase64 || "").replace(/^data:application\/pdf;base64,/, ''),
                    securityTypes: doc.securityTypes,
                    optionalServicesSelections: doc.optionalServicesSelections.map((service) => ({
                        value: service.value,
                        Quantity: service.Quantity,
                    })),
                }));
            };

            const preparePartiesForApi = (partyList) => {
                return partyList.map((party) => ({
                    selectedPartyType: party.selectedPartyType,
                    roleType: party.roleType,
                    lastName: party.lastName,
                    firstName: party.firstName,
                    middleName: party.middleName,
                    suffix: party.suffix,
                    companyName: party.companyName,
                    address: party.Address,
                    address2: party.Address2,
                    city: party.City,
                    state: party.State,
                    zip: party.Zip,
                    addressUnknown: !party.Address, // Set to true if address is missing
                    internationalAddress: party.internationalAddress,
                    saveToAddressBook: true, // Static value or modify as needed
                    selectedAttorney: party.selectedAttorney,
                    selectedBarNumbers: party.selectedBarNumbers,
                }));
            };

            const selectedPartiesForAPI = values.selectedParties.map((party) => ({
                partyName:
                    party.roleType === '1'
                        ? `${party.firstName}${party.lastName}`.trim() // Combine firstName and lastName for roleType 1
                        : party.companyName.replace(/\s+/g, ''), // Use companyName for roleType 2
                partyType: party.selectedPartyType,
                role: party.roleType,
            }));

            // Updated request body
            const generatedRequestBody = {
                ...values,
                documents: prepareDocumentsForApi(values.documents),
                parties: preparePartiesForApi(values.parties),
                selectedParties: selectedPartiesForAPI, // Replace selectedParties with filtered data
            };

            setRequestBody(generatedRequestBody);

            const baseURL = process.env.REACT_APP_BASE_URL;
            try {
                // Fixed template literal for URL and Authorization header
                const response = await fetch(`${baseURL}/CoreFilingNewCivil`, {
                    //const response = await fetch('https://localhost:7207/api/Tyler/CoreFilingNewCivil', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                alert('Form submitted successfully!');
                console.log("form data:", data)

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
                            willClose: () => {
                                window.location.reload();  // Reload the page when the user clicks "Ok"
                            },
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
    });

    //construct request body for fees calculation api
    const generateRequestBody = (values) => {
        const prepareDocumentsForApi = (documents) => {
            return documents.map((doc) => ({
                documentType: doc.documentType,
                documentDescription: doc.documentDescription.replace(/\s+/g, ''),
                fileName: doc.fileName,
                fileBase64: doc.fileBase64.replace(/^data:application\/pdf;base64,/, ''),
                securityTypes: doc.securityTypes,
                optionalServicesSelections: doc.optionalServicesSelections.map((service) => ({
                    value: service.value,
                    Quantity: service.Quantity,
                })),
            }));
        };

        const preparePartiesForApi = (partyList) => {
            return partyList.map((party) => ({
                selectedPartyType: party.selectedPartyType,
                roleType: party.roleType,
                lastName: party.lastName,
                firstName: party.firstName,
                middleName: party.middleName,
                suffix: party.suffix,
                companyName: party.companyName,
                address: party.Address,
                address2: party.Address2,
                city: party.City,
                state: party.State,
                zip: party.Zip,
                addressUnknown: !party.Address,
                internationalAddress: party.internationalAddress,
                saveToAddressBook: true,
                selectedAttorney: party.selectedAttorney,
                selectedBarNumbers: party.selectedBarNumbers,
            }));
        };

        const selectedPartiesForAPI = values.selectedParties.map((party) => ({
            partyName: party.roleType === '1'
                ? `${party.firstName}${party.lastName}`.trim()
                : party.companyName.replace(/\s+/g, ''),
            partyType: party.selectedPartyType,
            role: party.roleType,
        }));

        return {
            ...values,
            documents: prepareDocumentsForApi(values.documents),
            parties: preparePartiesForApi(values.parties),
            selectedParties: selectedPartiesForAPI,
        };
    };

    // First API Call triggered by clicking a link
    const feesCalculationApiCall = async () => {
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

        const baseURL = process.env.REACT_APP_BASE_URL;

        try {
            const response = await fetch(`${baseURL}/GetFeesCalculation`, {
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
            // console.log("Generated Payload:", requestBody);
            const data = await response.json();
            console.log('API Response:', data);
            //const json = await response.json();
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

    //functions to fetch/call feescalculations
    useEffect(() => {
        const generatedRequestBody = generateRequestBody(formik.values);
        setRequestBody(generatedRequestBody);
    }, [formik.values]);

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
    };

    useEffect(() => {
        setPartyList(formik.values.parties);
    }, [formik.values.parties]);

    // Remove a party
    const handleRemoveClick = (id) => {
        setPartyList((prevParties) => {
            const updatedParties = prevParties.filter((party) => party.id !== id);
            formik.setFieldValue('parties', updatedParties);
            formik.setFieldValue('selectedParties', updatedParties); // Update Formik's parties field
            return updatedParties; // Update local state
        });
    };

    // Handle role type change
    const handleRoleTypeChange = (id, event) => {
        const newRoleType = event.target.value;
        const partyIndex = formik.values.parties.findIndex((party) => party.id === id);

        if (partyIndex !== -1) {
            // Update both parties and selectedParties arrays to reflect the new role type
            const updatedParties = [...formik.values.parties];
            updatedParties[partyIndex] = {
                ...updatedParties[partyIndex],
                roleType: newRoleType, // Update roleType in parties array
            };

            formik.setFieldValue('parties', updatedParties); // Update the parties array

            const updatedSelectedParties = [...formik.values.selectedParties];
            updatedSelectedParties[partyIndex] = {
                ...updatedSelectedParties[partyIndex],
                roleType: newRoleType,
            };

            formik.setFieldValue('selectedParties', updatedSelectedParties);
        }
    };

    // Handle suffix change
    const handleSuffixChange = (id, event) => {
        const newSuffix = event.target.value;
        const partyIndex = formik.values.parties.findIndex((party) => party.id === id);

        if (partyIndex !== -1) {
            // Update the specific suffix field using Formik's setFieldValue
            formik.setFieldValue(`parties[${partyIndex}].suffix`, newSuffix);
        }
    };

    // Handle individual row checkbox change
    const handleRowCheckboxChange = (id) => {
        const updatedParties = formik.values.selectedParties.map((party) =>
            party.id === id ? { ...party, isChecked: !party.isChecked } : party
        );
        // Update Formik state
        formik.setFieldValue('selectedParties', updatedParties);

        // Check if all parties are selected to update the "Select All" checkbox
        const allSelected = updatedParties.every((party) => party.isChecked);
        setSelectAll(allSelected);
    };

    // Handle "Select All" checkbox change
    const handleSelectAllChange = () => {
        const updatedSelectAll = !selectAll;
        setSelectAll(updatedSelectAll);

        // Update all parties' "isChecked" state to match the "Select All" checkbox
        const updatedParties = formik.values.selectedParties.map((party) => ({
            ...party,
            isChecked: updatedSelectAll,
        }));

        formik.setFieldValue('selectedParties', updatedParties); // Update Formik state
    };

    useEffect(() => {
        const someSelected = formik.values.selectedParties.some((party) => party.isChecked);
        const allSelected = formik.values.selectedParties.every((party) => party.isChecked);
        setSelectAll(allSelected || someSelected ? "indeterminate" : false);
    }, [formik.values.selectedParties]);

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

            formik.setFieldValue('selectedParties', updatedSelectedParties);
        }
    };

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

    // Map the payment accounts to the format required by react-select
    const paymentAccountOptions = paymentAccounts.map((account) => ({
        value: account.PaymentAccountID,
        label: account.AccountName,
    }));

    // handle to the selected attorney
    const handleAttorneySelect = (selectedOption) => {
        setSelectedAttorneySec(selectedOption);
    };

    //functionality for fees calculation
    const requiredFees = [
        "Case Initiation Fee",
        "Party Fee",
        "Filing Fee",
        "Optional Service Fee",
        "Total Service Fees",
        "Total Service Tax Fees",
        "Redaction Fee",
        "Total Redaction Fees",
        "Convenience Fee",
        "Total Provider",
        "Total Provider Tax Fees",
        "Total Court Service Fees",
        "Total Mail Service Fees",
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
            console.log("Case Initiation Fee:", initiationFee);
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


    const prepareDocumentsForApi = (documents) => {
        return documents.map((doc) => ({
            documentType: doc.documentType,
            documentDescription: doc.documentDescription.trim(),
            fileName: doc.fileName,
            fileBase64: (doc.fileBase64 || "").replace(/^data:application\/pdf;base64,/, ''),
            securityTypes: doc.securityTypes,
            optionalServicesSelections: doc.optionalServicesSelections.map((service) => ({
                value: service.value,
                Quantity: service.Quantity,
            })),
        }));
    };

    const preparePartiesForApi = (partyList) => {
        return partyList.map((party) => ({
            selectedPartyType: party.selectedPartyType,
            roleType: party.roleType,
            lastName: party.lastName,
            firstName: party.firstName,
            middleName: party.middleName,
            suffix: party.suffix,
            companyName: party.companyName,
            address: party.Address,
            address2: party.Address2,
            city: party.City,
            state: party.State,
            zip: party.Zip,
            addressUnknown: !party.Address, // Set to true if address is missing
            internationalAddress: party.internationalAddress,
            saveToAddressBook: true, // Static value
            selectedAttorney: party.selectedAttorney,
            selectedBarNumbers: party.selectedBarNumbers,
        }));
    };


    const handleSaveDraft = async () => {
        setLoading(true);

        // Extract values from form
        const { selectedCourt,
            selectedCategory,
            selectedCaseType,
            paymentAccount,
            selectedAttorneySec,
            createdBy, courtesyemail,
            note, documents,
            parties,
            selectedParties
        } = formik.values;


        const selectedPartiesForAPI = selectedParties.map((party) => ({
            partyName:
                party.roleType === '1'
                    ? `${party.firstName} ${party.lastName}`.trim() // Combine firstName and lastName for roleType 1
                    : party.companyName.replace(/\s+/g, ''), // Use companyName for roleType 2
            partyType: party.selectedPartyType,
            role: party.roleType,
        }));
        // Ensure required field is present
        if (!selectedCourt) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Court selection is required.',
                confirmButtonText: 'Ok',
            });
            setLoading(false);
            return;
        }

        // Function to replace null/undefined with empty string
        const cleanValue = (value) => (value === null || value === undefined ? "" : value);

        // Prepare request body
        const draftRequestBody = {
            filingID: cleanValue(filingID),
            selectedCourt: cleanValue(selectedCourt),
            selectedCategory: cleanValue(selectedCategory),
            selectedCaseType: cleanValue(selectedCaseType),
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
                    quantity: opt.Quantity !== null ? cleanValue(opt.Quantity) : 1,
                    fee: typeof opt.fee === "number" && typeof opt.Quantity === "number"
                        ? (opt.fee * opt.Quantity).toFixed(2) // Multiply fee by quantity
                        : "0.00",
                    label: cleanValue(opt.label),
                    multiplier: cleanValue(opt.multiplier),
                })) || [],
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
        };

        // Debug: Log final request body
        console.log("Final Draft Request Body:", draftRequestBody);

        try {
            const baseURL = process.env.REACT_APP_BASE_URL;
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
        } finally {
            setLoading(false);
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
                                        <span>
                                            <b>Initiate a New Case</b> - Complete the below filing steps and submit to file your documents.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- form sections --> */}
                    <div className="row case_form justify-content-center mt-2">
                        <form method="post" onSubmit={formik.handleSubmit}>
                            {/* <!--col-12 --> */}
                            <div className="col-12 col-md-12 col-xl-12">
                                <div className="card p-2">
                                    <div className="card-body">
                                        <div className="row">
                                            {/* <!-- section 1 --> */}
                                            <div className="col-12 mb-3">
                                                {/* Header */}
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}>
                                                        1. Select Court & Case Type -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            &nbsp; Choose the court location and case type to file your new case.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Body */}
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {/* Court Dropdown */}
                                                    <div className="row mb-3 align-items-center">
                                                        <label htmlFor="court-dropdown" className="col-12 col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                            Court
                                                            <i className="fa fa-asterisk fa-fw red small-icon" aria-hidden="false" aria-label="Required"></i>
                                                        </label>
                                                        <div className="col-12 col-sm-6" style={{ fontSize: "14px" }}>
                                                            <Select
                                                                id="court-dropdown"
                                                                options={courts}
                                                                value={courts.find(court => court.value === formik.values.selectedCourt) || null}
                                                                onChange={handleCourtChange}
                                                                onBlur={() => formik.setFieldTouched('selectedCourt', true)}
                                                                placeholder={loading ? 'Loading courts...' : 'Search or select a court'}
                                                                isLoading={loading}
                                                                isSearchable
                                                                noOptionsMessage={() => 'No courts found'}
                                                            />
                                                            {formik.touched.selectedCourt && formik.errors.selectedCourt && (
                                                                <div className="text-danger mt-1 fw-bold">{formik.errors.selectedCourt}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Category Dropdown */}
                                                    <div className="row mb-3 align-items-center">
                                                        <label htmlFor="category-select" className="col-12 col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                            Category
                                                            <i className="fa fa-asterisk fa-fw red small-icon" aria-hidden="false" aria-label="Required"></i>
                                                        </label>
                                                        <div className="col-12 col-sm-6" style={{ fontSize: "14px" }}>
                                                            <Select
                                                                id="category-select"
                                                                options={categories}
                                                                value={categories.find(category => category.value === formik.values.selectedCategory) || null}
                                                                onChange={handleCategoryChange}
                                                                onBlur={() => formik.setFieldTouched('selectedCategory', true)}
                                                                placeholder="Search or select a category"
                                                            />
                                                            {formik.touched.selectedCategory && formik.errors.selectedCategory && (
                                                                <div className="text-danger mt-1 fw-bold">{formik.errors.selectedCategory}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Case Type Dropdown */}
                                                    <div className="row mb-3 align-items-center">
                                                        <label htmlFor="case-select" className="col-12 col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                            Case Type
                                                            <i className="fa fa-asterisk fa-fw red small-icon" aria-hidden="false" aria-label="Required"></i>
                                                        </label>
                                                        <div className="col-12 col-sm-6" style={{ fontSize: "14px" }}>
                                                            <Select
                                                                id="case-select"
                                                                options={cases}
                                                                value={cases.find(caseType => caseType.value === formik.values.selectedCaseType) || null}
                                                                onChange={handleCaseTypeChange}
                                                                onBlur={() => formik.setFieldTouched('selectedCaseType', true)}
                                                                placeholder="Search or select a case"
                                                                isDisabled={!formik.values.selectedCategory || loadingDocumentTypes}
                                                            />
                                                            {formik.touched.selectedCaseType && formik.errors.selectedCaseType && (
                                                                <div className="text-danger mt-1 fw-bold">{formik.errors.selectedCaseType}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Info Note */}
                                                    <div className="row">
                                                        <div className="col-12 offset-sm-2 col-sm-9">
                                                            <p className="text-secondary" style={{ fontSize: "14px" }}>
                                                                <i className="fa fa-info-circle me-2"></i>
                                                                You must first select a court to load available case types.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- section 2 --> */}
                                            <div className="col-12 mb-3">
                                                {/* Header */}
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}>
                                                        2. Add Documents -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            &nbsp; Define, select, and upload the documents that make up your filing.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Body */}
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedCategory ? (
                                                        <div className="responsive-table-wrapper">
                                                            {/* Header */}
                                                            <div className="row fw-bold border-bottom pb-2 mb-2 d-none d-md-flex">
                                                                <div className="col-md-3">Document Type</div>
                                                                <div className="col-md-3">Document Description</div>
                                                                <div className="col-md-3">File Name</div>
                                                                <div className="col-md-3">Actions</div>
                                                            </div>

                                                            {/* Document Rows */}
                                                            {formik.values.documents.map((document, index) => (
                                                                <div className="row mb-4 border-bottom pb-3" key={index}>
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
                                                                                    onChange={(selected) => handleDocumentTypeChange(selected, index)}
                                                                                    onBlur={() => formik.setFieldTouched(`documents[${index}].documentType`, true)}
                                                                                    placeholder="Select type"
                                                                                    menuPortalTarget={document.body}
                                                                                    styles={{
                                                                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                                        menu: base => ({ ...base, zIndex: 9999 }),
                                                                                    }}
                                                                                />
                                                                                {formik.touched.documents?.[index]?.documentType && formik.errors.documents?.[index]?.documentType && (
                                                                                    <div className="text-danger mt-1 small">{formik.errors.documents[index].documentType}</div>
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
                                                                                onChange={(e) => formik.setFieldValue(`documents[${index}].documentDescription`, e.target.value)}
                                                                                placeholder="Enter description"
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    {/* File Upload */}
                                                                    <div className="col-12 col-md-3 mb-2" style={{ fontSize: "14px" }}>
                                                                        <label className="d-block d-md-none fw-bold">File Name</label>

                                                                        {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                            formik.values.documents[index]?.fileName ? (
                                                                                <a
                                                                                    href={formik.values.documents[index]?.fileURL}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="gwt-Anchor gf-subSectionFileLink"
                                                                                >
                                                                                    {formik.values.documents[index]?.fileName} ({formik.values.documents[index]?.fileSize} kB, {formik.values.documents[index]?.pageCount} pg.)
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-danger">No file uploaded</span>
                                                                            )
                                                                        ) : (
                                                                            <>
                                                                                {/* Hidden file input */}
                                                                                <input
                                                                                    id={`file-upload-${index}`}
                                                                                    type="file"
                                                                                    accept=".pdf"
                                                                                    onChange={(event) => handleFileChange(event, index)}
                                                                                    className="d-none"
                                                                                />

                                                                                {/* Link-style label trigger */}
                                                                                <label
                                                                                    htmlFor={`file-upload-${index}`}
                                                                                    style={{
                                                                                        cursor: "pointer",
                                                                                        color: "#007bff",
                                                                                        textDecoration: "none",
                                                                                        fontWeight: "normal", // <- ensures it's not bold
                                                                                    }}
                                                                                >
                                                                                    <i className="fa fa-paperclip fa-fw me-1" aria-hidden="true"></i>
                                                                                    Click to Upload
                                                                                </label>


                                                                                {/* Validation error */}
                                                                                {formik.touched.documents?.[index]?.fileName && formik.errors.documents?.[index]?.fileName && (
                                                                                    <div className="text-danger small mt-1">{formik.errors.documents[index].fileName}</div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    {/* Actions */}
                                                                    <div className="col-12 col-md-3 mb-2 text-md-start" style={{ fontSize: "14px" }}>
                                                                        {editIndex === index ? (
                                                                            <>
                                                                                <button className="btn btn-success btn-sm me-2" onClick={() => handleSave(index)}>Save</button>
                                                                                <button className="btn btn-secondary btn-sm" onClick={() => handleCancel(index)}>Cancel</button>
                                                                            </>
                                                                        ) : deleteIndex === index ? (
                                                                            <>
                                                                                <button className="btn btn-danger btn-sm me-2" onClick={handleConfirmDelete}>Confirm</button>
                                                                                <button className="btn btn-secondary btn-sm" onClick={handleCancelDelete}>Cancel</button>
                                                                            </>
                                                                        ) : (
                                                                            formik.values.documents[index]?.fileName && (
                                                                                <>
                                                                                    <button type="button" className="btn btn-dark btn-sm me-2" onClick={(e) => { e.preventDefault(); handleEdit(index); }}>
                                                                                        Edit
                                                                                    </button>
                                                                                    <button type="button" className="btn btn-dark btn-sm" onClick={(e) => { e.preventDefault(); handleDelete(index); }}>
                                                                                        Delete
                                                                                    </button>
                                                                                </>
                                                                            )
                                                                        )}
                                                                    </div>
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
                                                        <p className="text-muted small">Select case type / case to load available document types.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* <!-- section 3 --> */}
                                            <div className="col-12 mb-3">
                                                {/* Header */}
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}>
                                                        3. Security & Optional Services -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            &nbsp; Choose a security level, and any needed optional services, for each document.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Body */}
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedDocumentType ? (
                                                        <div className="row mb-3">
                                                            <div className="responsive-table-wrapper">
                                                                <table className="table table-borderless w-100">
                                                                    <thead className="border-bottom">
                                                                        <tr>
                                                                            <th className="w-25">Document</th>
                                                                            <th className="w-25">Security</th>
                                                                            <th className="w-25">Optional Services</th>
                                                                            <th style={{ width: "5%" }}></th>
                                                                            <th className="w-25">Qty</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {formik.values.documents?.map((document, index) => (
                                                                            <React.Fragment key={index}>
                                                                                <tr>
                                                                                    {/* Document Name */}
                                                                                    <td style={{ verticalAlign: "top" }}>
                                                                                        <p className="mb-0" style={{ fontSize: "14px" }}>
                                                                                            {documentType.find((option) => option.value === document.documentType)?.label || "No Document Type"}
                                                                                        </p>
                                                                                    </td>

                                                                                    {/* Security */}
                                                                                    <td style={{ verticalAlign: "top" }}>
                                                                                        <Select
                                                                                            id={`securitySelect-${index}`}
                                                                                            options={securityOptions[index] || []}
                                                                                            value={securityOptions[index]?.find((option) => option.value === document.securityTypes)}
                                                                                            onChange={(selectedSecurity) =>
                                                                                                formik.setFieldValue(`documents[${index}].securityTypes`, selectedSecurity.value)
                                                                                            }
                                                                                            placeholder="Select Security Type"
                                                                                            menuPortalTarget={document.body}
                                                                                            styles={{
                                                                                                fontSize: "14px",
                                                                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                                                menu: base => ({ ...base, zIndex: 9999 }),
                                                                                            }}
                                                                                        />
                                                                                    </td>

                                                                                    {/* Optional Services */}
                                                                                    <td style={{ verticalAlign: "top" }}>
                                                                                        {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                            <div key={serviceIndex} className="mb-2">
                                                                                                <Select
                                                                                                    id={`optionalServices-${index}-${serviceIndex}`}
                                                                                                    options={optionalServicesOptions || []}
                                                                                                    value={optionalServicesOptions.find((option) => option.value === service.value)}
                                                                                                    onChange={(selectedOption) =>
                                                                                                        handleOptionalServiceChange(selectedOption, index, serviceIndex)
                                                                                                    }
                                                                                                    placeholder={loadingOptionalServices ? "Loading..." : "Select Optional Service"}
                                                                                                    isDisabled={loadingOptionalServices}
                                                                                                    menuPortalTarget={document.body}
                                                                                                    styles={{
                                                                                                        fontSize: "14px",
                                                                                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                                                        menu: base => ({ ...base, zIndex: 9999 }),
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        ))}
                                                                                    </td>

                                                                                    {/* Add / Remove Buttons */}
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
                                                                                                serviceIndex > 0 && (
                                                                                                    <Link
                                                                                                        key={serviceIndex}
                                                                                                        onClick={() => handleRemoveOptionalService(index, serviceIndex)}
                                                                                                        style={{
                                                                                                            textDecoration: "none",
                                                                                                            color: "red",
                                                                                                            marginLeft: "10px",
                                                                                                            cursor: "pointer",
                                                                                                        }}
                                                                                                    >
                                                                                                        <i className="fa fa-times-circle fa-fw" style={{ marginRight: "5px", height: "48px" }}></i>
                                                                                                    </Link>
                                                                                                )
                                                                                            )}
                                                                                        </div>
                                                                                    </td>

                                                                                    {/* Quantity */}
                                                                                    <td style={{ verticalAlign: "top" }}>
                                                                                        {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                            <div key={serviceIndex} className="mb-2" style={{ height: "38px" }}>
                                                                                                {service.multiplier ? (
                                                                                                    <input
                                                                                                        name="quantity-multiplier"
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
                                                                                                        className="form-control"
                                                                                                        placeholder="Enter Quantity"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <span>{service.Quantity ?? null}</span>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </td>
                                                                                </tr>

                                                                                {/* Divider between rows */}
                                                                                {index < formik.values.documents.length - 1 && (
                                                                                    <tr>
                                                                                        <td colSpan="5">
                                                                                            <hr className="my-2" />
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
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
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}>
                                                        4. New Case Parties -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            &nbsp; Enter the required parties.
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedCaseType && (
                                                        <>
                                                            {formik.values.parties.map((party, index) => (
                                                                <div key={party.id} className="mb-4 p-3 border rounded shadow-sm bg-white">
                                                                    <div className="d-flex justify-content-end mb-2">
                                                                        <Link
                                                                            onClick={(e) => { e.preventDefault(); handleRemoveClick(party.id); }}
                                                                            className="text-decoration-none"
                                                                            style={{
                                                                                color: "#336C9D",
                                                                                fontWeight: "500",
                                                                            }}
                                                                        >
                                                                            <i className="fa fa-times-circle me-1 text-danger" />
                                                                            Remove Party
                                                                        </Link>
                                                                    </div>

                                                                    {/* Form Fields Row */}
                                                                    <div className="row g-3">
                                                                        {/* Role Type */}
                                                                        <div className="col-12 col-md-3">
                                                                            <label className="form-label fw-bold">
                                                                                Role <i className="fa fa-asterisk text-danger small" />
                                                                            </label>
                                                                            <select
                                                                                className={`form-select ${formik.errors.parties?.[index]?.selectedPartyType &&
                                                                                    formik.touched.parties?.[index]?.selectedPartyType ? 'is-invalid' : ''}`}
                                                                                value={party.selectedPartyType}
                                                                                onChange={(e) => handlePartyTypeChange(party.id, e)}
                                                                                onBlur={() => formik.setFieldTouched(`parties[${index}].selectedPartyType`, true)}
                                                                            >
                                                                                <option value="">Select Party Type</option>
                                                                                {partyTypes.map((type) => (
                                                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                                                ))}
                                                                            </select>
                                                                            {formik.touched.parties?.[index]?.selectedPartyType && formik.errors.parties?.[index]?.selectedPartyType && (
                                                                                <div className="invalid-feedback">{formik.errors.parties[index].selectedPartyType}</div>
                                                                            )}
                                                                        </div>

                                                                        {/* Type */}
                                                                        <div className="col-12 col-md-3">
                                                                            <label className="form-label fw-bold">Type</label>
                                                                            <select
                                                                                className="form-select"
                                                                                value={party.roleType}
                                                                                onChange={(e) => handleRoleTypeChange(party.id, e)}
                                                                            >
                                                                                <option value="1">Individual</option>
                                                                                <option value="2">Business</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>

                                                                    {/* Individual Fields */}
                                                                    {party.roleType === "1" && (
                                                                        <>
                                                                            <div className="row g-3 mt-2">
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">Last Name <i className="fa fa-asterisk text-danger small" /></label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className={`form-control ${formik.touched.parties?.[index]?.lastName && formik.errors.parties?.[index]?.lastName ? 'is-invalid' : ''}`}
                                                                                        value={party.lastName || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "lastName", e.target.value)}
                                                                                    />
                                                                                    {formik.touched.parties?.[index]?.lastName && formik.errors.parties?.[index]?.lastName && (
                                                                                        <div className="invalid-feedback">{formik.errors.parties[index].lastName}</div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">First Name <i className="fa fa-asterisk text-danger small" /></label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className={`form-control ${formik.touched.parties?.[index]?.firstName && formik.errors.parties?.[index]?.firstName ? 'is-invalid' : ''}`}
                                                                                        value={party.firstName || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleInputChange(party.id, "firstName", e.target.value)}
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
                                                                        </>
                                                                    )}

                                                                    {/* Business Fields */}
                                                                    {party.roleType === "2" && (
                                                                        <>
                                                                            <div className="row g-3 mt-2">
                                                                                <div className="col-12 col-md-3">
                                                                                    <label className="form-label fw-bold">Company Name <i className="fa fa-asterisk text-danger small" /></label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className={`form-control ${formik.touched.parties?.[index]?.companyName && formik.errors.parties?.[index]?.companyName ? 'is-invalid' : ''}`}
                                                                                        value={party.companyName || ""}
                                                                                        placeholder=""
                                                                                        onChange={(e) => handleCompanyNameChange(party.id, e.target.value)}
                                                                                    />
                                                                                    {formik.touched.parties?.[index]?.companyName && formik.errors.parties?.[index]?.companyName && (
                                                                                        <div className="invalid-feedback">{formik.errors.parties[index].companyName}</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    {/* Shared Address Fields */}
                                                                    {/* Address Fields */}
                                                                    <div className="row g-3 mt-2" style={{ fontSize: "14px" }}>
                                                                        <div className="col-12 col-md-3" style={{ fontSize: "14px" }}>
                                                                            <label className="form-label fw-bold">Address</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={party.address || ""}
                                                                                placeholder=""
                                                                                onChange={(e) => handleInputChange(party.id, "address", e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="col-12 col-md-3" style={{ fontSize: "14px" }}>
                                                                            <label className="form-label fw-bold">Address 2</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={party.address2 || ""}
                                                                                placeholder=""
                                                                                onChange={(e) => handleInputChange(party.id, "address2", e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* City / State / Zip */}
                                                                    <div className="row g-3 mt-2">
                                                                        <div className="col-12 col-md-3">
                                                                            <label className="form-label fw-bold">City</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
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
                                                                                value={party.Zip || ""}
                                                                                placeholder=""
                                                                                onChange={(e) => handleInputChange(party.id, "Zip", e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Address Options Checkboxes */}
                                                                    <div className="row g-3 mt-2">
                                                                        <div className="col-12 col-md-4">
                                                                            <div className="form-check">
                                                                                <input className="form-check-input" type="checkbox" id={`unknown_${party.id}`} />
                                                                                <label className="form-check-label" htmlFor={`unknown_${party.id}`}>
                                                                                    Address Unknown
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        {/* <div className="col-12 col-md-4">
                                                                        <div className="form-check">
                                                                            <input className="form-check-input" type="checkbox" id={`international_${party.id}`} />
                                                                            <label className="form-check-label" htmlFor={`international_${party.id}`}>
                                                                                International Address
                                                                            </label>
                                                                        </div>
                                                                    </div> */}
                                                                        <div className="col-12 col-md-3">
                                                                            <div className="form-check">
                                                                                <input className="form-check-input" type="checkbox" id={`savebook_${party.id}`} />
                                                                                <label className="form-check-label" htmlFor={`savebook_${party.id}`}>
                                                                                    Save to Address Book
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Representing Attorney */}
                                                                    <div className="row g-3 mt-4">
                                                                        <div className="col-12 col-md-3">
                                                                            <label className="form-label fw-bold">
                                                                                Representing Attorney <i className="fa fa-asterisk text-danger small" />
                                                                            </label>
                                                                            <Select
                                                                                value={party.selectedAttorney ? attorneys.find((attorney) => attorney.value === party.selectedAttorney) || null : null}
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

                                                                        {Array.isArray(party.selectedBarNumbers) && party.selectedBarNumbers.length > 0 && (
                                                                            <div className="col-12 col-md-3">
                                                                                <label className="form-label fw-bold">Added Attorneys</label>
                                                                                <p>{party.selectedBarNumbers.join(", ")}</p>
                                                                            </div>
                                                                        )}

                                                                        <div className="col-12 col-md-3">
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
                                                                </div>
                                                            ))}

                                                            {/* Add Party Button */}
                                                            <div className="mt-3">
                                                                <Link
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAddParty();
                                                                    }}
                                                                    className="text-decoration-none fw-bold"
                                                                    style={{ color: "#9092f7" }}
                                                                >
                                                                    <i className="fa fa-plus-circle fa-fw me-1" />
                                                                    Add Party
                                                                </Link>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* <!-- section 5 --> */}
                                            <div className="col-12 mb-3">
                                                {/* Section Header */}
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}>
                                                        5. Filing Party -
                                                        <span className="fw-normal" style={{ fontSize: "14px" }}>
                                                            &nbsp;Choose the parties you are filing on behalf of.If using a keyboard,select parties with the Enter key instead of the spacebar.
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Conditional Table */}
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedCaseType ? (
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
                                                                        {formik.values.selectedParties.map((party) => (
                                                                            <tr key={party.id}>
                                                                                <td className="text-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={party.isChecked}
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
                                                                                            : "N/A"}
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
                                                        <p style={{ margin: 0, fontSize: "15px" }}>Add parties above to load available parties to select.</p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* <!-- section 6 --> */}
                                            <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}> 6 . Service Contacts -
                                                        <span className='fw-normal' style={{ fontSize: "14px" }}> &nbsp; Add service contacts to your filing to perform electronic service.</span>
                                                    </p>
                                                </div>
                                                <div className="border border-top-0 shadow rounded-bottom p-3">
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
                                                    <Link className='fw-bold' onClick={handleShow} style={{
                                                        textDecoration: "none",
                                                        textDecorationLine: "none", cursor: "pointer", color: "#9092f7"
                                                    }} >
                                                        <i className="fa fa-plus-circle fa-fw"></i>
                                                        Add Service Contact</Link>
                                                </div>
                                            </div>
                                            {/* <!-- section 7 --> */}
                                            <div className="col-12 mb-3" style={{ fontSize: "14px" }}>
                                                <div className="section-case-bg border p-2 mb-0">
                                                    <p className="fw-bold mb-0" style={{ fontSize: "14px" }}>
                                                        7. Filing Fee - <span className="fw-normal" style={{ fontSize: "14px" }}>&nbsp;Select a payment method to pay estimated fees.</span>
                                                    </p>
                                                </div>

                                                <div className="border border-top-0 shadow rounded-bottom p-3">
                                                    {selectedCaseType && (
                                                        <div className="container-fluid px-3">
                                                            {/* Fee Item - Case Type */}
                                                            <div className="border rounded shadow-sm mb-4">
                                                                {/* Header Row */}
                                                                <div className="row border-bottom mb-3 p-2">
                                                                    <div className="col-6 text-start fw-bold">
                                                                        {selectedCaseType.label}
                                                                    </div>
                                                                    <div className="col-6 text-end fw-bold">
                                                                        Estimated Fees
                                                                    </div>
                                                                </div>

                                                                {/* Case Initiation Fee */}
                                                                {caseInitiationFee && (
                                                                    <div className="row px-2 pb-2 border-bottom">
                                                                        <div className="col-6 text-start text-secondary">{caseInitiationFee.reason}</div>
                                                                        <div className="col-6 text-end text-secondary">{caseInitiationFee.amount} USD</div>
                                                                    </div>
                                                                )}

                                                                {/* Sub-Total */}
                                                                {caseInitiationFee && (
                                                                    <div className="row px-2 py-2">
                                                                        <div className="col-12 d-flex justify-content-between">
                                                                            <span className="fw-normal">Sub-Total</span>
                                                                            <span className="fw-bold">{caseInitiationFee.amount} USD</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="border rounded shadow-sm mb-4">
                                                                {/* Fee Item - Other Fees */}
                                                                <div className="row border-bottom mt-0 p-2">
                                                                    <div className="col-6 text-start fw-bold">Service Fees</div>
                                                                    <div className="col-6 text-end fw-bold">Estimated Fees</div>
                                                                </div>

                                                                {otherFees?.length > 0 ? (
                                                                    otherFees.map((fee, index) => (
                                                                        <div className="row px-2 py-2 border-bottom" key={index}>
                                                                            <div className="col-6 text-start text-secondary">{fee.reason}</div>
                                                                            <div className="col-6 text-end text-secondary">{fee.amount} USD</div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="row px-2 py-2">
                                                                        <div className="col-12 text-center text-muted">No other fees available</div>
                                                                    </div>
                                                                )}

                                                                {/* Grand Total */}
                                                                <div className="row px-2 py-2 mt-2">
                                                                    <div className="col-12 d-flex justify-content-between">
                                                                        <span className="fw-bold">Grand Total</span>
                                                                        <span className="fw-bold">{feesCalculationAmount} USD</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    )}

                                                    {/* Payment Section */}
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
            </div>
        </WrapperTag>
    )
}

export default InitiateCase;