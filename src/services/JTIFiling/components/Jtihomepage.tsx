import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Building2, ArrowRight, Phone, Mail } from 'lucide-react';
import JTIHeader from './JTIHeader';

const JTIHomepage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'File your documents',
      description: 'Submit your legal documents electronically to the court'
    },
    {
      icon: Clock,
      title: 'Reserve a Motion',
      description: 'Schedule and reserve motion hearing dates'
    },
    {
      icon: FileText,
      title: 'Electronically serve the opposition',
      description: 'Serve documents to opposing parties electronically'
    },
    {
      icon: Building2,
      title: 'Government filers are exempt from filing fees',
      description: 'No filing fees required for government entities'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <JTIHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 sm:px-8 py-8 sm:py-12 border-b border-gray-200">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Sample Homepage
            </h1>
            <p className="text-base sm:text-lg text-gray-700 max-w-3xl">
              This portal site allows you to electronically file documents, search data and download 
              documents from a target eCourt.
            </p>
          </div>

          {/* About the Project Section */}
          <div className="p-6 sm:p-8">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">About the Project</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-start">
                <button
                  onClick={() => {/* Navigate to more info */}}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 transition"
                >
                  more...
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How to Participate Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">How to Participate</h2>

          {/* Attorney Service Companies */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 italic">
              Attorney Service Companies
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Attorney service companies wishing to take part in the project can contact{' '}
              <a
                href="mailto:efile@countrywide.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium underline"
              >
                efile@countrywide.com
              </a>{' '}
              or call{' '}
              <a
                href="tel:0001115555"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                (000) 111-5555
              </a>{' '}
              Option 2.
            </p>
          </div>

          {/* Law Firms */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 italic">
              Law Firms
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Law firms wishing to participate in the project can now register online by creating 
              an account without contacting Journal Technologies.
            </p>
          </div>

          {/* Self-Represented */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 italic">
              Self-Represented
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Self-Represented parties can now register online by creating an account without 
              contacting Journal Technologies.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to Get Started?
          </h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Begin your electronic filing process today. Create an account or file a new case.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/services/jti-filing/new-case')}
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition shadow-md flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              File a New Case
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition border-2 border-white"
            >
              Create an Account
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 hover:border-indigo-300 transition">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Need Help?</p>
              <a
                href="tel:8004584575"
                className="text-sm font-semibold text-gray-900 hover:text-indigo-600"
              >
                (000) 111-5555
              </a>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 hover:border-indigo-300 transition">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Email Support</p>
              <a
                href="mailto:efile@countrywide.com"
                className="text-sm font-semibold text-gray-900 hover:text-indigo-600"
              >
                efile@countrywide.com
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JTIHomepage;