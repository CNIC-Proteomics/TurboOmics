import React, { useState } from 'react';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

import { useJob } from '../JobContext';
import MyMotion from '../../MyMotion';
import MenuOption from './MenuOption';
import CreateJobBtn from './CreateJobBtn';
import LoadSampleBtn from './LoadSampleBtn';
import { Box } from '@mui/material';

export default function Menu({ page, setPage, setCreatingJob }) {

    const { user } = useJob();
    const { OS } = useJob();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            {
                page == 'new-job' &&
                <LoadSampleBtn page={page} />
            }
            <MenuOption text='New Job' id='new-job' setPage={setPage} page={page}><CreateIcon /></MenuOption>
            <MenuOption text='Find Job' id='find-job' setPage={setPage} page={page}><SearchIcon /></MenuOption>
            <MenuOption text='Results' id='results' setPage={setPage} page={page}><ScienceIcon /></MenuOption>
            {
                page == 'new-job' && user.mdata && ((user.xm && user.m2i) && (user.xq && user.q2i)) && OS != null &&
                <MyMotion><CreateJobBtn setCreatingJob={setCreatingJob} /></MyMotion>
            }
        </Box>
    );
}