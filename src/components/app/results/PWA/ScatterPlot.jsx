import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import React, { useMemo, useRef, useState } from 'react'
import { CartesianGrid, Label, LabelList, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useJob } from '../../JobContext';
import { myPalette } from "@/utils/myPalette";
import { ShowLabels } from '../EDA/PCA/MyScatter';
import { DownloadComponent } from '@/utils/DownloadRechartComponent';

function ScatterPlot({ projections, nLV, mdataCategorical }) {

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

    // Show Labels
    const [showLabels, setShowLabels] = useState(false);

    // Download chart
    const scatterRef = useRef();

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', overflow: 'auto' }}>
                <Box>
                    <Box sx={{ width: 0 }}>
                        <DownloadComponent scatterRef={scatterRef} name='PathwayAnalysis' />
                    </Box>
                    <ScatterChart
                        ref={scatterRef}
                        width={540} height={500}
                        margin={{
                            top: 5, right: 20, bottom: 20, left: 20
                        }}
                    >
                        <CartesianGrid />
                        <XAxis
                            type="number"
                            dataKey={selectedLV.x.label}
                            name={selectedLV.x.label}
                            style={{ fontFamily: 'Calibri' }}
                        >
                            <Label
                                value={`${selectedLV.x.label}`}
                                offset={-10}
                                position="insideBottom"
                                style={{ fontFamily: 'Calibri' }}
                            />
                        </XAxis>
                        <YAxis
                            type="number"
                            dataKey={selectedLV.y.label}
                            name={selectedLV.y.label}
                            style={{ fontFamily: 'Calibri' }}
                        >
                            <Label
                                value={selectedLV.y.label}
                                offset={20}
                                position="insideLeft"
                                angle={-90}
                                style={{ fontFamily: 'Calibri' }}
                            />
                        </YAxis>
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
                        <Legend verticalAlign="top" />
                        <Scatter
                            name={mdataCategorical.g1.id}
                            data={data.filter(e => e.g == mdataCategorical.g1.id)}
                            fill={myPalette[0]}
                        >
                            {showLabels && <LabelList dataKey="sample" position='top' style={{fontFamily: 'Calibri'}} />}
                        </Scatter>
                        <Scatter
                            name={mdataCategorical.g2.id}
                            data={data.filter(e => e.g == mdataCategorical.g2.id)}
                            fill={myPalette[1]}
                        >
                            {showLabels && <LabelList dataKey="sample" position='top' style={{fontFamily: 'Calibri'}} />}
                        </Scatter>
                    </ScatterChart>
                </Box>
                <Box sx={{}}>
                    <AxisSelector
                        selectedLV={selectedLV}
                        setSelectedLV={setSelectedLV}
                        projOpts={projOpts}
                        showLabels={showLabels}
                        setShowLabels={setShowLabels}
                    />
                </Box>
            </Box>
        </Box>
    )
}


const AxisSelector = ({ selectedLV, setSelectedLV, projOpts, showLabels, setShowLabels }) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}
        >
            <Box sx={{ position: 'relative', top: -50, left: -30 }}>
                <ShowLabels showLabels={showLabels} setShowLabels={setShowLabels} />
            </Box>
            <Box sx={{ px: 4 }}>
                <Autocomplete
                    value={selectedLV.x}//{mdataCol}
                    onChange={(e, newValue) => newValue && setSelectedLV(prev => ({ ...prev, x: newValue }))}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    id="xAxis"
                    options={projOpts}
                    sx={{ width: 200 }}
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
            <Box sx={{ p: 4 }}>
                <Autocomplete
                    value={selectedLV.y}//{mdataCol}
                    onChange={(e, newValue) => newValue && setSelectedLV(prev => ({ ...prev, y: newValue }))}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    id="yAxis"
                    options={projOpts}
                    sx={{ width: 200 }}
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
                {true && <Typography variant='h8' sx={{ display: 'block' }}>{`${payload[0].payload.sample}`}</Typography>}
                {payload[0].payload.g && <Typography variant='h8' sx={{ display: 'block' }}>{`Group: ${payload[0].payload.g}`}</Typography>}
                {true && <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[0].name}: ${payload[0].value.toFixed(3)}`}</Typography>}
                {true && <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[1].name}: ${payload[1].value.toFixed(3)}`}</Typography>}
            </Box>
        );
    }

    return null;
};

export default ScatterPlot