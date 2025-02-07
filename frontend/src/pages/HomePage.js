import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useAuth } from '../hooks/Auth';

const HomePage = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const handleGetStarted = () => {
        if (isLoggedIn) {
            navigate('/notebooks');
            return;
        } else {
            navigate('/login');
        }
    };

    return (
        <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h1" component="h1" gutterBottom>
                Book-Keeper
            </Typography>
            <Typography variant="h5" component="p" gutterBottom>
                The better way to study, with AI.
            </Typography>
            <Box mt={4}>
                <Button variant="contained" color="primary" onClick={handleGetStarted}>
                    {isLoggedIn ? "View Notebooks" : "Get Started"}
                </Button>
            </Box>
        </Container>
    );
}

export default HomePage;