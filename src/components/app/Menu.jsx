import React, { useState } from 'react';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';

import { useJob } from './JobContext';

export default function Menu({ page, setPage, job }) {

    return (
        <div className='my-2 d-flex justify-content-center'>
            <MenuOption text='New Job' id='new-job' setPage={setPage} page={page}><CreateIcon /></MenuOption>
            <MenuOption text='Find Job' id='find-job' setPage={setPage} page={page}><SearchIcon /></MenuOption>
            <MenuOption text='Results' id='results' setPage={setPage} page={page}><ScienceIcon /></MenuOption>
        </div>
    );
}

const StyledCard = styled(Card)(({ theme }) => ({
    transition: "transform 0.15s ease-in-out, background 0.15s",
    "&:hover": { transform: "scale3d(1.05, 1.05, 1)", backgroundColor: 'rgba(204, 229, 255, 0.8)' },
}));

function MenuOption({ children, text, id, setPage, page }) {

    const job = useJob();

    const resultsDisable = id == 'results' && job.jobID == null

    let backgroundColor;

    if (resultsDisable) {
        backgroundColor = 'rgba(210,210,210,0.8)';
    } else {
        backgroundColor = page == id ? 'rgba(204, 229, 255, 0.8)' : 'rgba(255,255,255,1)';
    }

    const style = {
        width: 110,
        height: 70,
        textAlign: 'center',
        backgroundColor: backgroundColor,
        cursor: resultsDisable ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        margin: "0px 15px"
    }

    return (
        <>
            {
                resultsDisable ?

                    <Card
                        sx={style}>
                        <div className='py-2'>
                            {children}
                        </div>
                        <div>
                            <Typography gutterBottom variant="h7" component="div">{text}</Typography>
                        </div>
                    </Card>
                    :

                    <StyledCard
                        sx={style}
                        onClick={() => setPage(id)}
                    >
                        <div className='py-2'>
                            {children}
                        </div>
                        <div>
                            <Typography gutterBottom variant="h7" component="div">{text}</Typography>
                        </div>
                    </StyledCard>
            }
        </>
    )
}