import { useJob } from '@/components/app/JobContext';
import { Box, FormLabel, IconButton, Switch, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { myPalette } from "@/utils/myPalette";

import React, { useRef, useState } from 'react';

import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
    Legend,
    LabelList
} from "recharts";
import downloadSVG from '@/utils/downloadSVG';
import { useVars } from '@/components/VarsContext';

export function MyScatter({ omic, scatterData, mdataCol, PCA }) {

    const [showLabels, setShowLabels] = useState(false);

    const { OMIC2NAME } = useVars();

    const scatterRef = useRef();
    const mdataColType = useJob()['mdataType'][mdataCol].type;
    let scatterType;
    if (mdataColType == 'categorical') scatterType = 'category'
    if (mdataColType == 'numeric') scatterType = 'number'


    return (
        <Box>
            <DownloadComponent scatterRef={scatterRef} name={OMIC2NAME[omic]} />
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
                    <Scatter data={scatterData} fill={myPalette[0]}>
                        {showLabels &&
                            <LabelList
                                dataKey="element"
                                position="right"
                            />
                        }
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
            <ShowLabels showLabels={showLabels} setShowLabels={setShowLabels} />
        </Box>
    )
}

export function MyScatter2D({ omic, scatterData, selectedPlot2D }) {

    const { OMIC2NAME } = useVars();
    const scatterRef = useRef();

    const [showLabels, setShowLabels] = useState(false);

    return (
        <Box>
            <DownloadComponent scatterRef={scatterRef} name={OMIC2NAME[omic]} />
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
                        name={`PCA ${selectedPlot2D.x}`}
                    //allowDuplicatedCategory={false}
                    >
                        <Label value={`PCA ${selectedPlot2D.x}`} offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis
                        type="number"
                        dataKey="y"
                        name={`PCA ${selectedPlot2D.y}`}
                    >
                        <Label value={`PCA ${selectedPlot2D.y}`} offset={20} position="insideLeft" angle={-90} />
                    </YAxis>
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
                    {Object.keys(scatterData).length > 1 && <Legend verticalAlign="top" />}
                    {
                        Object.keys(scatterData).map((level, i) => {
                            return (
                                <Scatter
                                    key={level}
                                    data={scatterData[level]}
                                    fill={myPalette[i % myPalette.length]}
                                    name={level}
                                >
                                    {showLabels &&
                                        <LabelList
                                            dataKey="element"
                                            position="top"
                                        />
                                    }
                                </Scatter>
                            )
                        })
                    }
                </ScatterChart>
            </ResponsiveContainer>
            <Box sx={{mt:1}}><ShowLabels showLabels={showLabels} setShowLabels={setShowLabels} /></Box>
        </Box>
    )
}

export const ShowLabels = ({showLabels, setShowLabels}) => {
    return (
        <Box sx={{ mt: 0, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: 100, textAlign: 'center', position: 'relative', left: 30, border: '0px solid red' }}>
                <FormLabel component="legend" sx={{ pt: 0 }}>
                    Show Labels
                </FormLabel>
                <Switch
                    sx={{ position: 'relative', top: -10, border: '0px solid red' }}
                    checked={showLabels}
                    onChange={e => {
                        setShowLabels(prev => !prev);
                    }}
                    inputProps={{ 'aria-label': 'controlled' }}
                />
            </Box>
        </Box>
    )
}

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
                <Typography variant='h8' sx={{ display: 'block' }}>
                    {`${payload[0].payload.element}`}
                </Typography>
                <Typography variant='h9' sx={{ display: 'block' }}>
                    {
                        `${payload[0].name}: ${typeof (payload[0].value) == 'string' ?
                            payload[0].value : payload[0].value.toFixed(3)}`
                    }
                </Typography>
                <Typography variant='h9' sx={{ display: 'block' }}>
                    {`${payload[1].name}: ${payload[1].value.toFixed(3)}`}
                </Typography>
            </Box>
        );
    }

    return null;
};

const DownloadComponent = ({ scatterRef, name }) => {
    const downloadScatter = () => {
        const scatterComp = scatterRef.current.container.cloneNode(true);
        const fullFig = window.document.createElement('div');
        fullFig.appendChild(scatterComp);
        downloadSVG(fullFig, `PCA_Scatter-${name}`);
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
                    <DownloadIcon />
                </IconButton>
            </Box>
        </Box>
    )
}