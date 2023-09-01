import React from 'react';

import { Card, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import DragFile from "./DragFile";


export default function FileUploadView() {
    return (
        <Box sx={{ width: '100%' }} className='p-4'>
            <Typography variant="h3">File Upload</Typography>
            <div className='py-4 d-flex justify-content-between'>
                <DragFile title="Proteomic Quantifications"/>
                <DragFile title="Metadata"/>
                <DragFile title="Metabolomic Quantifications"/>
            </div>
            <div className='py-4 d-flex justify-content-between'>
                <DragFile title="Proteomic Metadata"/>
                <DragFile title="Metabolomic Metadata"/>
            </div>
        </Box>
    )
}
