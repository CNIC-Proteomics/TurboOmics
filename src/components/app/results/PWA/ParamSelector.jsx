import { Autocomplete, Backdrop, Box, Button, CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useJob } from '../../JobContext';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useVars } from '../../../VarsContext';
import SendIcon from '@mui/icons-material/Send';

// Constants
const omicIdTypeOpts = {
    m: [
        { label: 'ChEBI', id: 'ChEBI' },
        { label: 'KEGG', id: 'KEGG' },
        { label: 'PubChem (CID)', id: 'PubChem' },
        { label: 'HMDB', id: 'HMDB' }
    ],
    q: [
        { label: 'Uniprot Protein ID', id: 'Uniprot Protein ID' },
        { label: 'Entrez ID', id: 'Entrez ID' },
        { label: 'Ensembl Gene ID', id: 'Ensembl Gene ID' },
        { label: 'Ensembl Transcript ID ', id: 'Ensembl Transcript ID' },
        { label: 'Official Gene Symbol', id: 'Official Gene Symbol' },
    ],
    t: [
        { label: 'Uniprot Protein ID', id: 'Uniprot Protein ID' },
        { label: 'Entrez ID', id: 'Entrez ID' },
        { label: 'Ensembl Gene ID', id: 'Ensembl Gene ID' },
        { label: 'Ensembl Transcript ID ', id: 'Ensembl Transcript ID' },
        { label: 'Official Gene Symbol', id: 'Official Gene Symbol' },
    ],
}


