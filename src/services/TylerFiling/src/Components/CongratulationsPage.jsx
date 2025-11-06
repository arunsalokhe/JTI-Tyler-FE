import React from 'react';
import LogoBlack from './assets/efilinglogopurple.png';
import { Link } from 'react-router-dom';

const CongratulationsPage = () => {
  return (
    <>
      <div className="logout-page container">
        <div className='mb-5'></div>
        <div className='logout-container shadow'> 
          <div className='row mt-3'>
            <div className='col text-center'>
              <img className='logoimg' src={LogoBlack} alt='E-filing Logo'/>
            </div>
          </div>

          {/* ✅ Congratulations Section */}
          <div className='row mt-3 justify-content-center'>
            <div className="col-xs-10 col-lg-8 text-center">
              <h2 className="mb-4">Congratulations!</h2>  
              <p style={{fontSize:"16px"}}>Just one last step to complete. Please check your email and click the link to activate your account.</p>
            </div>
          </div>

          {/* ✅ Already have an account section */}
          <div className="row mt-1">
            <div className="col-lg-3"></div>
            <div className="col-lg-6">
              <div className="loginseparator text-center">
                <span className="logintextseparator">Already have an e-filing account?</span>
              </div>
            </div>
            <div className="col-lg-3"></div>
          </div>

          {/* ✅ Login Button Section */}
          <div className='row mt-1 mb-5'>
            <div className="col-md-4 col-xs-1"></div>
            <div className='col-md-4 col-xs-10 text-center'>
              <div className='text-center'>               
                <div className='row mt-4'>
                  <Link to='/' className='btn btn-dark'>Login</Link> 
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CongratulationsPage;
