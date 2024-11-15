import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);
    return (
        <div>
            An error occurred.
            {error.statusText || error.message}
        </div>
    )
}

export default ErrorPage;