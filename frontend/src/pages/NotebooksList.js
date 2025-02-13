import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/Auth';
import { useToast } from '../hooks/Toast';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { IconButton } from '@mui/material';

const getNotebookLastModifiedText = (utc_epoch_nanoseconds) => {
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

const NotebooksList = () => {
  const { isLoggedIn, user_data } = useAuth();
  const [notebooks, setNotebooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const navigate = useNavigate();
  const { setErrorToast, setSuccessToast } = useToast();

  async function getNoteBooks() {
    // Note: The API sends notebooks in reverse chronological order - latest `lastModified` is first.
    if (isLoggedIn) {
      let response = await fetch('/api/notebooks',{
        method: 'GET',
        headers: {'Authorization': `Bearer ${user_data.access_token_cookie}`},
      })
      const data = await response.json()
      setNotebooks(data.notebooks);
    } else {
      setErrorToast("Unable to fetch notebooks.")
      navigate('/')
    }
  }
  useEffect(() => {
    getNoteBooks();
  }, []);

  const handleNotebookClick = (notebookId) => {
    navigate(`/notebook/${notebookId}`);
  };

  const handleFabClick = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setNewNotebookName('');
  };

  const handleCreateNotebook = () => {
    console.log("Creating a notebook: user_data",user_data)
    fetch('/api/notebooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user_data.access_token_cookie}`,
      },
      body: JSON.stringify({ name: newNotebookName }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setSuccessToast(`Created notebook ${data.notebook_name}`)
        } else {
          setErrorToast(`Unknown error creating notebook`)
        }
        getNoteBooks()
        handleDialogClose();
      })
      .catch((error) => {
        console.error('Error creating notebook:', error);
        setErrorToast(`Error creating a notebook: ${error}`)
      });
  };

  return (
    <Container sx={{mt:6}}>
      <Typography variant="h2" component="h1" gutterBottom>
        Your Notebooks
      </Typography>
      <Container sx={{backgroundColor: 'white',borderRadius: 5, padding: 2}}>
      {notebooks.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{textDecoration: 'underline'}}>Notebook Name</TableCell>
              <TableCell sx={{textDecoration: 'underline'}}>Last Modified</TableCell>
              <TableCell sx={{textDecoration: 'underline'}}>Actions(TO DO LOL)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notebooks.map((notebook) => (
              <TableRow key={notebook._id}>
                <TableCell>
                  <Link
                    component="button"
                    onClick={() => handleNotebookClick(notebook._id)}
                  >
                    {notebook.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {getNotebookLastModifiedText(notebook.lastModified)}
                </TableCell>
                <TableCell><IconButton color='error'><DeleteOutlineIcon onClick={()=>setErrorToast('Attempting to delete Notebook.')}/></IconButton><IconButton color='secondary'><DriveFileRenameOutlineIcon></DriveFileRenameOutlineIcon></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography>No notebooks found.</Typography>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleFabClick}
        style={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      {/* Dialog for creating a new notebook */}
      <Dialog 
        open={open} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>Create New Notebook</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notebook Name"
            type="text"
            fullWidth
            value={newNotebookName}
            autoComplete='off'
            onChange={(e) => setNewNotebookName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleCreateNotebook} disabled={!newNotebookName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Container>
  );
};

export default NotebooksList;