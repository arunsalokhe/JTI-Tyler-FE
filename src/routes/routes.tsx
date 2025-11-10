import { createBrowserRouter } from 'react-router-dom';
import Login from '../components/auth/Login/Login';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import CaseInfo from '../services/2-ProcessServing/components/CaseInfo';
import CaseParticipants from '../services/2-ProcessServing/components/CaseParticipants';
import DocumentsUpload from '../services/2-ProcessServing/components/DocumentsUpload';
import ServeInfo from '../services/2-ProcessServing/components/ServeInfo';
import OrderDetails from '../services/2-ProcessServing/components/OrderDetails';
import EFiling from "../services/TylerFiling/src/TylerFilingApp.jsx";
import NewCase from '../services/JTIFiling/components/NewCase.tsx';
import AddParty from '../services/JTIFiling/components/AddParty.tsx';
import AddPartyWithFiledAsTo from '../services/JTIFiling/components/AddPartyWithFiledAsTo.tsx';
import UploadDocuments from '../services/JTIFiling/components/Uploaddocuments.tsx';
import Checkout from '../services/JTIFiling/components/Checkout.tsx';
import HomePage from '../services/JTIFiling/components/Jtihomepage.tsx';
import SubsequentPage from '../services/JTIFiling/components/SubsequentFiling.tsx';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/services/process-serving/case-info',
    element: <CaseInfo />,
  },
  {
    path: '/services/process-serving/case-participants',
    element: <CaseParticipants />,
  },
  {
    path: '/services/process-serving/documents-upload',
    element: <DocumentsUpload />,
  },
  {
    path: '/services/process-serving/serve-info',
    element: <ServeInfo />,
  },
  {
    path: '/services/process-serving/order-details',
    element: <OrderDetails />,
  },
  {
    path: '/services/jti-filing/home-page',
    element: <HomePage />,
  },
  {
    path: '/services/jti-filing/new-case',
    element: <NewCase />,
  },
  {
    path: '/services/jti-filing/add-party',
    element: <AddParty />,
  },
  {
    path: '/services/jti-filing/add-PartyWithFiledAsTo',
    element: <AddPartyWithFiledAsTo />,
  },
  {
    path: '/services/jti-filing/upload-documents',
    element: <UploadDocuments />,
  },
  {
    path: '/services/jti-filing/checkout',
    element: <Checkout />,
  },
    {
    path: '/services/jti-filing/subsequent-filing',
    element: <SubsequentPage />,
  },
  {
    path: "/tyler-filing/*",
    element: <EFiling />
  }

]);