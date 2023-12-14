import { useJob } from '@/components/app/JobContext'
import { Box, Typography } from '@mui/material';
//import { BarChart } from '@mui/x-charts';

import { Cell, BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { myPalette } from '@/utils/myPalette';
import { useVars } from '@/components/VarsContext';
import Image from 'next/image';

function GProfiler({ fRef }) {

    const BASE_URL = useVars().BASE_URL;
    const [qSet, setQSet] = useState([]);
    const [goRes, setGoRes] = useState(null);

    const q2i = useJob().user.q2i;
    const { OS } = useJob()
    const myBackg = useMemo(() => q2i.index, [q2i]);
    const mySet = fRef.map(e => e[q2i.columns[0]]);

    if (
        !mySet.map(e => qSet.includes(e)).every(e => e) ||
        !qSet.map(e => mySet.includes(e)).every(e => e)
    ) {
        setQSet(mySet);
    }

    const gProfiler = useCallback(async () => {
        const res = await fetch(
            'https://biit.cs.ut.ee/gprofiler/api/gost/profile/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "organism": OS.id,
                    "query": qSet,
                    "domain_scope": "custom",
                    "background": myBackg,
                    "user_threshold": 1e-1,
                    "significance_threshold_method": "bonferroni",
                    'sources': ['GO:MF', 'GO:BP', 'GO:CC']//, 'GO:CC', 'KEGG', 'REAC']
                })
            }
        )
        const resJson = await res.json();
        console.log(resJson);
        setGoRes(resJson);
    }, [OS, qSet, myBackg]);

    useEffect(() => {
        const myTimeOut = setTimeout(gProfiler, 100);
        return () => clearTimeout(myTimeOut);
    }, [qSet, myBackg, gProfiler]);

    const myData = useMemo(() => {
        if (goRes == null) return null;
        const myData = goRes.result.map(e => ({
            ...e,
            '-Log10(pvalue)': Math.round(-Math.log10(e.p_value) * 10000) / 10000
        }));
        return myData
    }, [goRes]);

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ mr: 2 }}><Typography variant='h6'>GO Enrichment with</Typography></Box>
                <Box sx={{ cursor: 'pointer' }} onClick={() => window.open("https://biit.cs.ut.ee/gprofiler/gost", "_blank", "noreferrer")}><Image
                    src={`${BASE_URL}/gProfiler_logo.png`}
                    width={110}
                    height={30}
                    className="d-inline-block align-top"
                    alt="g:Profiler"
                    href="https://biit.cs.ut.ee/gprofiler/gost"
                /></Box>
            </Box>
            <Box sx={{
                border: '1px solid #999999',
                borderRadius: 5,
                paddingX: 0
            }}>
                {myData && <>
                    <Box sx={{
                        width: 530,
                        height: 450,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        m: 'auto',
                    }}>
                        <BarChart
                            width={500}
                            height={Math.max(400, 35 * myData.length)}
                            data={myData}
                            margin={{
                                top: 0,
                                right: 0,
                                left: 50,
                                bottom: 0,
                            }}
                            layout='vertical'
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis type='category' dataKey="native" />
                            <XAxis type='number' />
                            <Tooltip
                                content={<CustomTooltip />}
                            />
                            <Legend content={() => <CustomLegend />} align="center" verticalAlign="top" />
                            <Bar dataKey='-Log10(pvalue)' fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />}>
                                {myData.map(e => (
                                    <Cell key={e.native} fill={getColor(e.source)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </Box>
                </>}
            </Box>
        </ Box>
    )
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                className="custom-tooltip"
                sx={{
                    width: 400,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(50, 50, 50, 0.8)',
                    padding: 1,
                    borderRadius: 1,
                    color: 'rgba(50,50,50,1)'
                }}
            >
                {true && <Typography variant='h7' sx={{ display: 'block' }}>{`${payload[0].payload.source} - ${payload[0].payload.native}`}</Typography>}
                {true && <Typography variant='h7' sx={{ display: 'block' }}>{`${payload[0].payload.name}`}</Typography>}
                {true && <Typography variant='h7' sx={{ display: 'block' }}>{`${payload[0].payload.description}`}</Typography>}
                {false && <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[0].name}: ${typeof (payload[0].value) == 'string' ? payload[0].value : payload[0].value.toFixed(3)}`}</Typography>}
                {false && <Typography variant='h9' sx={{ display: 'block' }}>{`${payload[1].name}: ${payload[1].value.toFixed(3)}`}</Typography>}
            </Box>
        );
    }

    return null;
};

const CustomLegend = () => {
    const legendData = [
        { value: 'GO:MF', color: myPalette[0] },
        { value: 'GO:BP', color: myPalette[1] },
        { value: 'GO:CC', color: myPalette[2] },
    ];
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            {legendData.map((entry, index) => (
                <div key={index} style={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '15px', height: '15px', backgroundColor: entry.color, marginRight: '5px' }} />
                    <span>{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

const getColor = (category) => {
    switch (category) {
        case 'GO:MF': {
            return myPalette[0]
        }
        case 'GO:BP': {
            return myPalette[1]
        }
        case 'GO:CC': {
            return myPalette[2]
        }
    }
}



export default GProfiler