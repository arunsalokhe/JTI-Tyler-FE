import React, { useState, useEffect } from "react";

const UpdatePaymentAccount = ({ selectedAccount, onUpdateSuccess }) => {
    const [accountName, setAccountName] = useState("");

    // ✅ Load selected account details when modal opens
    useEffect(() => {
        if (selectedAccount) {
            setAccountName(selectedAccount.AccountName);
        }
    }, [selectedAccount]);

    // ✅ Handle input change
    const handleInputChange = (e) => {
        setAccountName(e.target.value);
    };

    // ✅ Function to call API
    const handleUpdate = async () => {
        const token = "YOUR_BEARER_TOKEN_HERE"; // Replace with actual token
        const baseURL = process.env.REACT_APP_BASE_URL || "https://localhost:7207/api/Tyler";

        const payload = {
            paymentAccountID: selectedAccount.PaymentAccountID,
            accountName: accountName
        };
        console.log("payload",payload);

        try {
            const response = await fetch(`${baseURL}/UpdatePaymentAccount`, {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json-patch+json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log("API Response:", result);

            if (response.ok) {
                alert("Payment info updated successfully!");
                onUpdateSuccess(); // Refresh the account list
            } else {
                alert("Error updating payment info: " + result.message);
            }
        } catch (error) {
            console.error("API Error:", error);
            alert("Failed to update payment info. Please try again.");
        }
    };

    return (
        <div className="modal fade" id="edit-modal" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Edit Payment Method</h3>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body">
                        <label className="form-label">Payment Method Nickname</label>
                        <input
                            className="form-control"
                            type="text"
                            value={accountName}
                            onChange={handleInputChange}
                            placeholder="Enter Nickname"
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-dark" data-bs-dismiss="modal">
                            Cancel
                        </button>
                        <button type="button" className="btn btn-dark" onClick={handleUpdate}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePaymentAccount;
