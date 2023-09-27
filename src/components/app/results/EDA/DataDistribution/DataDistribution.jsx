import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import Select from 'react-select';
import Grid from '@mui/material/Grid';
//import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import React, { useState } from 'react'
import { useJob } from '../../../JobContext';
import { useDispatchResults, useResults } from '../../../ResultsContext';
import PlotData from './PlotData';
import MyMotion from '@/components/MyMotion';
import { MySelect, MySwitch } from './MyFormComponents';
import FilterFeatures from './FilterFeatures';
import { AnimatePresence } from 'framer-motion';


export default function DataDistribution() {

    const [showPlot, setShowPlot] = useState(false);

    const [filteredID, setFilteredID] = useState({ 'q2i': [], 'm2i': [] });
    const { showNorm } = useResults().EDA.DD;
    const groupby = { label: useResults().EDA.DD.groupby, value: useResults().EDA.DD.groupby };
    const dispatchResults = useDispatchResults();

    const [filterText, setFilterText] = useState({ 'q2i': '', 'm2i': '' });

    let mdataCols = useJob().user.mdata.columns.map(e => ({ label: e, value: e }));
    mdataCols = [{ label: 'All values', value: 'All values' }, ...mdataCols];

    console.log(filteredID);

    const updatePlot = () => {
        setShowPlot(false);
        setTimeout(() => setShowPlot(true), 2000);
    }

    const handleSelect = e => {
        e != null && dispatchResults({
            type: 'set-eda-dd-groupby',
            groupby: e.value
        });
        updatePlot();
    }

    const handleSwitch = e => {
        dispatchResults({
            type: 'set-eda-dd-norm',
            showNorm: !showNorm
        });
        //setShowNorm(!showNorm);
        updatePlot();
    }

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
                    <MySwitch checked={showNorm} onChange={handleSwitch} label="Normalized" />
                </Grid>
                <Grid item xs={3}>
                    <MySelect
                        options={mdataCols}
                        onChange={handleSelect}
                        value={groupby}
                        label={'Group by'}
                    />
                </Grid>
            </Grid>
            <Box sx={{ flexGrow: 1, p: 0, mt: 0 }}>
                <Grid
                    container
                    direction='row'
                    justifyContent='center'
                    //alignItems='center'
                    spacing={2}
                    sx={{ p: 1 }}
                >
                    <Grid item sx={{ borderRight: '1px solid #cccccc' }} xs={6}>
                        <Typography variant='h6' sx={{ textAlign: 'center', color: '#555555' }}>Proteomics</Typography>
                        {true &&
                            <>
                                <PlotData fileType='xq' showPlot={showPlot} filteredID={filteredID.q2i} />
                                {true &&
                                    <FilterFeatures
                                        fileType='q2i'
                                        lastFilterText={filterText.q2i}
                                        setFilteredID={setFilteredID}
                                        updatePlot={updatePlot}
                                        filteredID={filteredID.q2i}
                                    />
                                }
                            </>
                        }
                    </Grid>
                    <Grid item xs={6} sx={{ borderLeft: '1px solid #cccccc' }}>
                        <Typography variant='h6' sx={{ textAlign: 'center', color: '#555555' }}>Metabolomics</Typography>
                        {true &&
                            <>
                                <MyMotion>
                                    <PlotData fileType='xm' showPlot={showPlot} filteredID={filteredID.m2i} />
                                    {true &&
                                        <FilterFeatures
                                            fileType='m2i'
                                            lastFilterText={filterText.m2i}
                                            setFilteredID={setFilteredID}
                                            updatePlot={updatePlot}
                                            filteredID={filteredID.m2i}
                                        />
                                    }
                                </MyMotion>
                            </>
                        }
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}
