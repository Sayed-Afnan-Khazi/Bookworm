import { Snackbar } from "@mui/material";
import Alert from '@mui/material/Alert';
import { createContext, useContext, useState } from "react";


const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [successToast, setSuccessToast] = useState('');
    const [errorToast, setErrorToast] = useState('');
    const [warningToast, setWarningToast] = useState('');
    const [infoToast, setInfoToast] = useState('');

    const handleSnackBarClose = (event, reason) => {
        // Close the snackbar by setting all the toast messages to empty string
        if (reason === 'clickaway') {
            return;
        }
        setSuccessToast('');
        setErrorToast('');
        setWarningToast('');
        setInfoToast('');
    }
    const handleSuccessToastClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSuccessToast('');
    }

    const handleErrorToastClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setErrorToast('');
    }

    const handleWarningToastClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setWarningToast('');
    }

    const handleInfoToastClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setInfoToast('');
    }
    return (
        <ToastContext.Provider value={{ setSuccessToast, setErrorToast, setWarningToast, setInfoToast }}>
            <Snackbar
                open={(successToast || errorToast || warningToast || infoToast) ? true : false}
                anchorOrigin={{ vertical: 'top', horizontal:'center' }}
                autoHideDuration={2000}
                onClose={handleSnackBarClose}
            >
                <div style={{width: '100%'}}>
                    {successToast && <Alert severity="success" onClose={handleSuccessToastClose} variant="filled" sx={{width: '100%', marginBottom: '10px'}}>
                        {successToast}
                    </Alert>}
                    {errorToast && <Alert severity="error" onClose={handleErrorToastClose} variant="filled" sx={{width: '100%', marginBottom: '10px'}}>
                        {errorToast}
                    </Alert>}
                    {warningToast && <Alert severity="warning" onClose={handleWarningToastClose} variant="filled" sx={{width: '100%', marginBottom: '10px'}}>
                        {warningToast}
                    </Alert>}
                    {infoToast && <Alert severity="info" onClose={handleInfoToastClose} variant="filled" sx={{width: '100%', marginBottom: '10px'}}>
                        {infoToast}
                    </Alert>}
                </div>
            </Snackbar>
            {children}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    return useContext(ToastContext);
}