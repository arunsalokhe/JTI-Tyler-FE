import { createBrowserRouter } from 'react-router-dom';
import Login from '../components/auth/Login/Login';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import CaseInfo from '../services/2-ProcessServing/components/CaseInfo';
import CaseParticipants from '../services/2-ProcessServing/components/CaseParticipants';
import DocumentsUpload from '../services/2-ProcessServing/components/DocumentsUpload';
import ServeInfo from '../services/2-ProcessServing/components/ServeInfo';
import OrderDetails from '../services/2-ProcessServing/components/OrderDetails';

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
]);