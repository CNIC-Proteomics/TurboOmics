import { useVars } from '@/components/VarsContext';
import { useJob } from '@/components/app/JobContext'
import { Box } from '@mui/material'
import React, { useState } from 'react'

export default function OmicSelector({ selOmic, setSelOmic, omicViewRef }) {

    const { omics } = useJob();
    const { OMIC2NAME } = useVars();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            {omics.map((omic, i) => (
                <OmicButton
                    key={omic}
                    selOmic={selOmic}
                    id={omic}
                    title={OMIC2NAME[omic]}
                    setSelOmic={setSelOmic}
                    omicViewRef={omicViewRef}
                />
            ))}
        </Box>
    )
}

const OmicButton = ({ selOmic, id, title, setSelOmic, omicViewRef }) => {

    const { omics } = useJob();

    const [isHover, setIsHover] = useState(false);

    const selected = id == selOmic;

    let bgColor = '#00000015';
    let textColor = '#000000aa';

    if (selected) {
        bgColor = '#1976D2ff';
        textColor = '#ffffff';
    } else if (isHover) {
        bgColor = '#00000033';
        textColor = '#000000aa'//'#ffffff';
    }


    const handleClick = () => {
        const steps = omics.indexOf(id) - omics.indexOf(selOmic);

        setTimeout(() => {
            omicViewRef.current.scrollLeft =
                omicViewRef.current.scrollLeft +
                steps * omicViewRef.current.clientWidth;
        }, 100);

        setSelOmic(id);
    }

    return (
        <Box
            sx={{
                px: 3,
                py: 1,
                mx: 0.1,
                fontSize: '1.1em',
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
            {title}
        </Box>
    )
}