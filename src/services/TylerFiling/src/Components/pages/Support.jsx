import React from 'react';
import { Link } from 'react-router-dom';
import FileImg from'../assets/FileImg.png';
import Phone from '../assets/Phone.png';
import Envelope from '../assets/Envelope.png';

const Support = () => {
  return (
    <div>
        <div className='container'>
            <div className="col-12 col-md-12 col-xl-12 py-3 mt-5">
                <div className="row justify-content-center mt-3">
                    <div className="col-12 col-md-12 col-xl-12 align-items-center">
                    <h1 className="fw-bold  text-center">Support</h1>
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-center mt-2 ">
                    <input
                    className="form-control my-0 p-3 me-2 rounded-pill border-0"
                    style={{ width: 900 }}
                    type="search"
                    name=""
                    id=""
                    defaultValue="Have a Question? Ask or enter a search team"
                    />
                    <button
                    type="button"
                    className="btn btn-dark btn-lg px-4 rounded-pill p-"
                    >
                    Search
                    </button>
                </div>
                {/* start white container (card) */}
                <div className=" card p-2 mt-4">
                    <div className="card-body">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-xl-8 align-items-center">
                        <h2 className="card-title fw-normal ms-3">
                            E-Filing Support
                        </h2>
                        </div>
                        <div className="col-12 col-md-4 col-xl-4 align-items-center">
                        <h2 className="card-title fw-normal ms-3">Contact Us</h2>
                        </div>
                    </div>
                    <div className="row justify-content-center mt-4 support-sec">
                        {/*col-6 */}
                        <div className="col-12 col-md-8 col-xl-8 align-items-center">
                        <div className="card px-2 py-2 m-2">
                            <div className="card-header border-bottom-0 d-flex">
                            <h5 className="card-title fw-normal text-start">
                                Getting Started
                            </h5>
                            <span className="fw-normal text-end">
                                <Link href="#" className=" text-decoration-none text-dark">
                                View all
                                </Link>
                            </span>
                            </div>
                            <div className="card-body">
                            <ul className="list-group  justify-content-start float-start list-group-flush">
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Add and Manange Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Add on Attorney or staff person from the Firm Account
                                </li>
                            </ul>
                            </div>
                        </div>
                        <div className="card px-2 py-2 m-2">
                            <div className="card-header border-bottom-0 d-flex">
                            <h5 className="card-title fw-normal text-start">
                                Getting Started
                            </h5>
                            <span className="fw-normal text-end">
                                <Link href="#" className=" text-decoration-none text-dark">
                                View all
                                </Link>
                            </span>
                            </div>
                            <div className="card-body">
                            <ul className="list-group  justify-content-start float-start list-group-flush">
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Add on Attorney or staff person from the Firm Account
                                </li>
                            </ul>
                            </div>
                        </div>
                        <div className="card px-2 py-2 m-2">
                            <div className="card-header border-bottom-0 d-flex">
                            <h5 className="card-title fw-normal text-start">
                                Getting Started
                            </h5>
                            <span className="fw-normal text-end">
                                <Link href="#" className=" text-decoration-none text-dark">
                                View all
                                </Link>
                            </span>
                            </div>
                            <div className="card-body">
                            <ul className="list-group  justify-content-start float-start list-group-flush">
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Add on Attorney or staff person from the Firm Account
                                </li>
                            </ul>
                            </div>
                        </div>
                        <div className="card px-2 py-2 m-2">
                            <div className="card-header border-bottom-0 d-flex">
                            <h5 className="card-title fw-normal text-start">
                                Getting Started
                            </h5>
                            <span className="fw-normal text-end">
                                <Link href="#" className=" text-decoration-none text-dark">
                                View all
                                </Link>
                            </span>
                            </div>
                            <div className="card-body">
                            <ul className="list-group  justify-content-start float-start list-group-flush">
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Add on Attorney or staff person from the Firm Account
                                </li>
                            </ul>
                            </div>
                        </div>
                        <div className="card px-2 py-2 m-2">
                            <div className="card-header border-bottom-0 d-flex">
                            <h5 className="card-title fw-normal text-start">
                                Getting Started
                            </h5>
                            <span className="fw-normal text-end">
                                <Link href="#" className=" text-decoration-none text-dark">
                                View all
                                </Link>
                            </span>
                            </div>
                            <div className="card-body">
                            <ul className="list-group  justify-content-start float-start list-group-flush">
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />{" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                <img
                                    className="img-responsive mx-2"
                                    width={25}
                                    height={25}
                                    src={FileImg}
                                    alt='file-img'
                                />
                                Add on Attorney or staff person from the Firm Account
                                </li>
                            </ul>
                            </div>
                        </div>
                        </div>
                        {/*col-6 end*/}
                        {/*col-6 */}
                        <div className="col-12 col-md-4 col-xl-4 align-items-center">
                        <div className="card px-2 py-2 m-2">
                            <div className="card-body">
                            <table className="table table-borderless">
                                <tbody>
                                <tr>
                                    <td>
                                    <img
                                        className="img-responsive mx-2"
                                        width={25}
                                        height={25}
                                        src={Phone}
                                        alt='phone-img'
                                    />{" "}
                                    </td>
                                    <td className="text-star">
                                    91 9876543210
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    <img
                                        className="img-responsive mx-2"
                                        width={25}
                                        height={25}
                                        src={Envelope}
                                        alt='envelope-img'
                                    />{" "}
                                    </td>
                                    <td className="text-star">
                                    email@gmail.com
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </div>
                        </div>
                        <div className="card px-2 py-2 m-2">
                            <div className="card-header border-bottom-0">
                            <h5 className="card-title fw-normal text-start">
                                Latest Articles
                            </h5>
                            </div>
                            <div className="card-body">
                            <ul className="list-group  justify-content-start float-start list-group-flush">
                                <li className="list-group-item border-0">
                                {" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add on Attorney or staff person from the Firm Account
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add on Attorney or staff person from the Firm Account
                                </li>
                            </ul>
                            </div>
                        </div>
                        <div className="card px-2 py-2 m-2">
                            <div className="card-header border-bottom-0">
                            <h5 className="card-title fw-normal text-start">
                                Popular Articles
                            </h5>
                            </div>
                            <div className="card-body">
                            <ul className="list-group  justify-content-start float-start list-group-flush">
                                <li className="list-group-item border-0">
                                {" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add on Attorney or staff person from the Firm Account
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add on Attorney or staff person from the Firm Account
                                </li>
                            </ul>
                            </div>
                        </div>
                        <div className="card px-2 py-2 m-2">
                            <div className="card-header border-bottom-0">
                            <h5 className="card-title fw-normal text-start">
                                Categories
                            </h5>
                            </div>
                            <div className="card-body">
                            <ul className="list-group  justify-content-start float-start list-group-flush categories">
                                <li className="list-group-item border-0">
                                {" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add on Attorney or staff person from the Firm Account
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add and Manage Payment Accounts
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Pro se and self Represented Litigant E-Filing Guide
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Initiate a New Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                File on an Existing Case
                                </li>
                                <li className="list-group-item border-0">
                                {" "}
                                Add on Attorney or staff person from the Firm Account
                                </li>
                            </ul>
                            </div>
                        </div>
                        </div>
                        {/*col-6 end*/}
                    </div>
                </div>
            </div>
            {/* End white container */}
            </div>
        </div>
    </div>
  )
}

export default Support;





