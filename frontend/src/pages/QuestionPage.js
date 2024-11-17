import { io } from 'socket.io-client';
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import SendIcon from '@mui/icons-material/Send';
import { Button, Skeleton } from '@mui/material'; // Add Skeleton import

const QuestionPage = () => {
    const [socket, setSocket] = useState(null);
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    useEffect(() => {
        const newSocket = io('http://localhost:8000/');
        newSocket.on('answer_chunk', (data) => {
            setIsLoading(false);
            setAnswer(prev => prev + data.text)
        });
        newSocket.on('error', (data) => {
            setIsLoading(false);
            console.error(data.message);
        });
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    const onFormSubmit = (event) => {
        event.preventDefault();
        setAnswer('');
        setIsLoading(true); // Set loading to true when sending question
        socket.emit('ask_question', { questionText });
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '20px'
            }}>
                <h1>Ask A Question</h1>
            </div>
            <div style={{ 
                flex: 1,
                marginBottom: '80px',
                padding: '0 20px'
            }}>
                {isLoading ? (
                    <>
                        <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="80%" />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="70%" />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="75%" />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="60%" />
                    </>
                ) : (
                    answer && <ReactMarkdown>{answer}</ReactMarkdown>
                )}
            </div>
            <form 
                onSubmit={onFormSubmit}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px',
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'inherit'
                }}>
                <input 
                    type="text" 
                    onChange={(e) => setQuestionText(e.target.value)}
                    style={{
                        width: '70%',
                        padding: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        color: 'black',
                        border: 'none',
                        borderRadius: '20px',
                        outline: 'none',
                        boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                    }}
                />
                <Button variant="text" onClick={onFormSubmit}>
                    <SendIcon />
                </Button>
            </form>
        </div>
    );
};

export default QuestionPage;