import React, { useEffect, useState } from 'react'
import { Box, FormControlLabel, MenuItem, Switch, TextField, Typography } from "@mui/material";
import Slider from '@mui/material/Slider';

import { useDispatchJob, useJob } from '../JobContext';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';


const MVmethod = [
    {
        value: 'KNN',
        label: 'KNN',
    },
    {
        value: 'Minimum',
        label: 'Minimum',
    },
    /*{
        value: 'RF',
        label: 'RF'
    },*/
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

    const myLog = useJob().results.PRE.log[fileType];
    const myScale = useJob().results.PRE.scale[fileType];

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
        <Box sx={{ width: "33%" }}>
            <Typography variant='h6' sx={{ textAlign: 'center' }}>Apply:</Typography>
            <MySwitch actionType='set-log' fileType={fileType} myChecked={myLog} label={'Log Transformation'} />
            <MySwitch actionType='set-scale' fileType={fileType} myChecked={myScale} label={'Center & Scale'} />

            {xTable.isNa().sum({ axis: 0 }).sum() == 0 ?
                <>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant='h6' sx={{ textAlign: 'center' }}>No missing value detected</Typography>
                    </Box>
                </>
                :
                <>
                    <Box sx={{ mt: 3, textAlign: 'center', overflow: 'auto' }}>
                        <Typography variant='h6'>{omic} Features vs MV Threshold</Typography>
                        <Box sx={{ width: 550, margin: 'auto' }} >
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
                        </Box>
                        <Box sx={{ margin: 'auto', width: 550 }}>
                            <Box sx={{ position: 'relative', left: 30, margin: 'auto', width: 450 }}>
                                <DiscreteSlider thr={thr} setThr={setThr} />
                                <Box sx={{ display: 'flex', justifyContent: 'end', flexDirection: 'column' }}>
                                    <Typography>Selected MV Threshold: {thr}</Typography>
                                    <Box sx={{ p: 0 }}>
                                        <TextField
                                            id="outlined-select-currency"
                                            select
                                            label="Select"
                                            value={MVType}
                                            helperText="Please select imputation type"
                                            size="small"
                                            sx={{ width: "100%" }}
                                            onChange={e => setMVType(e.target.value)}
                                        >
                                            {MVmethod.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </>}
        </Box>
    )
}

function valuetext(value) {
    return `${value}`;
}

function DiscreteSlider({ thr, setThr }) {
    return (
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
    );
}

const MySwitch = ({ actionType, fileType, myChecked, label }) => {
    //const [checked, setChecked] = useState(myChecked)
    const dispatchJob = useDispatchJob();

    // 

    return (
        <Box sx={{ margin: 'auto', width: 275, pl: 5 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={myChecked}
                        onChange={e => {
                            //setChecked(e.target.checked);
                            dispatchJob({ type: actionType, fileType: fileType, checked: e.target.checked });
                        }}
                    />
                }
                label={label}
            />
        </Box>
    )
}