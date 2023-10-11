import { useVars } from '@/components/VarsContext'
import { useJob } from '@/components/app/JobContext'
import { Box, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import TablePvalues from './TablePvalues';
import MyScatter from './MyScatter';
import TableLoadings from './TableLoadings';
import { MaterialReactTable } from 'material-react-table';


export default function PCAOmic({ title, omic }) {

    const [selectedPlot, setSelectedPlot] = useState(null);

    const [data, setData] = useState({
        projections: null,
        loadings: null,
        explained_variance: null,
        anova: null
    });

    const { projections, loadings, explained_variance, anova } = data;

    const { mdata } = useJob().user;
    const { jobID } = useJob();
    const { API_URL } = useVars();

    useEffect(() => {
        console.log('Get PCA and ANOVA data');

        const fetchData = async () => {
            const res = await fetch(`${API_URL}/get_eda_pca/${jobID}/${omic}`);
            const resJson = await res.json();
            console.log(resJson);
            setData(resJson);
        }

        fetchData();

    }, [API_URL, jobID, omic]);

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
            {anova != null &&
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
                                <TableLoadings omic={omic} selectedLoadings={selectedLoadings} selectedPCA={selectedPlot.PCA} />
                            </Box>
                            :
                            <Box>Select a pvalue cell to plot values</Box>
                        }
                    </Box>
                </Box>
            }
        </Box>
    )
}
