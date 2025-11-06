import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import Trash from '../assets/trash.png';
import Edit from '../assets/Edit.png';

const PartyAddressBook = () => {

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
                                        Party Address Book
                                    </h1>

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
                                    maxWidth: "100%",
                                }}
                            >
                                <div className="panel-body">
                                    <div className="row">
                                        <div className="col-12 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 lh-base">
                                            <i className="fa fa-info-circle fa-fw text-dark"></i>
                                            <span className="text-dark">
                                                <strong>Tip</strong> – Use the edit or delete actions to manage Saved Parties.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Start Form data */}
                        <form method="post">
                            <div className="row mt-2">
                                <div className="col-12">
                                    {/* Start card */}
                                    <div className="card grey_bg_color border-0">
                                        <div className="card-body">
                                            {/* Responsive table */}
                                            <div className="table-responsive">
                                                <table className="table table-borderless">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" className="w-25">Name</th>
                                                            <th scope="col" className="w-50">Address</th>
                                                            <th scope="col" className="w-25">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Jay</td>
                                                            <td></td>
                                                            <td>
                                                                <div className="d-flex flex-wrap gap-3">
                                                                    {/* Delete */}
                                                                    <div className="d-flex align-items-center">
                                                                        <img className="img-responsive" width={25} height={25} src={Trash} alt="trash" />
                                                                        <Link href="#" className="text-decoration-none text-primary ms-2" data-bs-toggle="modal" data-bs-target="#confirmDel-modal">
                                                                            Delete
                                                                        </Link>
                                                                    </div>
                                                                    {/* Edit */}
                                                                    <div className="d-flex align-items-center">
                                                                        <img className="img-responsive" width={25} height={25} src={Edit} alt="edit" />
                                                                        <Link href="#" className="text-decoration-none text-primary ms-2" data-bs-toggle="modal" data-bs-target="#edit-modal">
                                                                            Edit
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Optional spacer */}
                                        <div className="py-3"></div>

                                        {/* Start pagination */}
                                        <div className="px-3 pb-3">
                                            <nav aria-label="Pagination" className="custom-pagination">
                                                <ul className="pagination justify-content-center justify-content-md-end flex-wrap mb-0 gap-1">
                                                    <li className="page-item disabled">
                                                        <Link className="page-link" href="#" tabIndex={-1} aria-disabled="true">
                                                            Previous
                                                        </Link>
                                                    </li>
                                                    <li className="page-item active" aria-current="page">
                                                        <Link className="page-link" href="#">
                                                            1 <span className="visually-hidden">(current)</span>
                                                        </Link>
                                                    </li>
                                                    <li className="page-item">
                                                        <Link className="page-link" href="#">Next</Link>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                        {/* End pagination */}
                                    </div>
                                    {/* End card */}
                                </div>
                            </div>
                        </form>

                    </div>
                </div>
            </div>


            {/* modal 1 start */}
            <div className="modal fade" id="confirmDel-modal" tabIndex={-1} role="dialog" area-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">
                                Confirm Delete
                            </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"> </button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Start tip data */}
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data" style={{ textIndent: "1rem" }}>
                                            <strong>Attention:</strong> This will delete your Saved Party!{" "}
                                        </p>
                                    </div>
                                </div>
                                {/* End tip data */}
                                <div className="row">
                                    <p className="ps-1" htmlFor="">
                                        Are you sure you would like to remove selected Contact, if yes,
                                        click confirm.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" className="btn btn-dark px-4">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* modal 2 start */}
            <div className="modal fade" id="edit-modal" tabIndex={-1} role="dialog" area-hidden="true" >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document" >
                    <div className="modal-content">
                        <div className="modal-header border-0 mt-2">
                            <h3 className="modal-title fw-bold ms-3" id="exampleModalLongTitle">
                                Edit Party
                            </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">
                                {/* Start tip data */}
                                <div className="row">
                                    <div className="col-12 col-md-12 col-lg-12 col-xl-12 p-0 mx-0">
                                        <p className="text-start mx-0 mt-0 mb-3 px-2 py-3 fs-6 tip_data" style={{ textIndent: "1rem" }} >
                                            <strong>Tip:</strong> First name and Last name or Business Name Required.
                                        </p>
                                    </div>
                                </div>
                                {/* End tip data */}
                                {/* row 1 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="actor">Actor Type</label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <select className=" form-select" name="actor" id="actor">
                                            <option value={1}>Individual</option>
                                        </select>
                                    </div>
                                </div>
                                {/* row 2 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="firstName">
                                            First Name
                                        </label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <input className="form-control" type="text" name="firstName" id="firstName" />
                                    </div>
                                </div>
                                {/* row 3 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="middleName">
                                            Middle Name
                                        </label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <input className="form-control" type="text" name="middleName" id="middleName" />
                                    </div>
                                </div>
                                {/* row 4 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="lastName">
                                            Last Name
                                        </label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <input className="form-control" type="text" name="lastName" id="lastName" />
                                    </div>
                                </div>
                                {/* row 5 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="suffix">
                                            Suffix
                                        </label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <input className="form-control" type="text" name="suffix" id="suffix" />
                                    </div>
                                </div>
                                {/* row 6 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="address">
                                            Address
                                        </label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <input className="form-control" type="text" name="address" id="address" />
                                    </div>
                                </div>
                                {/* row 7 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="address2">
                                            Address 2
                                        </label>
                                    </div>
                                    <div className="col-9 px-1">
                                        <input className=" form-control" type="text" name="address2" id="address2" />
                                    </div>
                                </div>
                                {/* row 8 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="city">
                                            City
                                        </label>
                                    </div>
                                    <div className="col-3 px-1">
                                        <input className=" form-control" type="text" name="city" id="city" />
                                    </div>
                                    <div className="col-2 px-1 align-content-center pt-1 d-flex justify-content-end">
                                        <label className=" form-label fw-bold pe-3" htmlFor="state">
                                            State
                                        </label>
                                    </div>
                                    <div className="col-4 px-1">
                                        <input className=" form-control" type="text" name="state" id="state" />
                                    </div>
                                </div>
                                {/* row 9 */}
                                <div className="row mb-2">
                                    <div className="col-3 ps-3">
                                        <label className=" form-label fw-bold" htmlFor="zip">
                                            Zip
                                        </label>
                                    </div>
                                    <div className="col-3 px-1">
                                        <input className=" form-control" type="text" name="zip" id="zip" />
                                    </div>
                                </div>
                                {/* row 10 */}
                                <div className="row mb-2 mt-3">
                                    <div className="col-3 ps-3"></div>
                                    <div className="col-9 px-1">
                                        <div className="form-check">
                                            <label className="form-check-label" htmlFor='contactPublic'>
                                                <input type="checkbox" className="form-check-input" name="contactPublic" id="contactPublic" defaultValue="checkedValue" />
                                                Make this Contact Public
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {/* row 11 */}
                                <div className="row mb-2 mt-3">
                                    <div className="col-3 ps-3"></div>
                                    <div className="col-9 px-1">
                                        <p>
                                            <Link href="#" className=" text-decoration-none text-blue fw-bold" >
                                                + Optional Fields
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center align-content-center text-center border-0 mb-2">
                            <button type="button" className="btn btn-dark px-4" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" className="btn btn-dark px-4">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </WrapperTag>
    )
}

export default PartyAddressBook