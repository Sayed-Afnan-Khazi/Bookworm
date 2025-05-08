import { useState } from 'react'
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Menu} from "@mui/material";
import MenuItem from '@mui/material/MenuItem';
import {
    Typography,
    Card, 
} from "@mui/material";
import { IconButton } from '@mui/material';

function FileCard({file_name, thumbnail_url}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
      <Card sx={{ maxWidth: 300, minWidth: 250, m: 2}}>
        <CardActionArea>
      <CardMedia
        component="img"
        height="160"
        sx={{objectFit: 'cover'}}
        image={thumbnail_url? thumbnail_url : '#'}
        alt="green iguana"
      />
        </CardActionArea>
        <CardActions sx={{paddingTop: 0, backgroundColor: 'secondary.main',display: 'flex', alignItems: 'center', justifyContent: 'space-between',paddingY: 1}}>
          <Typography variant="h6" component="div" >
              {file_name ? file_name : 'Untitled file'}
          </Typography>
          <div>
            <IconButton 
              size="small"
              onClick={handleClick}
              aria-controls={open ? 'options-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <MoreVertIcon/>
            </IconButton>
            <Menu
              id="options-menu"
              sx={{backgroundColor:"error"}}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
            'aria-labelledby': 'options-button',
              }}
            >
              <MenuItem onClick={handleClose}>Delete</MenuItem>
              <MenuItem onClick={handleClose}>Rename</MenuItem>
              <MenuItem onClick={handleClose}>Download</MenuItem>
            </Menu>
          </div>
        </CardActions>
      </Card>
    );
  }

export default FileCard