import { useVars } from '@/components/VarsContext';
import { useJob } from '@/components/app/JobContext'
import { useResults } from '@/components/app/ResultsContext';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react'
import { MySelect } from '../../EDA/DataDistribution/MyFormComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import generateArray from '@/utils/generateArray';

function GSEA({ f2MeanL, fSet, omic }) {

    const BASE_URL = useVars().BASE_URL;
    const mdataCol = useResults().MOFA.displayOpts.selectedPlot.mdataCol;
    const mdataColInfo = useJob().mdataType[mdataCol];
    const [groups, setGroups] = useState({
        g1: mdataColInfo.levels[0],
        g2: mdataColInfo.levels[1]
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const myTimeout = setTimeout(() => setLoading(true), 100);
        const myTimeOut2 = setTimeout(() => setLoading(false), 1500);
        return () => { clearTimeout(myTimeout); clearTimeout(myTimeOut2) };
    }, [fSet]);

    const { ES, setBool, deltaZ, score } = useMemo(() => {
        let data = Object.keys(f2MeanL).map(
            e => [e, f2MeanL[e][groups.g1] - f2MeanL[e][groups.g2], fSet.includes(e)]
        );

        data = data.map(e => [
            e[0], // feature ID
            e[1], //Rank score (deltaZ)
            e[2], // boolean with true if element is in set
            e[2] ? Math.abs(e[1]) : 0, // Score to calculate Fset
            e[2] ? 0 : 1 // Score to calculate FNset
        ])

        data.sort((a, b) => b[1] - a[1]);

        const sumFset = data.map(e => e[3]).reduce((prev, e) => prev + e);
        const sumFNset = data.map(e => e[4]).reduce((prev, e) => prev + e);

        const cumFset = data.map((sum => e => sum += (e[3]) / sumFset)(0));
        const cumFNset = data.map((sum => e => sum += (e[4] / sumFNset))(0));

        const ES = cumFset.map((v, i) => v - cumFNset[i]);
        const setBool = data.map(e => e[2]);
        const deltaZ = data.map(e => e[1]);
        const score = Math.abs(Math.max(...ES)) > Math.abs(Math.min(...ES)) ? Math.max(...ES) : Math.min(...ES);

        return { ES, setBool, deltaZ, score }
    }, [f2MeanL, groups, fSet])

    return (
        <Box sx={{ mt: 3, height:550 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ mr: 2 }}><Typography variant='h6'>GSEA</Typography></Box>
                <Box sx={{ cursor: 'pointer' }} onClick={
                    () => window.open(
                        "https://www.gsea-msigdb.org/gsea/index.jsp",
                        "_blank",
                        "noreferrer"
                    )
                }>
                    <Image
                        src={`${BASE_URL}/GSEA_logo.gif`}
                        width={85}
                        height={30}
                        className="d-inline-block align-top"
                        alt="GSEA"
                    /></Box>
            </Box>
            <Box>
                <GroupsSelector
                    groups={groups}
                    setGroups={setGroups}
                    mdataColInfo={mdataColInfo}
                />
            </Box>
            <Box sx={{ mt: 3, opacity: omic == 'q' && loading ? 0 : 1, transition: 'all ease 1s', }}>
                <GSEAplot
                    ES={ES}
                    setBool={setBool}
                    deltaZ={deltaZ}
                    score={score}
                />
            </Box>
        </Box>
    )
}

const GroupsSelector = ({ groups, setGroups, mdataColInfo }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '20%' }}>
                <MySelect
                    options={mdataColInfo.levels.map(e => ({ label: e, value: e }))}
                    onChange={
                        e => setGroups(prev => ({ ...prev, g1: e.value }))
                    }
                    value={{ label: `${groups.g1}`, value: groups.g1 }}
                    label=''
                />
            </Box>
            <Box sx={{ mx: 2, pt: 3.5 }}><Typography variant='h6'>vs</Typography></Box>
            <Box sx={{ width: '20%' }}>
                <MySelect
                    options={mdataColInfo.levels.map(e => ({ label: e, value: e }))}
                    onChange={
                        e => setGroups(prev => ({ ...prev, g2: e.value }))
                    }
                    value={{ label: `${groups.g2}`, value: groups.g2 }}
                    label=''
                />
            </Box>
        </Box>
    )
}

const GSEAplot = ({ ES, setBool, deltaZ, score }) => {

    const interval = Math.ceil(ES.length / 100);
    const ESdata = ES/*.filter((e,i) => i%interval==0)*/.map((e, i) => ({ ES: e, index: i }));
    const Zdata = deltaZ.map((e, i) => ({ deltaZ: e, index: i }));

    //console.log(data)

    return (
        <Box>
            <Typography>Score = {Math.round(score * 1000) / 1000} | p-value {'<'} 1</Typography>
            <Box>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={ESdata} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                        <XAxis dataKey="index" tick={false} />
                        <YAxis label={{ value: 'ES', angle: -90, position: 'insideLeft' }} />
                        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="ES" stroke="grey" strokeWidth={1} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
            <Box sx={{ position: 'relative', top: -28, border: '0px solid red' }}>
                <ResponsiveContainer width="100%" height={80}>
                    <LineChart margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" domain={generateArray(0, setBool.length, 1)} tick={false} />
                        <YAxis />
                        {setBool.map((isInSet, index) => (
                            isInSet && <ReferenceLine key={index} x={index} strokeWidth={0.5} stroke="grey" />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </Box>
            <Box sx={{ position: 'relative', top: -58, border: '0px solid red' }}>
                <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={Zdata} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <XAxis dataKey="index" tick={false} />
                        <YAxis label={{ value: 'ΔZ', angle: -90, position: 'insideLeft' }} />
                        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="deltaZ" stroke="grey" fill="grey" />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default GSEA