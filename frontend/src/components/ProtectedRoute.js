// components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/Auth';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;