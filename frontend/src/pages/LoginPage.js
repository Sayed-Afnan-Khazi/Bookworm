import React, { useEffect } from 'react';
import { Card, Container, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
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
                Login to Bookworm securely with Google.
            </Typography>
            <Card>
                <CardContent>
                    <Typography variant="h6" component="h1" gutterBottom>
                        By logging in and creating an account, you agree to Bookworm's Terms of Service and Privacy Policy.
                    </Typography>
                    <CardActions>
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                handleLogin(credentialResponse);
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                            useOneTap
                            />
                    </CardActions>
                    </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;