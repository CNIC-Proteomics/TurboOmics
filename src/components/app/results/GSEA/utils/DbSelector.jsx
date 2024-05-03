import { Box } from '@mui/material';
import React, { useState } from 'react'

const DbSelector = ({ db, selDb, setDb }) => {

    return (
        <Box sx={{ display: 'flex' }}>
            {db.map(e => (
                <SetButton
                    key={e.db}
                    selDb={selDb}
                    setDb={setDb}
                    dbid={e.db}
                />
            ))}
        </Box>
    )
}

const SetButton = ({ selDb, setDb, dbid }) => {

    const selected = selDb == dbid;
    const [isHover, setIsHover] = useState(false);

    const handleClick = () => {
        setDb(prev => prev.map(e =>
            e.db == dbid ? { ...e, show: true } : { ...e, show: false }
        ));
    }

    let bgColor = '#00000015';
    let textColor = '#000000aa';

    if (selected) {
        bgColor = '#006633ff';
        textColor = '#ffffff';
    } else if (isHover) {
        bgColor = '#00000033';
        textColor = '#000000aa'//'#ffffff';
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
                cursor: 'pointer',
                transition: 'ease 1s'
            }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={handleClick}
        >
            {dbid}
        </Box>
    )
}

export default DbSelector