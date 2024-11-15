import './App.css';
// import { useState, useEffect } from 'react';
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
const App = () => {
	return (
		<div className="App">
			<RouterProvider router={router}/>
		</div>
	);
}

export default App;
