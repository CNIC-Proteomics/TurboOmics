import React, { useMemo, useRef, useState } from 'react';
import {
    Box,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
//import DownloadIcon from '@mui/icons-material/Download';
import GridOnIcon from '@mui/icons-material/GridOn';
import { CSVLink } from 'react-csv';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';


const separator = ",";
const myFontSize = 15;
const myGridColor = 'rgba(200,200,200,0.5)'

const useStyles = (scatterMode) => ({
    cell: {
        transition: 'background-color 0.3s, border-color 0.3s',
        border: `1px solid ${myGridColor}`,
        cursor: scatterMode == '1D' ? 'pointer' : '',
        //width: 10,
        padding: 0.5,
        fontSize: myFontSize,
        textAlign: 'center',
        userSelect: 'none',
        '&:hover': {
            border: scatterMode == '1D' ? '1px solid rgba(50,50,50,1)' : `1px solid ${myGridColor}`,
        },
    },
    selectedCell: {
        border: scatterMode == '1D' ? '1px solid rgba(50,50,50,1)' : `1px solid ${myGridColor}`,
        '&:hover': {
            border: scatterMode == '1D' ? '1px solid rgba(50,50,50,1)' : `1px solid ${myGridColor}`,
        },
    },
})

const firstColStyles = {
    textAlign: 'center',
    padding: 0.5,
    border: `1px solid ${myGridColor}`,
    borderRight: `1px solid rgba(10,10,10,1)`,
    fontSize: myFontSize, whiteSpace: 'nowrap',
    userSelect: 'none',
};

const calculateBackgroundColor = (value) => {
    let red = value * 10 * 255;
    let green = 200 + value * 550;
    let blue = value * 10 * 255;
    return { backgroundColor: value < 0.1 ? `rgba(${red},${green},${blue}, 0.5)` : `rgba(255,255,255,0.5)` };
};

const calculateBackgroundColorExpVar = (value) => {
    let red = 255;
    let green = 255 - 255 * value / 100;
    let blue = 255 - 255 * value / 100;
    return { backgroundColor: `rgba(${red},${green},${blue}, 0.8)` };
};

export default function TablePvalues({
    anova,
    explained_variance,
    setSelectedPlot,
    scatterMode,
    factorNames,
    colNames,
    rowNames
}) {

    const dispatchResults = useDispatchResults();
    const classes = useStyles(scatterMode);

    const savedSelectedCell = useResults().MOFA.displayOpts.selectedCell;
    const [selectedCell, setSelectedCell] = useState(savedSelectedCell);

    // get pvalues
    const pvalues = useMemo(() => {
        return rowNames.map(i => factorNames.map(j => anova[j][i].pvalue));
    }, [anova, rowNames, factorNames]);

    // get qExpVar and mExpVar
    const [qExpVar, mExpVar] = useMemo(() => {
        return [
            factorNames.map(e => explained_variance['q'][e]['Explained_Variance']),
            factorNames.map(e => explained_variance['m'][e]['Explained_Variance'])
        ];
    }, [explained_variance, factorNames]);

    const handleCellClick = (rowIndex, colIndex) => {
        if (scatterMode == '2D') return
        setSelectedCell({ rowIndex, colIndex });
        setSelectedPlot({ mdataCol: rowNames[rowIndex], Factor: factorNames[colIndex] });
        dispatchResults({
            type: 'set-selected-plot-cell-mofa',
            rowIndex: rowIndex,
            colIndex: colIndex,
            mdataCol: rowNames[rowIndex],
            Factor: factorNames[colIndex]
        })

        console.log(`Plot scatter: MOFA ${factorNames[colIndex]} vs ${rowNames[rowIndex]}`)
    };

    const csvData = useMemo(() => {
        let csvData = [];

        csvData.push(['Factor / Cond.', ...colNames]);
        csvData.push(['%Var (P)', ...qExpVar]);
        csvData.push(['%Var (M)', ...mExpVar]);

        const outData = pvalues.map((e, i) => [rowNames[i], ...e])
        csvData = [...csvData, ...outData];

        return csvData;
    }, [colNames, qExpVar, mExpVar, pvalues, rowNames])

    return (
        <>
            <Box sx={{ height: 0, width: 50, zIndex: 5000, display: 'flex', paddingLeft: 0.5 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    sx={{ opacity: 0.5, position: 'relative', top: -21 }}
                >
                    <CSVLink data={csvData} filename={"MOFA_Anova_pvalues.csv"} separator={separator}>
                        <GridOnIcon />
                    </CSVLink>
                </IconButton>
            </Box>
            <Grid container>
                <Grid item xs={2}>
                    <TableContainer sx={{ margin: 'auto' }}>
                        <Table>
                            <TableHead><TableRow><TableCell sx={{ padding: 0, textAlign: 'center' }}>Factor / Cond.</TableCell></TableRow></TableHead>
                            <TableBody>
                                {['P', 'M'].map(e => (
                                    <TableRow key={e}>
                                        <TableCell sx={{ padding: 0, border: 0 }}>
                                            <Box
                                                sx={{ ...firstColStyles, borderBottom: e == 'M' && `1px solid rgba(10,10,10,1)` }}
                                            >%Var ({e})
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {rowNames.map((rowName, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        <TableCell sx={{ padding: 0, border: 0 }}>
                                            <Box
                                                sx={firstColStyles}
                                            >{rowName}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={10}>
                    <TableContainer sx={{ margin: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {colNames.map((e, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{ padding: 0, textAlign: 'center', width: 50, userSelect: 'none', }}
                                        >
                                            {e}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[qExpVar, mExpVar].map((expVar, i) => (
                                    <TableRow key={i}>
                                        {expVar.map((e, index) => (
                                            <TableCell key={index} sx={{ padding: 0, border: 0 }}>
                                                <Box
                                                    sx={{
                                                        padding: 0.5,
                                                        border: `1px solid ${myGridColor}`,
                                                        borderBottom: i == 1 && `1px solid rgba(10,10,10,1)`,
                                                        fontSize: myFontSize,
                                                        textAlign: 'center',
                                                        backgroundColor: calculateBackgroundColorExpVar(e),
                                                        userSelect: 'none',
                                                    }}>
                                                    {e.toFixed(2)}
                                                </Box>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {pvalues.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {row.map((value, colIndex) => (
                                            <TableCell
                                                key={colIndex}
                                                sx={{ padding: 0, border: 0 }}
                                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                            >
                                                <Box sx={
                                                    selectedCell &&
                                                        selectedCell.rowIndex === rowIndex &&
                                                        selectedCell.colIndex === colIndex ?
                                                        { ...classes.cell, ...classes.selectedCell, ...calculateBackgroundColor(value) } :
                                                        { ...classes.cell, ...calculateBackgroundColor(value) }
                                                }
                                                >
                                                    {value.toFixed(3)}
                                                </Box>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </>
    );
}