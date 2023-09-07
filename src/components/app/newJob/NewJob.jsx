import React, { useState } from 'react';

import Box from '@mui/material/Box';
import DragFile from "./DragFile";
import { Card, Typography } from "@mui/material";

import SummaryTable from './SummaryTable'
//import PlotMV from './PlotMV';

import dynamic from 'next/dynamic';

const PlotMV = dynamic(
    () => import('./PlotMV'),
    { ssr: false }
)

export default function NewJob() {

    const [qThr, setQThr] = useState(0.2);
    const [mThr, setMThr] = useState(0.2);

    return (
        <Box sx={{ width: '100%' }} className='p-4'>

            <div className='py-4 d-flex justify-content-between'>
                <DragFile title="Proteomic Metadata" fileName="q2i" />
                <DragFile title="Metadata" fileName="mdata" />
                <DragFile title="Metabolomic Metadata" fileName="m2i" />
            </div>
            <div className='py-4 d-flex justify-content-between align-items-center'>
                <DragFile title="Proteomic Quantifications" fileName="xq" />
                <SummaryTable qThr={qThr} mThr={mThr} />
                <DragFile title="Metabolomic Quantifications" fileName="xm" />
            </div>
            <div className='py-4 d-flex justify-content-between align-items-center'>
                <div className='text-center'>
                    <PlotMV fileName='xq' omic='Proteomic' thr={qThr} setThr={setQThr} />
                </div>
                <div className='text-center'>
                    <PlotMV fileName='xm' omic='Metabolomic' thr={mThr} setThr={setMThr} />
                </div>
            </div>
        </Box>
    )
}
