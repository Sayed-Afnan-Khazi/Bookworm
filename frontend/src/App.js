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
import UploadPage from './pages/UploadPage';
import Notebook from './pages/Notebook';
import NotebooksList from './pages/NotebooksList';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const customTheme = createTheme({
	typography: {
		fontFamily: [
		  'ClashGrotesk',
		]
	},
	palette: {
	  text: {
		primary: '#0e0f11',
	  },
	  background: {
		default: '#eff2f6',
		// paper: '#fafffc'
	  },
	  primary: {
		main: '#223c67',
	  },
	  secondary: {
		main: '#73a8de',
	  },
	  accent: {
		main: '#1975d2',
	  },
	},
	// components: {
	//   MuiCssBaseline: {
	// 	styleOverrides: {
	// 	  ':root': {
	// 		'--text': '#0e0f11',
	// 		'--background': '#eff2f6', 
	// 		'--primary': '#236c44',
	// 		'--secondary': '#88b5d8',
	// 		'--accent': '#3953b1',
	// 	  },
	// 	},
	//   },
	// },
  });


const App = () => {
	return (
		/// Add breadcrumbs sitewide
		/// https://mui.com/material-ui/react-breadcrumbs/#integration-with-react-router
		///
		<ToastProvider>
		<AuthProvider>
			<GoogleOAuthProvider clientId="499048419040-ms4consf86oumjb2rtnebvb7d6j98kr2.apps.googleusercontent.com">
				<ThemeProvider theme={customTheme}>
				<CssBaseline />
					<div className="App">
						<Router>
						<NavBar/>
							<Routes>
								<Route path="/" element={<HomePage/>}/>
								<Route path="/login" element={<LoginPage/>}/>
								<Route path="/notebooks" element={<ProtectedRoute><NotebooksList/></ProtectedRoute>}/>
								<Route path="/notebook/:notebook_id" element={<ProtectedRoute><Notebook/></ProtectedRoute>} />
								<Route path="/chat/:chat_id" element={<ProtectedRoute><QuestionPage/></ProtectedRoute>} />
								<Route path="*" element={<ErrorPage/>}/>
							</Routes>
						</Router>
					</div>
				</ThemeProvider>
			</GoogleOAuthProvider>
		</AuthProvider>
		</ToastProvider>
	);
}

export default App;
