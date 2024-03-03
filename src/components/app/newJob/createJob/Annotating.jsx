import { Box, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useMemo } from 'react'
import { useJob } from '../../JobContext'
import { useVars } from '@/components/VarsContext';

const BATCH_SIZE = 5;
//const CMM_URI = "http://ceumass.eps.uspceu.es/mediator/api/v3/batch";
const CMM_URI = "mediator/api/v3/batch";

function Annotating() {

    const {SERVER_URL} = useVars();

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

    const requestCMM = async () => {
        console.log('Startinng request to CMM');
        console.log(`${SERVER_URL}/${CMM_URI}`)
        try {
            const res = await fetch(
                `${SERVER_URL}/${CMM_URI}`, 
                {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "metabolites_type": "all-except-peptides",
                    "databases": ["all-except-mine"],
                    "masses_mode": "mz",
                    "ion_mode": "negative",
                    "adducts": ["M-H", "M-2H"],
                    "tolerance": 10.0,
                    "tolerance_mode": "ppm",
                    "masses": [400.3432, 422.32336]
                })
            });

            if (res.ok) {
                console.log('Solicitud POST exitosa');
                const resJson = await res.json()
                console.log(resJson);
            } else {
                console.error('Error en la solicitud POST:', res.statusText);
            }
        } catch (error) {
            console.error('Error al realizar la solicitud POST:', error);
            return;
        }
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
                    width: '12%',
                    height: 80,
                    border: '0px solid red',
                    textAlign: 'center',
                    pt: 2
                }}
                >
                    <Box sx={{ border: '0px solid green' }}>
                        <Box>
                            <CircularProgress disableShrink size={20} />
                        </Box>
                        <Box>
                            <Typography variant='body2'>Running CMM</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Annotating