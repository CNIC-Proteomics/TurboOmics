import { Box, Paper, Typography } from '@mui/material';
import React, { useState } from 'react'

function OmicSelector({ selectedOmic, setSelectedOmic, scrollOmic }) {

    const [selfSelectedOmic, setSelfSelectedOmic] = useState(selectedOmic);

    return (
        <Box display='flex'>
            <MyButton
                setSelectedOmic={setSelectedOmic}
                selfSelectedOmic={selfSelectedOmic}
                setSelfSelectedOmic={setSelfSelectedOmic}
                buttonOmic='q'
                title='Proteomics'
                scroll={()=>scrollOmic('left')}
            />
            <MyButton
                setSelectedOmic={setSelectedOmic}
                selfSelectedOmic={selfSelectedOmic}
                setSelfSelectedOmic={setSelfSelectedOmic}
                buttonOmic='m'
                title='Metabolomics'
                scroll={()=>scrollOmic('right')}
            />
        </Box>
    )
}

const MyButton = ({ 
    setSelectedOmic,
    selfSelectedOmic,
    setSelfSelectedOmic,
    buttonOmic, 
    title, 
    scroll 
}) => {

    const bgColor = { act: '#424242', noAct: '#FFFFFF' };
    const txColor = { act: '#FFFFFF', noAct: '#424242' };

    const [isHover, setIsHover] = useState(false);

    const isActive = selfSelectedOmic == buttonOmic || isHover;

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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={() => {
                if (selfSelectedOmic == buttonOmic) return
                setSelfSelectedOmic(buttonOmic);
                setTimeout(() => setSelectedOmic(buttonOmic), 500); 
                scroll()
            }}
        >
            <Typography variant='h5'>{title}</Typography>
        </Paper>
    )
}

export default OmicSelector