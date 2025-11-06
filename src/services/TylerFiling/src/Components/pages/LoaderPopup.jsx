import React from 'react';

const LoaderPopup = ({ message }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '9999',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        minWidth: '200px',
      }}>
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p>{message || 'Getting your case details...'}</p>
      </div>
    </div>
  );
};

export default LoaderPopup;
