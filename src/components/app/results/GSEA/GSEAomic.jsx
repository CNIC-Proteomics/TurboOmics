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
import { getMedian, getTvalue } from './utils/stats';


/*
Constants
*/
const DB = {
    t: [
        { db: 'Custom', status: 'ok', show: true },
        { db: 'HALLMARK', status: 'waiting', show: false },
        { db: 'REACTOME', status: 'waiting', show: false },
        { db: 'KEGG', status: 'waiting', show: false }
    ],
    m: [
        { db: 'Custom', status: 'ok', show: true },
        { db: 'Mummichog (P)', status: '', show: false },
        { db: 'Mummichog (N)', status: '', show: false }
    ]
};


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

    // Data used for GSEA
    const [g2info, setG2info] = useState(null);

    // Get fx2i 
    const [fx2i] = useFx2i(omic);

    // Get quantifications
    const xi = useJob().norm[`x${omic}`];

    // Get mdata
    const { mdataType } = useJob();

    // Generate column options for feature id (protein or transcript) or mz (untargeted metab.)
    const [gidCol, setGidCol] = useState(null);

    // Mummichog Untargeted metabolomic enrichment
    const [rtCol, setRtCol] = useState(null);
    const [ionCol, setIonCol] = useState(null);
    const [ionVal, setIonVal] = useState({ pos: null, neg: null });

    // GSEA ranking metric
    const [rankCol, setRankCol] = useState(null);
    const [subRankCol, setSubRankCol] = useState(null);
    const [groups, setGroups] = useState({ 'g1': null, 'g2': null }); // only for t-test

    // DataBases
    const [db, setDb] = useState(isM ? DB.m : DB.t);
    const selDb = db.filter(e => e.show)[0].db;

    // Run GSEA
    const getGseaId = () => {
        if (
            !(gidCol && rankCol && subRankCol &&
                (rankCol.label != 't-test' || (groups.g1 && groups.g2)))
        ) return '';

        let myGseaID = `${OS.id}-${gidCol.id}-${rankCol.label}-${subRankCol.id}`;
        myGseaID += rankCol.label == 't-test' ?
            `${groups.g1.id}vs${groups.g2.id}` : '';

        if (isM) {
            myGseaID += rtCol ? '_' + rtCol.id : '';
            myGseaID += ionVal.pos ? '_' + ionVal.pos.id : '';
            myGseaID += ionVal.neg ? '_' + ionVal.neg.id : '';
        }

        myGseaID = myGseaID.replace(/[^a-zA-Z0-9]/g, '_');
        return myGseaID
    }

    const [gseaID, setGseaID] = useState('');
    const [waitingGsea, setWaitingGsea] = useState([]);
    const [gseaData, setGseaData] = useState(null);
    const [showGsea, setShowGsea] = useState(false);
    const [titleGsea, setTitleGsea] = useState('');

    const handleRunGSEA = useCallback(() => {
        console.log('Run GSEA');

        // get rank
        const preData = g2info;
        console.log(g2info)
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

        if (rankCol.label == 't-test') {
            const xiJson = danfo2RowColJson(xi);
            const g1Id = mdataType[subRankCol.id].level2id[groups.g1.id]
                .filter(e => xi.index.includes(e));
            const g2Id = mdataType[subRankCol.id].level2id[groups.g2.id]
                .filter(e => xi.index.includes(e));

            Object.keys(preData).map(e => {
                preData[e].fRank = preData[e].f.map(f => {
                    const g1v = g1Id.map(myid => xiJson[myid][f]);
                    const g2v = g2Id.map(myid => xiJson[myid][f]);
                    return getTvalue(g1v, g2v);
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

        // Create identifier
        const myGseaID = getGseaId();
        setGseaID(myGseaID);

        // Add GSEA job to waiting list
        if (!isM || (isM && rtCol && (ionVal.pos || ionVal.neg))) {
            setWaitingGsea(
                prev => prev.length < 2 ?
                    [...prev, { id: myGseaID }] : [...prev.slice(0, 1), { id: myGseaID }]
            );
        }

        // Show results section
        setTitleGsea(
            `GSEA: ${gidCol.label} | 
            ${rankCol.label} | 
            ${subRankCol.label}
            ${rankCol.label == 't-test' ? ' | ' + groups.g1.label + ' vs ' + groups.g2.label : ''}`
        );
        setShowGsea(false);
        setTimeout(() => setShowGsea(true), 500);

    }, [g2info, gidCol, rankCol, subRankCol, groups, rtCol, ionVal]);

    // Fetch GSEA controlling by previous jobs
    const fetchRunGsea = useCallback(async () => {

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
        } else {
            res = await fetch(
                `${API_URL}/run_mummichog/${jobID}/${omic}/${gseaID}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gseaData)
                }
            );
        }

        const resJson = await res.json();

        console.log(resJson);

    }, [API_URL, jobID, gseaID, gseaData]);

    useEffect(() => {
        // only fetch when there is one waiting job
        if (waitingGsea.length != 1) return;
        const myTimeout = setTimeout(fetchRunGsea, 500);
        return () => clearTimeout(myTimeout);
    }, [waitingGsea]);

    return (
        <Box>
            <ParamSelector
                omic={omic}
                g2info={g2info} setG2info={setG2info}
                gidCol={gidCol} setGidCol={setGidCol}
                rtCol={rtCol} setRtCol={setRtCol}
                ionCol={ionCol} setIonCol={setIonCol}
                ionVal={ionVal} setIonVal={setIonVal}
                rankCol={rankCol} setRankCol={setRankCol}
                subRankCol={subRankCol} setSubRankCol={setSubRankCol}
                groups={groups} setGroups={setGroups}
                handleRunGSEA={handleRunGSEA}
                changeID={gseaID != getGseaId()}
            />
            {showGsea &&
                <MyMotion>
                    <Divider sx={{ my: 4 }}>
                        <Typography variant='body2'>{titleGsea}</Typography>
                    </Divider>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <DbSelector db={db} selDb={selDb} setDb={setDb} />
                        </Box>
                        <Box>
                            {selDb == 'Custom' ?
                                <Box>Custom Table</Box>
                                :
                                <Box>{selDb}</Box>
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

export default GSEAomic