import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';
import QuestionPage from './pages/QuestionPage';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

const router = createBrowserRouter([
	{
		path:'/',
		element: <HomePage/>,
		errorElement: <ErrorPage/>
	},
	{
		path: '/question',
		element: <QuestionPage/>
	}
])

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});


const App = () => {
	return (
		<ThemeProvider theme={darkTheme}>
		<CssBaseline />
			<div className="App">
				<RouterProvider router={router}/>
			</div>
		</ThemeProvider>
	);
}

export default App;
