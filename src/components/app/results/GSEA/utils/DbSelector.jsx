import { Box, CircularProgress } from '@mui/material';
import React, { useState } from 'react'

const DbSelector = ({ db, selDb, setDb, setShowEnrichment }) => {

    return (
        <Box sx={{ display: 'flex' }}>
            {db.map(e => (
                <SetButton
                    key={e.db}
                    selDb={selDb}
                    setDb={setDb}
                    dbid={e.db}
                    status={e.status}
                    label={e.label}
                    setShowEnrichment={setShowEnrichment}
                />
            ))}
        </Box>
    )
}

const SetButton = ({
    selDb,
    setDb,
    dbid,
    status,
    label,
    setShowEnrichment
}) => {

    const selected = selDb == dbid;
    const [isHover, setIsHover] = useState(false);

    const handleClick = () => {
        if (status != 'ok') return;
        setShowEnrichment(false);
        setTimeout(() => setShowEnrichment(true), 500);
        setDb(prev => prev.map(e =>
            e.db == dbid ? { ...e, show: true } : { ...e, show: false }
        ));

    }

    let bgColor = '#00000015';
    let textColor = '#000000aa';

    if (selected) {
        bgColor = '#006633ff';
        textColor = '#ffffff';
    } else if (status != 'ok') {
        bgColor = '#00000033';
        textColor = '#000000aa';
    } else if (isHover) {
        bgColor = '#00000033';
        textColor = '#000000aa';//'#ffffff';
    }

    return (
        <Box
            sx={{
                px: 1,
                py: 0.5,
                mx: 0.5,
                fontSize: '1em',
                color: textColor,
                backgroundColor: bgColor,
                userSelect: 'none',
                cursor: status == 'ok' ? 'pointer' : 'no-drop',
                transition: 'ease 1s',
                zIndex: 10
            }}
            onMouseEnter={() => { console.log('enter'); setIsHover(true) }}
            onMouseLeave={() => setIsHover(false)}
            onClick={handleClick}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                }}
            >
                {status == 'waiting' &&
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        <CircularProgress disableShrink size={15} />
                    </Box>
                }
                <Box>{label}</Box>
            </Box>
        </Box>
    )
}

export default DbSelector