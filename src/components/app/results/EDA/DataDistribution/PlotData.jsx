import * as React from "react";

import { useJob } from "../../../JobContext";
import { useResults } from "../../../ResultsContext";
import { getHistogramValues, calculateQuantile, calculateXTicks } from "@/components/app/results/EDA/DataDistribution/utils";
import { Box, CircularProgress } from "@mui/material";
import MyHistogram from "./MyHistogram";

import MyBoxPlotPlotly from "./MyBoxPlotPlotly";
import { myPalette } from '@/utils/myPalette';
import { danfo2RowColJson } from "@/utils/jobDanfoJsonConverter";
import MyMotion from '@/components/MyMotion';

export default function PlotData({ fileType, showPlot, filteredID }) {

    const { groupby, showNorm } = useResults().EDA.DD;

    const xi_all = {
        norm: useJob().norm[fileType],
        user: useJob().user[fileType]
    }

    const xi = showNorm ? xi_all.norm : xi_all.user;
    const mdata = useJob().user.mdata

    //console.log(xi)

    // From index to group
    const idx2g = {}
    for (let i = 0; i < mdata.shape[0]; i++) {
        idx2g[mdata.index[i]] = mdata.columns.includes(groupby) ? mdata.column(groupby).values[i] : 'All values';
    }
    //console.log(idx2g);

    // Get unique values of groupby column
    const gValues = Object.keys(idx2g).map(e => idx2g[e]).filter(
        (value, index, array) => array.indexOf(value) === index
    );
    //console.log(gValues);

    // Create object with data used for plotting
    let myData = {};
    let dataHist = {};
    let dataBox = {};
    gValues.map(
        e => {
            myData[e] = [];
        }
    );

    // Get values from xi dataframe and add to data divided by groups
    //let xiJson = dfd.toJSON(xi);
    let xiJson = danfo2RowColJson(xi);
    Object.keys(xiJson).map(
        idx => {
            if (Object.keys(idx2g).includes(idx)) {
                Object.keys(xiJson[idx]).map(
                    feature => {
                        xiJson[idx][feature] != null && filteredID.includes(feature) && myData[idx2g[idx]].push(xiJson[idx][feature]);
                    }
                )
            }
        })

    // Get maximum and minimum 
    const values = Object.keys(myData).map(g => myData[g]).flat();
    const minimum = calculateQuantile(values, 0.0001);
    const maximum = calculateQuantile(values, 0.9999);
    const range = [
        minimum - Math.abs(0.05 * minimum),
        maximum + Math.abs(0.05 * maximum)
    ];
    //console.log(range)

    const xTicks = calculateXTicks(minimum, maximum, 6);
    //console.log(xTicks)

    // Remove extreme values for representation
    Object.keys(myData).map(
        g => {
            dataHist[g] = myData[g].filter(x => minimum <= x && x <= maximum)
        }
    )

    // Get histogram arrays from raw data
    Object.keys(dataHist).map(
        g => {
            try {
                if (dataHist[g].length > 0) {
                    dataHist[g] = getHistogramValues(
                        dataHist[g],
                        1 + Math.ceil(Math.log2(dataHist[g].length)) // Sturges rule to get numBins
                    );
                } else {
                    delete dataHist[g];
                }
            } catch (error) {
                console.error(error);
            }
        }
    )

    // Generate Object for each data value
    dataHist = Object.keys(dataHist).map(
        g => (
            dataHist[g].map(
                ({ binCenter, density }) => (
                    { binCenter: Math.round(binCenter * 100) / 100, [g]: density }
                )
            )
        )
    )

    dataHist = dataHist.flat();
    dataHist.sort((a, b) => a.binCenter - b.binCenter);
    //console.log(dataHist)


    // Generate data used for BoxPlot
    dataBox = Object.keys(myData).map(
        (g, i) => {
            if (myData[g].length > 0) {
                return ({
                    x: myData[g],//.map(x => ({ group: g, value: x }))
                    type: 'box',
                    name: `${g}`,
                    marker: { color: myPalette[i] }
                }) //myData[g].map(x => ({ group: g, value: x }));
            } else {
                return null;//[];
            }
        }
    ); //.flat();
    dataBox = dataBox.filter(e => e != null);
    //console.log(dataBox);

    return (
        <>
            <Box sx={{ height: '25vh' }}>
                { showPlot ?
                    <MyHistogram dataHist={dataHist} gValues={gValues} range={range} xTicks={xTicks} />
                    :
                    <Box sx={{textAlign:'center', pt:10}}><CircularProgress size={100} thickness={2} /></Box>
                }
            </Box>
            <Box sx={{ height: '37vh', width: 500, margin: 'auto', overflowX: 'hidden', overflowY: 'visible' }}>
                { showPlot ?
                    <MyMotion><MyBoxPlotPlotly data={dataBox} range={range} xTicks={xTicks} /></MyMotion>
                    :
                    <Box sx={{textAlign:'center', pt:15 }}><CircularProgress size={100} thickness={2}  /></Box>
                }
            </Box>
        </>
    );
}
