import { Card, Typography, styled } from '@mui/material';
import React from 'react'
import { getStyle } from './getStyle';


const StyledCard = styled(Card)(({ theme }) => ({
    transition: "transform 0.15s ease-in-out, background 0.15s",
    "&:hover": { transform: "scale3d(1.05, 1.05, 1)", backgroundColor: 'rgba(255, 0, 0, 0.3)' },
}));


export default function CreateJobBtn({ children, text, setPage }) {

    return (
        <StyledCard
            sx={{ ...getStyle('rgba(255, 0, 0, 0.2)'), position: 'absolute', right: '12%' }}
            onClick={() => setPage('create-job')}
        >
            <div className='py-2'>
                {children}
            </div>
            <div>
                <Typography gutterBottom variant="h7" component="div">{text}</Typography>
            </div>
        </StyledCard>
    )
}
