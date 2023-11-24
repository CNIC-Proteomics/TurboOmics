import { Box, Paper, Typography } from '@mui/material';
import React, { useState } from 'react'

function OmicSelector({ selectedOmic, setSelectedOmic }) {

    return (
        <Box display='flex'>
            <MyButton
                selectedOmic={selectedOmic}
                setSelectedOmic={setSelectedOmic}
                buttonOmic='q'
                title='Proteomics'
            />
            <MyButton
                selectedOmic={selectedOmic}
                setSelectedOmic={setSelectedOmic}
                buttonOmic='m'
                title='Metabolomics'
            />
        </Box>
    )
}

const MyButton = ({ selectedOmic, setSelectedOmic, buttonOmic, title }) => {

    const bgColor = { act: '#424242', noAct: '#FFFFFF' };
    const txColor = { act: '#FFFFFF', noAct: '#424242' };

    const [isHover, setIsHover] = useState(false);

    const isActive = selectedOmic == buttonOmic || isHover;

    return (
        <Paper
            elevation={3}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            style={{
                backgroundColor: isActive ? bgColor.act : bgColor.noAct,
                color: isActive ? txColor.act : txColor.noAct,
                width: '50%',
                height: 70,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display:'flex',
                alignItems: 'center',justifyContent: 'center'
            }}
            onClick={() => setSelectedOmic(buttonOmic)}
        >
            <Typography variant='h5'>{title}</Typography>
        </Paper>
    )
}

export default OmicSelector