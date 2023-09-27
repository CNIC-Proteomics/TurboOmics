import React, { useState } from 'react'
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import Slider from '@mui/material/Slider';

import { useDispatchJob, useJob } from '../JobContext';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';


const MVmethod = [
    {
        value: 'KNN',
        label: 'KNN',
    },
    /*{
        value: 'Minimum',
        label: 'Minimum',
    },*/
    {
        value: 'RF',
        label: 'RF'
    },
    {
        value: 'Mean',
        label: 'Mean',
    },
    {
        value: 'Median',
        label: 'Median',
    },
];


export default function PlotMV({ fileType, omic }) {

    const MVdata = useJob().results.PRE.MV[fileType];
    const xTable = useJob().user[fileType];

    const thr = useJob().results.PRE.MVThr[fileType];
    const dispatchJob = useDispatchJob();
    const setThr = (thr) => dispatchJob({
        type: 'set-mv-thr',
        fileType: fileType,
        thr: thr
    })

    const MVType = useJob().results.PRE.MVType[fileType];
    const setMVType = (MVType) => dispatchJob({
        type: 'set-mv-type',
        fileType: fileType,
        MVType: MVType
    })

    if (MVdata == null) return (<></>)

    const error = console.error;
    console.error = (...args) => {
        if (/defaultProps/.test(args[0])) return;
        error(...args);
    };

    return (
        xTable.isNa().sum({ axis: 0 }).sum() == 0 ?
            <>
                <div style={{ width: '33%' }}>
                    <Typography variant='h6' sx={{ textAlign: 'center' }}>No missing value detected</Typography>
                </div>
            </>
            :
            <>
                <div className='text-center'>
                    <Typography variant='h6'>{omic} Features vs MV Threshold</Typography>
                    <LineChart
                        id='1'
                        width={550}
                        height={200}
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
                    <div className='d-flex justify-content-end px-3 flex-column'>
                        <Typography>Selected MV Threshold: {thr}</Typography>
                        <div className='p-2'>
                            <TextField
                                id="outlined-select-currency"
                                select
                                label="Select"
                                value={MVType}
                                helperText="Please select imputation type"
                                size="small"
                                sx={{ width: "50%" }}
                                onChange={e => setMVType(e.target.value)}
                            >
                                {MVmethod.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>
                    </div>
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