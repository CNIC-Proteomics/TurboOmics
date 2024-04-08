import React, { useMemo, useState } from 'react'
import { Box, Autocomplete, TextField, Typography } from "@mui/material"
import useFx2i from '@/hooks/useFx2i';
import { useVars } from '@/components/VarsContext';
import { useResults } from '../../ResultsContext';

function GSEAomic({ omic }) {
    // check if this is a metabolomics section
    const isM = omic == 'm';

    const { OMIC2NAME } = useVars();

    // Get fx2i 
    const [fx2i] = useFx2i(omic);

    // Generate column options for feature id (protein or transcript)
    const fidColOpts = useMemo(
        () => fx2i.columns.map(e => ({ label: e, id: e })),
        [fx2i]);

    const [fidCol, setFidCol] = useState(null);

    const handleFidColOpts = (e, newValue) => {
        setFidCol(newValue);
    }

    // GSEA ranking metric
    const resStatus = useResults().status;

    const rankColOpts = useMemo(() => ([
        { label: 't-test', disabled: false },
        { label: 'PCA', disabled: resStatus.EDA_PCA.status != 'ok' },
        { label: 'MOFA', disabled: resStatus.MOFA.status != 'ok' }
    ]), [resStatus]);

    const [rankCol, setRankCol] = useState(null);

    const handleRankColOpts = (e, newValue) => {
        setRankCol(newValue);
    }

    return (
        <Box sx={{ mt: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography type='body2'>Select column containing {OMIC2NAME[omic]} ID</Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Autocomplete
                            options={fidColOpts}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label={`${OMIC2NAME[omic]} ID column`} />}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={fidCol}
                            onChange={handleFidColOpts}
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
        </Box>
    )
}

export default GSEAomic