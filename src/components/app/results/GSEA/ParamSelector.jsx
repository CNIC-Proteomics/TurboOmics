import React, { useMemo, useState } from 'react'
import { Box, Autocomplete, TextField, Typography, Button } from "@mui/material"
import SendIcon from '@mui/icons-material/Send';
import useFx2i from '@/hooks/useFx2i';
import { useVars } from '@/components/VarsContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useJob } from '../../JobContext';
import MyMotion from '@/components/MyMotion';

/*
Constants
*/
const TEXT = {
    't-test': {
        text1: 'Select metadata variable',
        text2: 'Metadata Variable'
    },
    'PCA': {
        text1: 'Select Principal Component',
        text2: 'Principal Component'
    },
    'MOFA': {
        text1: 'Select MOFA Factor',
        text2: 'MOFA Factor'
    },
    'Custom': {
        text1: 'Select column with ranking metric',
        text2: 'Ranking Metric Column'
    }
}

function ParamSelector({
    omic,
    setG2info,
    gidCol,
    setGidCol,
    rankCol,
    setRankCol,
    subRankCol,
    setSubRankCol,
    groups,
    setGroups,
    handleRunGSEA
}) {

    // check if this is a metabolomics section
    const isM = omic == 'm';

    // 
    const { OMIC2NAME, API_URL } = useVars();
    const { OS } = useJob();
    const { jobID } = useJob();

    // Get results
    const results = useResults();
    const dispatchResults = useDispatchResults();

    // Get mdata
    const { mdataType } = useJob();

    // Get fx2i 
    const [fx2i] = useFx2i(omic);

    // Generate column options for feature id (protein or transcript)
    const gidColOpts = useMemo(
        () => fx2i.columns.map(e => ({ label: e, id: e })),
        [fx2i]);

    const handleGidColOpts = async (e, newValue) => {
        if (newValue == null) return;
        setGidCol(newValue);

        // Get ENTREZ values
        const gidColSerie = fx2i.column(newValue.id);
        const g2i = {};
        gidColSerie.values.map((g, i) => {
            Object.keys(g2i).includes(g) ?
                g2i[g].f.push(gidColSerie.index[i]) : g2i[g] = { f: [gidColSerie.index[i]] };
        });

        // Fetch from gProfiler only for Proteomics and Transcriptomics
        if (!isM) {
            console.log('Fetch ENTREZ identifiers');
            const res = await fetch(
                'https://biit.cs.ut.ee/gprofiler/api/convert/convert/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "organism": OS.id,
                        "target": "ENTREZGENE_ACC",
                        "query": Object.keys(g2i)
                    })
                }
            );

            const resJson = await res.json();

            const _g = [];
            resJson.result.map(e => {
                if (_g.includes(e.incoming) || e.converted == 'None') return;
                _g.push(e.incoming);
                g2i[e.incoming].gn = e.name;
                g2i[e.incoming].egn = e.name.toUpperCase();
                g2i[e.incoming].eid = e.converted;
            });
        }

        setG2info(g2i);
    }

    // GSEA ranking metric
    const resStatus = useResults().status;

    const rankColOpts = useMemo(() => ([
        {
            label: 't-test',
            disabled: !Object.keys(mdataType).some(e =>
                mdataType[e].type == 'categorical'
            )
        },
        {
            label: 'PCA',
            disabled: resStatus.EDA_PCA.status != 'ok'
        },
        {
            label: 'MOFA',
            disabled: resStatus.MOFA.status != 'ok'
        },
        {
            label: 'Custom',
            disabled: !fx2i.ctypes.values.some(
                e => e.includes('int') || e.includes('float')
            )
        }
    ]), [resStatus]);

    const [subRankColOpts, setSubRankColOpts] = useState([]); // Number of component or metavariable
    const [showSubSection, setShowSubSection] = useState(false);
    const [groupColOpts, setGroupColOpts] = useState([]); // Only when selecting t-test

    const handleRankColOpts = async (e, newValue) => {
        if (!newValue) return;
        setRankCol(newValue);
        setSubRankCol(null);
        setGroupColOpts([]);
        setGroups({ g1: null, g2: null });
        setShowSubSection(false)
        setTimeout(e => setShowSubSection(true), 100)

        if (newValue.label == 'PCA') {
            let expVar = results.EDA.PCA[omic].data.explained_variance
            if (expVar == null) {
                const res = await fetch(`${API_URL}/get_eda_pca/${jobID}/${omic}`);
                const { resStatus, dataPCA } = await res.json();
                dispatchResults({ type: 'set-eda-pca-data', data: dataPCA, omic: omic });
                dispatchResults({ type: 'set-eda-pca-status', status: resStatus, omic: omic });
                expVar = dataPCA.explained_variance;
            }
            setSubRankColOpts(
                Object.keys(expVar).map(e => ({ label: `PCA${e}`, id: `PCA${e}` }))
            );
        }

        if (newValue.label == 'MOFA') {
            let expVar;
            if (results.MOFA.data == null) {
                const res = await fetch(`${API_URL}/get_mofa/${jobID}`);
                const resJson = await res.json(); // {dataMofa, resStatus}
                dispatchResults({ type: 'set-mofa-data', data: resJson.dataMOFA });
                expVar = resJson.dataMOFA.explained_variance[omic];
            } else {
                expVar = results.MOFA.data.explained_variance[omic];
            }
            setSubRankColOpts(
                Object.keys(expVar).map(e => ({ label: e, id: e }))
            );
        }

        if (newValue.label == 't-test') {
            setSubRankColOpts(
                Object.keys(mdataType).filter(
                    e => mdataType[e].type == 'categorical'
                ).map(e => ({ label: e, id: e }))
            );
        }

        if (newValue.label == 'Custom') {
            const dtypeSerie = fx2i.ctypes;
            setSubRankColOpts(
                dtypeSerie.index.filter(
                    (e, i) => dtypeSerie.values[i].includes('int') ||
                        dtypeSerie.values[i].includes('float')
                ).map(e => ({label: e, id: e}))
            );
        }
    }

    const handleSubRankColOpts = (e, newValue) => {
        if (newValue == null) return;
        setSubRankCol(newValue);

        if (rankCol.label == 't-test') {
            setGroups({ g1: null, g2: null });
            setGroupColOpts(
                mdataType[newValue.id].levels.map(e => ({ label: e, id: e }))
            );
        }
    }

    return (
        <Box sx={{ mt: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography type='body2'>Select column containing {OMIC2NAME[omic]} ID</Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Autocomplete
                            options={gidColOpts}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label={`${OMIC2NAME[omic]} ID column`} />}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={gidCol}
                            onChange={handleGidColOpts}
                            renderOption={(props, option) => {
                                return (
                                    <li {...props} key={option.label}>
                                        {option.label}
                                    </li>
                                );
                            }}
                        />
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography type='body2'>Select GSEA Ranking Metric</Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Autocomplete
                            options={rankColOpts}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label='GSEA Ranking Metric' />}
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            getOptionDisabled={(option) => option.disabled}
                            value={rankCol}
                            onChange={handleRankColOpts}
                            renderOption={(props, option) => {
                                return (
                                    <li {...props} key={option.label}>
                                        {option.label}
                                    </li>
                                );
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            {showSubSection &&
                <MyMotion>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        textAlign: 'center',
                        mt: 5,
                    }}>
                        <Box>
                            <Typography type='body2'>{TEXT[rankCol.label].text1}</Typography>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <Autocomplete
                                    options={subRankColOpts}
                                    sx={{ width: 300 }}
                                    renderInput={
                                        (params) => <TextField {...params} label={TEXT[rankCol.label].text2} />
                                    }
                                    isOptionEqualToValue={(option, value) => option.label === value.label}
                                    value={subRankCol}
                                    onChange={handleSubRankColOpts}
                                    renderOption={(props, option) => {
                                        return (
                                            <li {...props} key={option.label}>
                                                {option.label}
                                            </li>
                                        );
                                    }}
                                />
                            </Box>
                        </Box>
                        {rankCol.label == 't-test' &&
                            <Box sx={{ display: 'flex' }}>
                                <Box>
                                    <Typography type='body2'>Select 1st group</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Autocomplete
                                            options={groupColOpts}
                                            sx={{ width: 200 }}
                                            renderInput={
                                                (params) => <TextField {...params} label='1st Group' />
                                            }
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            value={groups.g1}
                                            onChange={(e, newValue) => setGroups(prev => ({ ...prev, g1: newValue }))}
                                            renderOption={(props, option) => {
                                                return (
                                                    <li {...props} key={option.label}>
                                                        {option.label}
                                                    </li>
                                                );
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ width: '20%', mx: 2, display: 'flex', alignItems: 'flex-end' }}>
                                    <Typography type='body1' sx={{ py: 2 }}>vs</Typography>
                                </Box>
                                <Box sx={{}}>
                                    <Typography type='body2'>Select 2nd group</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Autocomplete
                                            options={groupColOpts}
                                            sx={{ width: 200 }}
                                            renderInput={
                                                (params) => <TextField {...params} label='2nd Group' />
                                            }
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            value={groups.g2}
                                            onChange={(e, newValue) => setGroups(prev => ({ ...prev, g2: newValue }))}
                                            renderOption={(props, option) => {
                                                return (
                                                    <li {...props} key={option.label}>
                                                        {option.label}
                                                    </li>
                                                );
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        }
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <Button
                            variant='outlined'
                            color='primary'
                            endIcon={<SendIcon />}
                            disabled={!(
                                gidCol && rankCol && subRankCol &&
                                (rankCol.label != 't-test' || (groups.g1 && groups.g2))
                            )}
                            onClick={handleRunGSEA}
                        >
                            Run GSEA
                        </Button>
                    </Box>
                </MyMotion>
            }
        </Box>
    )
}

export default ParamSelector