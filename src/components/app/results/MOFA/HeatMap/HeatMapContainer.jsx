import { useJob } from '@/components/app/JobContext';
import { Box, Button, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { MyHeatMap, HeatMapIndex } from './MyHeatMap';
import HeatMapHeader from './HeatMapHeader';
import HeatMapLegend from './HeatMapLegend';
import { useImmer } from 'use-immer';

function HeatMapContainer({ nFeatRef, fLVec, mdataCol, plotHM }) {

    const { omics } = useJob();
    const [zLegend, updateZLegend] = useImmer(
        omics.reduce((o, e) => ({ ...o, [e]: { min: 0, max: 0 } }), {})
        //{'q':{min:0, max:0}, 'm':{min:0, max:0}}
    );
    useEffect(() => {
        updateZLegend(
            omics.reduce((o, e) => ({ ...o, [e]: { min: 0, max: 0 } }), {})
            //{ 'q': { min: 0, max: 0 }, 'm': { min: 0, max: 0 } }
        );
    }, [plotHM, updateZLegend]);

    // Get common indexes
    const xi = useJob().norm;
    let myIndex = omics.map(omic => xi[`x${omic}`].index);
    myIndex = myIndex.reduce((a,b) => a.filter(c => b.includes(c)));

    return (
        <Box>
            <HeatMapHeader nFeatRef={nFeatRef} />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '5%', display: 'flex', justifyContent: 'flex-end' }}>
                    <HeatMapIndex myIndex={myIndex} mdataCol={mdataCol} />
                </Box>
                {omics.map(omic => (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }} key={omic}>
                        {nFeatRef.current[omic].down > 0 &&
                            <MyHeatMap
                                omic={omic}
                                myIndex={myIndex}
                                myFeat={fLVec[omic].filter(
                                    (e, i) => i < [nFeatRef.current[omic].down]
                                ).map(e => e[0])}
                                mdataCol={mdataCol}
                                updateZLegend={updateZLegend}
                                zLegend={zLegend[omic]}
                            />
                        }
                        {nFeatRef.current[omic].up > 0 &&
                            <MyHeatMap
                                omic={omic}
                                myIndex={myIndex}
                                myFeat={fLVec[omic].filter(
                                    (e, i) => i >= (fLVec[omic].length - [nFeatRef.current[omic].up])
                                ).map(e => e[0])}
                                mdataCol={mdataCol}
                                updateZLegend={updateZLegend}
                                zLegend={zLegend[omic]}
                            />
                        }
                    </Box>
                ))}
            </Box>
            <HeatMapLegend nFeatRef={nFeatRef} zLegend={zLegend} />
        </Box>
    )
}

export default HeatMapContainer