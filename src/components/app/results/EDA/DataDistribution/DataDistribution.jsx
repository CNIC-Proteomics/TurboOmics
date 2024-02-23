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

    const omicViewRef = useRef()

    const { omics } = useJob();
    const [selOmic, setSelOmic] = useState(omics[0]);

    // Ref to download figures
    const figRef = useRef(
        omics.reduce((obj, omic) => ({ ...obj, [omic]: {} }), {})
    );

    // Display options (norm & groupby mdata & feature filtration) 
    const savedShowNorm = useResults().EDA.DD.showNorm;
    const [showNorm, setShowNorm] = useState(savedShowNorm);

    const savedGroupby = useResults().EDA.DD.groupby;
    const [groupby, setGroupby] = useState(savedGroupby);

    const [filteredID, setFilteredID] = useState(
        omics.reduce((obj, omic) => ({ ...obj, [`${omic}2i`]: [] }), {})
    );

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
        setGroupby({ label: e.value, value: e.value })
        updatePlot(omics);
    }, [updatePlot])


    // Handle change in norm
    const handleSwitch = useCallback(e => {
        setShowNorm(e.target.checked);
        updatePlot(omics);
    }, [updatePlot]);

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
                        <Box sx={{
                            width: `${100 / omics.length}%`,
                            opacity: selOmic == omic ? 1 : 0,
                            transition: 'all 1s ease'
                        }}
                        >
                            <OmicView
                                key={omic}
                                omic={omic}
                                figRef={figRef}
                                showPlot={showPlot}
                                showNorm={showNorm}
                                filteredID={filteredID[`${omic}2i`]}
                                setFilteredID={setFilteredID}
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
