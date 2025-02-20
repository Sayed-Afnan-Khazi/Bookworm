import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import SendIcon from '@mui/icons-material/Send';
import { Skeleton } from '@mui/material'; // Add Skeleton import
import { Box, InputAdornment, IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Container from '@mui/material/Container';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/material';
import { styled} from '@mui/system';
import Avatar from '@mui/material/Avatar';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/Auth';
import { useToast } from '../hooks/Toast';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

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
    const chat_id = useParams().chat_id;
    const { user_data } = useAuth();
    const { setErrorToast, setSuccessToast } = useToast();
    const navigate = useNavigate();


    const [socket, setSocket] = useState(null);
    const [questionText, setQuestionText] = useState({"role":"user","parts":['']});

    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const [chatName,setChatName] = useState('')
    const [chatHistory, setChatHistory] = useState([]);
    const chatContainerRef = useRef(null);

    const getChatDetails = async () => {
        let response = await fetch('/api/chat/'+ chat_id, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${user_data.access_token_cookie}`},
        })
        const data = await response.json();
        if (data.error) {
            setErrorToast(data.error)
            navigate('/')
        }
        console.log('Chat DATA',data)
        setChatHistory(data.chat_history);
        setChatName(data.name);
    }

    // On load -> Get chat history and files
    useEffect(()=> {
        getChatDetails()
    },[])

    useEffect(() => {
        const newSocket = io('/');
        newSocket.on('answer_chunk', (data) => {
            console.log("Receiving from socket:",data.text)
            setIsLoading(false);
            setChatHistory(prevHistory => {
                const newHistory = [...prevHistory];
                console.log("New history",newHistory)
                newHistory[newHistory.length - 1].parts[0] += data.text;
                return newHistory;
            });
        });
        newSocket.on('error', (data) => {
            console.log("Error from socket:",data.message)
            setIsLoading(false);
            setErrorToast(data.message)
            console.log(data.message);
        });
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    // useEffect to scroll to bottom whenever chatHistory changes
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onFormSubmit(event);
        }
    };

    const onFormSubmit = (event) => {
        event.preventDefault();
        setQuestionText({...questionText,"parts":['']});
        setChatHistory([...chatHistory, questionText, {"role":"assistant","parts":['']}]);
        console.log("Sending to socket:",questionText)
        setIsLoading(true); // Set loading to true when sending question
        socket.emit('ask_question', {...questionText,chat_id,access_token:user_data.access_token_cookie});
    };

    return (
          <Container sx={{height: '90vh'}}>
              <Typography variant="h4" component="h4" sx={{padding: '20px 7vw 15px'}}>
              {chatName ? chatName : "Loading"}
              </Typography>
            <Container maxWidth="md" ref={chatContainerRef} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '20px 3vw',
                height: '70vh',
                overflowY: 'scroll'
            }}>
                {chatHistory && chatHistory.map((chatText) => {
                    if (chatText.role==="assistant") {
                        return (
                            <Container sx={{display:'flex',flexDirection: 'row', alignItems: 'flex-end',marginBottom: 2}}>
                                <Avatar sx={{height:'30px', width:'30px',margin:'0px 7px 0px 0px'}} > <LocalLibraryIcon color='primary'></LocalLibraryIcon> </Avatar>
                                {(isLoading && chatText.parts[0] === '') ? (
                                    <>
                                        <Container sx={{display:'flex',flexDirection: 'column',alignSelf:'flex-start',paddingX:'25px',}}>
                                            <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="80%" />
                                            <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="70%" />
                                            <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="75%" />
                                            <Skeleton variant="text" sx={{ fontSize: '1rem', marginBottom: 1 }} width="80%" />
                                        </Container>
                                    </>
                                ):
                                (<Box sx={{alignSelf:'flex-start',backgroundColor:'secondary.main', paddingX:'25px',borderRadius:'15px 15px 15px 0px'}}>
                                    <ReactMarkdown>
                                        {chatText.parts[0]}
                                    </ReactMarkdown>
                                </Box>)}
                            </Container>
                        )
                    } else if (chatText.role==="user") {
                        return (
                            <Container sx={{display:'flex',flexDirection: 'row-reverse', alignItems: 'flex-start',marginBottom: 2}}>
                                <Avatar sx={{height:'30px', width:'30px',margin:'0px 0px 0px 7px'}} src={user_data.user.picture}></Avatar>
                                <Box sx={{alignSelf: 'flex-end',backgroundColor: 'white', paddingX:'25px',borderRadius:'15px 0px 15px 15px'}}> 
                                    <ReactMarkdown>
                                        {chatText.parts[0]} 
                                    </ReactMarkdown>
                                </Box>
                            </Container>
                        )
                    } else {
                        return (
                            <></>
                        )
                    }
                })
                }

            </Container>
            <Container maxWidth="md"
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px',
                zIndex: 100,
            }}>
            <Box
                sx={{
                  borderRadius: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0px 0px 8px',
                }}
                >
                <InputAdornment position="start">
                    <IconButton edge="start" sx={{ color: 'primary.main' }}>
                        <AttachFileIcon />
                    </IconButton>
                </InputAdornment>
                <Textarea aria-label="empty textarea" maxRows={5} placeholder="Ask a question..." value={questionText.parts[0]} onChange={(e)=>setQuestionText({...questionText,"parts":[e.target.value]})} onKeyDown={handleKeyDown}/> 
                <InputAdornment position="end">
                    <IconButton edge="end" sx={{ color: 'primary.main' }} onClick={onFormSubmit}>
                        <SendIcon/>
                    </IconButton>
                </InputAdornment>
            </Box>
            </Container>
        </Container>
    );
};

export default QuestionPage;