import { io } from 'socket.io-client';
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import '@material/web/textfield/outlined-text-field';

const QuestionPage = () => {
    const [socket, setSocket] = useState(null);
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        const newSocket = io('http://localhost:8000/');
        newSocket.on('answer_chunk', (data) => {
            console.log(data.text.split(''))
            setAnswer(prev => prev + data.text)
        });
        newSocket.on('error', (data) => {
            console.error(data.message);
        });
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    const onFormSubmit = (event) => {
        event.preventDefault();
        setAnswer('');
        socket.emit('ask_question', { questionText });
    };

    return (
        <div>
            <div>
                <h1>Ask A Question</h1>
                {answer && <ReactMarkdown>{answer}</ReactMarkdown>}
            </div>
            <form 
                onSubmit={onFormSubmit} >
                <input 
                    type="text" 
                    onChange={(e) => setQuestionText(e.target.value)}
                />
                
                <button 
                    type="submit"
                    style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
        
                </button>
            </form>
        </div>
    );
};

export default QuestionPage;