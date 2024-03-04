import { Box, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useMemo } from 'react'
import { useJob } from '../../JobContext'
import { useVars } from '@/components/VarsContext';

const BATCH_SIZE = 5;
const TIME_SLEEP = 1000; //in milliseconds
//const CMM_URI = "http://ceumass.eps.uspceu.es/mediator/api/v3/batch";
const CMM_URI = "mediator/api/v3/batch";

function Annotating() {

    const { jobID } = useJob();
    const { SERVER_URL, API_URL } = useVars();

    const xm_mid = useJob().norm.xm.columns;

    const { m2i } = useJob().user;
    const { annParams } = useJob();

    const mzBatches = useMemo(() => {

        const mzSerie = m2i.column(annParams.mzCol.id);
        const ionSerie = m2i.column(annParams.ionCol.id);

        const mzList = { pos: [], neg: [] };
        if (annParams.ionValPos !== null) {
            xm_mid.map((mid, i) => {
                m2i.index.includes(mid) &&
                    ionSerie.values[m2i.index.indexOf(mid)] == annParams.ionValPos.id &&
                    mzList['pos'].push(parseFloat(mzSerie.values[m2i.index.indexOf(mid)]));
            });
        }
        if (annParams.ionValNeg !== null) {
            xm_mid.map((mid, i) => {
                m2i.index.includes(mid) &&
                    ionSerie.values[m2i.index.indexOf(mid)] == annParams.ionValNeg.id &&
                    mzList['neg'].push(parseFloat(mzSerie.values[m2i.index.indexOf(mid)]));
            });
        }

        // make batches
        const mzBatches = { 'pos': [], 'neg': [] };
        for (let i = 0; i < mzList.pos.length; i += BATCH_SIZE) {
            mzBatches.pos.push(mzList.pos.slice(i, i + BATCH_SIZE));
        }

        for (let i = 0; i < mzList.neg.length; i += BATCH_SIZE) {
            mzBatches.neg.push(mzList.neg.slice(i, i + BATCH_SIZE));
        }

        return mzBatches;
    });

    const fetchCMM = (ion_mode, adducts, masses) => {
        return new Promise(async (resolve, reject) => {
            const body = {
                "metabolites_type": "all-except-peptides",
                "databases": ["all-except-mine"],
                "masses_mode": "mz",
                "ion_mode": ion_mode,
                "adducts": adducts,
                "tolerance": annParams.mzError,
                "tolerance_mode": "ppm",
                "masses": masses
            };


            try {
                const res = await fetch(
                    `${SERVER_URL}/${CMM_URI}`,
                    {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(body)
                    });

                if (res.ok) {
                    console.log('Successful POST request');
                    const resJson = await res.json()
                    resolve(resJson.results);
                } else {
                    console.error('Error on POST request:', res.statusText);
                    reject([]);
                }
            } catch (error) {
                console.error('Error al realizar la solicitud POST:', error);
                reject([]);
            }
        })
    }

    const requestCMM = async () => {
        console.log('Startinng request to CMM');

        const fullResCMM = { 'pos': [], 'neg': [] };

        // POSITIVE
        if (annParams.ionValPos !== null) {
            //for (let i = 0; i < mzBatches.pos.length; i++) {
            for (let i = 0; i < 1; i++) {
                const resCMM = await fetchCMM('positive', annParams.posAdd, mzBatches.pos[i]);
                fullResCMM.pos = [...fullResCMM.pos, ...resCMM];
                await new Promise(r => setTimeout(r, TIME_SLEEP));
            }

            console.log('Positive: Sending request to TP');
            const resTP = await fetch(`${API_URL}/run_turboputative/pos/${jobID}`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(fullResCMM.pos)
                }
            );
            console.log('Positive:', resTP)
        }

        // NEGATIVE
        if (annParams.ionValNeg !== null) {
            //for (let i = 0; i < mzBatches.neg.length; i++) {
            for (let i = 0; i < 1; i++) {
                const resCMM = await fetchCMM('negative', annParams.negAdd, mzBatches.neg[i]);
                fullResCMM.neg = [...fullResCMM.neg, ...resCMM];
                await new Promise(r => setTimeout(r, TIME_SLEEP));
            }

            console.log('Negative: Sending request to TP');
            const resTP = await fetch(`${API_URL}/run_turboputative/neg/${jobID}`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(fullResCMM.neg)
                }
            );
        }

        // Run interval to ask if positive and negative finished

    };


    useEffect(() => {
        const cmmTimeOut = setTimeout(requestCMM, 1000);
        return () => clearTimeout(cmmTimeOut);
    }, []);

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 60,
                height: 0,
                width: '100%',

            }}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'right',
                alignContent: 'center',
                border: '0px solid blue',
                height: 0,
            }}
            >
                <Box sx={{
                    width: '11%',
                    height: 80,
                    border: '0px solid red',
                    textAlign: 'center',
                    pt: 4
                }}
                >
                    <Box sx={{ border: '0px solid green' }}>
                        <Box>
                            <CircularProgress disableShrink size={20} />
                        </Box>
                        <Box>
                            <Typography variant='body2' sx={{ userSelect: 'none' }}>
                                Running CMM
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Annotating