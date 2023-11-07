import { useVars } from '@/components/VarsContext'
import { useJob } from '@/components/app/JobContext'
import { Box, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import TablePvalues from './TablePvalues';
import MyScatter from './MyScatter';
import TableLoadings from './TableLoadings';
import { MaterialReactTable } from 'material-react-table';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';
import { MySelect } from '../DataDistribution/MyFormComponents';


export default function PCAOmic({ title, omic }) {

    // useRef to store an interval requesting to the server
    const fetchRef = useRef(null);
    const { API_URL } = useVars();

    // Data used for plots
    const dispatchResults = useDispatchResults();
    const savedStatus = useResults().EDA.PCA[omic].status;
    const savedData = useResults().EDA.PCA[omic].data;

    const [status, setStatus] = useState(savedStatus);
    const [data, setData] = useState(savedData);

    const { projections, loadings, explained_variance, anova } = data;

    const { mdata } = useJob().user;
    const { mdataType } = useJob()
    const { jobID } = useJob();

    const [scatterMode, setScatterMode] = useState('1D'); // 1D or 2D
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [selectedPlot2D, setSelectedPlot2D] = useState({ x: 1, y: 2, g: 'No color' });

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
    )

    useEffect(() => {
        console.log('useEffect to get data');

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
        () => getScatterData(selectedPlot, mdata, projections, status),
        [selectedPlot, mdata, projections, status]
    )

    const selectedLoadings = useMemo(
        () => getSelectedLoadings(loadings, selectedPlot, selectedPlot2D, status, scatterMode),
        [loadings, selectedPlot, selectedPlot2D, status, scatterMode]
    );

    return (
        <Box sx={{ borderRight: omic == 'q' ? '1px solid #cccccc' : '0px' }}>
            <Typography
                variant='h6'
                sx={{ textAlign: 'center', color: '#555555' }}
            >
                {title}
            </Typography>
            {(() => {
                if (status.status == 'ok') {
                    return (
                        <Box sx={{ padding: 1 }}>
                            <TablePvalues
                                data={pvTable}
                                rowNames={pvRowNames}
                                colNames={pvColNames}
                                expVar={pvExpVar}
                                setSelectedPlot={setSelectedPlot}
                            />
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Box sx={{ mb: 2 }}>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={scatterMode}
                                        exclusive
                                        onChange={(e, mode) => setScatterMode(e.target.value)}
                                        aria-label="Platform"
                                    >
                                        <ToggleButton value="1D">1D</ToggleButton>
                                        <ToggleButton value="2D">2D</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                {scatterMode == '1D' ?
                                    <Box>
                                        Select a pvalue cell to plot PCA
                                    </Box>
                                    :
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Box sx={{ width: '25%' }}>
                                            <MySelect
                                                options={pvColNames.map(e => ({ label: `PCA ${e}`, value: e }))}
                                                onChange={
                                                    e => setSelectedPlot2D(prev => ({ ...prev, x: e.value }))
                                                }
                                                value={{ label: `PCA ${selectedPlot2D.x}`, value: selectedPlot2D.x }}
                                                label='X axis'
                                            />
                                        </Box>
                                        <Box sx={{ width: '25%' }}>
                                            <MySelect
                                                options={pvColNames.map(e => ({ label: `PCA ${e}`, value: e }))}
                                                onChange={
                                                    e => setSelectedPlot2D(prev => ({ ...prev, y: e.value }))
                                                }
                                                value={{ label: `PCA ${selectedPlot2D.y}`, value: selectedPlot2D.y }}
                                                label='Y axis'
                                            />
                                        </Box>
                                        <Box sx={{ width: '40%' }}>
                                            <MySelect
                                                options={[
                                                    { label: 'No color', value: 'No color' },
                                                    ...pvRowNames.filter(
                                                        e => mdataType[e].type == 'categorical'
                                                    ).map(e => ({ label: e, value: e }))]}
                                                onChange={
                                                    e => setSelectedPlot2D(prev => ({ ...prev, g: e.value }))
                                                }
                                                value={{ label: selectedPlot2D.g, value: selectedPlot2D.g }}
                                                label='Color by'
                                            />
                                        </Box>
                                    </Box>
                                }
                            </Box>
                            {scatterData &&
                                <Box>
                                    {scatterMode == '1D' ?
                                        <MyScatter
                                            scatterData={scatterData}
                                            mdataCol={selectedPlot.mdataCol}
                                            PCA={selectedPlot.PCA}
                                        />
                                        :
                                        <Box>2D scatter</Box>
                                    }
                                </Box>
                            }
                            {selectedLoadings &&
                                <Box sx={{ marginTop: 5, textAlign: 'center' }}>
                                    <TableLoadings
                                        omic={omic}
                                        selectedLoadings={selectedLoadings}
                                        selectedPCA={scatterMode=='1D'?[selectedPlot.PCA,] : [selectedPlot2D.x, selectedPlot2D.y]}
                                    />
                                </Box>
                            }
                        </Box>
                    )
                } else if (status.status == 'waiting') {
                    return (
                        <Box sx={{ textAlign: 'center', pt: 15, height: '30vh' }}>
                            <CircularProgress size={100} thickness={2} />
                        </Box>
                    )
                } else if (status.status == 'error') {
                    return (
                        <Box sx={{ textAlign: 'center', pt: 15, height: '30vh' }}>
                            An error occurred
                        </Box>
                    )
                }
            })()
            }
        </Box>
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

const getScatterData = (selectedPlot, mdata, projections, status) => {
    let scatterData = null;
    if (status.status == 'ok' && selectedPlot) {
        scatterData = [];
        let mdataColSerie = mdata.column(selectedPlot.mdataCol)
        Object.keys(projections).forEach(element => {
            scatterData.push({
                element: element,
                projection: projections[element][selectedPlot.PCA],
                mdataValue: mdataColSerie.values[mdataColSerie.index.indexOf(element)]
            })
        })
    }
    return scatterData
}


const getSelectedLoadings = (loadings, selectedPlot, selectedPlot2D, status, scatterMode) => {
    let selectedLoadings = null;

    if (status.status == 'ok' && scatterMode == '1D' && selectedPlot) {
        selectedLoadings = {};
        Object.keys(loadings).map(fid => {
            selectedLoadings[fid] = [parseFloat(loadings[fid][selectedPlot.PCA].toFixed(5)), ];
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