import { useState } from "react";
import {useNavigate} from 'react-router-dom';


const HomePage = () => {
    const [file, setFile] = useState(null);
    const navigate = useNavigate()

    const onFormSubmit = async (event) => {
        event.preventDefault()

        const formData = new FormData()
        formData.append('file',file)
        console.info("hi")
        let response = await fetch('http://localhost:8000/api/upload',{
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
            <form onSubmit={onFormSubmit}>
                <input type="file" onChange={fileInputChange}/>
                <input type="submit" />
            </form>
        </div>
    );
}

export default HomePage;