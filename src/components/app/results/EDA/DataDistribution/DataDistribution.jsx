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
import OmicView from './OmicView';
import OmicSelector from './OmicSelector';

export default function DataDistribution() {

    // useRef to change omic view
    const omicViewRef = useRef();
    const { omics } = useJob();
    const [selOmic, setSelOmic] = useState(omics[0]);

    // Ref to download figures
    const figRef = useRef(
        omics.reduce((obj, omic) => ({ ...obj, [omic]: {} }), {})
    );

    // Display options (norm & groupby mdata & feature filtration) 
    const dispatchResults = useDispatchResults();

    const savedShowNorm = useResults().EDA.DD.showNorm;
    const [showNorm, setShowNorm] = useState(savedShowNorm);

    const savedGroupby = useResults().EDA.DD.groupby;
    const [groupby, setGroupby] = useState(savedGroupby);

    // Extract categorical mdata columns (adding a generic one)
    const { mdataType } = useJob();
    let mdataCols = useJob().user.mdata.columns
        .map(e => ({ label: e, value: e }))
        .filter(e => mdataType[e.value].type == 'categorical');
    mdataCols = [{ label: 'All values', value: 'All values' }, ...mdataCols];


    // Control display plot
    const [showPlot, setShowPlot] = useState(
        omics.reduce((obj, omic) => ({ ...obj, [omic]: false }), {})
    );

    const updatePlot = useCallback((omics = omics) => {
        omics.map(
            omic => {
                setShowPlot(prevState => ({ ...prevState, [omic]: false }))
            }
        );
        omics.map(
            omic => setTimeout(() => setShowPlot(prevState => ({ ...prevState, [omic]: true })), 300)
        );
    }, []);


    // Handle change in groupby
    const handleSelect = useCallback(e => {
        const newGroupby =  { label: e.value, value: e.value }
        setGroupby(newGroupby);
        dispatchResults({ type: 'set-eda-dd-groupby', groupby: newGroupby });
        updatePlot(omics);
    }, [updatePlot, omics])


    // Handle change in norm
    const handleSwitch = useCallback(e => {
        setShowNorm(e.target.checked);
        updatePlot(omics);
    }, [updatePlot, omics]);

    return (
        <Box>
            <OmicSelector
                selOmic={selOmic}
                setSelOmic={setSelOmic}
                omicViewRef={omicViewRef}
            />
            <Grid
                container
                direction='row'
                justifyContent='center'
                alignItems='center'
                sx={{ mb: 3, mt: 3 }}
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
            <Box ref={omicViewRef} sx={{ overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', width: `${omics.length}00%`, }}>
                    {omics.map(omic => (
                        <Box
                            key={omic}
                            sx={{
                                width: `${100 / omics.length}%`,
                                opacity: selOmic == omic ? 1 : 0,
                                transition: 'all 1s ease'
                            }}
                        >
                            <OmicView
                                omic={omic}
                                figRef={figRef}
                                showPlot={showPlot}
                                showNorm={showNorm}
                                updatePlot={updatePlot}
                                groupby={groupby.value}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}
