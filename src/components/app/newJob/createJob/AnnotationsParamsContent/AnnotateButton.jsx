import { Autocomplete, Box, Button, Card, CardContent, CardHeader, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

function AnnotateButton({ showButton, onAnnotate }) {

    const [isHover, setIsHover] = useState(false);

    let bgColor = isHover ? 'rgba(255,0,0,0.4)' : 'rgba(255,0,0,0.2)'

    return (
        <Box sx={{
            position: 'sticky',
            height: 0,
            width: 0,
            top: 10,
            left: "85%",
            zIndex: 100,
            margin: 'right',
            visibility: showButton ? 'visible' : 'hidden',
            opacity: showButton ? 1 : 0,
            transition: 'all 0.5s ease'
        }}
        >
            <Card sx={{
                backgroundColor: bgColor,
                transition: 'all 1s ease',
                cursor: 'pointer',
                width: 150,
                height: 60,
                textAlign: 'center',
                px: 1, py: 1
            }}
                onMouseEnter={e => setIsHover(true)}
                onMouseLeave={e => setIsHover(false)}
                onClick={onAnnotate}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <Box>
                        <Typography gutterBottom variant="h7" component="div">
                            Annotate Features
                        </Typography>
                    </Box>
                    <Box sx={{ py: 1 }}>
                        <KeyboardDoubleArrowRightIcon />
                    </Box>
                </Box>
            </Card>
        </Box>
    )
}

export default AnnotateButton