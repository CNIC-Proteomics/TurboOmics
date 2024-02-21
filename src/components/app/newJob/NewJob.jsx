import React, { useState } from 'react';

import Box from '@mui/material/Box';
import DragFile from "./DragFile";

import SummaryTable from './SummaryTable'

import dynamic from 'next/dynamic';
import { useDispatchJob, useJob } from '../JobContext';
import MyAutocomplete from './MyAutocomplete';

const PlotMV = dynamic(
    () => import('./PlotMV'),
    { ssr: false }
)

export default function NewJob() {

    return (
        <Box sx={{ width: '100%' }} className='p-2'>

            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                <DragFile title="Proteomic Metadata" fileType="q2i" />
                <DragFile title="Metadata" fileType="mdata" />
                <DragFile title="Metabolomic Metadata" fileType="m2i" />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <DragFile title="Proteomic Quantifications" fileType="xq" traspose={true} />
                <Box sx={{ height: '100%' }}>
                    <MyAutocomplete />
                    <SummaryTable />
                </Box>
                <DragFile title="Metabolomic Quantifications" fileType="xm" traspose={true} />
            </Box>

            <Box sx={{ py: 1, display: 'flex', justifyContent: 'space-around' }}>
                <PlotMV fileType='xq' omic='Proteomic' />
                <Box sx={{ width: '33%' }}></Box>
                <PlotMV fileType='xm' omic='Metabolomic' />
            </Box>
        </Box>
    )
}