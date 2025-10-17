import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { router } from './routes/routes.tsx';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <OrderProvider>
        <RouterProvider router={router} />
      </OrderProvider>
    </AuthProvider>
  );
};

export default App;