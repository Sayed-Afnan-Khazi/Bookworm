import { useState } from "react";
import {useNavigate} from 'react-router-dom';
import Container from '@mui/material/Container';

const HomePage = () => {
    const [file, setFile] = useState(null);
    const navigate = useNavigate()

    const onFormSubmit = async (event) => {
        event.preventDefault()

        const formData = new FormData()
        formData.append('file',file)
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
        <Container>
            <h1>Book Keeper</h1>
            <p>Upload your book and get summary</p>
            <form onSubmit={onFormSubmit}>
                <input type="file" onChange={fileInputChange}/>
                <input type="submit" />
            </form>
        </Container>
    );
}

export default HomePage;