import React, { useState } from 'react';

import Box from '@mui/material/Box';
import DragFile from "./DragFile";
import { Card, Typography } from "@mui/material";

import SummaryTable from './SummaryTable'
//import PlotMV from './PlotMV';

import dynamic from 'next/dynamic';
import { useDispatchJob, useJob } from '../JobContext';

const PlotMV = dynamic(
    () => import('./PlotMV'),
    { ssr: false }
)

export default function NewJob() {

    const qThr = useJob().results.PRE.MVThr.xq;
    const mThr = useJob().results.PRE.MVThr.xm;

    const dispatchJob = useDispatchJob();

    const setQThr = (thr) => dispatchJob({
        type: 'set-mv-thr',
        fileType: 'xq',
        thr: thr
    })
    const setMThr = (thr) => dispatchJob({
        type: 'set-mv-thr',
        fileType: 'xm',
        thr: thr
    })

    //const [qThr, setQThr] = useState(0.2);
    //const [mThr, setMThr] = useState(0.2);
    
    return (
        <Box sx={{ width: '100%' }} className='p-4'>

            <div className='py-4 d-flex justify-content-between'>
                <DragFile title="Proteomic Metadata" fileType="q2i" />
                <DragFile title="Metadata" fileType="mdata" />
                <DragFile title="Metabolomic Metadata" fileType="m2i" />
            </div>
            <div className='py-4 d-flex justify-content-between align-items-center'>
                <DragFile title="Proteomic Quantifications" fileType="xq" />
                <SummaryTable qThr={qThr} mThr={mThr} />
                <DragFile title="Metabolomic Quantifications" fileType="xm" />
            </div>
            { true &&
            <div className='py-4 d-flex justify-content-between align-items-center'>
                <div className='text-center'>
                    <PlotMV fileType='xq' omic='Proteomic' thr={qThr} setThr={setQThr} />
                </div>
                <div className='text-center'>
                    <PlotMV fileType='xm' omic='Metabolomic' thr={mThr} setThr={setMThr} />
                </div>
            </div>}
        </Box>
    )
}
