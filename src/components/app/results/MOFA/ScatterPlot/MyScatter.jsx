import { useJob } from '@/components/app/JobContext';
import { Box, IconButton, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { myPalette } from "@/utils/myPalette";

import React, { useRef } from 'react';

import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
    Legend
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
                {true && <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[0].name}: ${typeof(payload[0].value)=='string' ? payload[0].value: payload[0].value.toFixed(3)}`}</Typography>}
                {true && <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[1].name}: ${payload[1].value.toFixed(3)}`}</Typography>}
            </Box>
        );
    }

    return null;
};

const DownloadComponent = ({ scatterRef }) => {
    const downloadScatter = () => {
        const scatterComp = scatterRef.current.container.cloneNode(true);
        const fullFig = window.document.createElement('div');
        fullFig.appendChild(scatterComp);
        downloadSVG(fullFig, 'MOFA_Scatter');
    }

    return (
        <Box sx={{ height: 0 }}>
            <Box sx={{ width: 50, position: 'relative', top: 5, zIndex: 5000 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    onClick={downloadScatter}
                    sx={{ opacity: 0.5 }}
                >
                    <ImageIcon />
                </IconButton>
            </Box>
        </Box>
    )
}

export function MyScatter({ scatterData, mdataCol, Factor }) {

    const scatterRef = useRef();
    const mdataColType = useJob()['mdataType'][mdataCol].type;
    let scatterType;
    if (mdataColType == 'categorical') scatterType = 'category'
    if (mdataColType == 'numeric') scatterType = 'number'


    return (
        <Box>
            <DownloadComponent scatterRef={scatterRef} />
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
                    <YAxis type="number" dataKey="projection" name={`${Factor}`} >
                        <Label value={`${Factor}`} offset={20} position="insideLeft" angle={-90} />
                    </YAxis>
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
                    <Scatter data={scatterData} fill="#8884d8" />
                </ScatterChart>
            </ResponsiveContainer>
        </Box>
    )
}

export function MyScatter2D({ scatterData, selectedPlot2D }) {

    const scatterRef = useRef();

    return (
        <Box>
            <DownloadComponent scatterRef={scatterRef} />
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
                        type="number"
                        dataKey="x"
                        name={`${selectedPlot2D.x}`}
                    >
                        <Label value={`${selectedPlot2D.x}`} offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis
                        type="number"
                        dataKey="y"
                        name={`${selectedPlot2D.y}`}
                    >
                        <Label value={`${selectedPlot2D.y}`} offset={20} position="insideLeft" angle={-90} />
                    </YAxis>
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
                    {Object.keys(scatterData).length>1 && <Legend verticalAlign="top" />}
                    {
                        Object.keys(scatterData).map((level, i) => {
                            return (
                                <Scatter
                                    key={level}
                                    data={scatterData[level]}
                                    fill={myPalette[i % myPalette.length]}
                                    name={level}
                                />
                            )
                        })
                    }
                </ScatterChart>
            </ResponsiveContainer>
        </Box>
    )
}