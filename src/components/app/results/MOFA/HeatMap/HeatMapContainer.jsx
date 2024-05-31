import { useJob } from '@/components/app/JobContext';
import { Box, Button, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { MyHeatMap, HeatMapIndex } from './MyHeatMap';
import HeatMapHeader from './HeatMapHeader';
import HeatMapLegend from './HeatMapLegend';
import { useImmer } from 'use-immer';
import { useResults } from '@/components/app/ResultsContext';

function HeatMapContainer({ nFeatRef, fLVec, mdataCol, plotHM, plotHeatMap }) {

    const { omics } = useJob();

    // Show observation id in heatmap
    const showIndex = useJob().user.mdata.shape[0] <= 24;
    const mdataIdCol = useJob().user.mdata.columns[0];

    const savedZLegend = useResults().MOFA.displayOpts.zLegend;
    const [zLegend, updateZLegend] = useImmer(
        omics.reduce((o, e) => ({
            ...o, [e]: { min: savedZLegend[e].min, max: savedZLegend[e].max }
        }), {})
    );

    // Get common indexes
    const xi = useJob().norm;

    const myIndex = useMemo(() => {
        let myIndex = omics.map(omic => xi[`x${omic}`].index);
        myIndex = myIndex.reduce((a, b) => a.filter(c => b.includes(c)));
        return myIndex;
    }, [omics, xi]);

    const myFeat = useMemo(() => {
        console.log(plotHM);
        const myFeat = {};
        console.log(fLVec)
        omics.map(omic => {
            myFeat[omic] = {
                down: fLVec[omic].filter(
                    (e, i) => i < nFeatRef.current[omic].down
                ).map(e => e[0]),
                up: fLVec[omic].filter(
                    (e, i) => i >= (fLVec[omic].length - nFeatRef.current[omic].up)
                ).map(e => e[0])
            }
        });
        return myFeat
    }, [omics, nFeatRef, fLVec, plotHM]);



    return (
        <Box>
            <HeatMapHeader nFeatRef={nFeatRef} />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '5%', display: 'flex', justifyContent: 'flex-end' }}>
                    <HeatMapIndex 
                    myIndex={myIndex} 
                    mdataCol={mdataCol}  
                    showBorder={true}
                    showLevel={true}
                    />
                </Box>
                {omics.map(omic => (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }} key={omic}>
                        {nFeatRef.current[omic].down > 0 &&
                            <MyHeatMap
                                omic={omic}
                                myIndex={myIndex}
                                myFeat={myFeat[omic].down}
                                mdataCol={mdataCol}
                                zLegend={zLegend[omic]}
                            />
                        }
                        {nFeatRef.current[omic].up > 0 &&
                            <MyHeatMap
                                omic={omic}
                                myIndex={myIndex}
                                myFeat={myFeat[omic].up}
                                mdataCol={mdataCol}
                                zLegend={zLegend[omic]}
                            />
                        }
                    </Box>
                ))}
                <Box sx={{ width: '5%', display: 'flex', justifyContent: 'flex-start' }}>
                    {showIndex && 
                    <HeatMapIndex 
                    myIndex={myIndex} 
                    mdataCol={mdataCol} 
                    showBorder={false} 
                    showLevel={false}
                    />}
                </Box>
            </Box>
            <HeatMapLegend
                nFeatRef={nFeatRef}
                zLegend={zLegend}
                updateZLegend={updateZLegend}
                plotHeatMap={plotHeatMap}
            />
        </Box>
    )
}

export default HeatMapContainer