import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useVars } from '@/components/VarsContext';


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

export default function TablePvalues({ omic, data, rowNames, colNames, expVar, setSelectedPlot, scatterMode }) {

    const { OMIC2NAME } = useVars()

    const savedSelectedCell = useResults().EDA.PCA[omic].displayOpts.selectedCell;
    const [selectedCell, setSelectedCell] = useState(savedSelectedCell);

    const dispatchResults = useDispatchResults();
    const classes = useStyles(scatterMode);

    const handleCellClick = (rowIndex, colIndex) => {
        if (scatterMode == '2D') return
        setSelectedCell({ rowIndex, colIndex });
        setSelectedPlot({ mdataCol: rowNames[rowIndex], PCA: colNames[colIndex] });
        dispatchResults({
            omic: omic,
            type: 'set-selected-plot-cell',
            rowIndex: rowIndex,
            colIndex: colIndex,
            mdataCol: rowNames[rowIndex],
            PCA: colNames[colIndex]
        });

        console.log(`Plot scatter: PCA ${colNames[colIndex]} vs ${rowNames[rowIndex]}`)
    };

    const csvData = useMemo(() => {
        let csvData = [];

        csvData.push(['PCA / Cond.', ...colNames]);
        csvData.push(['%Variance', ...expVar]);

        const outData = data.map((e, i) => [rowNames[i], ...e])
        csvData = [...csvData, ...outData];

        return csvData;
    }, [colNames, expVar, data, rowNames])

    return (
        <>
            <Box sx={{ height: 0, width: 50, zIndex: 5000, display: 'flex', paddingLeft: 0.5 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    sx={{ opacity: 0.5, position: 'relative', top: -21 }}
                >
                    <CSVLink
                        data={csvData}
                        filename={`PCA_Anova_pvalues/${OMIC2NAME[omic]}.csv`}
                        separator={separator}
                    >
                        <GridOnIcon />
                    </CSVLink>
                </IconButton>
            </Box>
            <Grid container>
                <Grid item xs={2}>
                    <TableContainer sx={{ margin: 'auto' }}>
                        <Table>
                            <TableHead><TableRow><TableCell sx={{ padding: 0, textAlign: 'center' }}>PCA / Cond.</TableCell></TableRow></TableHead>
                            <TableBody>
                                <TableRow key='expVar'>
                                    <TableCell sx={{ padding: 0, border: 0 }}>
                                        <Box
                                            sx={{ ...firstColStyles, borderBottom: `1px solid rgba(10,10,10,1)` }}
                                        >%Variance
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                {rowNames.map((rowName, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        <TableCell sx={{ padding: 0, border: 0 }}>
                                            <Box
                                                sx={firstColStyles}
                                            >p-value [ <strong>{rowName}</strong> ]
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
                                    {data[0].map((_, index) => (
                                        <TableCell
                                            key={index}
                                            sx={{ padding: 0, textAlign: 'center', width: 50, userSelect: 'none', }}
                                        >
                                            {index + 1}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow key='expVar'>
                                    {expVar.map((e, index) => (
                                        <TableCell key={index} sx={{ padding: 0, border: 0 }}>
                                            <Box
                                                sx={{
                                                    padding: 0.5,
                                                    border: `1px solid ${myGridColor}`,
                                                    borderBottom: `1px solid rgba(10,10,10,1)`,
                                                    fontSize: myFontSize,
                                                    textAlign: 'center',
                                                    backgroundColor: calculateBackgroundColorExpVar(e),
                                                    userSelect: 'none',
                                                }}>
                                                {e}
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                {data.map((row, rowIndex) => (
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
                                                    {value<0.001 ? value.toExponential(3) : value.toFixed(3)}
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