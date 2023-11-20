import { useDispatchResults, useResults } from '@/components/app/ResultsContext';
import { Box, Slider, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react'
import {
    ScatterChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Scatter,
    ReferenceArea,
    ResponsiveContainer,
    ZAxis,
    LineChart,
    Line,
    ReferenceLine
} from 'recharts'
import { calculateXTicks } from '../../EDA/DataDistribution/utils';


function LoadingPlot({ fLVec, omic, thrL, setThrL }) {

    const scatterData = useMemo(() => {

        const nPoints = Math.min(200, fLVec.length);
        const step = Math.floor(fLVec.length / nPoints);

        let scatterData = fLVec.map(e => ({
            f: e[0],
            loading: Math.floor(e[1] * 10000) / 10000,
            quantile: e[2]
        })).filter((e, i) => i % step == 0 || i == (fLVec.length - 1));

        scatterData = scatterData.map(e => {
            if (e.loading > thrL.down && e.loading < thrL.up) {
                return { ...e, qNS: e.quantile }
            } else {
                return { ...e, qS: e.quantile }
            }

        })

        return scatterData

    }, [fLVec, thrL]);


    const handleSlider = ([down, up]) => {
        setThrL({ down: Math.min(down, 0), up: Math.max(up, 0) });
    };

    const handleClick = (value) => {
        if (value < 0) {
            setThrL(prevState => ({...prevState, down: value}))
        } else {
            setThrL(prevState => ({...prevState, up: value}))
        }
    }

    let myInterval = Math.ceil(
        Math.max(
            Math.abs(fLVec[0][1]),
            Math.abs(fLVec[fLVec.length - 1][1])
        ) * 10
    ) / 10;


    return (
        <Box sx={{ overflow: 'auto' }}>
            <Box sx={{ mt: 1, display: 'block', m: 'auto', width: 600 }}>
                <Box sx={{ width: 600, position: 'relative' }}>
                    <LineChart
                        data={scatterData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                        width={600} height={200}
                        onClick={e => e != null && handleClick(e.activeLabel)}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="loading"
                            type='number'
                            name='Loadings'
                            domain={[-myInterval, myInterval]}
                            label={{ value: 'Loading', position: 'insideBottom', offset: -10 }}
                            ticks={calculateXTicks(-myInterval, myInterval, 6)}
                        />
                        <YAxis
                            type='number'
                            label={{
                                value: "Quantile",
                                position: "insideLeft",
                                angle: -90,
                                dy: 30,
                                offset: -5
                            }}
                        />
                        <ReferenceArea
                            x1={thrL.down}
                            x2={thrL.up}
                            y1={0}
                            y2={1}
                        />
                        <ReferenceLine x={0} stroke="#333333" strokeDasharray="3 3" />
                        <Line
                            type="monotone"
                            dataKey="quantile"
                            stroke="#aaaaaa"
                            dot={false}
                            strokeWidth={1}
                        />
                        <Line
                            type="monotone"
                            dataKey="qS"
                            stroke="#8884d8"
                            dot={false}
                            strokeWidth={3}
                        />
                    </LineChart>
                </Box>
                <Box sx={{ width: 490, position: 'relative', left: 80 }}>
                    <Slider
                        //aria-label="Small steps"
                        track='inverted'
                        value={[thrL.down, thrL.up]}
                        getAriaValueText={valuetext}
                        valueLabelDisplay="auto"
                        step={0.001}
                        //marks
                        min={-myInterval}
                        max={myInterval}
                        onChange={e => handleSlider(e.target.value)}
                    />
                </Box>
                <Box sx={{
                    width: 490,
                    position: 'relative',
                    left: 80,
                    display: 'flex',
                    textAlign: 'center',
                    justifyContent: 'space-around',
                }}>
                    <Box sx={{ width: '33%' }}>
                        <Typography variant='body1'>
                            Negatively Associated Features: {fLVec.filter(e => e[1] <= thrL.down).length}
                        </Typography>
                    </Box>
                    <Box sx={{ width: '33%' }}>
                        <Typography variant='body1'>
                            Positively Associated Features: {fLVec.filter(e => e[1] >= thrL.up).length}
                        </Typography>
                    </Box>
                </Box>
            </Box >
        </Box>
    )
}

function valuetext(value) {
    return `${value}`;
}

export default LoadingPlot