import { googleLogout } from "@react-oauth/google";
import { useState, createContext, useContext, useEffect } from "react";

const authContext = createContext();

// context Provider
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); // Needed to handle the async loading state of the auth context, other components were pulling the wrong values of state from the context before this was added.

    // Function to check authentication status
    const checkAuthStatus = async () => {
        try {
            const local_data = JSON.parse(localStorage.getItem('data'));
            const response = await fetch('/api/check-auth', {
                method: 'GET',
                headers: {'Authorization': `Bearer ${local_data.access_token_cookie}`},
            });
            if (response.ok) {
                const data = await response.json();
                setIsLoggedIn(true);
                console.log('checkAuth ran: data.user :>> ', data.user);
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('data')) {
            const data = JSON.parse(localStorage.getItem('data'));
            setIsLoggedIn(true);
            setUser(data.user);
            console.log('useEffect ran: data.user :>> ', data.user);
            checkAuthStatus().finally(()=>setIsAuthLoading(false));
        } else {
            setIsAuthLoading(false);
        }
    }, []);

    const handleLogin = async (codeResponse) => {
        const response = await fetch('/api/login',{
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ credential: codeResponse?.credential }),
          });
        if (response.ok) {
            const data = await response.json();
            if (data) {
                console.log('Login Successful', data);
                setIsLoggedIn(true);
                setUser(data.user); // The user state will also contain the user's name, notebooks.
                console.log('login ran: data.user :>> ', data.user);
                localStorage.setItem('data', JSON.stringify(data));
            } else {
                console.log('Login Failed');
            }
        }
    }

    // Handle logout
    const handleLogout = async () => {
        const local_data = JSON.parse(localStorage.getItem('data'));
        await fetch('/api/logout', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${local_data.access_token_cookie}`},
        });
        setIsLoggedIn(false);
        googleLogout();
        localStorage.removeItem('data');
        setUser(null);
    };
    return (
        <authContext.Provider value={{ isLoggedIn, handleLogin, user , handleLogout, isAuthLoading}}>
            {children}
        </authContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(authContext);
};