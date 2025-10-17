import React, { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DocumentForm {
  id: string;
  courtDefinedDoc: string;
  documentName: string;
  file: File | null;
  fileName: string;
}

const DocumentsUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const serveEntriesData = location.state?.serveEntries || [];
  const partiesData = location.state?.parties || [];

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
        capacity: entry.capacity || 'Authorized Person'
      };
    })
  );

  useEffect(() => {
    if (serveEntries.length === 0) {
      alert('No serve entries found. Please complete the previous step.');
      navigate('/services/process-serving/case-participants');
    }
  }, [serveEntries, navigate]);

  const [serveAllWithSameDoc, setServeAllWithSameDoc] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const [singleDocForm, setSingleDocForm] = useState<DocumentForm>({
    id: 'all',
    courtDefinedDoc: 'Civil',
    documentName: '',
    file: null,
    fileName: ''
  });

  const [multipleDocForms, setMultipleDocForms] = useState<DocumentForm[]>(
    serveEntries.map((entry: any) => ({
      id: entry.id,
      courtDefinedDoc: 'Civil',
      documentName: '',
      file: null,
      fileName: ''
    }))
  );

  const courtDocOptions = ['Civil', 'Criminal', 'Family', 'Eviction', 'Small Claims'];

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setServeAllWithSameDoc(true);
    } else {
      setShowWarningModal(true);
    }
  };

  const handleWarningConfirm = () => {
    setServeAllWithSameDoc(false);
    setShowWarningModal(false);
  };

  const handleWarningCancel = () => {
    setShowWarningModal(false);
  };

  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSingleDocForm({
        ...singleDocForm,
        file: file,
        fileName: file.name
      });
    }
  };

  const handleMultipleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMultipleDocForms(multipleDocForms.map(form => 
        form.id === id 
          ? { ...form, file: file, fileName: file.name }
          : form
      ));
    }
  };

  const handleSaveAndNext = () => {
    if (serveAllWithSameDoc) {
      if (!singleDocForm.documentName || !singleDocForm.file) {
        alert('Please select document name and upload a file');
        return;
      }
    } else {
      const incomplete = multipleDocForms.some(form => !form.documentName || !form.file);
      if (incomplete) {
        alert('Please complete all document uploads for each party');
        return;
      }
    }
    
    console.log('Documents ready to submit:', serveAllWithSameDoc ? singleDocForm : multipleDocForms);
    
    // Navigate to serve info page with all data
    navigate('/services/process-serving/serve-info', {
      state: {
        ...location.state,
        documents: serveAllWithSameDoc ? singleDocForm : multipleDocForms,
        serveAllWithSameDoc: serveAllWithSameDoc
      }
    });
  };

  const handleBack = () => {
    navigate('/services/process-serving/case-participants', {
      state: location.state
    });
  };

  const handleReset = () => {
    setServeAllWithSameDoc(true);
    setSingleDocForm({
      id: 'all',
      courtDefinedDoc: 'Civil',
      documentName: '',
      file: null,
      fileName: ''
    });
    setMultipleDocForms(
      serveEntries.map((entry: any) => ({
        id: entry.id,
        courtDefinedDoc: 'Civil',
        documentName: '',
        file: null,
        fileName: ''
      }))
    );
  };

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
                <p className="text-sm text-gray-500">Upload documents</p>
              </div>
            </div>
            <button onClick={() => alert('Navigating to dashboard...')} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gray-100 px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-indigo-600">Documents Upload</h2>
              <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline">
                Reset Order
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {serveAllWithSameDoc ? (
              <div>
                <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Document For: All Serve</span>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-sm">Serve All Parties With The Same Documents</span>
                    <input
                      type="checkbox"
                      checked={serveAllWithSameDoc}
                      onChange={(e) => handleCheckboxChange(e.target.checked)}
                      className="w-5 h-5 rounded border-white"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Court Defined Documents
                    </label>
                    <select
                      value={singleDocForm.courtDefinedDoc}
                      onChange={(e) => setSingleDocForm({...singleDocForm, courtDefinedDoc: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {courtDocOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Document Name
                    </label>
                    <select
                      value={singleDocForm.documentName}
                      onChange={(e) => setSingleDocForm({...singleDocForm, documentName: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="">Select Title</option>
                      <option value="Summons">Summons</option>
                      <option value="Complaint">Complaint</option>
                      <option value="Notice">Notice</option>
                      <option value="Subpoena">Subpoena</option>
                    </select>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Choose Document
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="relative cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition">
                      <span className="text-sm font-medium text-gray-700">Choose file</span>
                      <input
                        type="file"
                        onChange={handleSingleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx"
                      />
                    </label>
                    <span className="text-sm text-gray-600">
                      {singleDocForm.fileName || 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {serveEntries.map((entry: any, index: number) => {
                  const form = multipleDocForms.find(f => f.id === entry.id);
                  return (
                    <div key={entry.id}>
                      <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Document For: {entry.name}</span>
                          <span className="text-sm italic">({entry.capacity})</span>
                        </div>
                        {index === 0 && (
                          <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-sm">Serve All Parties With The Same Documents</span>
                            <input
                              type="checkbox"
                              checked={serveAllWithSameDoc}
                              onChange={(e) => handleCheckboxChange(e.target.checked)}
                              className="w-5 h-5 rounded border-white"
                            />
                          </label>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Court Defined Documents
                          </label>
                          <select
                            value={form?.courtDefinedDoc || 'Civil'}
                            onChange={(e) => setMultipleDocForms(multipleDocForms.map(f => 
                              f.id === entry.id ? {...f, courtDefinedDoc: e.target.value} : f
                            ))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          >
                            {courtDocOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Document Name
                          </label>
                          <select
                            value={form?.documentName || ''}
                            onChange={(e) => setMultipleDocForms(multipleDocForms.map(f => 
                              f.id === entry.id ? {...f, documentName: e.target.value} : f
                            ))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          >
                            <option value="">Select Document</option>
                            <option value="Summons">Summons</option>
                            <option value="Complaint">Complaint</option>
                            <option value="Notice">Notice</option>
                            <option value="Subpoena">Subpoena</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Choose Document
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="relative cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 transition">
                            <span className="text-sm font-medium text-gray-700">Choose file</span>
                            <input
                              type="file"
                              onChange={(e) => handleMultipleFileChange(entry.id, e)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                          <span className="text-sm text-gray-600">
                            {form?.fileName || 'No file chosen'}
                          </span>
                        </div>
                      </div>

                      {index < serveEntries.length - 1 && (
                        <div className="border-t border-gray-200 mt-8"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Serve</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {serveEntries.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{entry.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{entry.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                onClick={handleSaveAndNext}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Save & Next &gt;
              </button>
              <button className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </main>

      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-2xl font-bold text-center">WARNING</h3>
            </div>
            <div className="p-8">
              <p className="text-red-600 text-center text-base leading-relaxed">
                If you upload documents for a different "Case Number" Your Proof of Service Will Be faulty and Rejected by the court. make sure all your documents pertain to the same case
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
              <button
                onClick={handleWarningConfirm}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg"
              >
                I Understand, Processed With Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsUpload;