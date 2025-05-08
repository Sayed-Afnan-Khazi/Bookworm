import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Container } from "@mui/material";
import { useAuth } from "../hooks/Auth";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { IconButton } from '@mui/material';
import TestImage1 from '../test-images/test-image1.jpg'
import TestImage2 from '../test-images/test-image2.jpg'
import TestImage3 from '../test-images/test-image3.jpg'
import TestImage4 from '../test-images/test-image4.jpg'
import TestImage5 from '../test-images/test-image5.jpg';
import FileCard from '../components/FileCard';

import {
    Typography,
    Box,
    Table,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from "@mui/material";
import Link from '@mui/material/Link';
import { useToast } from "../hooks/Toast";
import { styled } from '@mui/material/styles';


const getChatLastModifiedText = (utc_epoch_nanoseconds) => {
    const utc_epoch_ms = utc_epoch_nanoseconds/1000000;
  
    const now = Date.now();
    const diffInMs = now - utc_epoch_ms;
  
    const ONE_MINUTE = 60 * 1000; // in milliseconds
    const FIVE_MINUTES = 5 * ONE_MINUTE;
    const ONE_DAY = 24 * 60 * ONE_MINUTE;
  
    if (diffInMs < ONE_MINUTE) {
      return "Just now"
    } else if (diffInMs < FIVE_MINUTES) {
      return "A few minutes ago"
    } else if (diffInMs < ONE_DAY) {
      return "Today"
    } else {
      const send_date = new Date(utc_epoch_ms);
      return send_date.toDateString() + ', ' + send_date.toLocaleTimeString()
    }
  
}

const VisuallyHiddenFileInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Notebook = () => {
    const navigate = useNavigate();
    const { user_data } = useAuth();
    const { setErrorToast, setSuccessToast } = useToast();
    const notebook_id = useParams().notebook_id;

    const [notebookName,setNotebookName] = useState('');
    const [notebookChats,setNotebookChats] = useState([]);
    const [chatDialogOpen, setChatDialogOpen] = useState(false);
    const [newChatName, setNewChatName] = useState('');

    const getNotebookDetails = async () => {
      let response = await fetch('/api/notebook/'+notebook_id, {
          method: 'GET',
          headers: {'Authorization': `Bearer ${user_data.access_token_cookie}`},
      })
      const data = await response.json();
      if (data.error) {
          setErrorToast(data.error)
          navigate('/')
          return;
      }
      console.log('NB DATA',data)
      setNotebookChats(data?.chats);
      setNotebookName(data?.notebook.name);
    }

    useEffect(()=>{
        getNotebookDetails();
        // eslint-disable-next-line
    },[])

    const handleChatDialogClose = () => {
      setChatDialogOpen(false);
      setNewChatName('');
    };

    const handleCreateChat = async () => {
        const response = await fetch('/api/chat',{
          method:'POST',
          headers: {'Content-Type': 'application/json','Authorization': `Bearer ${user_data.access_token_cookie}`},
          body: JSON.stringify({
            'chat_name': newChatName,
            'notebook_id':notebook_id 
          })
        })
        const data = await response.json()
        if (data.error) {
          console.error(data.error)
          setErrorToast('An error occurred while creating the chat.')
          navigate('/')
          return;
        }
        setSuccessToast('Chat created successfully!')
        navigate(`/chat/${data.new_chat_id}`)

    }

    const uploadNoteBookFile = async (files) => {
      console.log('Uploading files',files)
      try {
        const formData = new FormData();
        for (let i = 0; i < files?.length; i++) {
          formData.append('files', files[i]);
        }
        formData.append('notebook_id',notebook_id)
        const response = await fetch('/api/notebook/upload',{
          method:'POST',
          headers: {'Authorization': `Bearer ${user_data.access_token_cookie}`},
          body: formData
        })
        const data = await response.json()
        if (data.error) {
          console.error(data.error)
          setErrorToast('An error occurred while uploading the file.')
          return;
        }
        setSuccessToast('File uploaded successfully!')
      } catch (error) {
        console.error('Error uploading file',error)
        setErrorToast('An error occurred while uploading the file.')
      }
    }
  

    return (
      <Container sx={{mt:6}}>
        <Typography variant="h2" component="h1" gutterBottom>
          {notebookName ? notebookName : "Loading"}
        </Typography>
        <Container sx={{backgroundColor: 'white',borderRadius: 5, padding: 2, marginBottom: 5}}>
          <Box >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" component="h1">
                Notebook Global Files 
              </Typography>
              <Button variant="contained" component="label" role={undefined} size="small" startIcon={<CloudUploadIcon />}>Upload
                <VisuallyHiddenFileInput
                  type="file"
                  onChange={(event) => uploadNoteBookFile(event.target.files)}
                  multiple
                />
              </Button>
            </Box>
              <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary' }}>
                <em>These files are referenced in every chat within this notebook, acting as this notebook's global context.</em>
              </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', overflowX : 'scroll'}}>
          <FileCard thumbnail_url={TestImage1}/>
          <FileCard thumbnail_url={TestImage2}/>
          <FileCard thumbnail_url={TestImage3}/>
          <FileCard thumbnail_url={TestImage4}/>
          <FileCard thumbnail_url={TestImage5}/>
          <FileCard thumbnail_url={TestImage1}/>
          <FileCard thumbnail_url={TestImage2}/>
          </Box>
        </Container>
        <Container sx={{backgroundColor: 'white',borderRadius: 5, padding: 2}}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography variant="h5" component="h1" gutterBottom>
            Notebook Chats
          </Typography>
          <Button variant="outlined" size="small" onClick={()=>setChatDialogOpen(true)} startIcon={<AddIcon/>}> New Chat</Button>
        </Box>
        {notebookChats.length > 0 ? (
          <Table>
          <TableHead>
            <TableRow>
            <TableCell sx={{textDecoration: 'underline'}}>Chat Name</TableCell>
            <TableCell sx={{textDecoration: 'underline'}}>Last Modified</TableCell>
            <TableCell sx={{textDecoration: 'underline'}}>Actions(TO DO LOL)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notebookChats.map((chat) => (
            <TableRow key={chat._id}>
              <TableCell>
              <Link
                href={`/chat/${chat._id}`}
              >
                {chat.name}
              </Link>
              </TableCell>
              <TableCell>
              {getChatLastModifiedText(chat.lastModified)}
              </TableCell>
              <TableCell><IconButton color='error'><DeleteOutlineIcon onClick={()=>setErrorToast('Attempting to delete chat.')}/></IconButton><IconButton color='secondary'><DriveFileRenameOutlineIcon></DriveFileRenameOutlineIcon></IconButton></TableCell>
            </TableRow>
            ))}
          </TableBody>
          </Table>
        ) : (
          <Typography>No chats found.</Typography>
        )}
        </Container>
        {/* Dialog for creating a new chat */}
      <Dialog 
        open={chatDialogOpen} 
        onClose={handleChatDialogClose}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Chat Name"
            type="text"
            fullWidth
            value={newChatName}
            autoComplete='off'
            onChange={(e) => setNewChatName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChatDialogClose}>Cancel</Button>
          <Button onClick={handleCreateChat} disabled={!newChatName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    )
}



export default Notebook