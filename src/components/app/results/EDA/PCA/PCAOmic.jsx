import { useVars } from '@/components/VarsContext'
import { useJob } from '@/components/app/JobContext'
import { Box, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import TablePvalues from './TablePvalues';
import MyScatter from './MyScatter';
import TableLoadings from './TableLoadings';
import { MaterialReactTable } from 'material-react-table';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';


export default function PCAOmic({ title, omic }) {

    // useRef to store an interval requsting to the server
    const fetchRef = useRef(null);

    // Data used for plots
    const dispatchResults = useDispatchResults();
    const savedData = useResults().EDA.PCA[omic].data;
    const savedStatus = useResults().EDA.PCA[omic].status;

    const [data, setData] = useState({
        projections: null,
        loadings: null,
        explained_variance: null,
        anova: null
    });

    const [status, setStatus] = useState({ status: 'waiting' });

    const { projections, loadings, explained_variance, anova } = data;

    const { mdata } = useJob().user;
    const { jobID } = useJob();
    const { API_URL } = useVars();

    const [selectedPlot, setSelectedPlot] = useState(null);

    const fetchData = useCallback(async () => {
        console.log(`Fetching data`);
        const res = await fetch(`${API_URL}/get_eda_pca/${jobID}/${omic}`);
        const { resStatus, dataPCA } = await res.json();
        console.log(resStatus);
        if (resStatus.status != 'waiting') {
            setData(dataPCA);
            setStatus(resStatus);
            dispatchResults({ type: 'set-eda-pca-data', data: dataPCA, omic: omic });
            dispatchResults({ type: 'set-eda-pca-status', status: resStatus, omic: omic });
        }
    }, [API_URL, jobID, omic, dispatchResults])

    useEffect(() => {
        console.log('useEffect to get data');

        // check if it is saved
        if (savedStatus.status == 'ok') {
            console.log('Using saved data');
            setStatus(savedStatus);
            setData(savedData);
            return;

        } else { // get from server
            console.log('Get data from server');
            fetchRef.current = setInterval(fetchData, 2000);
            return () => clearInterval(fetchRef.current);
        }

    }, [fetchRef, fetchData, savedStatus, savedData]);

    useEffect(() => {
        console.log(`Status changed: ${JSON.stringify(status)}`);
        if (status.status != 'waiting') {
            clearInterval(fetchRef.current);
        }
    }, [status])

    // Get array of arrays with pvalues

    const { pvTable, pvRowNames, pvColNames, pvExpVar } = useMemo(() => {
        let pvData, pvTable, pvRowNames, pvColNames, pvExpVar;

        if (anova != null) {

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
    }, [anova, explained_variance, mdata])

    const scatterData = useMemo(() => {
        let scatterData = null;
        if (selectedPlot) {
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
    }, [selectedPlot, mdata, projections])

    const selectedLoadings = useMemo(() => {
        const selectedLoadings = {};

        if (loadings && selectedPlot) {
            Object.keys(loadings).map(fid => {
                selectedLoadings[fid] = parseFloat(loadings[fid][selectedPlot.PCA].toFixed(5));
            })
        }

        return selectedLoadings;

    }, [loadings, selectedPlot]);

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
                            <Box sx={{ marginTop: 5, textAlign: 'center' }}>
                                {scatterData ?
                                    <Box>
                                        <MyScatter
                                            scatterData={scatterData}
                                            mdataCol={selectedPlot.mdataCol}
                                            PCA={selectedPlot.PCA}
                                        />
                                        {true && <TableLoadings
                                            omic={omic}
                                            selectedLoadings={selectedLoadings}
                                            selectedPCA={selectedPlot.PCA}
                                        />}
                                    </Box>
                                    :
                                    <Box>Select a pvalue cell to plot values</Box>
                                }
                            </Box>
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
