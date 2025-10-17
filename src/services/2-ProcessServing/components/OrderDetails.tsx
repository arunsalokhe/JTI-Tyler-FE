import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use location.state or default state
  const locationState = location.state || {
    serveEntries: [],
    parties: [],
    documents: [],
    serveInfo: [],
    serveAllAtSameAddress: false,
    serveAllWithSameDoc: false
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    caseNo: '',
    attorney: '',
    jurisdiction: '',
    orderNumber: ''
  });

  const serveEntriesData = locationState?.serveEntries || [];
  const partiesData = locationState?.parties || [];

  const [serveEntries] = useState(
    serveEntriesData.map((entry: any) => {
      const party = partiesData.find((p: any) => p.id === entry.entityBeingServed);
      const partyName = party ? (
        party.type === 'organization'
          ? party.organizationName
          : `${party.firstName} ${party.middleName ? party.middleName + ' ' : ''}${party.lastName}${party.suffix && party.suffix !== 'Default' ? ', ' + party.suffix : ''}`
      ) : 'Unknown';
      
      return {
        id: entry.id,
        name: partyName,
        capacity: entry.capacity || 'Authorized Person',
        address: 'The Strand, Galveston, TX 77550'
      };
    })
  );

  const [selectedService, setSelectedService] = useState('routine');
  const [internalReference, setInternalReference] = useState('');
  const [notifyUser, setNotifyUser] = useState('');

  const serviceOptions = [
    {
      id: 'routine',
      name: 'Routine Service',
      attemptBy: 'Wednesday, October 22, 2025 at 9 AM',
      price: 65
    },
    {
      id: 'priority',
      name: 'Priority Service',
      attemptBy: 'Tuesday, October 21, 2025 at 9 AM',
      price: 75
    },
    {
      id: 'urgent',
      name: 'Urgent Service',
      attemptBy: 'Monday, October 20, 2025 at 9 AM',
      price: 125
    },
    {
      id: 'ondemand',
      name: 'On Demand Service',
      attemptBy: 'Friday, October 17, 2025 at 1 PM',
      price: 195
    }
  ];

  const handleBack = () => {
    navigate('/services/process-serving/serve-info', { state: locationState });
  };

  const handleSubmit = () => {
    if (!selectedService) {
      alert('Please select a service option');
      return;
    }

    const selectedOption = serviceOptions.find(opt => opt.id === selectedService);
    
    const generatedOrderId = 'PS' + Math.random().toString().slice(2, 9);
    const generatedCaseNo = '16A20102';
    const generatedOrderNumber = 'PS' + Math.random().toString().slice(2, 9);
    
    setOrderDetails({
      orderId: generatedOrderId,
      caseNo: generatedCaseNo,
      attorney: 'John Doe',
      jurisdiction: 'Superior Court Of California, County Of Los Angeles - Chatsworth',
      orderNumber: generatedOrderNumber
    });

    console.log('Order submitted:', {
      service: selectedOption,
      internalReference,
      notifyUser,
      ...locationState
    });
    
    setShowSuccessModal(true);
  };

  const handleSaveAsDraft = () => {
    console.log('Saving as draft...');
    alert('Order saved as draft!');
    navigate('/dashboard');
  };

  const handleReset = () => {
    setSelectedService('routine');
    setInternalReference('');
    setNotifyUser('');
  };

  const firstParty = serveEntries[0] || { name: 'Kaufman Kaufman & Miller LLP', address: 'The Strand, Galveston, TX 77550' };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Process Serving</h1>
                <p className="text-sm text-gray-500">Order details</p>
              </div>
            </div>
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gray-100 px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-indigo-600">Order Details</h2>
              <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline">
                Reset Order
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-gray-700 mb-6">
                When would you like this attempted for <span className="font-semibold">{firstParty.name}</span> 
                <span className="text-gray-600"> ( {firstParty.address} )</span> ?
              </p>

              <div className="border-2 border-indigo-600 rounded-lg p-6">
                <div className="space-y-4">
                  {serviceOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition"
                    >
                      <input
                        type="radio"
                        name="service"
                        value={option.id}
                        checked={selectedService === option.id}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-5 h-5 mt-0.5 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{option.name}</span>
                          <span className="text-gray-600">Attempt by</span>
                          <span className="font-semibold text-gray-900">{option.attemptBy}</span>
                          <span className="text-gray-600">for</span>
                          <span className="font-semibold text-gray-900">${option.price}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                * Prices listed and service times displayed are per address attempted and only an estimate based on the information provided. 
                If you need your order processed sooner than the times listed above, please call us at (888) 962-9696.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Internal Reference/Matter Number (Optional) :
                </label>
                <input
                  type="text"
                  value={internalReference}
                  onChange={(e) => setInternalReference(e.target.value)}
                  placeholder="MISC-1005"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Choose User to notify :
                </label>
                <input
                  type="text"
                  value={notifyUser}
                  onChange={(e) => setNotifyUser(e.target.value)}
                  placeholder=""
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
            <button
              onClick={handleBack}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              &lt; Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Submit
              </button>
              <button
                onClick={handleSaveAsDraft}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order submitted</h2>
              
              <div className="space-y-2 text-sm text-gray-700 mb-6">
                <p>Order ID: <span className="font-semibold">{orderDetails.orderId}</span>, Case No: <span className="font-semibold">{orderDetails.caseNo}</span></p>
                <p>Attorney: <span className="font-semibold">{orderDetails.attorney}</span>, Jurisdiction Name: <span className="font-semibold">{orderDetails.jurisdiction}</span></p>
                <p>Order Number: <a href="#" className="text-indigo-600 hover:underline font-semibold">{orderDetails.orderNumber}</a></p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/services/process-serving/case-info');
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Create Order
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/services/process-serving/order-summary', { 
                      state: { 
                        orderDetails, 
                        selectedService,
                        internalReference,
                        notifyUser,
                        ...locationState 
                      } 
                    });
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;