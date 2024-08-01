import { Autocomplete, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
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


function ParamSelector() {

    // Get job data
    const { omics, mdataType, OS } = useJob();
    const jobUser = useJob().user;

    // Save section variables
    const dispatchResults = useDispatchResults();
    const savedResultsPWA = useResults().PWA;

    // Select metadata column
    const mdata = jobUser.mdata;
    const [mdataCol, setMdataCol] = useState(savedResultsPWA.mdataCol);
    const [mdataCategorical, setMdataCategorical] = useState({
        isCategorical: false,
        colOpts: [],
        g1: null, g2: null
    });

    const handleMdataAutocomplete = (event, newValue) => {
        if (!newValue) return;
        setMdataCol(newValue);
        dispatchResults({ type: 'set-pwa-attr', attr: 'mdataCol', value: newValue });

        if (mdataType[newValue.id].type == 'categorical') {
            setMdataCategorical(prev => ({
                isCategorical: true,
                colOpts: mdataType[newValue.id].levels.map(e => ({ label: e, id: e })),
                g1: null, g2: null
            }));
        } else {
            setMdataCategorical(prev => ({
                isCategorical: false,
                colOpts: [],
                g1: null, g2: null
            }));
        }
    }

    // Select omic identifier column
    const [omicIdCol, setOmicIdCol] = useState(
        omics.reduce((prev, curr) => ({ ...prev, [curr]: null }), {})
    );

    const [omicIdType, setOmicIdType] = useState(
        omics.reduce((prev, curr) => ({ ...prev, [curr]: omicIdTypeOpts[curr][0] }), {})
    );

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
                        onClick={() => console.log('Run Analysis')}
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
                        options={mdata.columns.map(e => ({ label: e, id: e }))}
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
                {true && <>
                    <Box sx={{ display: 'flex', mt: 4, alignItems: 'center', 
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
                </>}
            </Box>

            <Box sx={{ width: '2%', borderWidth: '0px 1.5px 0px 0px', borderStyle: 'dashed', borderColor: '#aaaaaa' }}></Box>

            <Box sx={{ width: '55%', display: 'flex', justifyContent: 'space-evenly' }}>
                {omics.map(o => (
                    <OmicIdSelector
                        key={o}
                        o={o}
                        omicIdCol_i={omicIdCol[o]}
                        setOmicIdCol_i={(e) => setOmicIdCol(prev => ({ ...prev, [o]: e }))}
                        omicIdType_i={omicIdType[o]}
                        setOmicIdType_i={(e) => setOmicIdType(prev => ({ ...prev, [o]: e }))}
                    />
                ))}
            </Box>

        </Box>
    )
}

const OmicIdSelector = ({ o, omicIdCol_i, setOmicIdCol_i, omicIdType_i, setOmicIdType_i }) => {

    const { OMIC2NAME } = useVars();
    const omicIdColOpts = useJob().user[`${o}2i`].columns.map(e => ({ label: e, id: e }));

    return (
        <Box key={o} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box>
                <Autocomplete
                    value={omicIdCol_i}
                    onChange={(event, newValue) => setOmicIdCol_i(newValue)}
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
                /></Box>

            <Box sx={{ mt: 4 }}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">ID Type</InputLabel>
                    <Select
                        sx={{ minWidth: '180px' }}
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        value={omicIdType_i}
                        label="ID Type"
                        onChange={(event) => setOmicIdType_i(event.target.value)}
                    >
                        {omicIdTypeOpts[o].map(e => (
                            <MenuItem key={e.id} value={e}>{e.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

        </Box>
    )
}


export default ParamSelector