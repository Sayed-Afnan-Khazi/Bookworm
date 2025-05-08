import { Container } from "@mui/material";
import {Typography} from "@mui/material";

const ErrorPage = () => {
    return (
        <Container>
            <Typography variant="h1" align="center">Oh oh.</Typography>
            <Typography variant="h3" align="center">The page you were looking for was not found.</Typography>
        </Container>
    )
}

export default ErrorPage;