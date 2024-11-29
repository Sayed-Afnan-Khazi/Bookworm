import { Snackbar } from "@mui/material";
import { createContext, useContext, useState } from "react";


const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState('');
    
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setToast('');
    }
    return (
        <ToastContext.Provider value={{toast, setToast}}>
            <Snackbar
                open={toast ? true : false}
                autoHideDuration={1000}
                onClose={handleClose}
                message={toast}
            />
            {children}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    return useContext(ToastContext);
}