function ParamSelector({ setRId2info, fetchJobRun, setLoading }) {

    // Get job data
    const { omics, mdataType, OS, f2x } = useJob();
    const jobUser = useJob().user;

    // Save section variables
    const dispatchResults = useDispatchResults();
    const savedResultsPWA = useResults().PWA;

    // Load MetaboID and load
    const [MetaboID, setMetaboID] = useState(null);
    useEffect(() => {
        import('@/utils/MetaboID.json').then(data => {
            setMetaboID(data);
            setLoading(false);
            console.log('MetaboID loaded');
        });
    }, [setLoading, setMetaboID]);

    // Select metadata column
    const mdata = jobUser.mdata;
    const [mdataCol, setMdataCol] = useState(savedResultsPWA.mdataCol);
    const [mdataCategorical, setMdataCategorical] = useState(savedResultsPWA.mdataCategorical)

    const handleMdataAutocomplete = (event, newValue) => {
        if (!newValue) return;
        setMdataCol(newValue);

        if (mdataType[newValue.id].type == 'categorical') {
            setMdataCategorical(prev => ({
                isCategorical: true,
                colOpts: mdataType[newValue.id].levels.map(e => ({ label: e, id: e })),
                g1: null, g2: null
            }));
        } else { // working with numeric mdata variables still not available
            setMdataCategorical(prev => ({
                isCategorical: false,
                colOpts: [],
                g1: null, g2: null
            }));
        }
    }

    // Select omic identifier column
    const [omicIdCol, setOmicIdCol] = useState(
        savedResultsPWA.omicIdCol ? savedResultsPWA.omicIdCol :
            omics.reduce((prev, curr) => ({ ...prev, [curr]: null }), {})
    );

    const [omicIdType, setOmicIdType] = useState(
        savedResultsPWA.omicIdType ? savedResultsPWA.omicIdType :
            omics.reduce((prev, curr) => ({ ...prev, [curr]: "" }), {})
    );

    const [omicIdR, setOmicIdR] = useState(
        savedResultsPWA.omicIdR ? savedResultsPWA.omicIdR :
        omics.reduce((prev, curr) => ({ ...prev, [curr]: null }), {})
    );

    const handleOmicIdChange = async (o, omicIdCol_i, omicIdType_i) => {
        console.log(o, omicIdCol_i, omicIdType_i);

        if (!omicIdCol_i) {
            setOmicIdR(prev => ({ ...prev, [o]: null }));
            setRId2info(prev => ({ ...prev, [o]: {} }));
            return;
        };

        const f2iColSerie = jobUser[`${o}2i`].column(omicIdCol_i.id);
        let f2x_i = f2x[o];
        let xId = f2iColSerie.index.filter((e, i) => f2x_i[i]); // X id
        let uId = f2iColSerie.values.filter((e, i) => f2x_i[i]); // User selected id
        let rId = []; // Reactome id (completed from uId)
        let omicIdR_i = {}; // xId -> rId
        let _rId2info = {}; // rId -> xId && name of compund/protein/transcript

        // If no omic type is selected, estimate it
        if (!omicIdType_i) {
            omicIdType_i = getOmicIdType(uId, o);
            if (!omicIdType_i) {
                setOmicIdR(prev => ({ ...prev, [o]: null }));
                setRId2info(prev => ({ ...prev, [o]: {} }));
                return;
            };
            setOmicIdType(prev => ({ ...prev, [o]: omicIdType_i }))
        }

        if (o == 'm') {

            //const MetaboID = require('@/utils/MetaboID.json');
            let _index = uId.map(e => MetaboID[omicIdType_i.id].indexOf(e));
            rId = _index.map(e => MetaboID['ChEBI'][e]);
            rId.map((e, i) => {
                if (!e) return;
                _rId2info[e] = { xId: xId[i], uId: uId[i], Name: MetaboID['Name'][_index[i]] }
            });


        } else if (o == 'q' || o == 't') {

            let GPresult = [];

            // First search in SwissProt
            const res = await fetch(
                'https://biit.cs.ut.ee/gprofiler/api/convert/convert/',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "organism": OS.id,
                        "query": uId,
                        "target": "UNIPROTSWISSPROT_ACC"
                    })
                }
            );
            const resJson = await res.json();
            GPresult = resJson.result.filter(e => e.converted != 'None' && e.n_converted == 1);

            // Second search in Trembl
            const _targeted = GPresult.map(e => e.incoming);
            const res2 = await fetch(
                'https://biit.cs.ut.ee/gprofiler/api/convert/convert/',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "organism": OS.id,
                        "query": uId.filter(e => !_targeted.includes(e)),
                        "target": "UNIPROTSPTREMBL_ACC"
                    })
                }
            );
            const res2Json = await res2.json();
            GPresult.concat(res2Json.result.filter(e => e.converted != 'None' && e.n_converted == 1));

            // Generate rId preserving order
            let _xId2uId = {};
            xId.map((e, i) => _xId2uId[e] = uId[i]);
            let _uId2rId = {};
            GPresult.map(e => _uId2rId[e.incoming] = e.converted);
            rId = xId.map(e => _uId2rId[_xId2uId[e]]);

            // Generate rId2info
            let _uId2xId = {};
            uId.map((e, i) => _uId2xId[e] = xId[i]);

            GPresult.map(e => {
                _rId2info[e.converted] = {
                    uId: e.incoming,
                    xId: _uId2xId[e.incoming],
                    name: e.name,
                    description: e.description
                }
            });
        }

        xId.map((e, i) => {
            if (!rId[i]) return;
            omicIdR_i[e] = rId[i];
        });

        setOmicIdR(prev => ({ ...prev, [o]: omicIdR_i }));
        setRId2info(prev => ({ ...prev, [o]: _rId2info }));
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 4 }}>

            <Box sx={{ width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <Box sx={{ textAlign: 'center', mt: 7, position: 'absolute', top: 145 }}>
                    <Button
                        variant='outlined'
                        color='primary'
                        endIcon={<SendIcon />}
                        disabled={!(
                            mdataCol && (!mdataCategorical.isCategorical || (mdataCategorical.g1 && mdataCategorical.g2)) &&
                            (Object.values(omicIdCol).some(e => e))
                        )}
                        onClick={() => {
                            dispatchResults({
                                type: 'set-pwa-params',
                                mdataCol,
                                mdataCategorical,
                                omicIdCol,
                                omicIdType,
                                omicIdR
                            })
                            fetchJobRun(
                                mdataCol,
                                mdataCategorical,
                                omicIdR,
                                getRunId(mdataCol, mdataCategorical, omicIdCol, omicIdType)
                            )
                        }
                        }
                    >
                        Run Analysis
                    </Button>
                </Box>

                <Box sx={{ display: 'flex' }}>
                    <Autocomplete
                        value={mdataCol}
                        onChange={handleMdataAutocomplete}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        id="metadata-column"
                        options={
                            mdata.columns.filter(
                                e => mdataType[e].type == 'categorical'
                            ).map(e => ({ label: e, id: e }))
                        }
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Metadata Column" />}
                        renderOption={(props, option) => {
                            return (
                                <li {...props} key={option.label}>
                                    {option.label}
                                </li>
                            );
                        }}
                    />
                </Box>
                <Box sx={{
                    display: 'flex', mt: 4, alignItems: 'center',
                    opacity: mdataCategorical.isCategorical ? 1 : 0,
                    transition: 'all 0.5s ease'
                }}>
                    <Box>
                        <Autocomplete
                            value={mdataCategorical.g1}
                            onChange={(e, newValue) => setMdataCategorical(prev => ({ ...prev, g1: newValue }))}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            id="metadata-column"
                            options={mdataCategorical.colOpts}
                            sx={{ width: 150 }}
                            renderInput={(params) => <TextField {...params} label="First Group" />}
                            renderOption={(props, option) => {
                                return (
                                    <li {...props} key={option.label}>
                                        {option.label}
                                    </li>
                                );
                            }}
                        />
                    </Box>
                    <Box sx={{ px: 2 }}><Typography>vs</Typography></Box>
                    <Box>
                        <Autocomplete
                            value={mdataCategorical.g2}
                            onChange={(e, newValue) => setMdataCategorical(prev => ({ ...prev, g2: newValue }))}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            id="metadata-column"
                            options={mdataCategorical.colOpts}
                            sx={{ width: 150 }}
                            renderInput={(params) => <TextField {...params} label="Second Group" />}
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

            <Box sx={{
                width: '2%',
                borderWidth: '0px 1px 0px 0px',
                borderStyle: 'dashed',
                borderColor: '#aaaaaa'
            }}
            ></Box>

            <Box sx={{ width: '55%', display: 'flex', justifyContent: 'space-evenly' }}>
                {omics.map(o => (
                    <OmicIdSelector
                        key={o}
                        o={o}
                        omicIdCol_i={omicIdCol[o]}
                        setOmicIdCol_i={(e) => setOmicIdCol(prev => ({ ...prev, [o]: e }))}
                        omicIdType_i={omicIdType[o]}
                        setOmicIdType_i={(e) => setOmicIdType(prev => ({ ...prev, [o]: e }))}
                        handleOmicIdChange={handleOmicIdChange}
                    />
                ))}
            </Box>

        </Box>
    )
}

