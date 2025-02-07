import { useParams } from "react-router-dom";
import { Container } from "@mui/material";

const Notebook = () => {
    const notebook_id = useParams().notebook_id;
    return (
        <Container>
            {notebook_id}
        </Container>
    )
}

export default Notebook