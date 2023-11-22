import { Box, Divider, Grid, Typography } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useVars } from '@/components/VarsContext';
import { useJob } from '../../JobContext';
import TablePvalues from './TablePvalues';
import ScatterPlotContainer from './ScatterPlot/ScatterPlotContainer';
import { MySection, MySectionContainer } from '@/components/MySection';
import LoadingPlotContainer from './LoadingPlot/LoadingPlotContainer';
import HeatMapContainer from './HeatMap/HeatMapContainer';


function MOFA() {

    const dispatchResults = useDispatchResults();
    const { API_URL } = useVars();
    const { jobID } = useJob();

    const savedDataMOFA = useResults().MOFA.data;
    const [dataMOFA, setDataMOFA] = useState(savedDataMOFA);

    const savedScatterMode = useResults().MOFA.displayOpts.scatterMode;
    const [scatterMode, setScatterMode] = useState(savedScatterMode);

    const savedSelectedPlot = useResults().MOFA.displayOpts.selectedPlot;
    const [selectedPlot, setSelectedPlot] = useState(savedSelectedPlot);

    const savedSelectedPlot2D = useResults().MOFA.displayOpts.selectedPlot2D;
    const [selectedPlot2D, setSelectedPlot2D] = useState(savedSelectedPlot2D);


    /*
    Fetch MOFA data
    */

    const fetchData = useCallback(async () => {
        console.log('Fetching MOFA data');
        if (savedDataMOFA == null) {
            const res = await fetch(`${API_URL}/get_mofa/${jobID}`);
            const resJson = await res.json(); // {dataMofa, resStatus}
            setDataMOFA(resJson.dataMOFA);
            dispatchResults({ type: 'set-mofa-data', data: resJson.dataMOFA });
        }
    }, [savedDataMOFA, API_URL, dispatchResults, jobID]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**/


    /* 
    Get arrays for pvalue table
    */
    const [colNames, factorNames] = useMemo(
        () => getFactorNames(dataMOFA), [dataMOFA],
    );
    const rowNames = useMemo(
        () => getRowNames(dataMOFA, factorNames), [dataMOFA, factorNames]
    );
    /**/


    /*
    Get arrays with sorted proteins and metabolites (loading and heatmap)
    */
    const [plotHM, setPlotHM] = useState(false);
    const plotHeatMap = useCallback(() => setPlotHM(e => !e), []);
    useEffect(() => {
        const myTimeOut = setTimeout(plotHeatMap, 100);
        return () => clearInterval(myTimeOut)
    }, [selectedPlot, plotHeatMap]);

    const nFeatRef = useRef({ q: { down: 0, up: 0 }, m: { down: 0, up: 0 } });

    const fLVec = useMemo(
        () => getFLVec(dataMOFA, selectedPlot), [dataMOFA, selectedPlot]
    );
    /**/

    return (
        <Box>
            <MySectionContainer height="80vh">
                {dataMOFA != null && <>

                    <MySection>
                        <Box sx={{ p: 5 }}>
                            <TablePvalues
                                anova={dataMOFA.anova}
                                explained_variance={dataMOFA.explained_variance}
                                setSelectedPlot={setSelectedPlot}
                                scatterMode={scatterMode}
                                rowNames={rowNames}
                                colNames={colNames}
                                factorNames={factorNames}
                            />
                        </Box>
                    </MySection>
                    <MySection>
                        <Divider>Projections</Divider>
                        <Box sx={{ mt: 2 }}>
                            <ScatterPlotContainer
                                scatterMode={scatterMode}
                                setScatterMode={setScatterMode}
                                selectedPlot={selectedPlot}
                                selectedPlot2D={selectedPlot2D}
                                setSelectedPlot2D={setSelectedPlot2D}
                                rowNames={rowNames}
                                factorNames={factorNames}
                                projections={dataMOFA.projections}
                            />
                        </Box>
                    </MySection>
                    {scatterMode == '1D' && selectedPlot && <>
                        <MySection sx={{ mt: 1 }}>
                            <Divider variant='h6' sx={{ textAlign: 'center' }}>
                                Feature Loading Analysis: {selectedPlot.Factor}
                            </Divider>
                            <LoadingPlotContainer
                                fLVec={fLVec}
                                nFeatRef={nFeatRef}
                                plotHeatMap={plotHeatMap}
                            />

                        </MySection>
                        <MySection>
                            <Divider>HeatMap</Divider>
                            <HeatMapContainer
                                nFeatRef={nFeatRef}
                                fLVec={fLVec}
                                mdataCol={selectedPlot.mdataCol}
                                plotHM={plotHM}
                            />
                        </MySection>
                    </>}

                </>}
            </MySectionContainer>
        </Box >
    )
}

/*
Define functions
*/

const getFactorNames = (dataMOFA) => {
    if (dataMOFA == null) return [undefined, undefined];

    const factorNames = Object.keys(dataMOFA.anova);
    const colNames = factorNames.map((e, i) => i + 1);
    return [colNames, factorNames]
}

const getRowNames = (dataMOFA, factorNames) => {
    if (dataMOFA == null) return;

    let rowNames = Object.keys(dataMOFA.anova[factorNames[0]]);

    // remove metadata columns without results in any factor
    rowNames = rowNames.map(i => {
        return [i, factorNames.map(j => {
            return Object.keys(dataMOFA.anova[j][i]).length == 0;
        }).every(e => e)];
    }).filter(e => !e[1]).map(e => e[0]);

    return rowNames;
}

const getFLVec = (dataMOFA, selectedPlot) => {
    if (dataMOFA == null || selectedPlot == null) return null;

    let fLVec = { 'q': [], 'm': [] };
    Object.keys(fLVec).map(e => {
        fLVec[e] = Object.keys(dataMOFA.loadings[e][selectedPlot.Factor]).map(
            f => [f, dataMOFA.loadings[e][selectedPlot.Factor][f]]
        );
        fLVec[e].sort((a, b) => a[1] - b[1]);
        fLVec[e] = fLVec[e].map((elem, i) => [...elem, (i + 1) / fLVec[e].length]);
    })
    return fLVec
}

export default MOFA