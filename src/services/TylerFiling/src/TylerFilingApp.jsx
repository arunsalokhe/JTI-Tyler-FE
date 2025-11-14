import { useEffect } from "react";
import { Route, Routes, useLocation, Navigate, Outlet  } from "react-router-dom";
import Login from "./login";
import ProtectedRoutes from "./Components/ProtectedRoutes";
import Register from "./register";
import Header from "./Components/Header";
import Dashboard from "./Components/Dashboard";
import InitiateCase from './Components/pages/InitiateCase';
import ExistingCase from './Components/pages/ExistingCase';
import CreateServeOnly from './Components/pages/CreateServeOnly';
import Status from './Components/pages/Status';
import DraftHistory from './Components/pages/DraftHistory';
import Notification from './Components/pages/Notification';
import Support from './Components/pages/Support';
import FilingReport from './Components/pages/FilingReport';
import CaseList from './Components/pages/CaseList';
import AccountInfo from './Components/pages/AccountInfo';
import EditUser from './Components/pages/EditUser';
import ManageUsers from './Components/pages/ManageUsers';
import CaseListReport from './Components/pages/CaseListReport';
import FilingActivityCase from './Components/pages/FilingActivityCase';
import FilingActivityByClient from './Components/pages/FilingActivityByClient';
import FilingActivityPayment from './Components/pages/FilingActivityPayment';
import NonAcceptedFiling from './Components/pages/NonAcceptedFiling';
import NewCaseListReport from './Components/pages/NewCaseListReport';
import ChangePassword from './Components/pages/ChangePassword';
import InvoiceList from './Components/pages/InvoiceList';
import UserPreference from './Components/pages/UserPreference';
import ServiceContact from './Components/pages/ServiceContact';
import PartyAddressBook from './Components/pages/PartyAddressBook';
import PaymentSetting from './Components/pages/PaymentSetting';
import EFiling from './Components/Efiling';
import Settings from './Components/Settings';
import Reports from './Components/Reports';
import Account from './Components/Account';
import EditUserById from './Components/pages/EditUserById'
import CaseSummary from './Components/pages/CaseSummary';
import InitiateCaseSummary from "./Components/pages/InitiateCaseSummary";
import EditCasePage from "./Components/pages/EditCasePage";
import ViewDocument from "./Components/pages/ViewDocument";
import EditForm from "./Components/pages/EditForm";
import Logout from './Components/Logout';
import EditSupportStaff from "./Components/pages/EditSupportStaff";
import CongratulationsPage from "./Components/CongratulationsPage";
import './styles/tailwind.css'; // Update the path if needed
import 'bootstrap/dist/css/bootstrap.min.css';




  const App = () => {

    // const token = sessionStorage.getItem('access_token');
    const isAuthenticated = !!sessionStorage.getItem('access_token');
    const location = useLocation();

    const SESSION_TIMEOUT = 60 * 60 * 1000; 

    // Function to handle logout
    const handleLogout = () => {
      sessionStorage.removeItem("access_token");
      window.location.href = "/tyler-filing/logout"; // Redirect to the login page
    };

    useEffect(() => {
      if (isAuthenticated) {
        const logoutTimer = setTimeout(() => {
          handleLogout();
        }, SESSION_TIMEOUT);
  
        // Clear the timeout if the component unmounts or session refreshes
        return () => clearTimeout(logoutTimer);
      }
    }, [isAuthenticated, SESSION_TIMEOUT]);

    //to hide navbar 
    const hideNavbar = ["/","/login", "/register","/logout","/CongratulationsPage"].includes(location.pathname);

  return (
      <div>
        {!hideNavbar && <Header/>}
        <Routes>

          {/* Public Route: Login */}
          {/* <Route path="/" element={isAuthenticated ? <Navigate to="/tyler-filing/" replace /> : <Login />} />
           */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/tyler-filing/dashboard" replace /> : <Login />} />
          <Route path="/register" element={<Register />} />       

          {/* Protected Route */}
          {/* e-filing page nested routing */}
          <Route path="/tyler-filing/"element={
              <ProtectedRoutes>
                <EFiling />
              </ProtectedRoutes>
               } >
              <Route index element={<Dashboard />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='initiateCase' element={<InitiateCase/>} />
              <Route path='existingCase' element={<ExistingCase/>}/>
              <Route path='createServeOnly' element={<CreateServeOnly/>}/>
              <Route path='filingStatus' element={<Status/>}/>
              <Route path='draftHistory' element={<DraftHistory/>}/>
              <Route path='caseList' element={<CaseList/>} />
              <Route path='notifications' element={<Notification/>}/>
              <Route path='caseSummary' element={<CaseSummary/>} />
              <Route path='initiateCaseSummary' element={<InitiateCaseSummary/>}/>
              <Route path='viewDocument' element={<ViewDocument/>}/>
              <Route path="editForm/:filingID" element={<EditForm/>}/>
            </Route>

          {/* setting page nested routing */}
          <Route path='/settings' element={
            <ProtectedRoutes>
              <Settings/>
            </ProtectedRoutes>
            }>
            <Route index element={<AccountInfo/>}/>
            <Route path='accountInfo' element={<AccountInfo/>}/>
            <Route path='editUser' element={<EditUser/>}/>
            <Route path='changePassword' element={<ChangePassword/>}/>
            <Route path='paymentSetting' element={<PaymentSetting/>}/>
            <Route path='manageUsers' element={<ManageUsers/>}/>
            <Route path='invoiceList' element={<InvoiceList/>}/>
            <Route path='userPreferences' element={<UserPreference/>}/>
            <Route path='servicesContact' element={<ServiceContact/>} />
            <Route path='partyAddress' element={<PartyAddressBook/>}/>
          </Route>

          {/* report page nested routing */}
          <Route path='/reports' element={
            <ProtectedRoutes>
             <Reports/>
           </ProtectedRoutes>
            }>
            <Route index element={<FilingReport/>}/>
            <Route path='filingActivity' element={<FilingReport/>}/>
            <Route path='filingActivityByCase' element={<FilingActivityCase/>}/>
            <Route path='filingActivityByClient' element={<FilingActivityByClient/>}/>
            <Route path='filingActivityByPayment' element={<FilingActivityPayment/>}/>
            <Route path='nonAcceptedFilingActivity' element={<NonAcceptedFiling/>}/>
            <Route path='caseListReport' element={<CaseListReport/>} />
            <Route path='newCaseListReport' element={<NewCaseListReport/>}/>
          </Route>
          
          {/* account page nested routing */}
          <Route path='/accounts' element={
            <ProtectedRoutes>
              <Account/>
            </ProtectedRoutes>
            }>
            <Route index  element={<AccountInfo/>}/>
            <Route path='accountInfo'  element={<AccountInfo/>}/>
            <Route path='manageUsers' element={<ManageUsers/>}/>
            <Route path='paymentSetting' element={<PaymentSetting/>}/>
            <Route path='invoiceList' element={<InvoiceList/>}/>
            <Route path='servicesContact' element={<ServiceContact/>} />
            <Route path='partyAddress' element={<PartyAddressBook/>}/>
            <Route path='/accounts/editUserById' element={<EditUserById/>}/>
            <Route path="/accounts/edit-support-staff/:id" element={<EditSupportStaff />} />
          </Route>
          
          <Route path='/initiateCaseSummary' element={<InitiateCaseSummary/>}/>
          <Route path='/support' element={<Support/>} />
          <Route path="/logout" element={<Logout/>}/>            
          <Route path="/CongratulationsPage" element={<CongratulationsPage />} />        
                    
                
          </Routes>
        </div>        

  );
}

export default App;


