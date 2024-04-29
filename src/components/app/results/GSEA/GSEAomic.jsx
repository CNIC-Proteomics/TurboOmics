import React, { useCallback, useMemo, useState, useRef } from 'react'
import { Box, Autocomplete, TextField, Typography, Button, Divider } from "@mui/material"
import SendIcon from '@mui/icons-material/Send';
import useFx2i from '@/hooks/useFx2i';
import { useVars } from '@/components/VarsContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useJob } from '../../JobContext';
import MyMotion from '@/components/MyMotion';
import ParamSelector from './ParamSelector';
import { danfo2RowColJson } from '@/utils/jobDanfoJsonConverter';


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
        { db: 'Custom', status: 'ok', show: true }
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

    // Generate column options for feature id (protein or transcript)
    const [gidCol, setGidCol] = useState(null);

    // GSEA ranking metric
    const [rankCol, setRankCol] = useState(null);
    const [subRankCol, setSubRankCol] = useState(null);
    const [groups, setGroups] = useState({ 'g1': null, 'g2': null });

    // DataBases
    const [db, setDb] = useState(isM ? DB.m : DB.t);
    const selDb = db.filter(e => e.show)[0].db;

    // Run GSEA
    const [gseaData, setGseaData] = useState(null);
    const [showGsea, setShowGsea] = useState(false);
    const [titleGsea, setTitleGsea] = useState('');

    const handleRunGSEA = useCallback(() => {
        console.log('Run GSEA');

        // get rank
        const preData = g2info;
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
                preData[e].f.map(f => {
                    const g1v = g1Id.map(myid => xiJson[myid][f]);
                    const g2v = g2Id.map(myid => xiJson[myid][f]);
                    // CALCULA TTEST
                })
            })
        }
        

        console.log(preData);
        // dispatchResults

        // send to backend
        setTitleGsea(
            `GSEA: ${gidCol.label} | 
            ${rankCol.label} | 
            ${subRankCol.label}
            ${rankCol.label == 't-test' ? ' | ' + groups.g1.label + ' vs ' + groups.g2.label : ''}`
        );
        setShowGsea(false);
        setTimeout(() => setShowGsea(true), 500);


    }, [gidCol, rankCol, subRankCol, groups]);

    return (
        <Box>
            <ParamSelector
                omic={omic}
                setG2info={setG2info}
                gidCol={gidCol}
                setGidCol={setGidCol}
                rankCol={rankCol}
                setRankCol={setRankCol}
                subRankCol={subRankCol}
                setSubRankCol={setSubRankCol}
                groups={groups}
                setGroups={setGroups}
                handleRunGSEA={handleRunGSEA}
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

const DbSelector = ({ db, selDb, setDb }) => {

    //const [selDb, setSelDb] = useState(DB[0]);

    return (
        <Box sx={{ display: 'flex' }}>
            {db.map(e => (
                <SetButton
                    key={e.db}
                    selDb={selDb}
                    setDb={setDb}
                    dbid={e.db}
                />
            ))}
        </Box>
    )
}

const SetButton = ({ selDb, setDb, dbid }) => {

    const selected = selDb == dbid;
    const [isHover, setIsHover] = useState(false);

    const handleClick = () => {
        setDb(prev => prev.map(e =>
            e.db == dbid ? { ...e, show: true } : { ...e, show: false }
        ));
    }

    let bgColor = '#00000015';
    let textColor = '#000000aa';

    if (selected) {
        bgColor = '#006633ff';
        textColor = '#ffffff';
    } else if (isHover) {
        bgColor = '#00000033';
        textColor = '#000000aa'//'#ffffff';
    }

    return (
        <Box
            sx={{
                px: 1,
                py: 0.5,
                mx: 0.5,
                fontSize: '1em',
                color: textColor,
                backgroundColor: bgColor,
                userSelect: 'none',
                cursor: 'pointer',
                transition: 'ease 1s'
            }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={handleClick}
        >
            {dbid}
        </Box>
    )
}

export default GSEAomic