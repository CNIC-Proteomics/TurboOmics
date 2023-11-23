import { useJob } from '@/components/app/JobContext';
import { Box, Button, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { MyHeatMap, HeatMapIndex } from './MyHeatMap';
import HeatMapHeader from './HeatMapHeader';
import HeatMapLegend from './HeatMapLegend';
import { useImmer } from 'use-immer';

function HeatMapContainer({ nFeatRef, fLVec, mdataCol, plotHM }) {

    const [zLegend, updateZLegend] = useImmer({'q':{min:0, max:0}, 'm':{min:0, max:0}});
    useEffect(() => {
        updateZLegend({'q':{min:0, max:0}, 'm':{min:0, max:0}});
    }, [plotHM, updateZLegend]);

    const { xq, xm } = useJob().user;
    const myIndex = xq.index.filter(e => xm.index.includes(e));

    return (
        <Box>
            <HeatMapHeader nFeatRef={nFeatRef} />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '5%', display:'flex', justifyContent:'flex-end' }}>
                    <HeatMapIndex myIndex={myIndex} mdataCol={mdataCol} />
                </Box>
                {['q', 'm'].map(omic => (
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