import React, { useState } from 'react'
import { Box, Typography } from "@mui/material";
import Slider from '@mui/material/Slider';

import { useJob } from '../JobContext';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';


export default function PlotMV({ fileType, omic, thr, setThr }) {

    const MVdata = useJob().results.PRE.MV[fileType];

    if (MVdata == null) return (<></>)

    const error = console.error;
    console.error = (...args) => {
        if (/defaultProps/.test(args[0])) return;
        error(...args);
    };

    return (
        <>
            <Typography variant='h6'>{omic} Features vs MV Threshold</Typography>
            <LineChart
                id='1'
                width={550}
                height={300}
                data={MVdata}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                onClick={e => e != null && setThr(e.activeLabel)}
            >
                <ReferenceLine x={thr} stroke='rgba(100,100,100,1)' />

                <Line type="monotone" dataKey="Features" stroke="#8884d8" />

                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis id={1} dataKey="MVThr" label={{ value: "Missing Values Threshold", position: 'insideBottom', offset: -10 }} />
                <YAxis label={{ value: "Accepted Features", position: "insideLeft", angle: -90, dy: 60, offset: -5 }} />
                <Tooltip />
            </LineChart>
            <div className='d-flex justify-content-end px-3'>
                <DiscreteSlider thr={thr} setThr={setThr} />
            </div>
            <div className='d-flex justify-content-end px-3'>
                <Typography>Selected MV Threshold: {thr}</Typography>
            </div>
        </>
    )
}

function valuetext(value) {
    return `${value}`;
}

function DiscreteSlider({ thr, setThr }) {
    return (
        <Box sx={{ width: 450 }}>
            <Slider
                aria-label="Small steps"

                value={thr}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                step={0.05}
                marks
                min={0}
                max={1}
                onChange={e => setThr(e.target.value)}
            />
        </Box>
    );
}