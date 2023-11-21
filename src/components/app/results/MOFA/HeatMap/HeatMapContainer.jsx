import { useJob } from '@/components/app/JobContext';
import { Box, Button } from '@mui/material'
import React, { useState } from 'react'
import MyHeatMap from './MyHeatMap';

function HeatMapContainer({ nFeatRef, fLVec, mdataCol }) {

    const [plot, setPlot] = useState(false);
    console.log(nFeatRef.current.q);

    const { xq, xm } = useJob().user

    const myIndex = xq.index.filter(e => xm.index.includes(e));
    console.log(myIndex);

    return (
        <Box>
            <Box sx={{ textAlign: 'center' }}>
                <Button onClick={() => setPlot(prevState => !prevState)}>Plot</Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent:'center' }}>
                <MyHeatMap
                    omic='q'
                    myIndex={myIndex}
                    myFeat={[]}
                    mdataCol={mdataCol}
                    showYAxis={true}
                />
                {['q', 'm'].map(omic => (
                    <>
                        <MyHeatMap
                            omic={omic}
                            myIndex={myIndex}
                            myFeat={fLVec[omic].filter((e, i) => i < [nFeatRef.current[omic].down]).map(e => e[0])}
                            mdataCol={mdataCol}
                            showYAxis={false}
                        />
                        <MyHeatMap
                            omic={omic}
                            myIndex={myIndex}
                            myFeat={fLVec[omic].filter((e, i) => i >= (fLVec[omic].length - [nFeatRef.current[omic].up])).map(e => e[0])}
                            mdataCol={mdataCol}
                            showYAxis={false}
                        />
                    </>
                ))}
            </Box>
        </Box>
    )
}

export default HeatMapContainer