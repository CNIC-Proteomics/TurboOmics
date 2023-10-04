import { Box, CircularProgress, FormControlLabel, Switch, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useCallback, useState } from 'react'
import { useJob } from '../../../JobContext';
import PlotData from './PlotData';
import { MySwitch, MySelectGroupby } from './MyFormComponents';
import FilterFeatures from './FilterFeatures';


export default function DataDistribution() {

    const [showPlot, setShowPlot] = useState({ 'q': false, 'm': false });

    const [filteredID, setFilteredID] = useState({ 'q2i': [], 'm2i': [] });
    const [showNorm, setShowNorm] = useState(true);
    const [groupby, setGroupby] = useState({ label: 'All values', value: 'All values' });


    let mdataCols = useJob().user.mdata.columns.map(e => ({ label: e, value: e }));
    mdataCols = [{ label: 'All values', value: 'All values' }, ...mdataCols];

    const updatePlot = useCallback((omics = ['q', 'm']) => {
        omics.map(
            omic => {
                setShowPlot(prevState => ({ ...prevState, [omic]: false }))
            }
        )
        omics.map(
            omic => setTimeout(() => setShowPlot(prevState => ({ ...prevState, [omic]: true })), 300)
        )
    }, [])

    const handleSelect = useCallback(e => {
        setGroupby({ label: e.value, value: e.value })
        updatePlot(['q', 'm']);
    }, [updatePlot])

    const handleSwitch = useCallback(e => {
        setShowNorm(e.target.checked);
        updatePlot(['q', 'm']);
    }, [updatePlot]);

    return (
        <Box>
            <Grid
                container
                direction='row'
                justifyContent='center'
                alignItems='center'
                sx={{ mb: 3, mt: 0 }}
            >
                <Grid item xs={2}>
                    <MySwitch handleSwitch={handleSwitch} label="Normalized" />
                </Grid>
                <Grid item xs={3}>
                    <MySelectGroupby
                        options={mdataCols}
                        handleSelect={handleSelect}
                        label={'Group by'}
                    />
                </Grid>
            </Grid>
            <Box sx={{ flexGrow: 1, p: 0, mt: 0 }}>
                <Grid
                    container
                    direction='row'
                    justifyContent='center'
                    spacing={2}
                    sx={{ p: 0 }}
                >
                    <Grid item sx={{ borderRight: '1px solid #cccccc' }} xs={6}>
                        <Typography
                            variant='h6'
                            sx={{ textAlign: 'center', color: '#555555' }}
                        >
                            Proteomics
                        </Typography>
                        {showPlot['q'] ?
                            <Box sx={{ height: 510, overflowX: 'auto' }}>
                                <PlotData
                                    fileType='xq'
                                    filteredID={filteredID.q2i}
                                    groupby={groupby.value}
                                    showNorm={showNorm}
                                />
                            </Box>
                            :
                            <Box sx={{ textAlign: 'center', pt: 20, height: '52vh' }}>
                                <CircularProgress size={100} thickness={2} />
                            </Box>
                        }
                        <FilterFeatures
                            omic='q'
                            fileType='q2i'
                            setFilteredID={setFilteredID}
                            updatePlot={updatePlot}
                        />
                    </Grid>
                    <Grid item xs={6} sx={{ borderLeft: '1px solid #cccccc' }}>
                        <Typography
                            variant='h6'
                            sx={{ textAlign: 'center', color: '#555555' }}
                        >
                            Metabolomics
                        </Typography>
                        {showPlot['m'] ?
                            <Box sx={{ height: 510, overflowX: 'auto' }}>
                                <PlotData
                                    fileType='xm'
                                    filteredID={filteredID.m2i}
                                    groupby={groupby.value}
                                    showNorm={showNorm}
                                />
                            </Box>
                            :
                            <Box sx={{ textAlign: 'center', pt: 20, height: '52vh' }}>
                                <CircularProgress size={100} thickness={2} />
                            </Box>
                        }
                        <FilterFeatures
                            omic='m'
                            fileType='m2i'
                            setFilteredID={setFilteredID}
                            updatePlot={updatePlot}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}
