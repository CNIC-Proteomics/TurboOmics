import { Box, Button, CircularProgress, FormControlLabel, IconButton, Switch, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useJob } from '../../../JobContext';
import PlotData from './PlotData';
import { MySwitch, MySelectGroupby } from './MyFormComponents';
import FilterFeatures from './FilterFeatures';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';


import downloadImage from './downloadImage';
import { useResults, useDispatchResults } from '@/components/app/ResultsContext';
import { MySection, MySectionContainer } from '@/components/MySection';

export default function DataDistribution() {

    const qHistRef = useRef();
    const qBoxRef = useRef();
    const mHistRef = useRef();
    const mBoxRef = useRef();

    const savedShowNorm = useResults().EDA.DD.showNorm;
    const savedGroupby = useResults().EDA.DD.groupby;
    //const dispatchResults = useDispatchResults();

    const [showPlot, setShowPlot] = useState({ 'q': false, 'm': false });

    const [filteredID, setFilteredID] = useState({ 'q2i': [], 'm2i': [] });
    const [showNorm, setShowNorm] = useState(savedShowNorm);
    const [groupby, setGroupby] = useState(savedGroupby);

    const { mdataType } = useJob();
    let mdataCols = useJob().user.mdata.columns.map(e => ({ label: e, value: e }));
    mdataCols = mdataCols.filter(e => mdataType[e.value].type == 'categorical');
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
                {false && <Grid item xs={3} sx={{ pt: 3 }}>
                    <MySwitch handleSwitch={handleSwitch} label="Centered & Scaled" />
                </Grid>}
                <Grid item xs={3}>
                    <MySelectGroupby
                        options={mdataCols}
                        handleSelect={handleSelect}
                        label={'Group by'}
                    />
                </Grid>
            </Grid>
            <MySectionContainer height="70vh">
                <Box sx={{ flexGrow: 1, p: 0, mt: 0 }}>
                    <Grid
                        container
                        direction='row'
                        justifyContent='center'
                        spacing={2}
                        sx={{ p: 0 }}
                    >
                        <Grid item sx={{ borderRight: '1px solid #cccccc' }} xs={6}>
                            <MySection>
                                <Typography
                                    variant='h6'
                                    sx={{ textAlign: 'center', color: '#555555' }}
                                >
                                    Proteomics
                                    <IconButton
                                        aria-label="download"
                                        size='small'
                                        onClick={e => downloadImage(qHistRef.current, qBoxRef.current, 'Proteomics')}
                                        sx={{ opacity: 0.5, visibility: showPlot['q'] ? 'visible' : 'hidden', paddingBottom: 1 }}
                                    >
                                        <ImageIcon />
                                    </IconButton>
                                </Typography>
                                {showPlot['q'] ?
                                    <Box sx={{ height: 550, overflowX: 'auto' }}>
                                        <PlotData
                                            fileType='xq'
                                            filteredID={filteredID.q2i}
                                            groupby={groupby.value}
                                            showNorm={showNorm}
                                            histRef={qHistRef}
                                            boxRef={qBoxRef}
                                        />
                                    </Box>
                                    :
                                    <Box sx={{ textAlign: 'center', pt: 20, height: 550 }}>
                                        <CircularProgress size={100} thickness={2} />
                                    </Box>
                                }
                            </MySection>
                            <MySection>
                                <FilterFeatures
                                    omic='q'
                                    fileType='q2i'
                                    setFilteredID={setFilteredID}
                                    updatePlot={updatePlot}
                                />
                            </MySection>
                        </Grid>
                        <Grid item xs={6} sx={{ borderLeft: '1px solid #cccccc' }}>
                            <MySection>
                                <Typography
                                    variant='h6'
                                    sx={{ textAlign: 'center', color: '#555555' }}
                                >
                                    Metabolomics
                                    <IconButton
                                        aria-label="download"
                                        size='small'
                                        onClick={e => downloadImage(mHistRef.current, mBoxRef.current, 'Metabolomics')}
                                        sx={{ opacity: 0.5, visibility: showPlot['m'] ? 'visible' : 'hidden', paddingBottom: 1 }}
                                    >
                                        <ImageIcon />
                                    </IconButton>
                                </Typography>
                                {showPlot['m'] ?
                                    <Box sx={{ height: 550, overflowX: 'auto' }}>
                                        <PlotData
                                            fileType='xm'
                                            filteredID={filteredID.m2i}
                                            groupby={groupby.value}
                                            showNorm={showNorm}
                                            histRef={mHistRef}
                                            boxRef={mBoxRef}
                                        />
                                    </Box>
                                    :
                                    <Box sx={{ textAlign: 'center', pt: 20, height: '52vh' }}>
                                        <CircularProgress size={100} thickness={2} />
                                    </Box>
                                }
                            </MySection>
                            <MySection>
                                <FilterFeatures
                                    omic='m'
                                    fileType='m2i'
                                    setFilteredID={setFilteredID}
                                    updatePlot={updatePlot}
                                />
                            </MySection>
                        </Grid>
                    </Grid>
                </Box>
            </MySectionContainer>
        </Box>
    )
}
