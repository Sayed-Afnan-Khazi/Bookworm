// components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/Auth';
import { CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, isAuthLoading } = useAuth();
    if (isAuthLoading) {
        return <CircularProgress />;
    }
    console.log('isLoggedIn :>> ', isLoggedIn);
    return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;