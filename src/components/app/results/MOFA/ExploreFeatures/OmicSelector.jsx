import { useVars } from '@/components/VarsContext';
import { useJob } from '@/components/app/JobContext';
import { Box, Paper, Typography } from '@mui/material';
import React, { useState } from 'react'

function OmicSelector({ selectedOmic, setSelectedOmic, scrollOmic }) {

    const omics = useJob().omics;
    const { OMIC2NAME } = useVars();

    const [selfSelectedOmic, setSelfSelectedOmic] = useState(selectedOmic);

    return (
        <Box display='flex'>
            {
                omics.map(omic => (
                    <MyButton
                        key={omic}
                        setSelectedOmic={setSelectedOmic}
                        selfSelectedOmic={selfSelectedOmic}
                        setSelfSelectedOmic={setSelfSelectedOmic}
                        buttonOmic={omic}
                        title={OMIC2NAME[omic]}
                        scroll={() => scrollOmic(
                            omics.indexOf(omic) - omics.indexOf(selectedOmic)
                        )}
                    />
                ))
            }
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

    const len = useJob().omics.length;
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
                width: `${100/len}%`,
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
                scroll();
            }}
        >
            <Typography variant='h5'>{title}</Typography>
        </Paper>
    )
}

export default OmicSelector