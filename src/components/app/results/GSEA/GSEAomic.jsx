import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { Box, Autocomplete, TextField, Typography, Button, Divider } from "@mui/material"
import SendIcon from '@mui/icons-material/Send';
import useFx2i from '@/hooks/useFx2i';
import { useVars } from '@/components/VarsContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useJob } from '../../JobContext';
import MyMotion from '@/components/MyMotion';
import ParamSelector from './ParamSelector';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';
import DbSelector from './utils/DbSelector';
import { getMeanDiff, getMedian, getTvalue } from './utils/stats';
import { tsvToDanfo } from '@/utils/tsvToDanfo';
//import { MetaboID } from '../../../../utils/MetaboID';

import dynamic from 'next/dynamic';
const EnrichmentTable = dynamic(
    () => import('./EnrichmentTable')
);
const CustomEnrichment = dynamic(
    () => import('./CustomEnrichment')
);
//import EnrichmentTable from './EnrichmentTable';
//import CustomEnrichment from './CustomEnrichment';

/*
Constants
*/



/*
Main Component
*/

function GSEAomic({ omic }) {
    // check if this is a metabolomics section
    const isM = omic == 'm';

    const { API_URL } = useVars();
    const { OS } = useJob();
    const { jobID } = useJob();

    // Get results
    const results = useResults();
    const dispatchResults = useDispatchResults();
    const gseaObj = results.GSEA[omic];

    // Get fx2i 
    const [fx2i] = useFx2i(omic);

    // Data used for GSEA
    const [g2info, setG2info] = useState(gseaObj.g2info);

    // Get quantifications
    const xi = useJob().norm[`x${omic}`];

    // Get mdata
    const { mdataType } = useJob();

    // Generate column options for feature id (protein or transcript) or mz (untargeted metab.)
    const [gidCol, setGidCol] = useState(isM ? null : gseaObj.gidCol);//isM ? { id: 'Apex m/z', label: 'Apex m/z' } : null);

    // Untargeted metabolomic enrichment
    const [mParams, setMParams] = useState(gseaObj.mParams);

    const mMethod = useMemo(() => ({
        msea: isM && !!mParams.mid && !!mParams.midType,
        mummichog: isM && !!mParams.mz && !!mParams.rt && !!mParams.ionCol && (!!mParams.ionVal.pos || !!mParams.ionVal.neg)
    }), [isM, mParams]);

    // GSEA ranking metric
    const [rankCol, setRankCol] = useState(gseaObj.rankParams.rankCol);
    const [subRankCol, setSubRankCol] = useState(gseaObj.rankParams.subRankCol);
    const [groups, setGroups] = useState(gseaObj.rankParams.groups); // only for t-test

    // DataBases
    const [db, setDb] = useState(gseaObj.db);

    // Run GSEA
    const getGseaId = useCallback(() => {

        let myGseaID = `${OS.scientific_name.replace(' ', '_')}-${rankCol.label}-${subRankCol.id}`;
        myGseaID += ['Mean difference', 't-test'].includes(rankCol.label) ?
            `${groups.g1.id}vs${groups.g2.id}` : '';

        if (!isM) {
            myGseaID += `-${gidCol.id}`;
        }

        if (mMethod.msea) {
            myGseaID += `-${mParams.mid.id}-${mParams.midType.id}`;
        }

        if (mMethod.mummichog) {
            myGseaID += `-${mParams.mz.id}-${mParams.rt.id}`;
            myGseaID += mParams.ionVal.pos.id ? '_' + mParams.ionVal.pos.id : '';
            myGseaID += mParams.ionVal.neg.id ? '_' + mParams.ionVal.neg.id : '';
        }

        myGseaID = myGseaID.replace(/[^a-zA-Z0-9]/g, '_');
        return myGseaID

    }, [gidCol, rankCol, subRankCol, groups, OS, isM, mParams, mMethod]);

    const [gseaID, setGseaID] = useState(gseaObj.guiParams.gseaID);
    const [waitingGsea, setWaitingGsea] = useState([]);
    const [gseaData, setGseaData] = useState(gseaObj.gseaData);
    const [showGsea, setShowGsea] = useState(gseaObj.guiParams.showGsea);
    const [titleGsea, setTitleGsea] = useState(gseaObj.guiParams.titleGsea);

    const handleRunGSEA = useCallback(() => {
        console.log('Run GSEA');

        // get rank
        let preData = {};

        if (!isM) {
            //preData = g2info;
            Object.keys(g2info).map(e => preData[e] = { ...g2info[e] })
        } else {
            fx2i.index.map(e => preData[e] = { f: [e] });

            if (mMethod.msea) {
                const MetaboID = require('@/utils/MetaboID.json');
                const midSerie = fx2i.column(mParams.mid.id);
                midSerie.index.map((e, i) => {
                    const mid = midSerie.values[i]
                    const midIndex = MetaboID[mParams.midType.id].indexOf(mid);
                    preData[e].mid = mid;
                    preData[e].KEGG = MetaboID.KEGG[midIndex];
                    preData[e].ChEBI = MetaboID.ChEBI[midIndex];
                });
            }

            if (mMethod.mummichog) {
                const mzSerie = fx2i.column(mParams.mz.id);
                mzSerie.index.map((e, i) => preData[e].mz = mzSerie.values[i]);
            }

        }

        if (rankCol.label == 'PCA') {
            const ranks = results.EDA.PCA[omic].data.loadings;
            const pcakey = subRankCol.id.replace(/PCA/, '');
            Object.keys(preData).map(e => {
                preData[e].fRank = preData[e].f.map(f => ranks[f][pcakey])
            });
        }

        if (rankCol.label == 'MOFA') {
            const ranks = results.MOFA.data.loadings[omic][subRankCol.id];
            Object.keys(preData).map(e => {
                preData[e].fRank = preData[e].f.map(f => ranks[f])
            });
        }

        if (['Mean difference', 't-test'].includes(rankCol.label)) {
            const xiJson = danfo2RowColJson(xi);
            const g1Id = mdataType[subRankCol.id].level2id[groups.g1.id]
                .filter(e => xi.index.includes(e));
            const g2Id = mdataType[subRankCol.id].level2id[groups.g2.id]
                .filter(e => xi.index.includes(e));

            Object.keys(preData).map(e => {
                preData[e].fRank = preData[e].f.map(f => {
                    const g1v = g1Id.map(myid => xiJson[myid][f]);
                    const g2v = g2Id.map(myid => xiJson[myid][f]);
                    if (rankCol.label == 'Mean difference') return getMeanDiff(g1v, g2v);
                    if (rankCol.label == 't-test') return getTvalue(g1v, g2v);
                });
            });
        }

        if (rankCol.label == 'Custom') {
            const fx2iJson = danfo2RowColJson(fx2i);
            Object.keys(preData).map(e => {
                preData[e].fRank = preData[e].f.map(f => fx2iJson[f][subRankCol.id]);
            });
        }

        // combine ranks
        Object.keys(preData).map(e => {
            preData[e].rank = getMedian(preData[e].fRank);
        });

        // Set data for GSEA
        setGseaData(preData);
        dispatchResults({ type: 'set-gsea-data', gseaData: preData, omic })

        // Create identifier
        const myGseaID = getGseaId();
        setGseaID(myGseaID);

        // Add GSEA job to waiting list
        setWaitingGsea([{ id: myGseaID }]);

        // Show results section
        let _titleGsea = `Enrichment Analysis: ${rankCol.label} | ${subRankCol.label}
            ${['Mean difference', 't-test'].includes(rankCol.label) ? ' | ' +
                groups.g1.label + ' vs ' + groups.g2.label : ''}`
        setTitleGsea(_titleGsea);
        setShowGsea(false);

        if (!isM) {
            setDb(prev => prev.map(e => e.db == 'Custom' ? e : { ...e, status: 'waiting' }))
        } else {
            setDb(prev => prev.map(e => {
                if (e.db == 'Custom') return e
                if (['KEGG', 'ChEBI'].includes(e.db)) {
                    if (mMethod.msea) {
                        return { ...e, status: 'waiting' }
                    } else {
                        return { ...e, status: '' }
                    }
                }
                if (['pos', 'neg'].includes(e.db)) {
                    if (mMethod.mummichog) {
                        return { ...e, status: 'waiting' }
                    } else {
                        return { ...e, status: '' }
                    }
                }
            }))
        }

        //setDb(prev => prev.map(e => e.db == 'Custom' ? e : {...e,  status:'waiting'}))
        setDb(prev => prev.map(e => ({ ...e, show: e.db == 'Custom' ? true : false })))
        setTimeout(() => setShowGsea(true), 500);
        dispatchResults({
            type: 'set-run-gsea',
            omic: omic,
            guiParams: { gseaID: myGseaID, title: _titleGsea, showGsea: true },
        })
        console.log('Executed');

    }, [
        g2info, rankCol, subRankCol, groups,
        fx2i, getGseaId, isM, mdataType, mMethod,
        omic, results, xi, mParams, dispatchResults
    ]);

    /*
    BACK-END INTERACTION
    */

    const [backendStatus, setBackendStatus] = useState('ready'); // ready; sendJob

    // Ask back-end for Gsea results
    const fetchResultsRef = useRef();

    const fetchResults = useCallback(async (mydb) => {
        console.log('fetchResults: Getting GSEA results for ', mydb);

        //if (!isM) {
        const res = await fetch(
            `${API_URL}/get_gsea/${jobID}/${omic}/${gseaID}/${mydb}`
        );
        const resJson = await res.json();

        if (resJson.status != 'waiting') {

            let gseaRes = null;
            if (resJson.status == 'ok') {
                if (isM && ['pos', 'neg'].includes(mydb)) {
                    gseaRes = await tsvToDanfo(resJson.gseaRes, '\t', false);
                    const EC2fid = await tsvToDanfo(resJson.usrInput2EC, '\t', false);

                    gseaRes = gseaRes.map(e => {
                        if (!e['overlap_EmpiricalCompounds (id)']) {
                            return { ...e, overlap_fid: '' };
                        } else {
                            const myEC = e['overlap_EmpiricalCompounds (id)'].split(',');
                            const fid = [...new Set(
                                EC2fid.filter(e2 => myEC.includes(e2.EID))
                                    .map(e2 => e2.CompoundID_from_user)
                            )];
                            return { ...e, overlap_fid: fid.join(',') };
                        }

                    });

                } else {
                    gseaRes = resJson.gseaRes;
                }
            }

            setDb(prev => prev.map(e => {
                return e.db == mydb ? { ...e, status: resJson.status, gseaID, gseaRes } : e;
            }));
            dispatchResults({
                type: 'set-db', db: mydb, status: resJson.status, gseaID, gseaRes, omic
            });

            clearInterval(fetchResultsRef.current[mydb]);
            console.log('GSEA results were got for ', mydb);
        }

    }, [jobID, omic, gseaID, API_URL, fetchResultsRef, isM, dispatchResults]);

    // Run GSEA in the back-end when there is one waiting job
    // useEffect look at waitingGsea and run fetchRunGsea
    const fetchRunGsea = useCallback(async () => {
        console.log('Start fetchRunGsea');
        setBackendStatus('sendJob'); // useEffect to laucnh fetchRunGsea will not work

        let res;
        const myos = OS.scientific_name.replace(' ', '_');

        if (!isM) {

            const gseaScriptData = getDataQT(gseaData);

            res = await fetch(
                `${API_URL}/run_gsea/${jobID}/${omic}/${gseaID}/${myos}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gseaScriptData)
                }
            );
            const resJson = await res.json();
            console.log('GSEA data was sent: ', resJson);

        } else {

            if (mMethod.msea) {
                const gseaScriptData = getDataMSEA(gseaData);
                res = await fetch(
                    `${API_URL}/run_msea/${jobID}/${omic}/${gseaID}/${myos}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(gseaScriptData)
                    }
                );

                const resJson = await res.json();
                console.log('GSEA data (msea) was sent: ', resJson);
            }

            if (mMethod.mummichog) {
                const gseaScriptData = getDataMummichog(
                    gseaData, danfo2RowColJson(fx2i),
                    mParams.rt, mParams.ionCol, mParams.ionVal
                );

                res = await fetch(
                    `${API_URL}/run_mummichog/${jobID}/${omic}/${gseaID}/${myos}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(gseaScriptData)
                    }
                );
                const resJson = await res.json();
                console.log('GSEA data (mummichog) was sent: ', resJson);
            }
        }

        // Get results
        console.log('fetchRunGsea will set a fetchResults interval to get GSEA results');

        fetchResultsRef.current = {};

        if (!isM) {
            db.filter(e => e.db != 'Custom').map(e => {
                fetchResultsRef.current[e.db] = setInterval(() => fetchResults(e.db), 5000);
            });
        } else {

            if (mMethod.msea) {
                fetchResultsRef.current['KEGG'] = setInterval(() => fetchResults('KEGG'), 5000);
                fetchResultsRef.current['ChEBI'] = setInterval(() => fetchResults('ChEBI'), 5000);
            }

            if (mMethod.mummichog) {
                Object.keys(mParams.ionVal).map(e => { // pos or neg
                    if (!mParams.ionVal[e]) return;
                    fetchResultsRef.current[e] = setInterval(() => fetchResults(e), 5000);
                })
            }

            console.log('Get for metabolomics');
        }

    }, [OS, API_URL, jobID, gseaID, gseaData, fetchResults,
        fetchResultsRef, db, isM, omic, fx2i, mParams, mMethod
    ]);

    useEffect(() => {
        // only fetch when there is one waiting job and nothing is sent to back-end
        console.log('Launcher useEffect - is ready? - ', backendStatus, waitingGsea);
        if (waitingGsea.length != 1 || backendStatus != 'ready') return;
        console.log('Launcher useEffect calls fetchRunGsea');
        const myTimeout = setTimeout(fetchRunGsea, 500);
        return () => clearTimeout(myTimeout);
    }, [waitingGsea, fetchRunGsea, backendStatus]);

    // Getting results finished
    useEffect(() => {
        console.log('Ending useEffect - did finished?', backendStatus, db);


        if (db.every(e => e.status != 'waiting') && backendStatus == 'sendJob') {
            console.log('useEffect will handle GSEA finish');

            // If there is another element in the waiting list --> change status to waiting
            /*if (waitingGsea.length > 1) {
                console.log('Change status to waiting');
                setDb(prev => prev.map(e => e.db == 'Custom' ? e : { ...e, status: 'waiting' }));
            }*/

            setWaitingGsea(prev => prev.slice(1));
            setBackendStatus('ready');
        }
    }, [waitingGsea, db, backendStatus]);

    /*
    DISPLAY DATABASE OPTIONS
    */
    const [showEnrichment, setShowEnrichment] = useState(true);
    const selDb = db.filter(e => e.show)[0].db;


    return (
        <Box>
            <ParamSelector
                omic={omic}
                g2info={g2info} setG2info={setG2info}
                gidCol={gidCol} setGidCol={setGidCol}
                mParams={mParams} setMParams={setMParams} mMethod={mMethod}
                rankCol={rankCol} setRankCol={setRankCol}
                subRankCol={subRankCol} setSubRankCol={setSubRankCol}
                groups={groups} setGroups={setGroups}
                handleRunGSEA={handleRunGSEA}
                ready={waitingGsea.length == 0}
            />
            {showGsea &&
                <MyMotion>
                    <Divider sx={{ my: 4 }}>
                        <Typography variant='body2'>{titleGsea}</Typography>
                    </Divider>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <DbSelector
                                db={db}
                                selDb={selDb}
                                setDb={setDb}
                                setShowEnrichment={setShowEnrichment}
                            />
                        </Box>
                        <Box sx={{ height: 620 }}>
                            {showEnrichment &&
                                <MyMotion>
                                    {selDb == 'Custom' ?
                                        <CustomEnrichment gseaData={gseaData} omic={omic} />
                                        :
                                        <EnrichmentTable
                                            gseaRes={db.filter(e => e.db == selDb)[0].gseaRes}
                                            omic={omic}
                                            db={selDb}
                                        />
                                    }
                                </MyMotion>
                            }
                        </Box>
                    </Box>
                </MyMotion>
            }
        </Box>
    )
}

const getDataQT = (gseaData) => {

    let gseaScriptData = Object.keys(gseaData).map(e => ({
        GeneName: gseaData[e].egn,
        EntrezGene: gseaData[e].eid,
        RankStat: gseaData[e].rank
    }));

    gseaScriptData = gseaScriptData.filter(e => e.GeneName && e.EntrezGene && e.RankStat);

    // remove duplicates
    const _g = [];
    gseaScriptData.filter(e => {
        let filter = true;
        _g.includes(e.egn) ? filter = false : _g.push(e.egn);
        return filter;
    });

    return gseaScriptData;
}

const getDataMummichog = (gseaData, fx2iJson, rtCol, ionCol, ionVal) => {

    //let preData = { ...gseaData };
    let preData = structuredClone(gseaData);

    // Filter 10% most significant element assigning a 0 pvalue
    let scores = Object.keys(preData).map(e => Math.abs(preData[e].rank));
    scores.sort(function (a, b) {
        return b - a;
    });
    const threshold = scores[Math.ceil(0.1 * scores.length)];

    // Add values to each json object
    Object.keys(preData).map(e => {
        preData[e].id = e;
        preData[e].rt = fx2iJson[e][rtCol.id];
        preData[e].mode = fx2iJson[e][ionCol.id];
        preData[e].pv = preData[e].rank < -threshold || preData[e].rank > threshold ? 0 : 1;
    });

    // Split by mode
    let preDataMode = {};
    Object.keys(ionVal).map(e => { // pos or neg
        if (!ionVal[e]) return;
        preDataMode[e] = Object.keys(preData)
            .map(e2 => preData[e2]) // convert to array of json
            .filter(e2 => e2.mode == ionVal[e].id); // filter by mode
    });

    // Prepare .tsv
    const header = 'm/z\tretention_time\tp-value\tt-score\tcustom_id\n';
    const gseaScriptData = {};

    Object.keys(ionVal).map(e => {
        if (!ionVal[e]) return;
        gseaScriptData[e] = header;
        preDataMode[e].map(row => {
            gseaScriptData[e] += `${row.mz}\t${row.rt}\t${row.pv}\t${row.rank}\t${row.id}\n`;
        });
    });

    return gseaScriptData;
}

const getDataMSEA = (gseaData) => {
    const _idadded = { KEGG: [], ChEBI: [] }
    const gseaScriptData = {
        KEGG: Object.keys(gseaData).map(e => ({
            ID: gseaData[e].KEGG,
            RankStat: gseaData[e].rank
        })).filter(e => {
            let filter = false;
            if (!!e.ID && !_idadded.KEGG.includes(e.ID)) {
                filter = true;
                _idadded.KEGG.push(e.ID);
            }
            return filter;
        }),
        ChEBI: Object.keys(gseaData).map(e => ({
            ID: gseaData[e].ChEBI,
            RankStat: gseaData[e].rank
        })).filter(e => {
            let filter = false;
            if (!!e.ID && !_idadded.ChEBI.includes(e.ID)) {
                filter = true;
                _idadded.ChEBI.push(e.ID);
            }
            return filter;
        }),
    };
    return gseaScriptData;
}

export default GSEAomic