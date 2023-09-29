import { useEffect, useMemo, useState } from "react";

import { useJob } from "../../../JobContext";
import { useResults } from "../../../ResultsContext";
import { getHistogramValues, calculateQuantile, calculateXTicks } from "@/components/app/results/EDA/DataDistribution/utils";
import { Box, CircularProgress, Typography } from "@mui/material";
import MyHistogram from "./MyHistogram";

import MyBoxPlotPlotly from "./MyBoxPlotPlotly";
import { myPalette } from '@/utils/myPalette';
import { danfo2RowColJson } from "@/utils/jobDanfoJsonConverter";
import MyMotion from '@/components/MyMotion';
import { useVars } from "@/components/VarsContext";

export default function PlotData({ omic, fileType, showPlot, filteredID, groupby, showNorm, pvalue, setPvalue }) {

    //const [pvalue, setPvalue] = useState(null);
    //const { showNorm } = useResults().EDA.DD;

    const { API_URL } = useVars();
    const { jobID } = useJob();
    const mdata = useJob().user.mdata

    const xi_all = {
        norm: useJob().norm[fileType],
        user: useJob().user[fileType]
    }
    const xi = showNorm ? xi_all.norm : xi_all.user;

    //console.log(xi)
    const { myData, dataAnova, gValues, idx2g } = useMemo(() => {
        // From index to group
        const idx2g = {}
        for (let i = 0; i < mdata.shape[0]; i++) {
            if (mdata.columns.includes(groupby)) { // La columna seleccionada es distinta de All values
                if (mdata.column(groupby).values[i] != null){ // Ese indice tiene valor para esa columna
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
        let dataAnova = [];
        let myData = {};
        gValues.map(e => myData[e] = []);

        // Get values from xi dataframe and add to data divided by groups
        let xiJson = danfo2RowColJson(xi);
        Object.keys(xiJson).map(
            idx => {
                if (Object.keys(idx2g).includes(idx)) {
                    Object.keys(xiJson[idx]).map(
                        feature => {
                            if (
                                xiJson[idx][feature] != null &&
                                filteredID.includes(feature)
                            ) {
                                myData[idx2g[idx]].push(xiJson[idx][feature]);
                                dataAnova.push({ ID: idx, feature: feature, g: idx2g[idx], x: xiJson[idx][feature] });
                            }
                        }
                    )
                }
            })
        return { myData, dataAnova, gValues, idx2g };
    }, [groupby, mdata, xi, filteredID])

    // Get maximum and minimum 
    const { range, xTicks, minimum, maximum } = useMemo(e => {
        const values = Object.keys(myData).map(g => myData[g]).flat();
        const minimum = calculateQuantile(values, 0.0001);
        const maximum = calculateQuantile(values, 0.9999);
        const range = [
            minimum - Math.abs(0.05 * minimum),
            maximum + Math.abs(0.05 * maximum)
        ];
        const xTicks = calculateXTicks(minimum, maximum, 6);

        return { range, xTicks, minimum, maximum };

    }, [myData]);

    // Get data used used for histogram
    const dataHist = useMemo(() => {
        let dataHist = {};
        Object.keys(myData).map(
            g => {
                dataHist[g] = myData[g].filter(x => minimum <= x && x <= maximum)
            }
        )

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

        return dataHist;

    }, [myData, minimum, maximum])


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
                        marker: { color: myPalette[i] }
                    })
                } else {
                    return null;
                }
            }
        );
        dataBox = dataBox.filter(e => e != null);

        return dataBox;

    }, [myData])

    // Obtain ANOVA pvalue // Disabled... useless
    /*useEffect(() => {
        console.log('useEffect: Calculating ANOVA');
        const myTimeout = setTimeout(() => {
            fetch(`${API_URL}/get_anova`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dataAnova: dataAnova, jobID: jobID })
            })
                .then(res => res.json())
                .then(data => setPvalue(prevState => ({ ...prevState, [omic]: data.pvalue })));
            console.log('Anova was calculated');
        }, 2000)

        return () => clearTimeout(myTimeout);

    }, [dataAnova, API_URL, jobID, setPvalue, omic])*/

    return (
        <>
            {false && <Box sx={{ height: '2vh', margin: 'auto', width: 380 }}>
                {showPlot && pvalue != null &&
                    <MyMotion><Typography variant='body2' sx={{ color: '#555555' }}>ANOVA pvalue: {pvalue}</Typography></MyMotion>
                }
            </Box>}
            <Box sx={{ height: '22vh' }}>
                {true ?
                    <MyHistogram dataHist={dataHist} gValues={gValues} range={range} xTicks={xTicks} />
                    :
                    <Box sx={{ textAlign: 'center', pt: 10 }}><CircularProgress size={100} thickness={2} /></Box>
                }
            </Box>
            <Box sx={{ height: '30vh', width: 500, margin: 'auto', overflowX: 'hidden', overflowY: 'visible' }}>
                {true ?
                    <MyMotion><MyBoxPlotPlotly data={dataBox} range={range} xTicks={xTicks} /></MyMotion>
                    :
                    <Box sx={{ textAlign: 'center', pt: 15 }}><CircularProgress size={100} thickness={2} /></Box>
                }
            </Box>
        </>
    );
}
