import { Navigate } from 'react-router-dom';

const CustomerRoute = ({ children }) => {
  // Customer routes only care about customer auth; admin auth is stored separately
  const stored = localStorage.getItem('parkmate_user') || localStorage.getItem('parkeasy_user');
  // Regardless of role, allow access – customer and admin sessions are independent per tab
  return children;
};

export default CustomerRoute;

