import { useEffect, useMemo, useRef, useState } from "react";

import { useJob } from "../../../JobContext";
import { getHistogramValues, calculateQuantile, calculateXTicks } from "@/components/app/results/EDA/DataDistribution/utils";
import { Box, Button, IconButton } from "@mui/material";
import MyHistogram from "./MyHistogram";

import MyBoxPlotPlotly from "./MyBoxPlotPlotly";
import { myPalette } from '@/utils/myPalette';
import { danfo2RowColJson } from "@/utils/jobDanfoJsonConverter";
import MyMotion from '@/components/MyMotion';

export default function PlotData({
    omic,
    fileType,
    filteredID,
    groupby,
    showNorm,
    figRef
}) {

    // Get data matrices
    const mdata = useJob().user.mdata;
    const xi = useJob().norm[fileType];

    const xiJson = useMemo(() => {

        // Extract a sample from filteredID
        const step = Math.floor(Math.max(1, filteredID.length / 10000));
        const postFilteredID = [];
        for (let i = 0; i < filteredID.length; i += step)
            postFilteredID.push(filteredID[i]);

        // Filter xi from the sample
        const xiTJsonFilt = [];
        const xiTJson = danfo2RowColJson(xi.T);
        for (let i = 0; i < postFilteredID.length; i++)
            xiTJsonFilt.push(xiTJson[postFilteredID[i]]);

        const xiTFilt = new dfd.DataFrame(xiTJsonFilt);
        xiTFilt.setIndex({ index: postFilteredID, inplace: true })
        let xiJson = danfo2RowColJson(xiTFilt.T);

        return xiJson
    }, [xi, filteredID]);

    const { myData, gValues, idx2g } = useMemo(() => {
        // From index to group
        const idx2g = {}
        for (let i = 0; i < mdata.shape[0]; i++) {
            // La columna seleccionada es distinta de All values
            if (mdata.columns.includes(groupby)) {
                // Ese indice tiene valor para esa columna
                if (mdata.column(groupby).values[i] != null) {
                    idx2g[mdata.index[i]] = mdata.column(groupby).values[i];
                }
            } else {
                idx2g[mdata.index[i]] = 'All values';
            }
        }

        // Get unique values of groupby column
        const gValues = Object.keys(idx2g).map(e => idx2g[e]).filter(
            (value, index, array) => array.indexOf(value) === index
        );

        // Create object with data used for plotting
        let myData = {};
        gValues.map(e => myData[e] = []);

        Object.keys(xiJson).map(
            idx => {
                if (Object.keys(idx2g).includes(idx)) {
                    Object.keys(xiJson[idx]).map(
                        feature => myData[idx2g[idx]].push(xiJson[idx][feature])
                    )
                }
            }
        )

        return { myData, gValues, idx2g };
    }, [groupby, mdata, xiJson]);

    // Get maximum and minimum 
    const { xrange, xTicks, minimum, maximum } = useMemo(e => {
        const values = Object.keys(myData).map(g => myData[g]).flat();
        const minimum = calculateQuantile(values, 0.0001);
        const maximum = calculateQuantile(values, 0.9999);
        const xrange = [
            minimum - Math.abs(0.05 * minimum),
            maximum + Math.abs(0.05 * maximum)
        ];
        const xTicks = calculateXTicks(minimum, maximum, 6);
        return { xrange, xTicks, minimum, maximum };

    }, [myData]);

    // Get data used used for histogram
    const { dataHist, yrange } = useMemo(() => {
        let dataHist = {};
        Object.keys(myData).map(
            g => {
                dataHist[g] = myData[g].filter(x => minimum <= x && x <= maximum)

                const step = Math.max(1, Math.floor(dataHist[g].length / 50_000));
                const sample = []
                for (let i = 0; i < dataHist[g].length; i += step)
                    sample.push(dataHist[g][i])
                sample.push(dataHist[g].slice(-1));
                dataHist[g] = sample;
            }
        );

        Object.keys(dataHist).map(
            g => {
                try {
                    if (dataHist[g].length > 0) {
                        dataHist[g] = getHistogramValues(
                            dataHist[g],
                            // Sturges rule to get numBins
                            1 + Math.ceil(Math.log2(dataHist[g].length))
                        );
                    } else {
                        delete dataHist[g];
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        );

        // Generate Object for each data value
        dataHist = Object.keys(dataHist).map(
            g => (
                dataHist[g].map(
                    ({ binCenter, density }) => (
                        {
                            binCenter: Math.round(binCenter * 100) / 100,
                            [g]: Number.parseFloat(density).toExponential(3), //Math.round(density * 10000) / 10000 
                            d: density
                        }
                    )
                )
            )
        )

        dataHist = dataHist.flat();
        dataHist.sort((a, b) => a.binCenter - b.binCenter);

        let yMaxHist = 0;
        const allDensities = dataHist.map(e => e.d);
        for (let i=0; i<allDensities.length; i++) {
            yMaxHist = allDensities[i] > yMaxHist ? allDensities[i] : yMaxHist;
        }

        const yrange = [0, Number.parseFloat((1.05 * yMaxHist).toPrecision(2))]

        return { dataHist, yrange };
    }, [myData, minimum, maximum]);

    // Generate data used for BoxPlot
    const dataBox = useMemo(() => {
        let dataBox = {};
        dataBox = Object.keys(myData).map(
            (g, i) => {
                if (myData[g].length > 0) {
                    return ({
                        x: myData[g],
                        type: 'box',
                        name: `${g}`,
                        marker: { color: myPalette[i % myPalette.length] }
                    })
                } else {
                    return null;
                }
            }
        );
        dataBox = dataBox.filter(e => e != null);

        return dataBox;

    }, [myData])



    return (
        <>
            <Box sx={{ height: 210 }}>
                <MyHistogram
                    dataHist={dataHist}
                    gValues={gValues}
                    xrange={xrange}
                    xTicks={xTicks}
                    yrange={yrange}
                    figRef={figRef}
                    omic={omic}
                />
            </Box>
            <Box sx={{ height: 280, width: 500, margin: 'auto', overflowX: 'hidden', overflowY: 'hidden' }}>
                <MyMotion>
                    <MyBoxPlotPlotly
                        data={dataBox}
                        xrange={xrange}
                        xTicks={xTicks}
                        figRef={figRef}
                        omic={omic}
                    />
                </MyMotion>
            </Box>
        </>
    );
}
