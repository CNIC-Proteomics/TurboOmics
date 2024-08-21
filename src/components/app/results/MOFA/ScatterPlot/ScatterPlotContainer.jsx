import { Box, Grid, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { SelectorFactor2D, SelectorFactor } from './SelectorFactor'
import ScatterModeSelector from './ScatterModeSelector'
import { useJob } from '@/components/app/JobContext'
import { MyScatter, MyScatter2D } from './MyScatter'
import HelpSection from './HelpSection'

function ScatterPlotContainer({
    scatterMode,
    setScatterMode,
    selectedPlot,
    setSelectedPlot,
    setSelectedCell,
    selectedPlot2D,
    setSelectedPlot2D,
    factorNames,
    rowNames,
    projections
}) {

    const { mdata } = useJob().user;
    const { mdataType } = useJob();

    const scatterData = useMemo(
        () => getScatterData(
            projections,
            scatterMode,
            selectedPlot,
            selectedPlot2D,
            mdata,
            mdataType
        ),
        [projections, scatterMode, selectedPlot, selectedPlot2D, mdata, mdataType]
    );

    return (
        <Box sx={{}} >
            <Box sx={{height:0}}><HelpSection /></Box>
            <Box sx={{ pt: 2 }} >
                <ScatterModeSelector
                    scatterMode={scatterMode}
                    setScatterMode={setScatterMode}
                    disable2D={Object.keys(Object.values(projections)[0]).length < 2}
                />

                <Box sx={{ px: 3, pb: 2, textAlign: 'center', width:600, margin: 'auto' }}>
                    {scatterMode == '1D' ?
                        <SelectorFactor
                            factorNames={factorNames}
                            rowNames={rowNames}
                            selectedPlot={selectedPlot}
                            setSelectedPlot={setSelectedPlot}
                            setSelectedCell={setSelectedCell}
                        />
                        :
                        <SelectorFactor2D
                            factorNames={factorNames}
                            rowNames={rowNames}
                            selectedPlot2D={selectedPlot2D}
                            setSelectedPlot2D={setSelectedPlot2D}
                        />
                    }
                </Box>
            </Box>

            <Box sx={{pb:2}}>
                {scatterData &&
                    <Box sx={{ width: 750, margin: 'auto' }}>
                        {scatterMode == '1D' ?
                            <MyScatter
                                scatterData={scatterData}
                                mdataCol={selectedPlot.mdataCol}
                                Factor={selectedPlot.Factor}
                            /> :
                            <MyScatter2D
                                scatterData={scatterData}
                                selectedPlot2D={selectedPlot2D}
                            />
                        }

                    </Box>
                }
            </Box>

        </Box>
    )
}

/*
Functions
*/

const getScatterData = (
    projections,
    scatterMode,
    selectedPlot,
    selectedPlot2D,
    mdata,
    mdataType
) => {
    let scatterData = null;

    if (selectedPlot && scatterMode == '1D') {
        scatterData = [];

        let mdataColSerie = mdata.column(selectedPlot.mdataCol);
        let mdataColJson = {};
        mdataColSerie.index.map((index, i) => { mdataColJson[index] = mdataColSerie.values[i] });

        Object.keys(projections).map(element => {
            scatterData.push({
                element,
                mdataValue: mdataColJson[element],
                projection: projections[element][selectedPlot.Factor],
            })
        });

        if (mdataType[selectedPlot.mdataCol].type == 'categorical') {
            scatterData.sort(
                (a, b) => mdataType[selectedPlot.mdataCol].levels.indexOf(a.mdataValue) -
                    mdataType[selectedPlot.mdataCol].levels.indexOf(b.mdataValue)
            );
        }

    } else if (scatterMode == '2D') {
        scatterData = {};
        if (Object.keys(mdataType).includes(selectedPlot2D.g)) {
            mdataType[selectedPlot2D.g].levels.map(lv => {
                scatterData[lv] = [
                    ...mdataType[selectedPlot2D.g].level2id[lv].map(element => {
                        if (Object.keys(projections).includes(element)) {
                            return {
                                element,
                                x: projections[element][selectedPlot2D.x],
                                y: projections[element][selectedPlot2D.y]
                            }
                        } else {
                            return null
                        }
                    }).filter(e => e != null)
                ]
            })
        } else {
            scatterData[selectedPlot2D.g] = Object.keys(projections).map(element => ({
                element,
                x: projections[element][selectedPlot2D.x],
                y: projections[element][selectedPlot2D.y]
            }))
        }

    }

    return scatterData

}

/*
Export
*/

export default ScatterPlotContainer