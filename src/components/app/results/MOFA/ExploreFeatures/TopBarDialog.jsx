import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import { Box, Typography, IconButton, Toolbar, AppBar } from '@mui/material';

function TopBarDialog({ setExploreF, title }) {
    return (
        <AppBar sx={{ position: 'relative', backgroundColor: '#666666' }}>
            <Toolbar>
                <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ width: '5%' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => {setExploreF(false)}}
                            aria-label="close" 
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ pt: 0.5, textAlign: 'center', width: '90%' }}>
                        <Typography sx={{ ml: 2 }} variant="h6" component="div">
                            {title}
                        </Typography>
                    </Box>
                    <Box sx={{ width: '5%' }}></Box>
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default TopBarDialog