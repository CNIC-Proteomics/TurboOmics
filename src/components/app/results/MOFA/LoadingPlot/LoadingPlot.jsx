import { useDispatchResults, useResults } from '@/components/app/ResultsContext';
import { Box, Slider, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useEffect, useMemo, useState } from 'react';
import {
    CartesianGrid,
    XAxis,
    YAxis,
    ReferenceArea,
    LineChart,
    Line,
    ReferenceLine
} from 'recharts'
import { calculateXTicks } from '../../EDA/DataDistribution/utils';


function LoadingPlot({ omic, fLVec, nFeatRef }) {

    const [thrL, setThrL] = useState({ down: 0, up: 0 });
    const [nFeat, setNFeat] = useState({ down: 0, up: 0 });

    /*
    Initialize loading threshold and number of features
    */
    useEffect(() => {
        const myNFeat = {
            down: Math.floor(fLVec.length * 0.01),
            up: Math.floor(fLVec.length * 0.01)
        };
        
        setNFeat(myNFeat);
        nFeatRef.current[omic] = myNFeat;

        setThrL({
            down: fLVec[myNFeat.down][1],
            up: fLVec[fLVec.length - myNFeat.up - 1][1]
        });

    }, [fLVec, nFeatRef]);
    /**/

    /*
    Get data to plot
    */
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
    /**/

    /*
    Handle user modifications in thresholds
    */
    const handleSlider = ([down, up]) => {
        const myThrL = { down: Math.min(down, 0), up: Math.max(up, 0) }
        setThrL(myThrL);
        const myNFeat = {
            down: fLVec.filter(e => e[1] < myThrL.down).length,
            up: fLVec.filter(e => e[1] > myThrL.up).length
        }

        setNFeat(myNFeat);
        nFeatRef.current[omic] = myNFeat;
    };
    

    const handleClick = (value) => {
        if (value < 0) {
            setThrL(prevState => ({ ...prevState, down: value }));

            const myValue = fLVec.filter(e => e[1] < value).length
            setNFeat(prevState => ({ ...prevState, down: myValue }));
            nFeatRef.current[omic].down = myValue
        } else {
            setThrL(prevState => ({ ...prevState, up: value }));

            const myValue = fLVec.filter(e => e[1] > value).length
            setNFeat(prevState => ({ ...prevState, up: myValue }));
            nFeatRef.current[omic].up = myValue
        }
    }

    const handleNumber = (value, type) => {

        const number = parseInt(value);
        if (isNaN(number)) {
            setNFeat(prevState => ({ ...prevState, [type]: 0 }));
            return
        };

        if (type == 'down') {
            const fLVecDown = fLVec.filter(e => e[1] < 0);

            if (number >= 0 && number < fLVecDown.length) {
                nFeatRef.current[omic].down = number
                setNFeat(prevState => ({ ...prevState, down: number }));
                setThrL(prevState => ({ ...prevState, down: fLVecDown[number][1] }));
            } else if (number < 0) {
                nFeatRef.current[omic].down = 0
                setNFeat(prevState => ({ ...prevState, down: 0 }));
                setThrL(prevState => ({ ...prevState, down: fLVecDown[0][1] }));
            } else if (number >= fLVecDown.length) {
                nFeatRef.current[omic].down = fLVecDown.length
                setNFeat(prevState => ({ ...prevState, down: fLVecDown.length }));
                setThrL(prevState => ({ ...prevState, down: 0 }));
            }
        }

        if (type == 'up') {
            const fLVecUp = fLVec.filter(e => e[1] > 0);

            if (number > 0 && number < fLVecUp.length) {
                nFeatRef.current[omic].up = number;
                setNFeat(prevState => ({ ...prevState, up: number }));
                setThrL(prevState => ({ ...prevState, up: fLVecUp[fLVecUp.length - number][1] }));
            } else if (number <= 0) {
                nFeatRef.current[omic].up = 0;
                setNFeat(prevState => ({ ...prevState, up: 0 }));
                setThrL(prevState => ({ ...prevState, up: fLVecUp[fLVecUp.length - 1][1] }));
            } else if (number >= fLVecUp.length) {
                nFeatRef.current[omic].up = fLVecUp.length;
                setNFeat(prevState => ({ ...prevState, up: fLVecUp.length }));
                setThrL(prevState => ({ ...prevState, up: 0 }));
            }
        }
    }
    /**/

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
                            Negatively Associated Features
                        </Typography>
                        <TextField
                            size='small'
                            value={nFeat.down}
                            inputProps={{ min: 0, style: { textAlign: 'center', width: 45, height: 12 } }}
                            onChange={e => handleNumber(e.target.value, 'down')}
                        />
                    </Box>
                    <Box sx={{ width: '33%' }}>
                        <Typography variant='body1'>
                            Positively Associated Features
                        </Typography>
                        <TextField
                            size='small'
                            value={nFeat.up}
                            inputProps={{ min: 0, style: { textAlign: 'center', width: 45, height: 12 } }}
                            onChange={e => handleNumber(e.target.value, 'up')}
                        />
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