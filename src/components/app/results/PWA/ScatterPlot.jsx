import { Autocomplete, Box, TextField } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { CartesianGrid, Label, Legend, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';
import { useJob } from '../../JobContext';
import { myPalette } from "@/utils/myPalette";

function ScatterPlot({ projections, nLV, mdataCategorical }) {

    console.log(mdataCategorical);

    // Get mdata value for each sample
    const mdataColSerie = useJob().user.mdata.column(mdataCategorical.mdataCol);

    // Generate array with data used to be plotted
    const data = useMemo(() => {
        let data = projections.map(e => ({
            sample: e.sample,
            g: mdataColSerie.values[mdataColSerie.index.indexOf(e.sample)],
            ...e.proj.reduce((prev, curr, i) => ({ ...prev, [`LV${i + 1}`]: curr }), {}),
        }));
        return data
    }, [projections, mdataColSerie]);

    // Generate array with possible LV to be selected
    const projOpts = useMemo(() => {
        let projOpts = []
        for (let i = 1; i <= nLV; i++) projOpts.push(`LV${i}`);
        projOpts = projOpts.map(e => ({ label: e, id: e }));
        return projOpts;
    }, [nLV]);

    // State containing selected LV
    const [selectedLV, setSelectedLV] = useState({ x: projOpts[0], y: projOpts[1] });

    console.log(selectedLV)

    return (
        <Box sx={{}}>
            <Box>
                <AxisSelector
                    selectedLV={selectedLV}
                    setSelectedLV={setSelectedLV}
                    projOpts={projOpts}
                />
            </Box>
            <Box>
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart
                        margin={{
                            top: 5, right: 20, bottom: 20, left: 20
                        }}
                    >
                        <CartesianGrid />
                        <XAxis
                            type="number" dataKey={selectedLV.x.label} name={selectedLV.x.label}
                        >
                            <Label value={`${selectedLV.x.label}`} offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis
                            type="number" dataKey={selectedLV.y.label} name={selectedLV.y.label}
                        >
                            <Label value={selectedLV.y.label} offset={20} position="insideLeft" angle={-90} />
                        </YAxis>
                        <Legend verticalAlign="top" />
                        <Scatter
                            name={mdataCategorical.g1.id}
                            data={data.filter(e => e.g==mdataCategorical.g1.id)}
                            fill={myPalette[0]}
                        />
                        <Scatter
                            name={mdataCategorical.g2.id}
                            data={data.filter(e => e.g==mdataCategorical.g2.id)}
                            fill={myPalette[1]}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    )
}


const AxisSelector = ({ selectedLV, setSelectedLV, projOpts }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ px: 2 }}>
                <Autocomplete
                    value={selectedLV.x}//{mdataCol}
                    onChange={(e, newValue) => newValue && setSelectedLV(prev => ({ ...prev, x: newValue }))}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    id="xAxis"
                    options={projOpts}
                    sx={{ width: 120 }}
                    renderInput={(params) => <TextField {...params} label="X Axis" />}
                    renderOption={(props, option) => {
                        return (
                            <li {...props} key={option.label}>
                                {option.label}
                            </li>
                        );
                    }}
                />
            </Box>
            <Box sx={{ px: 2 }}>
                <Autocomplete
                    value={selectedLV.y}//{mdataCol}
                    onChange={(e, newValue) => newValue && setSelectedLV(prev => ({ ...prev, y: newValue }))}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    id="yAxis"
                    options={projOpts}
                    sx={{ width: 120 }}
                    renderInput={(params) => <TextField {...params} label="Y Axis" />}
                    renderOption={(props, option) => {
                        return (
                            <li {...props} key={option.label}>
                                {option.label}
                            </li>
                        );
                    }}
                />
            </Box>
        </Box>
    )
}

export default ScatterPlot