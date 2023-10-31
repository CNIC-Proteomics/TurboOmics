import React, { useState } from 'react';

import Box from '@mui/material/Box';
import DragFile from "./DragFile";

import SummaryTable from './SummaryTable'

import dynamic from 'next/dynamic';
import { useDispatchJob, useJob } from '../JobContext';

const PlotMV = dynamic(
    () => import('./PlotMV'),
    { ssr: false }
)

export default function NewJob() {

    return (
        <Box sx={{ width: '100%' }} className='p-2'>

            <div className='py-2 d-flex justify-content-between'>
                <DragFile title="Proteomic Metadata" fileType="q2i" />
                <DragFile title="Metadata" fileType="mdata" />
                <DragFile title="Metabolomic Metadata" fileType="m2i" />
            </div>
            <div className='py-2 d-flex justify-content-between align-items-center'>
                <DragFile title="Proteomic Quantifications" fileType="xq" />
                <SummaryTable />
                <DragFile title="Metabolomic Quantifications" fileType="xm" />
            </div>

            <Box sx={{py:1, display:'flex', justifyContent:'space-around'}}>
                <PlotMV fileType='xq' omic='Proteomic' />
                <Box sx={{width:'33%'}}></Box>
                <PlotMV fileType='xm' omic='Metabolomic' />
            </Box>
        </Box>
    )
}
