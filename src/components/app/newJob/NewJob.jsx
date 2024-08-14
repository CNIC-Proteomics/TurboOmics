import React, { useState } from 'react';

import Box from '@mui/material/Box';
import DragFile from "./DragFile";

import SummaryTable from './SummaryTable'

import dynamic from 'next/dynamic';
import { useDispatchJob, useJob } from '../JobContext';
import MyAutocomplete from './MyAutocomplete';
import { Divider } from '@mui/material';
import HelpExperimentalMetadata from './DialogHelp/HelpExperimentalMetadata';
import HelpOmicMetadata from './DialogHelp/HelpOmicMetadata';
import HelpOmicQuant from './DialogHelp/HelpOmicQuant';

const PlotMV = dynamic(
    () => import('./PlotMV'),
    { ssr: false }
)

export default function NewJob() {

    return (
        <Box sx={{ width: '100%', p:2 }}>

            <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ width: '30%' }}><MyAutocomplete /></Box>
                <DragFile title="Experimental Metadata" fileType="mdata" DialogHelp={<HelpExperimentalMetadata />} />
                <Box sx={{ width: '30%' }}><SummaryTable /></Box>
            </Box>

            <Divider> </Divider>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <DragFile
                    title="Transcriptomic Metadata"
                    fileType="t2i"
                    DialogHelp={<HelpOmicMetadata title='Transcriptomic Metadata Table' tableFile='T_Metadata.png' />}
                />
                <DragFile
                    title="Metabolomic Metadata"
                    fileType="m2i"
                    DialogHelp={<HelpOmicMetadata title='Metabolomic Metadata Table' tableFile='M_Metadata.png' />}
                />
                <DragFile
                    title="Proteomic Metadata"
                    fileType="q2i"
                    DialogHelp={<HelpOmicMetadata title='Proteomic Metadata Table' tableFile='Q_Metadata.png' />}
                />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <DragFile
                    title="Transcriptomic Quantifications"
                    fileType="xt"
                    traspose={true}
                    DialogHelp={<HelpOmicQuant title='Transcriptomic Quantitative Table' tableFile='T_Quant.png' />}
                />
                <DragFile
                    title="Metabolomic Quantifications"
                    fileType="xm"
                    traspose={true}
                    DialogHelp={<HelpOmicQuant title='Metabolomic Quantitative Table' tableFile='M_Quant.png' />}
                />
                <DragFile
                    title="Proteomic Quantifications"
                    fileType="xq"
                    traspose={true}
                    DialogHelp={<HelpOmicQuant title='Transcriptomic Quantitative Table' tableFile='Q_Quant.png' />}
                />
            </Box>

            <Box sx={{ py: 1, display: 'flex', justifyContent: 'space-between' }}>
                <PlotMV fileType='xt' omic='Transcriptomic' />
                <PlotMV fileType='xm' omic='Metabolomic' />
                <PlotMV fileType='xq' omic='Proteomic' />
            </Box>
        </Box>
    )
}