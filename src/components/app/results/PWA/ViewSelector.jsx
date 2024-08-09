import { Box, Typography } from '@mui/material'
import React, { useState } from 'react'
import {  useDispatchResults } from '../../ResultsContext'

const ViewSelector = ({ view, setView, resetJobStatus }) => {
    return (
        <Box sx={{display:'flex', justifyContent:'center'}}>
            <Box sx={{ display: 'flex', width: 350 }}>
                <ViewButton title='Single-View' view={view} setView={setView} resetJobStatus={resetJobStatus} />
                <ViewButton title='Multi-View' view={view} setView={setView} resetJobStatus={resetJobStatus} />
            </Box>
        </Box>
    )
}

const ViewButton = ({ title, view, setView, resetJobStatus={resetJobStatus} }) => {

    const dispatchResults = useDispatchResults();

    const selected = title == view;

    const [hover, setHover] = useState(false);

    let bgColor = '#00000015';
    let textColor = '#000000aa';

    if (selected) {
        bgColor = '#1976D2ff';
        textColor = '#ffffff';
    } else if (hover) {
        bgColor = '#00000033';
        textColor = '#000000aa';
    }

    return (
        <Box
            sx={{
                px: 2, py: 1, mx:0.1, width: '50%', 
                fontSize: '1.1em', textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 1s ease',
                backgroundColor: bgColor,
                color: textColor
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => {
                resetJobStatus(); 
                setView(title); 
                dispatchResults({type:'set-pwa-attr', attr:'view', value: title});
            }}
        >
            {title}
        </Box>
    )
}

export default ViewSelector