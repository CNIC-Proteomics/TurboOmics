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

    const fileNames = useJob().userFileNames
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

   
    return (
        <Box sx={{ width: '100%' }} className='p-4'>

            <div className='py-4 d-flex justify-content-between'>
                <DragFile title="Proteomic Metadata" fileType="q2i" fileName={fileNames.q2i} />
                <DragFile title="Metadata" fileType="mdata" fileName={fileNames.mdata} />
                <DragFile title="Metabolomic Metadata" fileType="m2i" fileName={fileNames.m2i} />
            </div>
            <div className='py-4 d-flex justify-content-between align-items-center'>
                <DragFile title="Proteomic Quantifications" fileType="xq" fileName={fileNames.xq} />
                <SummaryTable qThr={qThr} mThr={mThr} />
                <DragFile title="Metabolomic Quantifications" fileType="xm" fileName={fileNames.xm} />
            </div>
            
            <div className='py-4 d-flex justify-content-between align-items-center'>
                <div className='text-center'>
                    <PlotMV fileType='xq' omic='Proteomic' thr={qThr} setThr={setQThr} />
                </div>
                <div className='text-center'>
                    <PlotMV fileType='xm' omic='Metabolomic' thr={mThr} setThr={setMThr} />
                </div>
            </div>
        </Box>
    )
}
