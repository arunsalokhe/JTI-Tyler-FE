import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Order, OrderContextType } from '../types';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedService, setSelectedService] = useState<string>('Court Filing');

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  return (
    <OrderContext.Provider value={{ orders, selectedService, setSelectedService, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
