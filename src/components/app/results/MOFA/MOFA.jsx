import { Backdrop, Box, Button, CircularProgress, Divider, Grid, Typography } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useVars } from '@/components/VarsContext';
import { useJob } from '../../JobContext';
import TablePvalues from './TablePvalues';
import ScatterPlotContainer from './ScatterPlot/ScatterPlotContainer';
import { MySection, MySectionContainer } from '@/components/MySection';
import LoadingPlotContainer from './LoadingPlot/LoadingPlotContainer';
import HeatMapContainer from './HeatMap/HeatMapContainer';

import dynamic from 'next/dynamic';
import HelpSection from './HelpSection';
const ExploreFeaturesContainer = dynamic(
    () => import('./ExploreFeatures/ExploreFeaturesContainer')
)
//import ExploreFeaturesContainer from './ExploreFeatures/ExploreFeaturesContainer';


function MOFA() {

    const dispatchResults = useDispatchResults();
    const { API_URL } = useVars();
    const { jobID } = useJob();

    const savedDataMOFA = useResults().MOFA.data;
    const [dataMOFA, setDataMOFA] = useState(savedDataMOFA);

    const savedScatterMode = useResults().MOFA.displayOpts.scatterMode;
    const [scatterMode, setScatterMode] = useState(savedScatterMode);

    const savedSelectedPlot = useResults().MOFA.displayOpts.selectedPlot
    const [selectedPlot, setSelectedPlot] = useState(savedSelectedPlot);

    const savedSelectedCell = useResults().MOFA.displayOpts.selectedCell;
    const [selectedCell, setSelectedCell] = useState(savedSelectedCell);

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
        const myTimeOut = setTimeout(fetchData, 100);
        return () => clearTimeout(myTimeOut);
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
    Initialize selectedPlot columns and index
    */
    if (factorNames != null && rowNames != null && selectedPlot == null) {
        setSelectedPlot({ mdataCol: rowNames[0], Factor: factorNames[0] });
        setSelectedCell({ rowIndex: 0, colIndex: 0 });
    }

    useEffect(() => {
        if (factorNames != null && rowNames != null && selectedPlot2D == null) {
            const mySelectedPlot2d = {
                x: factorNames[0],
                y: factorNames.length > 1 ? factorNames[1] : factorNames[0],
                g: 'No color'
            }
            setSelectedPlot2D(mySelectedPlot2d);
            dispatchResults({
                type: 'set-selected-plot-2d-mofa',
                mode: mySelectedPlot2d
            });
        }
    }, [factorNames, rowNames, selectedPlot2D, dispatchResults])

    /*
    Function to refresh heatmap
    */
    const [plotHM, setPlotHM] = useState(false);
    const plotHeatMap = useCallback(() => { console.log('Refresh'); setPlotHM(e => !e) }, [setPlotHM]);

    /*
    Refresh to plot heatmap at first render
    */
    useEffect(() => {
        const myTimeout = setTimeout(plotHeatMap, 1000);
        return () => clearTimeout(myTimeout);
    }, [setPlotHM, plotHeatMap]);
    /**/

    /*
    Save changes in cell selection
    */
    useEffect(() => {
        if (selectedPlot != null && selectedCell != null) {
            plotHeatMap();
            dispatchResults({
                type: 'set-selected-plot-cell-mofa',
                rowIndex: selectedCell.rowIndex,
                colIndex: selectedCell.colIndex,
                mdataCol: selectedPlot.mdataCol,
                Factor: selectedPlot.Factor
            });
        }
    }, [selectedPlot, selectedCell, dispatchResults, plotHeatMap]);
    /**/

    /*
    Function to update this component when changing nFeatRef
    */
    const { omics } = useJob();
    const nFeatRef = useRef(omics.reduce((o, e) => ({ ...o, [e]: { down: 0, up: 0 } }), {}));
    const thrLRef = useRef(omics.reduce((o, e) => ({ ...o, [e]: { down: 0, up: 0 } }), {}));

    /*
    Get arrays with sorted proteins and metabolites (loading and heatmap)
    */
    const fLVec = useMemo(
        () => getFLVec(dataMOFA, selectedPlot, omics),
        [dataMOFA, selectedPlot, omics]
    );
    /**/

    /*
    Explore Features
    */
    const [exploreF, setExploreF] = useState(false);
    const [EFLoading, setEFLoading] = useState(false);
    /**/

    return (
        <Box>
            <MySectionContainer height="80vh">
                {dataMOFA != null && selectedPlot != null && <>
                    <MySection>
                        <Box sx={{height:3}}><HelpSection /></Box>
                        <Box sx={{ p: 5 }}>
                            <TablePvalues
                                anova={dataMOFA.anova}
                                explained_variance={dataMOFA.explained_variance}
                                setSelectedPlot={setSelectedPlot}
                                selectedCell={selectedCell}
                                setSelectedCell={setSelectedCell}
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
                                setSelectedPlot={setSelectedPlot}
                                setSelectedCell={setSelectedCell}
                                selectedPlot2D={selectedPlot2D}
                                setSelectedPlot2D={setSelectedPlot2D}
                                rowNames={rowNames}
                                factorNames={factorNames}
                                projections={dataMOFA.projections}
                            />
                        </Box>
                    </MySection>
                    {scatterMode == '1D' && <>
                        <MySection sx={{ mt: 1 }}>
                            <Divider variant='h6' sx={{ textAlign: 'center' }}>
                                Feature Loading Analysis: {selectedPlot.Factor}
                            </Divider>
                            <LoadingPlotContainer
                                fLVec={fLVec}
                                nFeatRef={nFeatRef}
                                thrLRef={thrLRef}
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
                                plotHeatMap={plotHeatMap}
                            />
                        </MySection>
                        <MySection>
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button
                                    color='primary'
                                    variant='outlined'
                                    endIcon={<ArrowOutwardIcon />}
                                    onClick={() => {
                                        setEFLoading(true);
                                        setExploreF(true)
                                        /*setTimeout(() => {
                                            setEFLoading(false);
                                            setExploreF(true)
                                        }, 3000);*/
                                    }}
                                >
                                    Explore Features
                                </Button>
                            </Box>
                            <Backdrop
                                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                open={EFLoading}
                            >
                                <Box sx={{ textAlign: 'center' }}>
                                    <CircularProgress color="inherit" />
                                    <Box sx={{ pt: 2 }}><Typography>Loading features...</Typography></Box>
                                </Box>
                            </Backdrop>
                            {exploreF && <ExploreFeaturesContainer
                                exploreF={exploreF}
                                setExploreF={setExploreF}
                                Factor={selectedPlot.Factor}
                                mdataCol={selectedPlot.mdataCol}
                                thrLRef={thrLRef.current}
                                setEFLoading={setEFLoading}
                            />}
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
    if (dataMOFA == null) return [null, null];

    let factorNames = Object.keys(dataMOFA.anova);
    const _omics = Object.keys(dataMOFA.explained_variance);

    factorNames = factorNames.map(e => ({
        f: e,
        var: _omics.reduce(
            (prev, curr) => prev + dataMOFA.explained_variance[curr][e].Explained_Variance, 0
        )
    })).filter(e => e.var > 2).map(e => e.f)

    const colNames = factorNames.map((e, i) => i + 1);
    return [colNames, factorNames]
}

const getRowNames = (dataMOFA, factorNames) => {
    if (dataMOFA == null) return null;

    let rowNames = Object.keys(dataMOFA.anova[factorNames[0]]);

    // remove metadata columns without results in any factor
    rowNames = rowNames.map(i => {
        return [i, factorNames.map(j => {
            return Object.keys(dataMOFA.anova[j][i]).length == 0;
        }).every(e => e)];
    }).filter(e => !e[1]).map(e => e[0]);

    return rowNames;
}

const getFLVec = (dataMOFA, selectedPlot, omics) => {
    if (dataMOFA == null || selectedPlot == null) return null;

    let fLVec = omics.reduce((o, e) => ({ ...o, [e]: [] }), {}); //{ 'q': [], 'm': [] };
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