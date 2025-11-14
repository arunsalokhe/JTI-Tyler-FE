import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useFormik } from 'formik';
import Trash from '../assets/trash.png';
import Save from "../assets/Save.png";

const EditCasePage = () => {
    // State hooks for data
    const [courts, setCourts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCases, setLoadingCases] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null); // To store selected category
    const [selectedCaseType, setSelectedCaseType] = useState(null); // To store selected case type
    const [selectedDocumentType, setSelectedDocumentType] = useState(null);
    const [optionalServicesOptions, setOptionalServicesOptions] = useState([]);
    const [showDiv, setShowDiv] = useState(false); // For showing/hiding party types div

    const formik = useFormik({
        initialValues: {
            selectedCourt: '',
            selectedCategory: '',
            selectedCaseType: '',
            documents: []  // Add documents array to formik
        },
        onSubmit: (values) => {
            console.log(values);
        }
    });

    // Fetch court locations (on component mount)
    useEffect(() => {
        setLoading(true);
        const baseURL = process.env.REACT_APP_BASE_URL;
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

    // Fetch categories (on component mount)
    useEffect(() => {
        const baseURL = process.env.REACT_APP_BASE_URL;
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

    // Fetch case types based on selected category
    useEffect(() => {
        if (selectedCategory) {
            setLoadingCases(true);
            const baseURL = process.env.REACT_APP_BASE_URL;
            fetch(`${baseURL}/GetCaseType?categoryId=${selectedCategory}`)
                .then((response) => response.json())
                .then((data) => {
                    const formattedCases = data.map((c) => ({
                        value: c.code,
                        label: c.name,
                    }));
                    setCases(formattedCases);
                    setLoadingCases(false);
                })
                .catch((error) => {
                    console.error('Error fetching cases:', error);
                    setLoadingCases(false);
                });
        }
    }, [selectedCategory]);

    
    // Fetch data from API and set form values
    useEffect(() => {
        const fetchedData = {
            "id": 65,
            "selectedCourt": "fresno:cv",
            "selectedCategory": "17098",
            "selectedCaseType": "30395",
        };

        // Set the formik values using fetched data
        formik.setValues({
            selectedCourt: fetchedData.selectedCourt,
            selectedCategory: fetchedData.selectedCategory,
            selectedCaseType: fetchedData.selectedCaseType,
        });

        // Set the selected category to fetch case types
        setSelectedCategory(fetchedData.selectedCategory);
        setSelectedCaseType(fetchedData.selectedCaseType); // Set the selected case type
    }, []); // Only run on mount

    // Handle Court Change
    const handleCourtChange = (selectedOption) => {
        formik.setFieldValue('selectedCourt', selectedOption.value);
    };

    // Handle Category Change
    const handleCategoryChange = (selectedOption) => {
        formik.setFieldValue('selectedCategory', selectedOption.value);
        setSelectedCategory(selectedOption.value); // Update local state for category
    };

    // Handle Case Type Change
    const handleCaseTypeChange = (selectedOption) => {
        formik.setFieldValue('selectedCaseType', selectedOption.value);
        setSelectedCaseType(selectedOption); // Update local state for case type
    };

    return (
        <div>
            <section className="section-page col-9 col-md-9 col-xl-10 px-lg-10 mt-10">
                <div className="row container ps-lg-4 ps-md-4 ps-sm-4 pe-0">
                    {/* <!-- start title --> */}
                    <div className="d-flex mt-3 ">
                        <div className="me-auto">
                            <h1 className="fw-bold">Filing Draft</h1>
                        </div>
                        <div className="d-flex initiate_case_sec_btn">
                            <button type="button" className="btn btn-secondary text-dark btn-md mx-2 mb-2 fw-bold" onClick>
                                <img className="img-responsive mx-0" width="20" height="20" src={Trash} alt='trash' />
                                Discard
                            </button>
                            <button type="button" className="btn btn-secondary text-dark btn-md  mx-2 mb-2 fw-bold" onClick>
                                <img className="img-responsive mx-0" width="20" height="20" src={Save} alt='save' />
                                Save Draft
                            </button>
                        </div>
                    </div>
                    {/* <!-- end title --> */}
                </div>
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
                                                    <span className="fw-normal" style={{ fontSize: "14px" }}> Choose the court location and case type to file your new case.</span>
                                                </p>
                                            </div>

                                            {/* Court Dropdown */}
                                            <div className="row mb-3">
                                                <label htmlFor="court-dropdown" className="col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                    Court
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
                                                    {formik.touched.selectedCourt && formik.errors.selectedCourt && (
                                                        <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.selectedCourt}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Category Dropdown */}
                                            <div className="row mb-3">
                                                <label htmlFor="category-select" className="col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                    Category
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
                                                        isSearchable
                                                    />
                                                    {formik.touched.selectedCategory && formik.errors.selectedCategory && (
                                                        <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.selectedCategory}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Case Type Dropdown */}
                                            <div className="row mb-3">
                                                <label htmlFor="case-type-dropdown" className="col-sm-2 col-form-label fw-bold col-form-label-sm">
                                                    Case Type
                                                    <i className="fa fa-asterisk" aria-hidden="true" style={{ color: 'red', fontSize: '8px', verticalAlign: 'top' }}></i>
                                                </label>
                                                <div className="col-sm-5">
                                                    <Select
                                                        id="case-type-dropdown"
                                                        options={cases}
                                                        value={cases.find((caseType) => caseType.value === formik.values.selectedCaseType) || null}
                                                        onChange={handleCaseTypeChange}
                                                        onBlur={() => formik.setFieldTouched('selectedCaseType', true)}
                                                        placeholder={loadingCases ? 'Loading case types...' : 'Search or select a case type'}
                                                        isLoading={loadingCases}
                                                        isSearchable
                                                        noOptionsMessage={() => 'No case types found'}
                                                    />
                                                    {formik.touched.selectedCaseType && formik.errors.selectedCaseType && (
                                                        <div className="text-danger mt-1" style={{ fontWeight: "bold" }}>{formik.errors.selectedCaseType}</div>
                                                    )}
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
            </section>
        </div>
    );
};

export default EditCasePage;
