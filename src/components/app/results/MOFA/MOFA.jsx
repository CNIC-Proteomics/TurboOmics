import { Box, Grid } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatchResults, useResults } from '../../ResultsContext';
import { useVars } from '@/components/VarsContext';
import { useJob } from '../../JobContext';
import TablePvalues from './TablePvalues';
import ScatterPlotContainer from './ScatterPlot/ScatterPlotContainer';

function MOFA() {

    const dispatchResults = useDispatchResults();
    const { API_URL } = useVars();
    const { jobID } = useJob();

    const savedDataMOFA = useResults().MOFA.data;
    const [dataMOFA, setDataMOFA] = useState(savedDataMOFA);

    const savedScatterMode = useResults().MOFA.displayOpts.scatterMode;
    const [scatterMode, setScatterMode] = useState(savedScatterMode);

    const savedSelectedPlot = useResults().MOFA.selectedPlot;
    const [selectedPlot, setSelectedPlot] = useState(savedSelectedPlot);

    const savedSelectedPlot2D = useResults().MOFA.displayOpts.selectedPlot2D;
    const [selectedPlot2D, setSelectedPlot2D] = useState(savedSelectedPlot2D);

    /*
    Fetch MOFA data
    */

    const fetchData = async () => {
        console.log('Fetching MOFA data');
        if (savedDataMOFA == null) {
            const res = await fetch(`${API_URL}/get_mofa/${jobID}`);
            const resJson = await res.json(); // {dataMofa, resStatus}
            setDataMOFA(resJson.dataMOFA);
            dispatchResults({ type: 'set-mofa-data', data: resJson.dataMOFA });
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    /**/


    /* 
    Get arrays for pvalue table
    */
    const [colNames, factorNames] = useMemo(() => getFactorNames(dataMOFA), [dataMOFA]);
    const rowNames = useMemo(() => getRowNames(dataMOFA, factorNames), [dataMOFA, factorNames]);
    /**/

    return (
        <Box sx={{ pt: 4, border: '0px solid red' }}>
            {dataMOFA != null &&
                <Box>
                    <Box sx={{px:2}}>
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
                    <Box sx={{mt:2}}>
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
                </Box>
            }
        </Box>
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

export default MOFA