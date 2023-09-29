import { Box, CircularProgress, FormControlLabel, Switch, Typography } from '@mui/material';
import Select from 'react-select';
import Grid from '@mui/material/Grid';
//import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import React, { useCallback, useState } from 'react'
import { useJob } from '../../../JobContext';
import { useDispatchResults, useResults } from '../../../ResultsContext';
import PlotData from './PlotData';
import MyMotion from '@/components/MyMotion';
import { MySelect, MySwitch, MySelectGroupby } from './MyFormComponents';
import FilterFeatures from './FilterFeatures';


export default function DataDistribution() {

    const [showPlot, setShowPlot] = useState({ 'q': false, 'm': false });

    const [filteredID, setFilteredID] = useState({ 'q2i': [], 'm2i': [] });
    const [pvalue, setPvalue] = useState({ 'q': null, 'm': null });
    //const { showNorm } = useResults().EDA.DD;
    //const groupby = { label: useResults().EDA.DD.groupby, value: useResults().EDA.DD.groupby };
    const [showNorm, setShowNorm] = useState(true);
    const [groupby, setGroupby] = useState({ label: 'All values', value: 'All values' });
    //const dispatchResults = useDispatchResults();

    const [filterText, setFilterText] = useState({ 'q2i': '', 'm2i': '' });

    let mdataCols = useJob().user.mdata.columns.map(e => ({ label: e, value: e }));
    mdataCols = [{ label: 'All values', value: 'All values' }, ...mdataCols];

    //console.log(filteredID);

    const updatePlot = useCallback((omics = ['q', 'm']) => {
        omics.map(
            omic => {
                setShowPlot(prevState => ({ ...prevState, [omic]: false }))
                setPvalue(prevState => ({ ...prevState, [omic]: null }))
            }
        )
        omics.map(
            omic => setTimeout(() => setShowPlot(prevState => ({ ...prevState, [omic]: true })), 300)
        )
    }, [])

    const handleSelect = useCallback(e => {
        /*e != null && dispatchResults({
            type: 'set-eda-dd-groupby',
            groupby: e.value
        });*/
        setGroupby({ label: e.value, value: e.value })
        updatePlot(['q', 'm']);
    }, [updatePlot])

    const handleSwitch = useCallback(e => {
        /*dispatchResults({
            type: 'set-eda-dd-norm',
            showNorm: !showNorm
        });*/
        setShowNorm(e.target.checked);
        updatePlot(['q', 'm']);
    }, [showNorm, updatePlot]);

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
                    <MySelectGroupby
                        options={mdataCols}
                        onChange={handleSelect}
                        //value={groupby}
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
                    sx={{ p: 0 }}
                >
                    <Grid item sx={{ borderRight: '1px solid #cccccc' }} xs={6}>
                        <Typography variant='h6' sx={{ textAlign: 'center', color: '#555555' }}>Proteomics</Typography>
                        {true &&
                            <>
                                {showPlot['q'] ?
                                    <Box sx={{ height: '52vh' }}>
                                        <PlotData
                                            omic='q'
                                            fileType='xq'
                                            showPlot={showPlot['q']}
                                            filteredID={filteredID.q2i}
                                            groupby={groupby.value}
                                            showNorm={showNorm}
                                            pvalue={pvalue.q}
                                            setPvalue={setPvalue}
                                        />
                                    </Box>
                                    :
                                    <Box sx={{ textAlign: 'center', pt: 20, height: '52vh' }}><CircularProgress size={100} thickness={2} /></Box>
                                }
                                {true &&
                                    <FilterFeatures
                                        omic='q'
                                        fileType='q2i'
                                        //lastFilterText={filterText.q2i}
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
                                    {showPlot['m'] ?
                                        <PlotData
                                            omic='m'
                                            fileType='xm'
                                            showPlot={showPlot['m']}
                                            filteredID={filteredID.m2i}
                                            groupby={groupby.value}
                                            showNorm={showNorm}
                                            pvalue={pvalue.m}
                                            setPvalue={setPvalue}
                                        />
                                        :
                                        <Box sx={{ textAlign: 'center', pt: 20, height: '52vh' }}><CircularProgress size={100} thickness={2} /></Box>
                                    }
                                    {true &&
                                        <FilterFeatures
                                            omic='m'
                                            fileType='m2i'
                                            //lastFilterText={filterText.m2i}
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
