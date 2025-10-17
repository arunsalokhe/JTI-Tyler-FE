export interface User {
  id?: string;
  email: string;
  name: string;
  role?: string;
}

export interface Service {
  id: number;
  name: string;
  path: string;
  description?: string;
}

export interface Order {
  id: string;
  serviceId: number;
  serviceName: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  IN_PROGRESS = 'in_progress',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  status: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export interface OrderContextType {
  orders: Order[];
  selectedService: string;
  setSelectedService: (service: string) => void;
  addOrder: (order: Order) => void;
}
