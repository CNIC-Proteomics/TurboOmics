import React from 'react'

import { useJob } from '../JobContext';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
const data = [{ x: 0, y: 0 }, { x: 4, y: 2 }, { x: 9, y: 3 }];


export default function PlotMV({ fileName }) {

    const job = useJob().results.PRE.MV[fileName];

    if (job == null) return (<></>)

    return (
        <LineChart id='1' width={600} height={300} data={job} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Line type="monotone" dataKey="Features" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="MVThr" label={{ value: "Missing Values Threshold", position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: "Accepted Features", position: "insideLeft", angle: -90,   dy: 60, offset:-5 }} />
            <Tooltip />
        </LineChart>
    )
}