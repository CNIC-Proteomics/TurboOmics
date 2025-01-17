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

const MIDTYPE = ['ChEBI', 'KEGG', 'HMDB', 'PubChem'];

const TEXT = {
    'Mean difference': {
        text1: 'Select metadata variable',
        text2: 'Metadata Variable'
    },
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
    g2info, setG2info,
    gidCol, setGidCol,
    mParams, setMParams,
    rankCol, setRankCol,
    subRankCol, setSubRankCol,
    groups, setGroups,
    handleRunGSEA,
    ready, mMethod
}) {

    // check if this is a metabolomics section
    const isM = omic == 'm';

    // 
    const { OMIC2NAME, API_URL } = useVars();
    const { OS, jobID } = useJob();

    // Get results
    const results = useResults();
    const dispatchResults = useDispatchResults();
    const gseaObj = results.GSEA[omic];

    // Get mdata
    const { mdataType } = useJob();

    // Get fx2i 
    const [fx2i] = useFx2i(omic);

    // Generate column options for feature id (protein or transcript)
    const gidColOpts = useMemo(
        () => fx2i.columns.map(e => ({ label: e, id: e })),
        [fx2i]);

    // Save previous gProfiler results
    const [cachedG2i, setCachedG2i] = useState({});

    const handleGidColOpts = async (e, newValue) => {
        if (newValue == null) return;
        setG2info(null);
        setGidCol(newValue);

        let g2i = {};
        const gidColSerie = fx2i.column(newValue.id);

        // Fetch from gProfiler only for Proteomics and Transcriptomics
        if (!isM) {

            if (Object.keys(cachedG2i).includes(newValue.id)) {

                g2i = cachedG2i[newValue.id];

            } else {

                gidColSerie.values.map((g, i) => {
                    Object.keys(g2i).includes(g) ?
                        g2i[g].f.push(gidColSerie.index[i]) : g2i[g] = { f: [gidColSerie.index[i]] };
                });

                console.log('Fetch ENTREZ identifiers');
                const URI = ['https://biit.cs.ut.ee/gprofiler/api/convert/convert/',
                    'https://biit.cs.ut.ee/gprofiler_beta/api/convert/convert/'];

                const fetchGProfiler = (URI) => {
                    return new Promise(async (resolve, reject) => {
                        console.log('Trying ', URI);
                        try {
                            const res = await fetch(
                                URI,
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
                            resolve(res);
                        } catch (error) {
                            reject(error);
                        }
                    });
                }

                let res;
                try {
                    res = await fetchGProfiler(URI[0]);
                } catch (error) {
                    console.log(error);
                    res = await fetchGProfiler(URI[1]);
                }

                /*const res = await fetch(
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
                );*/

                const resJson = await res.json();

                const _g = [];
                resJson.result.map(e => {
                    if (_g.includes(e.incoming) || e.converted == 'None') return;
                    _g.push(e.incoming);
                    g2i[e.incoming].gn = e.name;
                    g2i[e.incoming].egn = e.name.toUpperCase();
                    g2i[e.incoming].eid = e.converted;
                });
                setCachedG2i(prev => ({ ...prev, [newValue.id]: g2i }));
            }

        }
        setG2info(g2i);
        dispatchResults({ type: 'set-g2info', omic: omic, g2info: g2i, gidCol: newValue });
    }

    // Create g2info for metabolomics using apex m/z and metabolite ID & Type
    // The same function executing different blocks depending on the field completed
    // create states to save selections

    // GSEA ranking metric
    const resStatus = useResults().status;

    const rankColOpts = useMemo(() => ([
        {
            label: 'Mean difference',
            disabled: !Object.keys(mdataType).some(e =>
                mdataType[e].type == 'categorical'
            )
        },
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
    ]), [resStatus, fx2i, mdataType]);

    const [subRankColOpts, setSubRankColOpts] = useState(gseaObj.rankParams.subRankColOpts); // Number of component or metavariable
    const [showSubSection, setShowSubSection] = useState(gseaObj.rankParams.showSubSection);
    const [groupColOpts, setGroupColOpts] = useState(gseaObj.rankParams.groupColOpts); // Only when selecting t-test

    const handleRankColOpts = async (e, newValue) => {
        if (!newValue) return;
        setRankCol(newValue);
        setSubRankCol(null);
        setGroupColOpts([]);
        setGroups({ g1: null, g2: null });
        setShowSubSection(false);
        setTimeout(e => setShowSubSection(true), 100);

        let _subRankColOpts = [];
        if (newValue.label == 'PCA') {
            let expVar = results.EDA.PCA[omic].data.explained_variance
            if (expVar == null) {
                const res = await fetch(`${API_URL}/get_eda_pca/${jobID}/${omic}`);
                const { resStatus, dataPCA } = await res.json();
                dispatchResults({ type: 'set-eda-pca-data', data: dataPCA, omic: omic });
                dispatchResults({ type: 'set-eda-pca-status', status: resStatus, omic: omic });
                expVar = dataPCA.explained_variance;
            }
            _subRankColOpts = Object.keys(expVar).map(e => ({ label: `PCA${e}`, id: `PCA${e}` }))
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
            _subRankColOpts = Object.keys(expVar).map(e => ({ label: e, id: e }))
        }

        if (['Mean difference', 't-test'].includes(newValue.label)) {
            _subRankColOpts = Object.keys(mdataType).filter(
                e => mdataType[e].type == 'categorical'
            ).map(e => ({ label: e, id: e }));
        }

        if (newValue.label == 'Custom') {
            const dtypeSerie = fx2i.ctypes;
            _subRankColOpts = dtypeSerie.index.filter(
                (e, i) => dtypeSerie.values[i].includes('int') ||
                    dtypeSerie.values[i].includes('float')
            ).map(e => ({ label: e, id: e }))
        }

        setSubRankColOpts(_subRankColOpts);

        dispatchResults({
            type: 'handle-rank-col-opts',
            omic: omic,
            rankParams: {
                rankCol: newValue,
                subRankCol: null,
                groups: { g1: null, g2: null },
                subRankColOpts: _subRankColOpts,
                groupColOpts: [],
                showSubSection: true
            }
        })
    }

    const handleSubRankColOpts = (e, newValue) => {
        if (newValue == null) return;
        setSubRankCol(newValue);
        dispatchResults({ type: 'set-sub-rank-col', subRankCol: newValue, omic })

        if (['Mean difference', 't-test'].includes(rankCol.label)) {
            setGroups({ g1: null, g2: null });
            let _groupColOpts = mdataType[newValue.id].levels.map(e => ({ label: e, id: e }))
            setGroupColOpts(_groupColOpts);
            dispatchResults({ type: 'set-group-col-opts', groupColOpts: _groupColOpts, omic })
        }
    }

    // Set ion values
    const [ionValOpts, setIonValOpts] = useState(isM ? gseaObj.ionValOpts : []);
    const handleIonCol = (e, newValue) => {

        setMParams(prev => ({ ...prev, ionCol: newValue }));
        dispatchResults({ type: 'set-m-params', attr: 'ionCol', value: newValue });

        setMParams(prev => ({ ...prev, ionVal: { pos: null, neg: null } }));
        dispatchResults({ type: 'set-m-params', attr: 'ionVal', value: { pos: null, neg: null } });

        if (!newValue) return;

        let _ionValOpts = [...new Set(fx2i.column(newValue.id).values)].map(
            e => ({ label: e, id: e })
        ).slice(0, 10); // Take only first ten elements

        setIonValOpts(_ionValOpts);
        dispatchResults({ type: 'set-ion-val-opts', ionValOpts: _ionValOpts });
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Box >
                {!isM &&
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography type='body2'>
                            {`Select column containing ${OMIC2NAME[omic]} ID`}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Autocomplete
                                options={gidColOpts}
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                    <TextField {...params} label={`${OMIC2NAME[omic]} ID column`} />
                                )}
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
                }

                {isM &&
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                        <Box sx={{ width: '49%', p: 2 }}>
                            <Typography type='body2' variant='h6'>MSEA</Typography>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-evenly',
                                flexDirection: 'column',
                                mt: 2
                            }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography type='body2'>Select Metabolite ID</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Autocomplete
                                            options={gidColOpts}
                                            sx={{ width: 250 }}
                                            renderInput={(params) => <TextField {...params} label='Metabolite ID' />}
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            getOptionDisabled={(option) => option.disabled}
                                            value={mParams.mid}
                                            onChange={(e, newValue) => {
                                                setMParams(prev => ({ ...prev, mid: newValue }));
                                                dispatchResults({ type: 'set-m-params', attr: 'mid', value: newValue });
                                            }}
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
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Typography type='body2'>Select ID Type</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Autocomplete
                                            options={MIDTYPE.map(e => ({ id: e, label: e }))}
                                            sx={{ width: 250 }}
                                            renderInput={(params) => <TextField {...params} label='ID Type' />}
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            getOptionDisabled={(option) => option.disabled}
                                            value={mParams.midType}
                                            onChange={(e, newValue) => {
                                                setMParams(prev => ({ ...prev, midType: newValue }));
                                                dispatchResults({ type: 'set-m-params', attr: 'midType', value: newValue });
                                            }}
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
                        </Box>
                        <Box sx={{ width: 0, borderWidth: '1px', borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.2)' }}></Box>
                        <Box sx={{ width: '49%', p: 2 }}>
                            <Typography type='body2' variant='h6'>Mummichog</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography type='body2'>Select Apex m/z Column</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Autocomplete
                                            options={gidColOpts}
                                            sx={{ width: 250 }}
                                            renderInput={(params) => <TextField {...params} label='Apex m/z' />}
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            getOptionDisabled={(option) => option.disabled}
                                            value={mParams.mz}
                                            onChange={(e, newValue) => {
                                                setMParams(prev => ({ ...prev, mz: newValue }))
                                                dispatchResults({ type: 'set-m-params', attr: 'mz', value: newValue });
                                            }}
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
                                    <Typography type='body2'>Select Retention Time Column (min)</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Autocomplete
                                            options={gidColOpts}
                                            sx={{ width: 250 }}
                                            renderInput={(params) => <TextField {...params} label='RT column (min)' />}
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            getOptionDisabled={(option) => option.disabled}
                                            value={mParams.rt}
                                            onChange={(e, newValue) => {
                                                setMParams(prev => ({ ...prev, rt: newValue }));
                                                dispatchResults({ type: 'set-m-params', attr: 'rt', value: newValue });
                                            }}
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
                            <Box>
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Typography type='body2'>Select Ion Mode Column</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Autocomplete
                                            options={gidColOpts}
                                            sx={{ width: 250 }}
                                            renderInput={(params) => <TextField {...params} label='Ion Mode Column' />}
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            getOptionDisabled={(option) => option.disabled}
                                            value={mParams.ionCol}
                                            onChange={handleIonCol}
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
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography type='body2'>Positive Ion Value</Typography>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                            <Autocomplete
                                                options={ionValOpts}
                                                sx={{ width: 150 }}
                                                renderInput={(params) => <TextField {...params} label='Positive Ion' />}
                                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                                getOptionDisabled={(option) => option.disabled}
                                                value={mParams.ionVal.pos}
                                                onChange={
                                                    (e, newValue) => {
                                                        setMParams(
                                                            prev => ({ ...prev, ionVal: { ...prev.ionVal, pos: newValue } })
                                                        );
                                                        dispatchResults({ type: 'set-ion-val', mode: 'pos', value: newValue })
                                                    }
                                                }
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
                                    <Box sx={{ width: '5%' }}></Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography type='body2'>Negative Ion Value</Typography>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                            <Autocomplete
                                                options={ionValOpts}
                                                sx={{ width: 150 }}
                                                renderInput={(params) => <TextField {...params} label='Negative Ion' />}
                                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                                getOptionDisabled={(option) => option.disabled}
                                                value={mParams.ionVal.neg}
                                                onChange={
                                                    (e, newValue) => {
                                                        setMParams(
                                                            prev => ({ ...prev, ionVal: { ...prev.ionVal, neg: newValue } })
                                                        );
                                                        dispatchResults({ type: 'set-ion-val', mode: 'neg', value: newValue });
                                                    }
                                                }
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
                            </Box>
                        </Box>
                    </Box>
                }
            </Box>
            <Box sx={{ height: 0, borderWidth: '1px', borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.2)' }}></Box>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', textAlign: 'center', mt: 3 }}>
                    <Box sx={{ width: '30%' }}>
                        <Typography type='body2'>Select {isM ? 'Enrichment' : 'GSEA'} Ranking Metric</Typography>
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

                    <Box sx={{ width: '30%' }}>
                        <Typography type='body2'>{showSubSection ? TEXT[rankCol.label].text1 : '-'}</Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Autocomplete
                                options={subRankColOpts}
                                sx={{ width: 300 }}
                                renderInput={
                                    (params) => <TextField {...params} label={showSubSection ? TEXT[rankCol.label].text2 : ''} />
                                }
                                disabled={!showSubSection}
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
                </Box>
                {showSubSection && ['Mean difference', 't-test'].includes(rankCol.label) &&
                    <MyMotion>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-evenly',
                            textAlign: 'center',
                            mt: 5,
                        }}>

                            {['Mean difference', 't-test'].includes(rankCol.label) &&
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
                                                onChange={(e, newValue) => {
                                                    setGroups(prev => ({ ...prev, g1: newValue }));
                                                    dispatchResults({ type: 'set-group', g: 'g1', value: newValue, omic });
                                                }}
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
                                                onChange={(e, newValue) => {
                                                    setGroups(prev => ({ ...prev, g2: newValue }));
                                                    dispatchResults({ type: 'set-group', g: 'g2', value: newValue, omic });
                                                }}
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
                    </MyMotion>
                }
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <Button
                        variant='outlined'
                        color='primary'
                        endIcon={<SendIcon />}
                        disabled={!(
                            ready && rankCol && subRankCol &&
                            (!['Mean difference', 't-test'].includes(rankCol.label) || (groups.g1 && groups.g2)) &&
                            (!isM || (mMethod.msea || mMethod.mummichog)) && // if metabolomic, required method
                            (isM || (gidCol && g2info)) // If not metabolomics, required id and g2info
                        )}
                        onClick={handleRunGSEA}
                    >
                        Run QEA
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default ParamSelector