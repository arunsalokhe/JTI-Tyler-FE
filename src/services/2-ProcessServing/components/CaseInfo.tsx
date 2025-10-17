import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowLeft, RotateCcw } from 'lucide-react';

interface Attorney {
  id: string;
  firstName: string;
  lastName: string;
  barId: string;
  email: string;
  phone: string;
  password: string;
  firmName: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

const CaseInfo: React.FC = () => {
  const navigate = useNavigate();
  const [caseNumber, setCaseNumber] = useState<string>('');
  const [noCaseNumber, setNoCaseNumber] = useState<boolean>(false);
  const [caseTitle, setCaseTitle] = useState<string>('');
  const [jurisdiction, setJurisdiction] = useState<string>('');
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [selectedAttorney, setSelectedAttorney] = useState<string>('');
  const [showAttorneyModal, setShowAttorneyModal] = useState<boolean>(false);

  // Attorney form state
  const [attorneyForm, setAttorneyForm] = useState({
    firstName: '',
    lastName: '',
    barId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firmName: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleAddAttorney = () => {
    setShowAttorneyModal(true);
  };

  const handleCloseModal = () => {
    setShowAttorneyModal(false);
    // Reset form
    setAttorneyForm({
      firstName: '',
      lastName: '',
      barId: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      firmName: '',
      streetAddress: '',
      city: '',
      state: '',
      zip: ''
    });
  };

  const handleSaveAttorney = () => {
    // Validate form
    if (!attorneyForm.firstName || !attorneyForm.email || !attorneyForm.phone || !attorneyForm.firmName) {
      alert('Please fill in all required fields');
      return;
    }

    if (attorneyForm.password !== attorneyForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Create new attorney
    const newAttorney: Attorney = {
      id: Date.now().toString(),
      firstName: attorneyForm.firstName,
      lastName: attorneyForm.lastName,
      barId: attorneyForm.barId,
      email: attorneyForm.email,
      phone: attorneyForm.phone,
      password: attorneyForm.password,
      firmName: attorneyForm.firmName,
      streetAddress: attorneyForm.streetAddress,
      city: attorneyForm.city,
      state: attorneyForm.state,
      zip: attorneyForm.zip
    };

    setAttorneys([...attorneys, newAttorney]);
    setSelectedAttorney(newAttorney.id);
    handleCloseModal();
  };

  const handleReset = () => {
    setCaseNumber('');
    setNoCaseNumber(false);
    setCaseTitle('');
    setJurisdiction('');
    setAttorneys([]);
    setSelectedAttorney('');
  };

  const handleSaveAndNext = () => {
  // Add validation logic here
  if (!caseNumber && !noCaseNumber) {
    alert('Please enter a case number or check the box if you don\'t have one');
    return;
  }
  
  if (!caseTitle) {
    alert('Please enter a case title');
    return;
  }
  
  if (!jurisdiction) {
    alert('Please select a jurisdiction');
    return;
  }

  console.log('Saving case info:', {
    caseNumber,
    caseTitle,
    jurisdiction,
    attorneys
  });
  
  // Navigate to Case Participants page
  navigate('/services/process-serving/case-participants');
};

  const getSelectedAttorneyDetails = () => {
    return attorneys.find(a => a.id === selectedAttorney);
  };

  const selectedAttorneyData = getSelectedAttorneyDetails();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Process Serving</h1>
                <p className="text-sm text-gray-500">Create new service order</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Case Info Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Case Info</h2>
                <p className="text-sm text-gray-600 mt-1">Enter case details and attorney information</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-white rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Order
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Case Number */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-900">
                Case Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                disabled={noCaseNumber}
                placeholder="Case Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noCaseNumber}
                  onChange={(e) => {
                    setNoCaseNumber(e.target.checked);
                    if (e.target.checked) setCaseNumber('');
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Click here if you don't have a case number</span>
              </label>
            </div>

            {/* Case Title and Jurisdiction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900">
                  Case Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  placeholder="Case Title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900">
                  Jurisdiction <span className="text-red-500">*</span>
                </label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Select or enter Court Name</option>
                  <option value="superior">Superior Court</option>
                  <option value="district">District Court</option>
                  <option value="federal">Federal Court</option>
                  <option value="appellate">Appellate Court</option>
                </select>
              </div>
            </div>

            {/* Add Attorney Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Add Attorney (Info Used For Proof Of Service)</h3>
                  <p className="text-sm text-gray-600 mt-1">Add attorney information for service documentation</p>
                </div>
                <button
                  onClick={handleAddAttorney}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Attorney
                </button>
              </div>

              {/* Attorney Dropdown */}
              <div className="space-y-4 mb-6">
                <select
                  value={selectedAttorney}
                  onChange={(e) => setSelectedAttorney(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Select...</option>
                  {attorneys.map((attorney) => (
                    <option key={attorney.id} value={attorney.id}>
                      {attorney.firstName} {attorney.lastName} - {attorney.firmName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attorney Details Display */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600">Attorney Name & Bar ID:</span>
                    <span className="text-sm text-gray-600">
                      {selectedAttorneyData ? `${selectedAttorneyData.firstName} ${selectedAttorneyData.lastName} - ${selectedAttorneyData.barId}` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600">Firm Name:</span>
                    <span className="text-sm text-gray-600">{selectedAttorneyData?.firmName || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600">Firm Address:</span>
                    <span className="text-sm text-gray-600">{selectedAttorneyData?.streetAddress || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600">City, State, Zip Code:</span>
                    <span className="text-sm text-gray-600">
                      {selectedAttorneyData ? `${selectedAttorneyData.city}, ${selectedAttorneyData.state} ${selectedAttorneyData.zip}` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600">Email:</span>
                    <span className="text-sm text-gray-600">{selectedAttorneyData?.email || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600">Phone:</span>
                    <span className="text-sm text-gray-600">{selectedAttorneyData?.phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndNext}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              Save & Next
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Need Help?</h4>
            <p className="text-sm text-blue-800">
              All fields marked with <span className="text-red-500 font-semibold">*</span> are required. 
              Make sure to add attorney information for proper service documentation.
            </p>
          </div>
        </div>
      </main>

      {/* Add Attorney Modal */}
      {showAttorneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <h3 className="text-xl font-bold">Add Attorney</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-indigo-700 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={attorneyForm.firstName}
                    onChange={(e) => setAttorneyForm({...attorneyForm, firstName: e.target.value})}
                    placeholder="First Name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={attorneyForm.lastName}
                    onChange={(e) => setAttorneyForm({...attorneyForm, lastName: e.target.value})}
                    placeholder="Last Name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Bar ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bar Id</label>
                <input
                  type="text"
                  value={attorneyForm.barId}
                  onChange={(e) => setAttorneyForm({...attorneyForm, barId: e.target.value})}
                  placeholder="cwptest1208@gmail.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-blue-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={attorneyForm.email}
                  onChange={(e) => setAttorneyForm({...attorneyForm, email: e.target.value})}
                  placeholder="Email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={attorneyForm.phone}
                  onChange={(e) => setAttorneyForm({...attorneyForm, phone: e.target.value})}
                  placeholder="phone"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={attorneyForm.password}
                    onChange={(e) => setAttorneyForm({...attorneyForm, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-blue-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={attorneyForm.confirmPassword}
                    onChange={(e) => setAttorneyForm({...attorneyForm, confirmPassword: e.target.value})}
                    placeholder="Confirm Password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Firm Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Firm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={attorneyForm.firmName}
                  onChange={(e) => setAttorneyForm({...attorneyForm, firmName: e.target.value})}
                  placeholder="Firm Name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={attorneyForm.streetAddress}
                  onChange={(e) => setAttorneyForm({...attorneyForm, streetAddress: e.target.value})}
                  placeholder="Street Address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={attorneyForm.city}
                    onChange={(e) => setAttorneyForm({...attorneyForm, city: e.target.value})}
                    placeholder="City"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={attorneyForm.state}
                    onChange={(e) => setAttorneyForm({...attorneyForm, state: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zip <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={attorneyForm.zip}
                    onChange={(e) => setAttorneyForm({...attorneyForm, zip: e.target.value})}
                    placeholder="Zip"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-center gap-4 sticky bottom-0">
              <button
                onClick={handleSaveAttorney}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCloseModal}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseInfo;