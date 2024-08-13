import React, { useState } from 'react';

import Box from '@mui/material/Box';
import DragFile from "./DragFile";

import SummaryTable from './SummaryTable'

import dynamic from 'next/dynamic';
import { useDispatchJob, useJob } from '../JobContext';
import MyAutocomplete from './MyAutocomplete';
import { Divider } from '@mui/material';

const PlotMV = dynamic(
    () => import('./PlotMV'),
    { ssr: false }
)

export default function NewJob() {

    return (
        <Box sx={{ width: '100%' }} className='p-2'>

            <Box sx={{ mt: 1, mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ width: '30%' }}><MyAutocomplete /></Box>
                <DragFile title="Experimental Metadata" fileType="mdata" />
                <Box sx={{ width: '30%' }}><SummaryTable /></Box>
            </Box>

            <Divider> </Divider>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <DragFile title="Transcriptomic Metadata" fileType="t2i" />
                <DragFile title="Metabolomic Metadata" fileType="m2i" />
                <DragFile title="Proteomic Metadata" fileType="q2i" />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <DragFile title="Transcriptomic Quantifications" fileType="xt" traspose={true} />
                <DragFile title="Metabolomic Quantifications" fileType="xm" traspose={true} />
                <DragFile title="Proteomic Quantifications" fileType="xq" traspose={true} />
            </Box>

            <Box sx={{ py: 1, display: 'flex', justifyContent: 'space-between' }}>
                <PlotMV fileType='xt' omic='Transcriptomic' />
                <PlotMV fileType='xm' omic='Metabolomic' />
                <PlotMV fileType='xq' omic='Proteomic' />
            </Box>
        </Box>
    )
}