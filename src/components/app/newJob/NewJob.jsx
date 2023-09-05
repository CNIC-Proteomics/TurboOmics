import React from 'react';

import Box from '@mui/material/Box';
import DragFile from "./DragFile";
import { Card, Typography } from "@mui/material";

import SummaryTable from './SummaryTable'


export default function NewJob() {
    return (
        <Box sx={{ width: '100%' }} className='p-4'>

            <div className='py-4 d-flex justify-content-between'>
                <DragFile title="Proteomic Metadata" fileName="q2i" />
                <DragFile title="Metadata" fileName="mdata" />
                <DragFile title="Metabolomic Metadata" fileName="m2i" />
            </div>
            <div className='py-4 d-flex justify-content-between align-items-center'>
                <DragFile title="Proteomic Quantifications" fileName="xq" />
                <SummaryTable />
                <DragFile title="Metabolomic Quantifications" fileName="xm" />
            </div>
        </Box>
    )
}