const OmicIdSelector = ({
    o,
    omicIdCol_i, setOmicIdCol_i,
    omicIdType_i, setOmicIdType_i,
    handleOmicIdChange
}) => {

    const { OMIC2NAME } = useVars();
    const omicIdColOpts = useJob().user[`${o}2i`].columns.map(e => ({ label: e, id: e }));

    return (
        <Box key={o} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box>
                <Autocomplete
                    value={omicIdCol_i}
                    onChange={
                        (event, newValue) => {
                            setOmicIdCol_i(newValue);
                            handleOmicIdChange(o, newValue, omicIdType_i);
                        }
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    id="omic-id-column"
                    options={omicIdColOpts}
                    sx={{ width: 250 }}
                    renderInput={(params) => <TextField {...params} label={`${OMIC2NAME[o]} ID Column`} />}
                    renderOption={(props, option) => {
                        return (
                            <li {...props} key={option.label}>
                                {option.label}
                            </li>
                        );
                    }}
                />
            </Box>

            <Box sx={{ mt: 4 }}>
                <FormControl variant="standard" fullWidth>
                    <InputLabel shrink id="demo-simple-select-label"></InputLabel>
                    <Select
                        sx={{ minWidth: '180px' }}
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        value={omicIdType_i}
                        label="ID Type"
                        onChange={
                            (event) => {
                                setOmicIdType_i(event.target.value);
                                handleOmicIdChange(o, omicIdCol_i, event.target.value);
                            }
                        }
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {omicIdTypeOpts[o].map(e => (
                            <MenuItem key={e.id} value={e}>{e.label}</MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>ID Type</FormHelperText>
                </FormControl>
            </Box>

        </Box>
    )
}

const getOmicIdType = (uId, o) => {
    const uIdf = uId.filter(e => e);
    if (o == 'm') {
        if (/^[0-9]+$/.test(uIdf[0])) {
            return omicIdTypeOpts.m[0]//{ label: 'ChEBI', id: 'ChEBI' }
        }
        if (/^C[0-9]+$/.test(uIdf[0])) {
            return omicIdTypeOpts.m[1] //{ label: 'KEGG', id: 'KEGG' }
        }
        if (/^HMDB[0-9]+$/.test(uIdf[0])) {
            return omicIdTypeOpts.m[3] //{ label: 'HMDB', id: 'HMDB' }
        }
        return null

    } else {
        if (/^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/.test(uIdf[0])) {
            return omicIdTypeOpts[o][0]//{ label: 'Uniprot Protein ID', id: 'Uniprot Protein ID' };
        }
        if (/^[0-9]+$/.test(uIdf[0])) {
            return omicIdTypeOpts[o][1]//{ label: 'Entrez ID', id: 'Entrez ID' };
        }
        if (/^ENS[A-Z]{0,3}G[0-9]+$/.test(uIdf[0])) {
            return omicIdTypeOpts[o][2]//{ label: 'Ensembl Gene ID', id: 'Ensembl Gene ID' };
        }
        if (/^ENS[A-Z]{0,3}T[0-9]+$/.test(uIdf[0])) {
            return omicIdTypeOpts[o][3]//{ label: 'Ensembl Transcript ID ', id: 'Ensembl Transcript ID' };
        }
        if (/^[A-Z]+$/.test(uIdf[0])) {
            return omicIdTypeOpts[o][4]//{ label: 'Official Gene Symbol', id: 'Official Gene Symbol' };
        }
        return null
    }
}

const getRunId = (mdataCol, mdataCategorical, omicIdCol, omicIdType) => {
    let runId = '';
    runId += mdataCol.id;
    if (mdataCategorical.isCategorical) {
        runId += '_' + mdataCategorical.g1.id;
        runId += '_' + mdataCategorical.g2.id;
    }
    Object.keys(omicIdCol).map(omic => {
        if (omicIdCol[omic] && omicIdType[omic]) {
            runId += '_' + omic + '_' + omicIdCol[omic].id + '_' + omicIdType[omic].id;
        }
    });
    runId = runId.replace(/[^a-zA-Z0-9]/g, '_');
    return runId;
}

export default ParamSelector