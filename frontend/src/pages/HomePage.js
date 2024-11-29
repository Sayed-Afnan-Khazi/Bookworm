import { useState } from "react";
import {useNavigate} from 'react-router-dom';
// import { useToast } from "../hooks/Toast";
import { useAuth } from "../hooks/Auth";

const HomePage = () => {
    const [file, setFile] = useState(null);
    const {isLoggedIn} = useAuth();
    // const {setToast} = useToast()
    const navigate = useNavigate()

    const onFormSubmit = async (event) => {
        event.preventDefault()

        const formData = new FormData()
        formData.append('file',file)
        // setToast("hi")
        let response = await fetch('/api/upload',{
            method:'POST',
            body: formData
        })
        console.log('response :>> ', response);
        if (response.ok) {
            response = await response.json()
            navigate('/question')
        }
    }

    const fileInputChange = (event) => {
        setFile(event.target.files[0])
    }
    return (
        <div>
            <h1>Book Keeper</h1>
            <p>Upload your book and get summary</p>
            {isLoggedIn ? <p>Logged in</p> : <p>Not logged in</p>}
            <form onSubmit={onFormSubmit}>
                <input type="file" onChange={fileInputChange}/>
                <input type="submit" />
            </form>
        </div>
    );
}

export default HomePage;