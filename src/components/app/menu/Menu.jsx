import React, { useState } from 'react';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';

import { useJob } from '../JobContext';
import MyMotion from '../../MyMotion';
import MenuOption from './MenuOption';
import CreateJobBtn from './CreateJobBtn';

export default function Menu({ page, setPage }) {

    const { jobID, user } = useJob();

    return (
        <div className='my-2 d-flex justify-content-center'>
            <MenuOption text='New Job' id='new-job' setPage={setPage} page={page}><CreateIcon /></MenuOption>
            <MenuOption text='Find Job' id='find-job' setPage={setPage} page={page}><SearchIcon /></MenuOption>
            <MenuOption text='Results' id='results' setPage={setPage} page={page}><ScienceIcon /></MenuOption>
            {
                jobID == null && user.mdata && ((user.xm && user.m2i) || (user.xq && user.q2i)) &&
                <MyMotion><CreateJobBtn text='Create Job' setPage={setPage}><NoteAddIcon /></CreateJobBtn></MyMotion>
            }
        </div>
    );
}