import { useVars } from '@/components/VarsContext';
import { useJob } from '@/components/app/JobContext'
import { useResults } from '@/components/app/ResultsContext';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
//import { MySelect } from '../../EDA/DataDistribution/MyFormComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import generateArray from '@/utils/generateArray';
//import { resolve } from 'styled-jsx/css';



function CustomGSEA({ f2MeanL, fSet }) {

    const EMPIRICAL_PVALUE = 100;

    const BASE_URL = useVars().BASE_URL;
    const [loading, setLoading] = useState(false);

    const dataZ = useMemo(() => {
        return Object.keys(f2MeanL).map(
            e => [e, f2MeanL[e]]
        );
    }, [f2MeanL]);

    const { ES, setBool, deltaZ, score } = useMemo(
        () => calculateGSEA(dataZ, fSet), [dataZ, fSet]
    )

    const [empPvalue, setEmpPvalue] = useState(null);
    const getPvalue = useCallback(async () => {
        const pvalue = await new Promise(resolve => {
            if (isNaN(score)) resolve(1)
            const nullZ = [];
            for (let i = 0; i < EMPIRICAL_PVALUE; i++) {
                const randomSet = getRandomElements(Object.keys(f2MeanL), fSet.length);
                const nullScore = calculateGSEA(dataZ, randomSet).score;
                nullZ.push(nullScore);
            }

            let pvalue = nullZ.filter(
                e => Math.abs(e) > Math.abs(score)
            ).length / EMPIRICAL_PVALUE;

            pvalue = pvalue == 0 ? 1 / EMPIRICAL_PVALUE : pvalue;
            resolve(pvalue);
        });
        setEmpPvalue(pvalue);
    }, [score, EMPIRICAL_PVALUE, f2MeanL, fSet, dataZ]);

    useEffect(() => {
        getPvalue();
    }, [getPvalue]);

    return (
        <Box sx={{ mt: 0, height: 540 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ mr: 2 }}><Typography variant='h5'>Set Enrichment Analysis</Typography></Box>

            </Box>
            <Box sx={{ mt: 3, opacity: loading ? 0 : 1, transition: 'all ease 1s', }}>
                <GSEAplot
                    ES={ES}
                    setBool={setBool}
                    deltaZ={deltaZ}
                    score={score}
                    pvalue={empPvalue}
                />
            </Box>
        </Box>
    )
}

const GSEAplot = ({ ES, setBool, deltaZ, score, pvalue }) => {

    const interval = Math.ceil(ES.length / 100);
    const ESdata = ES/*.filter((e,i) => i%interval==0)*/.map((e, i) => ({ ES: e, index: i }));
    const Zdata = deltaZ.map((e, i) => ({ deltaZ: e, index: i }));

    //console.log(data)

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent:'center', my:0}}>
                <Typography>
                    Enrichment Score = {Math.round(score * 1000) / 1000}
                </Typography>
            </Box>
            <Box sx={{display: 'flex', justifyContent:'center', my:1}}>
                <Typography>
                    Empirical p-value {'≤'} {pvalue}
                </Typography>
                </Box>
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

const calculateGSEA = (dataZ, fSet) => {
    let data = dataZ.map(
        e => [...e, fSet.includes(e[0])]
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
}

function getRandomElements(arr, n) {
    const randomElements = [];
    const arrayCopy = [...arr]; // Create a copy of the original array to avoid direct modification

    // Ensure that we don't attempt to take more elements than the array has
    n = Math.min(n, arr.length);

    for (let i = 0; i < n; i++) {
        const randomIndex = Math.floor(Math.random() * arrayCopy.length);
        const selectedElement = arrayCopy.splice(randomIndex, 1)[0];
        randomElements.push(selectedElement);
    }

    return randomElements;
}

export default CustomGSEA