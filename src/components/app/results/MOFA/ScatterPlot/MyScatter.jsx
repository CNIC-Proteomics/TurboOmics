import { useJob } from '@/components/app/JobContext';
import { Box, IconButton, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
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
import { DownloadComponent } from '@/utils/DownloadRechartComponent';
import { ShowLabels } from '../../EDA/PCA/MyScatter';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                className="custom-tooltip"
                sx={{
                    //backgroundColor: 'rgba(255,255,255,0.5)',
                    //color: 'rgba(50,50,50,0.8)',
                    backgroundColor: 'rgba(5,5,5,0.8)',
                    color: 'rgba(250,250,250,0.8)',
                    border: '1px solid rgba(50, 50, 50, 0.8)',
                    padding: 1,
                    borderRadius: 1,
                }}
            >
                <Typography variant='h8' sx={{ display: 'block' }}>{`${payload[0].payload.element}`}</Typography>
                {true && <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[0].name}: ${typeof (payload[0].value) == 'string' ? payload[0].value : payload[0].value.toFixed(3)}`}</Typography>}
                {true && <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[1].name}: ${payload[1].value.toFixed(3)}`}</Typography>}
            </Box>
        );
    }

    return null;
};

export function MyScatter({ scatterData, mdataCol, Factor }) {

    const [showLabels, setShowLabels] = useState(false);

    const scatterRef = useRef();
    const mdataColType = useJob()['mdataType'][mdataCol].type;
    let scatterType;
    if (mdataColType == 'categorical') scatterType = 'category'
    if (mdataColType == 'numeric') scatterType = 'number'

    return (
        <Box>
            <ShowLabels showLabels={showLabels} setShowLabels={setShowLabels} />
            <DownloadComponent scatterRef={scatterRef} name={'MOFA_1D'} />
            <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                    ref={scatterRef}
                    margin={{
                        top: 5,
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
                        style={{ fontFamily: 'Calibri' }}
                    >
                        <Label
                            value={mdataCol}
                            offset={-10}
                            position="insideBottom"
                            style={{ fontFamily: 'Calibri' }}
                        />
                    </XAxis>
                    <YAxis
                        type="number"
                        dataKey="projection"
                        name={`${Factor}`}
                        style={{ fontFamily: 'Calibri' }}
                    >
                        <Label
                            value={`${Factor}`}
                            offset={20}
                            position="insideLeft"
                            angle={-90}
                            style={{ fontFamily: 'Calibri' }}
                        />
                    </YAxis>
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
                    <Scatter data={scatterData} fill={myPalette[0]}>
                        {showLabels &&
                            <LabelList dataKey="element" position='right' style={{fontFamily: 'Calibri'}} />
                        }
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </Box>
    )
}

export function MyScatter2D({ scatterData, selectedPlot2D }) {

    const [showLabels, setShowLabels] = useState(false);
    const scatterRef = useRef();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: 600 }}>
                <ShowLabels showLabels={showLabels} setShowLabels={setShowLabels} />
                <DownloadComponent scatterRef={scatterRef} name='MOFA_2D' />
                <ScatterChart
                    ref={scatterRef}
                    width={600}
                    height={500}
                    margin={{
                        top: 5,
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
                        style={{ fontFamily: 'Calibri' }}
                    >
                        <Label
                            value={`${selectedPlot2D.x}`}
                            offset={-10}
                            position="insideBottom"
                            style={{ fontFamily: 'Calibri' }}
                        />
                    </XAxis>
                    <YAxis
                        type="number"
                        dataKey="y"
                        name={`${selectedPlot2D.y}`}
                        style={{ fontFamily: 'Calibri' }}
                    >
                        <Label
                            value={`${selectedPlot2D.y}`}
                            offset={20}
                            position="insideLeft"
                            angle={-90}
                            style={{ fontFamily: 'Calibri' }}
                        />
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
                                        <LabelList dataKey="element" position='top' style={{fontFamily: 'Calibri'}} />
                                    }
                                </Scatter>
                            )
                        })
                    }
                </ScatterChart>
            </Box>
        </Box>
    )
}