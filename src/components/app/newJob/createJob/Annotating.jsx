import { Box, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatchJob, useJob } from '../../JobContext'
import { useVars } from '@/components/VarsContext';

const BATCH_SIZE = 5;
const TIME_SLEEP = 1000; //in milliseconds
//const CMM_URI = "http://ceumass.eps.uspceu.es/mediator/api/v3/batch";
const CMM_URI = "mediator/api/v3/batch";

function Annotating() {

    const { SERVER_URL, API_URL } = useVars();

    const getTPRef = useRef();

    const dispatchJob = useDispatchJob();

    // Get data from jobContext
    const { jobID } = useJob();
    const xm_mid = useJob().norm.xm.columns;
    const { m2i } = useJob().user;
    const m2i_fileName = useJob().userFileNames.m2i;
    const { annParams } = useJob();

    // Component state
    const [loadText, setLoadText] = useState('');
    const [status, setStatus] = useState('waiting'); // waiting, error, ok

    // Batches of mz to be sent to CMM
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

    // Get results from TP
    const getTurboPutative = async () => {

        setLoadText('Running TurboPutative');

        let ion_mode = [];
        annParams.ionValPos !== null && ion_mode.push('pos');
        annParams.ionValNeg !== null && ion_mode.push('neg');

        const res = await fetch(`${API_URL}/get_turboputative/${jobID}/${ion_mode.join('_')}`);
        const resJson = await res.json();
        console.log(resJson.status);

        if (resJson.status == 'ok') {
            setLoadText('CMM & TP Finished');
            setStatus('ok');
            clearInterval(getTPRef.current);
            dispatchJob({
                type: 'user-upload',
                dfJson: resJson.m2i,
                fileType: 'm2i',
                userFileName: m2i_fileName
            })
        }

        if (resJson.status == 'error') {
            setLoadText('Putative Annotation Error');
            setStatus('error')
            clearInterval(getTPRef.current);
            console.log(resJson);
        }

    }

    // Fetch putative annotations from CMM
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

    // Loop all mz batches
    const requestCMM = async () => {
        console.log('Startinng request to CMM');

        const fullResCMM = { 'pos': [], 'neg': [] };

        // POSITIVE
        if (annParams.ionValPos !== null) {

            setLoadText('Running CMM Positive Mode');

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
        }

        // NEGATIVE
        if (annParams.ionValNeg !== null) {

            setLoadText('Running CMM Negative Mode');

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
        getTPRef.current = setInterval(getTurboPutative, 10_000);

    };

    useEffect(() => {
        const cmmTimeOut = setTimeout(requestCMM, 1000);
        return () => clearTimeout(cmmTimeOut);
    }, []);

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 40,
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
                    display: 'flex',
                    justifyContent: 'center',
                    width: '160px',
                    height: 100,
                    border: '0px solid red',
                    pt: 4
                }}
                >
                    <Box sx={{ width: '100px', textAlign: 'center', border: '0px solid green' }}>
                        {status == 'waiting' &&
                            <Box>
                                <CircularProgress disableShrink size={20} />
                            </Box>
                        }
                        {status == 'ok' &&
                            <Box>
                                <Typography>POS</Typography>
                                <Typography>NEG</Typography>
                            </Box>
                        }
                        <Box>
                            <Typography variant='body2' sx={{ userSelect: 'none' }}>
                                {loadText}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Annotating