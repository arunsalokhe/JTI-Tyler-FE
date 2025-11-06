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
import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Correct way to set the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
).toString();


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
            optionalServicesSelections: [{ Quantity: null, }],

        };
        formik.setFieldValue("documents", [...formik.values.documents, newDocument]);
        setIsSaved([...isSaved, false]);

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
                    // const response = await fetch('https://localhost:7207/api/Tyler/CoreFilingNewCivil', {
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
        <div>
            <section className="section-page col-9 col-md-9 col-xl-10 px-lg-10 mt-10">
                <div
                    className="container-fluid"
                    style={{ paddingRight: "40px", paddingLeft: "40px", marginRight: "auto", marginLeft: "auto", paddingTop: "10px" }}
                >
                    <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                        {/* <!-- start title --> */}
                        <div className="d-flex mt-3 ">
                            <div className="me-auto" style={{ fontFamily: "Arial, sans-serif" }}>
                                <h1 className="fw-normal">
                                    Filing {filingID} - RESERVED{""}
                                    <i className="fa fa-clock-o fa-fw" aria-hidden="true"></i>
                                </h1>
                            </div>
                            <div className="d-flex initiate_case_sec_btn">
                                <a href="#" className="custom-link mx-2 mb-2" onClick={(e) => { e.preventDefault(); handleShowDiscardButton(); }}>
                                    <i className="fa fa-trash fa-fw"></i> Discard
                                </a>

                                <a href="#" className="custom-link mx-2 mb-2" onClick={(e) => { e.preventDefault(); handleSaveDraft(); }}>
                                    <i className="fa fa-floppy-o fa-fw"></i> Save Draft
                                </a>
                            </div>
                        </div>
                        {/* <!-- end title --> */}
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
                                                            onChange={handleCourtChange}
                                                            onBlur={() => formik.setFieldTouched('selectedCourt', true)}
                                                            placeholder={loading ? 'Loading courts...' : 'Search or select a court'}
                                                            isLoading={loading}
                                                            isSearchable
                                                            noOptionsMessage={() => 'No courts found'}
                                                        />
                                                        {/* Show error message */}
                                                        {formik.touched.selectedCourt && formik.errors.selectedCourt && (
                                                            <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.selectedCourt}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <label htmlFor="category-select" className="col-sm-2 col-form-label fw-bold col-form-label-sm">Category
                                                        <i className="fa fa-asterisk" aria-hidden="true" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                    </label>
                                                    <div className="col-sm-5">
                                                        <Select
                                                            id="category-select"
                                                            options={categories}
                                                            value={categories.find((category) => category.value === formik.values.selectedCategory) || null}
                                                            onChange={handleCategoryChange}
                                                            onBlur={() => formik.setFieldTouched('selectedCategory', true)}
                                                            placeholder="Search or select a category"
                                                        />
                                                        {/* Show error message */}
                                                        {formik.touched.selectedCategory && formik.errors.selectedCategory && (
                                                            <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.selectedCategory}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <label htmlFor="case-select" className="col-sm-2 col-form-label fw-bold col-form-label-sm">Case Type
                                                        <i className="fa fa-asterisk" aria-hidden="true" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                    </label>
                                                    <div className="col-sm-5">
                                                        <Select
                                                            id="case-select"
                                                            options={cases}
                                                            value={cases.find((caseType) => caseType.value === formik.values.selectedCaseType) || null}
                                                            onChange={handleCaseTypeChange}
                                                            onBlur={() => formik.setFieldTouched('selectedCaseType', true)}
                                                            placeholder="Search or select a case"
                                                            isDisabled={!formik.values.selectedCategory || loadingDocumentTypes}
                                                        />
                                                        {/* Show error message */}
                                                        {formik.touched.selectedCaseType && formik.errors.selectedCaseType && (
                                                            <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.selectedCaseType}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="offset-2 col-sm-5 col-md-6">
                                                        <p className="text-secondary" style={{ fontSize: "14px" }}><i className="fa fa-info-circle" style={{ marginRight: "5px" }} ></i>
                                                            You must first select a court to load available case types.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <!-- section 2 --> */}
                                            <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                <div className="section-case-bg row border mb-3 shadow  p-2">
                                                    <p className="fw-bold mb-0">2 . Add Documents -
                                                        <span className='fw-normal' style={{ fontSize: "14px" }}> Define, select, and upload the documents that make up your filing.</span>
                                                    </p>
                                                </div>
                                                {selectedCategory ? (
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
                                                                    {formik.values.documents.map((document, index) => (
                                                                        <tr key={index}>
                                                                            <td>
                                                                                {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                                    <div>{documentType.find((option) =>
                                                                                        option.value === document.documentType)?.label || "N/A"}
                                                                                    </div>
                                                                                ) : (
                                                                                    <Select
                                                                                        id={`documentTypeSelect-${index}`}
                                                                                        options={documentType}
                                                                                        value={documentType.find((option) => option.value === document.documentType)}
                                                                                        onChange={(selectedOption) => handleDocumentTypeChange(selectedOption, index)}
                                                                                        onBlur={() => formik.setFieldTouched(`documents[${index}].documentType`, true)}
                                                                                        placeholder="Search or select a document type"
                                                                                    />
                                                                                )}
                                                                                {formik.touched.documents?.[index]?.documentType &&
                                                                                    formik.errors.documents?.[index]?.documentType && (
                                                                                        <div className="text-danger mt-1" style={{ fontSize: "15px", marginTop: "5px" }}>
                                                                                            {formik.errors.documents[index].documentType}
                                                                                        </div>
                                                                                    )}
                                                                            </td>
                                                                            <td>
                                                                                {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                                    <div>{document.documentDescription || "N/A"}</div>
                                                                                ) : (
                                                                                    <input
                                                                                        type="text"
                                                                                        id={`documentName-${index}`}
                                                                                        style={{ height: "36px" }}
                                                                                        value={document.documentDescription}
                                                                                        onChange={(e) => formik.setFieldValue(`documents[${index}].documentDescription`,
                                                                                            e.target.value)}
                                                                                        placeholder="Document description here..."
                                                                                        className="form-control"
                                                                                    />
                                                                                )}
                                                                            </td>
                                                                            {/* <td>
                                                                                {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                                    <div>{formik.values.documents[index]?.fileName || "No file uploaded"}</div>
                                                                                ) : (
                                                                                    <input
                                                                                        id={`file-upload-${index}`}
                                                                                        type="file"
                                                                                        accept=".pdf"
                                                                                        onChange={(event) => handleFileChange(event, index)}
                                                                                    />
                                                                                )}
                                                                            </td> */}
                                                                            <td>
                                                                                {isSaved[index] || (editIndex !== null && editIndex !== index) ? (
                                                                                    formik.values.documents[index]?.fileName ? (
                                                                                        <a
                                                                                            href={formik.values.documents[index]?.fileURL}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="gwt-Anchor gf-subSectionFileLink"
                                                                                            title={formik.values.documents[index]?.fileName}
                                                                                        >
                                                                                            {formik.values.documents[index]?.fileName} ({formik.values.documents[index]?.fileSize} kB, {formik.values.documents[index]?.pageCount} pg.)
                                                                                        </a>
                                                                                    ) : (
                                                                                        <span className="text-danger">No file uploaded</span>
                                                                                    )
                                                                                ) : (
                                                                                    <>
                                                                                        <input
                                                                                            id={`file-upload-${index}`}
                                                                                            type="file"
                                                                                            accept=".pdf"
                                                                                            onChange={(event) => handleFileChange(event, index)}
                                                                                            className={formik.errors.documents?.[index]?.fileName ? "input-error" : ""}
                                                                                        />
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
                                                                                            type="button"
                                                                                            className="btn btn-success"
                                                                                            style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                            onClick={() => handleSave(index)}
                                                                                        >
                                                                                            Save
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-dark"
                                                                                            style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                            onClick={() => handleCancel(index)}
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                    </>
                                                                                ) : deleteIndex === index ? (
                                                                                    <>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-danger"
                                                                                            style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                            onClick={handleConfirmDelete}
                                                                                        >
                                                                                            Confirm
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-dark"
                                                                                            style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                            onClick={handleCancelDelete}
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-dark"
                                                                                            style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                            onClick={() => handleEdit(index)}
                                                                                        >
                                                                                            Edit
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-dark"
                                                                                            style={{ fontSize: "14px", padding: "5px 8px", marginRight: "5px" }}
                                                                                            onClick={() => handleDelete(index)}
                                                                                        >
                                                                                            Delete
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <div style={{ marginTop: "10px" }}>
                                                                <button type="button" className="btn btn-dark text-white" onClick={handleAddDocument}>
                                                                    + Add Document
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p style={{ margin: "0", fontSize: "15px" }}>Select case type / case to load available document types.</p>
                                                )}
                                            </div>
                                            {/* <!-- section 3 --> */}
                                            <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                <div className="section-case-bg row border mb-3 shadow p-2">
                                                    <p className="fw-bold mb-0">3 . Security & Optional Services -
                                                        <span className='fw-normal' style={{ fontSize: "14px" }}>
                                                            Choose a security level, and any needed optional services, for each document.</span></p>
                                                </div>
                                                {selectedDocumentType ? (
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
                                                                {formik.values.documents?.map((document, index) => (
                                                                    <tr key={index}>
                                                                        <td style={{ height: "90px", verticalAlign: "top" }}>
                                                                            <div className="document-label" style={{ display: "flex", alignItems: "center", }}>
                                                                                <p>{documentType.find((option) =>
                                                                                    option.value === document.documentType)?.label || "No Document Type"}</p>
                                                                            </div>
                                                                        </td>
                                                                        <td style={{ height: "90px", verticalAlign: "top" }}>
                                                                            <Select
                                                                                id={`securitySelect-${index}`}
                                                                                options={securityOptions[index] || []}
                                                                                value={securityOptions[index]?.find((option) => option.value === document.securityTypes)}
                                                                                onChange={(selectedSecurity) =>
                                                                                    formik.setFieldValue(`documents[${index}].securityTypes`, selectedSecurity.value)
                                                                                }
                                                                                placeholder="Select Security Type"
                                                                            />
                                                                        </td>
                                                                        <td style={{ verticalAlign: "top" }}>
                                                                            {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                <div key={serviceIndex} style={{ marginBottom: "10px" }}>
                                                                                    <Select
                                                                                        id={`optionalServices-${index}-${serviceIndex}`}
                                                                                        options={optionalServicesOptions || []} // Dynamically fetched options
                                                                                        value={optionalServicesOptions.find((option) => option.value === service.value)}
                                                                                        onChange={(selectedOption) =>
                                                                                            handleOptionalServiceChange(selectedOption, index, serviceIndex)
                                                                                        }
                                                                                        placeholder={loadingOptionalServices ? "Loading..." : "Select Optional Service"}
                                                                                        isDisabled={loadingOptionalServices} // Disable if loading
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </td>
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
                                                                                            style={{ textDecoration: "none", color: "red", marginLeft: "10px", cursor: "pointer", }}
                                                                                        >
                                                                                            <i className="fa fa-times-circle fa-fw" style={{ marginRight: "5px", height: "48px" }}></i>
                                                                                            {/* Remove button */}

                                                                                        </Link>
                                                                                    ) : null
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td style={{ verticalAlign: "top" }}>
                                                                            {document.optionalServicesSelections?.map((service, serviceIndex) => (
                                                                                <div key={serviceIndex} style={{ marginBottom: "10px", height: "38px" }}>
                                                                                    {service.multiplier ? (
                                                                                        <input
                                                                                            name='quantity-multiplier'
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
                                                                                        // For services without a multiplier, display the default or pre-set value
                                                                                        <span>{service.Quantity ?? null}</span>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p style={{ margin: "0", fontSize: "15px" }}> Complete document upload to load security and available optional services.</p>
                                                )}
                                            </div>
                                            {/* <!-- section 4 --> */}
                                            <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                <div className="section-case-bg row border mb-3 shadow p-2">
                                                    <p className="fw-bold mb-0">4 . New Case Parties - <span className='fw-normal' style={{ fontSize: "14px" }}>
                                                        Enter the required parties. </span></p>
                                                </div>
                                                {selectedCaseType && (
                                                    <>
                                                        {formik.values.parties && formik.values.parties.map((party, index) => (
                                                            <div key={party.id} className="party-row">
                                                                <table className="table table-borderless table-responsive">
                                                                    <thead>
                                                                        <tr className="align-bottom fw-bold">
                                                                            <th>Role<i className="fa fa-asterisk" aria-hidden="true"
                                                                                style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i></th>
                                                                            <th>Type</th>
                                                                            <th></th>
                                                                            <th>
                                                                                {/* Remove Party */}
                                                                                <Link
                                                                                    onClick={(e) => { e.preventDefault(); handleRemoveClick(party.id) }}
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
                                                                                {/* Non-Searchable Party Type Dropdown */}
                                                                                <div>
                                                                                    <select
                                                                                        className={`form-select ${formik.errors.parties?.[index]?.selectedPartyType &&
                                                                                            formik.touched.parties?.[index]?.selectedPartyType ? 'is-invalid' : ''}`}
                                                                                        value={party.selectedPartyType}
                                                                                        onChange={(e) => { handlePartyTypeChange(party.id, e) }}
                                                                                        onBlur={() => formik.setFieldTouched(`parties[${index}].selectedPartyType`, true)}
                                                                                        style={{ width: '250px', padding: '5px' }}
                                                                                    >
                                                                                        <option value="">Select Party Type</option>
                                                                                        {partyTypes.map((partyType) => (
                                                                                            <option key={partyType.value} value={partyType.value}>
                                                                                                {partyType.label}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                    {formik.errors.parties?.[index]?.selectedPartyType &&
                                                                                        formik.touched.parties?.[index]?.selectedPartyType && (
                                                                                            <div className="invalid-feedback">
                                                                                                {formik.errors.parties[index].selectedPartyType}
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                <select
                                                                                    className="form-select text-black-50"
                                                                                    style={{ width: "250px", padding: "5px" }}
                                                                                    value={party.roleType}
                                                                                    onChange={(e) => handleRoleTypeChange(party.id, e)}
                                                                                >
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
                                                                                            className={`form-control ${formik.touched.parties?.[index]?.lastName &&
                                                                                                formik.errors.parties?.[index]?.lastName ? 'is-invalid' : ''}`}
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            name='lastName'
                                                                                            value={party.lastName || ""}
                                                                                            placeholder="Enter Last Name"
                                                                                            onChange={(e) => handleInputChange(party.id, "lastName", e.target.value)}
                                                                                        />
                                                                                        {/* Error Message */}
                                                                                        {formik.touched.parties?.[index]?.lastName && formik.errors.parties?.[index]?.lastName && (
                                                                                            <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.parties[index].lastName}</div>
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        <input
                                                                                            className={`form-control ${formik.touched.parties?.[index]?.firstName && formik.errors.parties?.[index]?.firstName ? 'is-invalid' : ''}`}
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            name='firstName'
                                                                                            value={party.firstName || ""}  // The input value is bound to the party's lastName
                                                                                            placeholder="Enter first Name"
                                                                                            onChange={(e) => handleInputChange(party.id, "firstName", e.target.value)} // Calls the handler when value changes
                                                                                        />
                                                                                        {/* Error Message */}
                                                                                        {formik.touched.parties?.[index]?.firstName && formik.errors.parties?.[index]?.firstName && (
                                                                                            <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.parties[index].firstName}</div>
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        <input
                                                                                            className="form-control"
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            name='middleName'
                                                                                            value={party.middleName || ""}
                                                                                            placeholder="Enter Middle Name"
                                                                                            onChange={(e) => handleInputChange(party.id, "middleName", e.target.value)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <select
                                                                                            className="form-select text-black-50"
                                                                                            style={{ width: '150px', padding: '5px' }}
                                                                                            value={party.suffix || ''}
                                                                                            onChange={(e) => handleSuffixChange(party.id, e)}
                                                                                        >
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
                                                                                            value={party.Address || ""}
                                                                                            placeholder="Enter Address"
                                                                                            onChange={(e) => handleInputChange(party.id, "Address", e.target.value)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <input
                                                                                            className="form-control"
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            name='Address2'
                                                                                            value={party.Address2 || ""}
                                                                                            placeholder="Enter Address 2"
                                                                                            onChange={(e) => handleInputChange(party.id, "Address2", e.target.value)}
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
                                                                                            value={party.City || ""}
                                                                                            placeholder="Enter City"
                                                                                            onChange={(e) => handleInputChange(party.id, "City", e.target.value)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <input
                                                                                            className="form-control"
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            name='state'
                                                                                            value={party.State || ""}
                                                                                            placeholder="Enter State"
                                                                                            onChange={(e) => handleInputChange(party.id, "State", e.target.value)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <input
                                                                                            className="form-control"
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            name='zip'
                                                                                            value={party.Zip || ""}
                                                                                            placeholder="Enter Zip"
                                                                                            onChange={(e) => handleInputChange(party.id, "Zip", e.target.value)}
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
                                                                                        {formik.touched.parties?.[index]?.attorneys && formik.errors.parties?.[index]?.attorneys && (
                                                                                            <div className="text-danger mt-1" style={{ fontSize: "15px", marginTop: "5px" }}>{formik.errors.parties[index].attorneys}</div>
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
                                                                                            isMulti
                                                                                            value={party.selectedBarNumbers.map(barNumber => ({ value: barNumber, label: barNumber }))}
                                                                                            onChange={(selectedOptions) => handleBarNumberChange(party.id, selectedOptions)}
                                                                                            options={attorneys.map((attorney) => ({
                                                                                                value: attorney.barNumber,
                                                                                                label: attorney.barNumber,
                                                                                            }))}
                                                                                            placeholder="Select Bar Numbers"
                                                                                            isSearchable={true}
                                                                                            isClearable={true}
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
                                                                                            className={`form-control ${formik.touched.parties?.[index]?.companyName &&
                                                                                                formik.errors.parties?.[index]?.companyName ? 'is-invalid' : ''}`}
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            value={party.companyName || ""}
                                                                                            placeholder="Enter company Name"
                                                                                            onChange={(e) => handleCompanyNameChange(party.id, e.target.value)}
                                                                                        />
                                                                                        {/* Error Message */}
                                                                                        {formik.touched.parties?.[index]?.companyName && formik.errors.parties?.[index]?.companyName && (
                                                                                            <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.parties[index].companyName}</div>
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
                                                                                            value={party.Address || ""}
                                                                                            placeholder="Enter Address"
                                                                                            onChange={(e) => handleInputChange(party.id, "Address", e.target.value)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <input
                                                                                            className="form-control"
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            value={party.Address2 || ""}
                                                                                            placeholder="Enter Address 2"
                                                                                            onChange={(e) => handleInputChange(party.id, "Address2", e.target.value)}
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
                                                                                            value={party.City || ""}
                                                                                            placeholder="Enter City"
                                                                                            onChange={(e) => handleInputChange(party.id, "City", e.target.value)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <input
                                                                                            className="form-control"
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            value={party.State || ""}
                                                                                            placeholder="Enter State"
                                                                                            onChange={(e) => handleInputChange(party.id, "State", e.target.value)}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <input
                                                                                            className="form-control"
                                                                                            style={{ width: "250px", padding: "5px" }}
                                                                                            type="text"
                                                                                            value={party.Zip || ""}
                                                                                            placeholder="Enter Zip"
                                                                                            onChange={(e) => handleInputChange(party.id, "Zip", e.target.value)}
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
                                                                                        {formik.touched.parties?.[index]?.attorneys && formik.errors.parties?.[index]?.attorneys && (
                                                                                            <div className="text-danger mt-1" style={{ fontSize: "15px", marginTop: "5px" }}>{formik.errors.parties[index].attorneys}</div>
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
                                                    </>
                                                )}
                                            </div>
                                            {/* <!-- section 5 --> */}
                                            <div className="col-12 col-md-12 col-lg-12 mb-3">
                                                <div className="section-case-bg row border mb-3 shadow p-2">
                                                    <p className="fw-bold mb-0"> 5 . Filing Party - <span className='fw-normal' style={{ fontSize: "14px" }}>Choose the party or parties you are filing on behalf of.
                                                        if using a keyboard, select parties with the enter key instead of the spacebar. </span></p>
                                                </div>
                                                {selectedCaseType ? (
                                                    <div className="row mb-3" >
                                                        <table className="table table-borderless table-responsive justify-content-center">
                                                            <thead>
                                                                <tr className="fw-bold">
                                                                    <td>
                                                                        <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
                                                                    </td>
                                                                    <td>Party Name</td>
                                                                    <td>Role </td>
                                                                    <td>Party Type</td>
                                                                    <td></td>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {formik.values.selectedParties.map((party) => (
                                                                    <tr key={party.id}>
                                                                        <td>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={party.isChecked}
                                                                                onChange={() => handleRowCheckboxChange(party.id)}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            {party.roleType === "1" ? (
                                                                                // Individual: First Name + Last Name
                                                                                `${party.firstName || "N/A"} ${party.lastName || ""}`
                                                                            ) : party.roleType === "2" ? (
                                                                                // Business: Company Name
                                                                                party.companyName || "N/A"
                                                                            ) : (
                                                                                // Default if neither
                                                                                "N/A"
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {party.selectedPartyType ? (
                                                                                // Display Party Type if selected
                                                                                partyTypes.find((type) => type.value === party.selectedPartyType)?.label || "N/A"
                                                                            ) : (
                                                                                // If Party Type is not selected
                                                                                "N/A"
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {party.roleType === "1" ? (
                                                                                "Individual"
                                                                            ) : party.roleType === "2" ? (
                                                                                "Business"
                                                                            ) : (
                                                                                "N/A"
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        {formik.touched.selectedParties && formik.errors.selectedParties && (
                                                            <div style={{ color: "red" }}>{formik.errors.selectedParties}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p style={{ margin: "0", fontSize: "15px" }}>Add parties above to load available parties to select..</p>
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
                                                        <span className='fw-normal' style={{ fontSize: "14px" }}>Select a payment method to pay estimated fees.</span>  </p>
                                                </div>
                                                {selectedCaseType && (
                                                    <div className="container-fluid px-5" >
                                                        {/* <!-- fee item 4--> */}
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
                                                        {/* <!-- fee item 5--> */}
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
                                                            value={paymentAccountOptions.find((option) => option.value === formik.values.paymentAccount) || null} // Match by value
                                                            onChange={(selectedOption) => formik.setFieldValue("paymentAccount", selectedOption?.value || null)} // Store only value
                                                            isSearchable={true}
                                                            placeholder="Choose payment account"
                                                            onBlur={() => formik.setFieldTouched("paymentAccount", true)} // Mark as touched on blur
                                                        />
                                                        {formik.touched.paymentAccount && formik.errors.paymentAccount && (
                                                            <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.paymentAccount}</div>
                                                        )}
                                                    </div>
                                                    <Link
                                                        className="col-6 col-lg-3 text-end fw-bold ps-0"
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Prevent default link behavior
                                                            feesCalculationApiCall(); // Trigger the first API call separately
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
                                                                        onChange={(selectedOption) => formik.setFieldValue("selectedAttorneySec", selectedOption?.value || "")}
                                                                        placeholder="Search and select an attorney"
                                                                        getOptionLabel={(e) => e.label}
                                                                        getOptionValue={(e) => e.value}
                                                                        isClearable
                                                                        isSearchable
                                                                        value={formik.values.selectedAttorneySec ? attorneys.find((attorney) => attorney.value === formik.values.selectedAttorneySec) : null}
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
                                                                        value={formik.values.createdBy}
                                                                        onChange={formik.handleChange}
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
                                                                        value={formik.values.referNo}
                                                                        onChange={formik.handleChange}
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
                                                                        value={formik.values.courtesyemail}
                                                                        onChange={formik.handleChange}
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
                                                                        name="note"
                                                                        className="form-control"
                                                                        placeholder="Leave a note to clerk here"
                                                                        value={formik.values.note}
                                                                        onChange={formik.handleChange}
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
                                                                            <button type="button" className="col-4 btn btn-dark bg-dark text-white me-2" onClick={handleSaveDraft}> Save Draft </button>
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
            </section>
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
                    <p style={{ textAlign: "center" }}>Are you sure you would like to discard this filing? <br /> If yes, click Confirm.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleCloseDiscard}> Cancel</Button>
                    <Button variant="dark" onClick={handleDiscardAndRefresh} > Confirm</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default InitiateCase;