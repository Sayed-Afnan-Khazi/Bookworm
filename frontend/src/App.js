import './App.css';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import NavBar from './components/NavBar';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './hooks/Auth';
import { ToastProvider } from './hooks/Toast';

import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';
import QuestionPage from './pages/QuestionPage';
import LoginPage from './pages/LoginPage';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});


const App = () => {
	return (
		<AuthProvider>
			<GoogleOAuthProvider clientId="499048419040-ms4consf86oumjb2rtnebvb7d6j98kr2.apps.googleusercontent.com">
				<ToastProvider>
				<ThemeProvider theme={darkTheme}>
				<CssBaseline />
					<div className="App">
						<Router>
						<NavBar/>
							<Routes>
								<Route path="/" element={<HomePage/>}/>
								<Route path="/question" element={<ProtectedRoute><QuestionPage/></ProtectedRoute>}/>
								<Route path="/login" element={<LoginPage/>}/>
								<Route path="*" element={<ErrorPage/>}/>
							</Routes>
						</Router>
					</div>
				</ThemeProvider>
				</ToastProvider>
			</GoogleOAuthProvider>
		</AuthProvider>
	);
}

export default App;
