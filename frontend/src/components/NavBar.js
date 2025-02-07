import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import NotebookSelector from './NotebookSelector';
import { useAuth } from '../hooks/Auth';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { isLoggedIn, user_data, handleLogout } = useAuth();
  const navigate = useNavigate();
  console.log('isLoggedIn :>> ', isLoggedIn);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={()=>navigate('/')}>
            Book-keeper
          </Typography>
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {console.log('user_data :>> ', user_data)}
              {/* <NotebookSelector NotebookList={user_data.notebooks.map((notebook) => notebook.name)}/> */}
              <IconButton
                size="large"
                aria-label="account of current user_data"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ height: '100%' }}
              >
                {console.log('user_data lol', user_data)}
                <Avatar sx={{height:'30px', width:'30px'}} src={user_data.user.picture}></Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{marginX: '6px'}}>
                Not Logged In
            </Typography>
            <IconButton
            size="large"
            aria-label="Not logged in icon"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <PersonOffIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={()=>navigate('/login')}>Login</MenuItem>
          </Menu>
          </div>)
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}
