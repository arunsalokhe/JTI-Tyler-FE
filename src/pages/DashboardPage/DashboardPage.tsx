import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    User,
    Clock,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    FileText,
    Send,
    Wifi,
    Truck,
    MapPin,
    Briefcase,
    Building2,
    Wrench,
    ClipboardList,
    LifeBuoy,
    Headphones,
    BookOpen,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SERVICES, NAVIGATION_TABS } from '../../utils/constants';

const DashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('Dashboard');
    const [orderPeriod, setOrderPeriod] = useState<string>('30 days');
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = (): void => {
        logout();
        navigate('/');
    };

    const servicesList = [
        { name: 'Court Filing', icon: FileText },
        { name: 'Process Serving', icon: Send },
        { name: 'Subpoena Domestication', icon: FileText },
        { name: 'eRecording', icon: FileText },
        { name: 'Courtesy Copy Delivery', icon: Truck },
        { name: 'Court Hearing', icon: Building2 },
        { name: 'Skip Tracing', icon: MapPin },
        { name: 'Document Retrieval', icon: FileText },
        { name: 'eService', icon: Wifi },
        { name: 'Secretary of State Filing', icon: FileText },
        { name: 'Messenger Delivery', icon: Truck },
        { name: 'Deposition Officer', icon: Briefcase },
        { name: 'Tyler EFiling', icon: FileText },
        { name: 'JTI EFiling', icon: FileText }
    ];

    // const handleServiceClick = (index: number, serviceName: string) => {
    //     // Navigate to specific service pages
    //     switch (index) {
    //         case 0: // Court Filing
    //             // navigate('/services/court-filing');
    //             break;
    //         case 1: // Process Serving
    //             navigate('/services/process-serving/case-info');
    //             break;
    //         case 2: // Subpoena Domestication
    //             // navigate('/services/subpoena-domestication');
    //             break;
    //         // Add more cases for other services
    //         default:
    //             console.log(`Selected service: ${serviceName}`);
    //     }
    // };

    const handleServiceClick = (index: number, serviceName: string) => {
        switch (serviceName) {
            case 'Tyler EFiling':
                navigate('/tyler-filing'); // ✅ Navigate to Tyler Filing app
                break;
            case 'Process Serving':
                navigate('/services/process-serving/case-info');
                break;
            case 'JTI EFiling':
                navigate('/services/jti-filing/home-page');
                break;
            default:
                console.log(`Selected service: ${serviceName}`);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-50">
            {/* Top Language Bar */}
            {/* <div className="bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex justify-end">
                    <select className="bg-transparent text-gray-400 text-xs outline-none cursor-pointer">
                        <option>English</option>
                    </select>
                </div>
            </div> */}

            {/* Main Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center py-4">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                            </svg>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">EfilingHub</h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
                            {NAVIGATION_TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-6 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab
                                        ? 'text-indigo-600 border-indigo-600'
                                        : 'text-gray-600 border-transparent hover:text-gray-900'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>

                        {/* Right Icons */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button className="relative p-2 hover:bg-gray-100 rounded transition">
                                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </button>
                            <button onClick={handleLogout} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm text-sm">
                                U
                            </button>
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded transition"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden pb-4 border-t border-gray-200 mt-2">
                            <nav className="flex flex-col space-y-2 pt-4">
                                {NAVIGATION_TABS.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`text-left px-4 py-2 text-sm font-medium rounded transition ${activeTab === tab
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                        {/* Place an Order */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-center">
                                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Place an order</h2>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-2">
                                {servicesList.map((service, idx) => {
                                    const IconComponent = service.icon;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleServiceClick(idx, service.name)}
                                            className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition flex items-center ${idx === 0
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
                                                }`}
                                        >
                                            <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                            <span className="truncate">{service.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Orders */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-center">
                                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Orders</h2>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col items-center py-4">
                                    <div className="mb-4 w-full">
                                        <img
                                            src="/assets/images/orders.svg"
                                            alt="Orders Illustration"
                                            className="w-full h-auto max-w-[280px] mx-auto"
                                        />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 text-center">
                                        Your orders will show up here
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg shadow h-half">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-center">
                                    <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent cases</h2>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                                    <div className="mb-6 sm:mb-8 w-full max-w-xs sm:max-w-sm">
                                        <img
                                            src="/assets/images/recentcases.svg"
                                            alt="Recent Cases Illustration"
                                            className="w-full h-auto"
                                        />
                                    </div>

                                    <p className="text-xs sm:text-sm text-gray-500 text-center mb-2 px-4">
                                        Cases you've recently interacted with will appear here.
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-700 text-center px-4">
                                        Get started by placing an order or <span className="text-indigo-600 font-medium cursor-pointer hover:underline">adding a case to your portfolio</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                        {/* Order Status */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-center">
                                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Order status</h2>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {['30 days', '60 days', '90 days'].map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setOrderPeriod(period)}
                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md font-medium transition ${period === orderPeriod
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Show statuses for:</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {SERVICES.map((service) => (
                                            <option key={service.id}>{service.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-gray-200">
                                    <div className="text-center">
                                        <div className="text-indigo-600 mb-2 text-xs sm:text-sm">In progress</div>
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
                                            <span className="text-2xl sm:text-4xl font-bold text-gray-900">0</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-green-600 mb-2 text-xs sm:text-sm">Accepted</div>
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                                            <span className="text-2xl sm:text-4xl font-bold text-gray-900">0</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-red-600 mb-2 text-xs sm:text-sm">Rejected</div>
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
                                            <span className="text-2xl sm:text-4xl font-bold text-gray-900">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support and Resources */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-center">
                                    <LifeBuoy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Support and resources</h2>
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                                <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-gray-200">
                                    <div className="flex-shrink-0">
                                        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 mb-1 text-indigo-600 text-sm sm:text-base">Support Center</h3>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            How-to articles and FAQs, including pricing information and court-specific rules and deadlines.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="flex-shrink-0">
                                        <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Contact customer support:</h3>
                                        <div className="space-y-1">
                                            <p className="text-xs sm:text-sm">
                                                <span className="text-indigo-600 font-medium cursor-pointer hover:underline">Send a message</span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600">(800) 938-8815</p>
                                            <p className="text-xs sm:text-sm text-gray-600">Monday-Friday 8 AM to 6 PM PT</p>
                                            <p className="text-xs sm:text-sm text-gray-600">Your customer number: 0197743</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* From the Blog */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">From the blog</h2>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-900" />
                                </div>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    {[1, 2].map((item) => (
                                        <div key={item} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                                            <div className="h-16 sm:h-20 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                                                <User className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                                            </div>
                                            <div className="p-2 sm:p-3">
                                                <h3 className="text-xs font-semibold text-gray-800 mb-1 line-clamp-2">Legal Concierge Service</h3>
                                                <p className="text-xs text-gray-600 mb-2">Expert Support</p>
                                                <button className="text-xs text-indigo-600 font-medium hover:underline">Continue Reading</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;