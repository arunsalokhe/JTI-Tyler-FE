import React, { useState } from "react";
import { Modal, Button, TextField, Select, MenuItem, FormLabel, RadioGroup, Radio, FormControlLabel, Box } from "@mui/material";

const CardholderModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    cardType: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    nameOnCard: "",
    addressType: "US",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="cardholder-modal">
      <Box 
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}
      >
        <h2 className="text-xl font-bold mb-4">Cardholder Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter the information as it appears on the Cardholder Account. Fields marked with * are required.
        </p>

        {/* Card Type */}
        <FormLabel>Card Type *</FormLabel>
        <Select name="cardType" value={formData.cardType} onChange={handleChange} fullWidth>
          <MenuItem value="">Select Card Type</MenuItem>
          <MenuItem value="Visa">Visa</MenuItem>
          <MenuItem value="MasterCard">MasterCard</MenuItem>
          <MenuItem value="Amex">American Express</MenuItem>
        </Select>

        {/* Card Number */}
        <FormLabel>Card Number *</FormLabel>
        <TextField type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} fullWidth required />

        {/* Expiration Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel>Exp Month *</FormLabel>
            <TextField type="text" name="expMonth" placeholder="MM" value={formData.expMonth} onChange={handleChange} fullWidth required />
          </div>
          <div>
            <FormLabel>Exp Year *</FormLabel>
            <TextField type="text" name="expYear" placeholder="YYYY" value={formData.expYear} onChange={handleChange} fullWidth required />
          </div>
        </div>

        {/* CVV Code */}
        <FormLabel>CVV Code *</FormLabel>
        <TextField type="text" name="cvv" value={formData.cvv} onChange={handleChange} fullWidth required />

        {/* Name on Card */}
        <FormLabel>Name on Card *</FormLabel>
        <TextField type="text" name="nameOnCard" value={formData.nameOnCard} onChange={handleChange} fullWidth required maxLength={30} />

        {/* Address Type */}
        <FormLabel>Address Type</FormLabel>
        <RadioGroup
          value={formData.addressType}
          onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
        >
          <FormControlLabel value="US" control={<Radio />} label="US" />
          <FormControlLabel value="Foreign" control={<Radio />} label="Foreign" />
        </RadioGroup>

        {/* Address Line 1 */}
        <FormLabel>Address Line 1 *</FormLabel>
        <TextField type="text" name="address1" value={formData.address1} onChange={handleChange} fullWidth required />

        {/* Address Line 2 */}
        <FormLabel>Address Line 2</FormLabel>
        <TextField type="text" name="address2" value={formData.address2} onChange={handleChange} fullWidth />

        {/* City */}
        <FormLabel>City *</FormLabel>
        <TextField type="text" name="city" value={formData.city} onChange={handleChange} fullWidth required />

        {/* State */}
        <FormLabel>State *</FormLabel>
        <TextField type="text" name="state" value={formData.state} onChange={handleChange} fullWidth required />

        {/* Zip Code */}
        <FormLabel>Zip Code *</FormLabel>
        <TextField type="text" name="zip" value={formData.zip} onChange={handleChange} fullWidth required />

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" color="primary">Submit</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default CardholderModal;
