import React, { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { Box } from '@mui/material';
import AnnotationsParamsContent from './AnnotationsParamsContent/AnnotationsParamsContent';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function AnnotationsParamsDialog({ creatingJob, setCreatingJob }) {

    //const [loading, setLoading] = useState(false);

    return (
        <Dialog
            fullScreen
            open={creatingJob == 'annotations-params'}
            TransitionComponent={Transition}
            sx={{zIndex:10}}
        >
            <AppBar sx={{ position: 'relative', backgroundColor: 'rgba(160, 0, 0, 1)' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setCreatingJob('ask-annotations')}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Metabolomic Putative Annotations
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box className="m-2">
                <AnnotationsParamsContent />
            </Box>
        </Dialog>
    )
}