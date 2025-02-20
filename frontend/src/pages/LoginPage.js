import React, { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/Auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const {isLoggedIn, handleLogin} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/notebooks');
        }
    });

    return (
        <Container 
            maxWidth="sm" 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mt: 8 
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                Login to Book-keeper securely with Google.
            </Typography>
            <GoogleLogin
                onSuccess={credentialResponse => {
                    handleLogin(credentialResponse);
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
                useOneTap
                />
        </Container>
    );
};

export default LoginPage;