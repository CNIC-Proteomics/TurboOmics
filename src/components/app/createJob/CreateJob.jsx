import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { Box } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateJob({ page, setPage }) {
    console.log(page)
    return (
        <div>
            <Dialog
                fullScreen
                open={page == 'create-job'}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative', backgroundColor: 'rgba(160, 0, 0, 1)' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => setPage('new-job')}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Metabolomic Putative Annotations
                        </Typography>
                        <Button autoFocus color="inherit" onClick={() => console.log('save')}>
                            save
                        </Button>
                    </Toolbar>
                </AppBar>
                <Box className="m-2">
                    Configure Metabolomics Putative Annotations
                </Box>
            </Dialog>
        </div>
    )
}
