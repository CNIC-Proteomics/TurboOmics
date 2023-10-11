import { useJob } from '@/components/app/JobContext';
import { Box, IconButton, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

import React, { useRef } from 'react';

import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label
} from "recharts";
import downloadSVG from '@/utils/downloadSVG';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                className="custom-tooltip"
                sx={{
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(50, 50, 50, 0.8)',
                    padding: 1,
                    borderRadius: 1,
                    color: 'rgba(50,50,50,0.8)'
                }}
            >
                <Typography variant='h8' sx={{ display: 'block' }}>{`${payload[0].payload.element}`}</Typography>
                <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[0].name}: ${payload[0].payload.mdataValue}`}</Typography>
                <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[1].name}: ${payload[0].payload.projection.toFixed(3)}`}</Typography>
            </Box>
        );
    }

    return null;
};

export default function MyScatter({ scatterData, mdataCol, PCA }) {

    const scatterRef = useRef();
    const mdataColType = useJob()['mdataType'][mdataCol].type;
    let scatterType;
    if (mdataColType == 'categorical') scatterType = 'category'
    if (mdataColType == 'numeric') scatterType = 'number'

    const downloadScatter = () => {
        const scatterComp = scatterRef.current.container.cloneNode(true);
        const fullFig = window.document.createElement('div');
        fullFig.appendChild(scatterComp);
        downloadSVG(fullFig, 'PCA_Scatter')
    }

    return (
        <Box>
            <Box sx={{ height: 0 }}>

                <Box sx={{ width: 50, position: 'relative', top: 5, zIndex: 5000 }}>
                    <IconButton
                        aria-label="download"
                        size='small'
                        onClick={downloadScatter}
                        sx={{ opacity: 0.5 }}
                    >
                        <DownloadIcon />
                    </IconButton>
                </Box>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                    ref={scatterRef}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20
                    }}
                >
                    <CartesianGrid />
                    <XAxis
                        type={scatterType}
                        dataKey="mdataValue"
                        name={mdataCol}
                        allowDuplicatedCategory={false}
                    >
                        <Label value={mdataCol} offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis type="number" dataKey="projection" name={`PCA ${PCA}`} >
                        <Label value={`PCA ${PCA}`} offset={20} position="insideLeft" angle={-90} />
                    </YAxis>
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
                    <Scatter data={scatterData} fill="#8884d8" />
                </ScatterChart>
            </ResponsiveContainer>
        </Box>
    )
}
