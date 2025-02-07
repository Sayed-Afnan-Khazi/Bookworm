import { io } from 'socket.io-client';
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import SendIcon from '@mui/icons-material/Send';
import { Skeleton } from '@mui/material'; // Add Skeleton import
import { Box, InputAdornment, IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Container from '@mui/material/Container';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/material';
import { styled } from '@mui/system';

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#222222',
};

const Textarea = styled(BaseTextareaAutosize)(
  ({ theme }) => `
  box-sizing: border-box;
  width: 100%;
  font-family: Helvetica, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 12px;
  resize: none;
  border-radius: 12px 12px 12px 12px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 0px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};



  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

const QuestionPage = () => {
    const [socket, setSocket] = useState(null);
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    useEffect(() => {
        const newSocket = io('/');
        newSocket.on('answer_chunk', (data) => {
            console.log("Receiving from socket:",data.text)
            setIsLoading(false);
            setAnswer(prev => prev + data.text)
        });
        newSocket.on('error', (data) => {
            console.log("Error from socket:",data.message)
            setIsLoading(false);
            console.log(data.message);
        });
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    // useEffect(()=>{
    //   console.log(questionText)
    // },[questionText])

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onFormSubmit(event);
        }
    };

    const onFormSubmit = (event) => {
        event.preventDefault();
        console.log(questionText);
        setAnswer('');
        setQuestionText('');
        console.log("Sending to socket:",questionText)
        setIsLoading(true); // Set loading to true when sending question
        socket.emit('ask_question', { questionText });
    };

    return (
          <Container>
            
            <div style={{
                flex: 1,
                marginBottom: '80px',
                padding: '0 20px',
            }}>
                {isLoading ? (
                    <>
                        <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="80%" />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="70%" />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="75%" />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="80%" />
                    </>
                ) : (
                    answer && <ReactMarkdown>{answer}</ReactMarkdown>
                )}
            </div>
            <Container maxWidth="md"
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px',
            }}>
            <Box
                sx={{
                  backgroundColor: '',
                  borderRadius: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 18px',
                }}
                >
                <InputAdornment position="start">
                    <IconButton edge="start" sx={{ color: '#ccc' }}>
                        <AttachFileIcon />
                    </IconButton>
                </InputAdornment>
                <Textarea aria-label="empty textarea" maxRows={5} placeholder="Ask a question..." value={questionText} onChange={(e)=>setQuestionText(e.target.value)} onKeyDown={handleKeyDown}/> 
                <InputAdornment position="end">
                    <IconButton edge="end" sx={{ color: '#ccc' }} onClick={onFormSubmit}>
                        <SendIcon/>
                    </IconButton>
                </InputAdornment>
            </Box>
            </Container>
        </Container>
    );
};

export default QuestionPage;