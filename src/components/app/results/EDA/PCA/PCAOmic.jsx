import { useVars } from '@/components/VarsContext'
import { useJob } from '@/components/app/JobContext'
import { Box, CircularProgress, FormControlLabel, FormLabel, Switch, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import TablePvalues from './TablePvalues';
import { MyScatter, MyScatter2D } from './MyScatter';
import TableLoadings from './TableLoadings';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';
import SelectorPCA2D from './SelectorPCA2D';


export default function PCAOmic({ omic }) {

    // useRef to store an interval requesting to the server
    const fetchRef = useRef(null);
    const { API_URL } = useVars();

    // Data used for plots
    const dispatchResults = useDispatchResults();

    const savedStatus = useResults().EDA.PCA[omic].status;
    const [status, setStatus] = useState(savedStatus);

    const savedData = useResults().EDA.PCA[omic].data;
    const [data, setData] = useState(savedData);


    const { projections, loadings, explained_variance, anova } = data;

    const { mdata } = useJob().user;
    const { mdataType } = useJob();
    const { jobID } = useJob();

    const { displayOpts } = useResults().EDA.PCA[omic]
    const [scatterMode, setScatterMode] = useState(displayOpts.scatterMode); // 1D or 2D
    const [selectedPlot, setSelectedPlot] = useState(displayOpts.selectedPlot);
    const [selectedPlot2D, setSelectedPlot2D] = useState(displayOpts.selectedPlot2D);

    const fetchData = useCallback(async () => {
        console.log(`Fetching data`);
        const res = await fetch(`${API_URL}/get_eda_pca/${jobID}/${omic}`);
        const { resStatus, dataPCA } = await res.json();
        console.log(resStatus);
        if (resStatus.status != 'waiting') {
            console.log(`Status changed: ${JSON.stringify(resStatus)}`);
            setData(dataPCA);
            setStatus(resStatus);
            dispatchResults({ type: 'set-eda-pca-data', data: dataPCA, omic: omic });
            dispatchResults({ type: 'set-eda-pca-status', status: resStatus, omic: omic });
            clearInterval(fetchRef.current);
        }
    },
        [API_URL, jobID, omic, dispatchResults, fetchRef]
    );

    useEffect(() => {

        if (status.status == 'waiting') {
            console.log('Get data from server');
            fetchRef.current = setInterval(fetchData, 2000);
            return () => clearInterval(fetchRef.current)
        }

    }, [fetchRef, fetchData, status.status]);//, savedStatus, savedData]);

    // Get array of arrays with pvalues

    const { pvTable, pvRowNames, pvColNames, pvExpVar } = useMemo(
        () => getMainData(anova, explained_variance, mdata, status),
        [anova, explained_variance, mdata, status]
    );

    const scatterData = useMemo(
        () => getScatterData(projections, mdata, mdataType, selectedPlot, selectedPlot2D, status, scatterMode),
        [projections, mdata, mdataType, selectedPlot, selectedPlot2D, status, scatterMode]
    );

    const selectedLoadings = useMemo(
        () => getSelectedLoadings(loadings, selectedPlot, selectedPlot2D, status, scatterMode),
        [loadings, selectedPlot, selectedPlot2D, status, scatterMode]
    );

    return (
        <Box>
            {status.status == 'ok' ? (
                <Box sx={{ padding: 0.2, transition: 'all 1s ease' }}>
                    <Box sx={{ margin: 'auto', pt: 3, width: '90%' }}>
                        <TablePvalues
                            omic={omic}
                            data={pvTable}
                            rowNames={pvRowNames}
                            colNames={pvColNames}
                            expVar={pvExpVar}
                            setSelectedPlot={setSelectedPlot}
                            scatterMode={scatterMode}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                        <Box sx={{ width: '45%', mt:4 }}>
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Box sx={{ mb: 2 }}>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={scatterMode}
                                        exclusive
                                        onChange={(e, mode) => {
                                            setScatterMode(e.target.value);
                                            dispatchResults({ type: 'set-scatter-mode', mode: e.target.value, omic: omic });
                                        }}
                                        aria-label="Platform"
                                    >
                                        <ToggleButton value="1D">1D</ToggleButton>
                                        <ToggleButton value="2D">2D</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                {scatterMode == '1D' ?
                                    <Box sx={{ height: 75, pt: 3 }}>
                                        <Typography variant='body1'>Select a p-value cell to plot PCA</Typography>
                                    </Box>
                                    :
                                    <SelectorPCA2D
                                        pvColNames={pvColNames}
                                        pvRowNames={pvRowNames}
                                        selectedPlot2D={selectedPlot2D}
                                        setSelectedPlot2D={setSelectedPlot2D}
                                        omic={omic}
                                    />
                                }
                            </Box>
                            {scatterData &&
                                <Box sx={{ display: 'flex', 'justifyContent': 'center' }}>
                                    {scatterMode == '1D' ?
                                        <MyScatter
                                            omic={omic}
                                            scatterData={scatterData}
                                            mdataCol={selectedPlot.mdataCol}
                                            PCA={selectedPlot.PCA}
                                        />
                                        :
                                        <MyScatter2D
                                            omic={omic}
                                            scatterData={scatterData}
                                            selectedPlot2D={selectedPlot2D}
                                        />
                                    }
                                </Box>
                            }
                        </Box>
                        <Box sx={{ width: '45%' }}>
                            {selectedLoadings &&
                                <Box sx={{ marginTop: 5, textAlign: 'center' }}>
                                    <TableLoadings
                                        omic={omic}
                                        selectedLoadings={selectedLoadings}
                                        selectedPCA={
                                            scatterMode == '1D' ?
                                                [selectedPlot.PCA,] :
                                                [selectedPlot2D.x, selectedPlot2D.y]
                                        }
                                    />
                                </Box>
                            }
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', pt: 15, height: '30vh' }}>
                    <CircularProgress size={100} thickness={2} />
                </Box>
            )
            }
        </Box >
    )
}

const getMainData = (anova, explained_variance, mdata, status) => {
    let pvData, pvTable, pvRowNames, pvColNames, pvExpVar;

    if (status.status == 'ok') {

        // 1st level --> mdataCol; 2nd level --> anova PCA info
        // [ [ [pca1], [pca2], ...], [], ...]
        pvData = mdata.columns.map(mdataCol => {
            return Object.keys(anova).map(pca => {
                return [mdataCol, parseInt(pca), anova[pca][mdataCol]]
            })

        })

        // Sort by PCA
        for (let i = 0; i < pvData.length; i++) {
            pvData[i].sort((a, b) => a[1] - b[1]);
        }

        // Remove mdataCol where all pca-anova are null
        pvData = pvData.filter(e1 => !e1.map(e2 => Object.keys(e2[2]).length == 0).every(e => e));


        // Extract data
        pvRowNames = pvData.map(e => e[0][0]);
        pvColNames = pvData[0].map(e => e[1]);
        pvTable = pvData.map(e1 => e1.map(e2 => e2[2].pvalue));
        //console.log(pvData, pvTable, pvRowNames, pvColNames);

        // Get explained variance
        pvExpVar = Object.keys(explained_variance).map(e => (100 * explained_variance[e]['Explained_Variance']).toFixed(1));
    }

    return { pvTable, pvRowNames, pvColNames, pvExpVar };
}

const getScatterData = (projections, mdata, mdataType, selectedPlot, selectedPlot2D, status, scatterMode) => {
    let scatterData = null;
    if (status.status == 'ok' && scatterMode == '1D' && selectedPlot) {
        let mdataColSerie = mdata.column(selectedPlot.mdataCol)

        scatterData = Object.keys(projections).map(element => ({
            element: element,
            projection: projections[element][selectedPlot.PCA],
            mdataValue: mdataColSerie.values[mdataColSerie.index.indexOf(element)]
        }))
    } else if (status.status == 'ok' && scatterMode == '2D' && selectedPlot2D) {
        if (Object.keys(mdataType).includes(selectedPlot2D.g)) {
            scatterData = {}
            mdataType[selectedPlot2D.g].levels.map(level => {
                scatterData[level] = [];
                mdataType[selectedPlot2D.g].level2id[level].map(
                    element => {
                        if (Object.keys(projections).includes(element)) {
                            scatterData[level].push({
                                element: element,
                                x: projections[element][selectedPlot2D.x],
                                y: projections[element][selectedPlot2D.y]
                            })
                        }
                    })
            })
        } else {
            scatterData = {
                [selectedPlot2D.g]: Object.keys(projections).map(element => ({
                    element: element,
                    x: projections[element][selectedPlot2D.x],
                    y: projections[element][selectedPlot2D.y],
                }))
            }
        }
    }
    return scatterData
}


const getSelectedLoadings = (loadings, selectedPlot, selectedPlot2D, status, scatterMode) => {
    let selectedLoadings = null;

    if (status.status == 'ok' && scatterMode == '1D' && selectedPlot) {
        selectedLoadings = {};
        Object.keys(loadings).map(fid => {
            selectedLoadings[fid] = [parseFloat(loadings[fid][selectedPlot.PCA].toFixed(5)),];
        })
    } else if (status.status == 'ok' && scatterMode == '2D') {
        selectedLoadings = {};
        Object.keys(loadings).map(fid => {
            selectedLoadings[fid] = [
                parseFloat(loadings[fid][selectedPlot2D.x].toFixed(5)),
                parseFloat(loadings[fid][selectedPlot2D.y].toFixed(5))
            ]
        })
    }
    return selectedLoadings;
}