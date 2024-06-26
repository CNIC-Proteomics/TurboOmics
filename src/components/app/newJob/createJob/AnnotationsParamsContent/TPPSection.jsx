import { Box, TextField, Typography } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'


import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';

registerAllModules();

function TPPSection({ name, attr, annParams, setAnnParams }) {

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h6'>{name}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 2 }}>

                <Box sx={{ width: '30%' }}>
                    <Box>
                        <Typography variant='body'>Metabolite Retention Time Window</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            sx={{ width: 80 }}
                            id="filled-number"
                            label="Number"
                            type="number"
                            step={0.1}
                            InputProps={{ inputProps: { min: 0 } }}
                            value={annParams[`mRtW${attr}`]}
                            onChange={
                                (e) => setAnnParams(prev => ({
                                    ...prev, [`mRtW${attr}`]: e.target.value
                                }))
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ width: '30%' }}>
                    <Box>
                        <Typography variant='body'>Lipid Retention Time Window</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            sx={{ width: 80 }}
                            id="filled-number"
                            label="Number"
                            type="number"
                            step={0.1}
                            InputProps={{ inputProps: { min: 0 } }}
                            value={annParams[`lRtW${attr}`]}
                            onChange={
                                (e) => setAnnParams(prev => ({
                                    ...prev, [`lRtW${attr}`]: e.target.value
                                }))
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="body">Lipid Class and Possible Adducts</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <HotTable
                        data={annParams[`lipidAdd${attr}`]} // It is being changed by handson table
                        rowHeaders={true}
                        colHeaders={['Lipid', 'Adduct']}
                        height={400} width={250}
                        //autoWrapRow={true}
                        //autoWrapCol={true}
                        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
                        //afterChange={handleHandsonTableChange}
                        contextMenu={{
                            callback: function (key, selection, clickEvent) {
                                console.log('Selected option:', key);
                            },
                            items: {
                                'row_above': {
                                    name: 'Insert row above this one'
                                },
                                'row_below': {
                                    name: 'Insert row below this one'
                                },
                                'remove_row': {
                                    name: 'Remove this row'
                                },
                                // More context menu items...
                            },
                            zIndex: 5000 
                        }}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export const DEFAULT_NEGATIVE_DATA = [
    ['PC', 'M+HCOOH-H'],
    ['PC', 'M+Cl'],
    ['PE', 'M-H'],
    ['PE', 'M-H+HCOONa'],
    ['PS', 'M-H'],
    ['PG', 'M-H'],
    ['PG', 'M-H+HCOONa'],
    ['PI', 'M-H'],
    ['PI', 'M-H+HCOONa'],
    ['PA', 'M-H'],
    ['PA', 'M-H+HCOONa'],
    ['LPC', 'M+HCOOH-H'],
    ['LPC', 'M+Cl'],
    ['LPE', 'M-H'],
    ['LPE', 'M-H+HCOONa'],
    ['LPS', 'M-H'],
    ['LPS', 'M-2H-Na'],
    ['LPG', 'M-H'],
    ['LPG', 'M-H+HCOONa'],
    ['LPI', 'M-H'],
    ['LPI', 'M-H+HCOONa'],
    ['SM', 'M+HCOOH-H'],
    ['SM', 'M+Cl'],
    ['Cer', 'M+HCOOH-H'],
    ['Cer', 'M+Cl'],
    ['Cer', 'M-H'],
    ['FAHFA', 'M-H'],
    ['FAHFA', 'M+HCOOH-H'],
    ['FA', 'M-H'],
    ['FA', 'M-H-H2O'],
    ['ST', 'M-H'],
    ['ST', 'M-H-H2O'],
    ['ST', 'M+HCOOH-H']
];

export const DEFAULT_POSITIVE_DATA_NH4 = [
    ['PC', 'M+H'],
    ['PC', 'M+Na'],
    ['PC', 'M+K'],
    ['PE', 'M+H'],
    ['PE', 'M+Na'],
    ['PG', 'M+NH4'],
    ['PI', 'M+NH4'],
    ['PA', 'M+NH4'],
    ['LPC', 'M+H'],
    ['LPC', 'M+Na'],
    ['LPC', 'M+H-H2O'],
    ['LPC', 'M+K'],
    ['LPE', 'M+H'],
    ['LPE', 'M+H-H2O'],
    ['LPE', 'M+Na'],
    ['SM', 'M+H'],
    ['SM', 'M+Na'],
    ['SM', 'M+K'],
    ['SM', 'M+H-H2O'],
    ['Cer', 'M+H-H2O'],
    ['Cer', 'M+H'],
    ['Cer', 'M+Na'],
    ['Cer', 'M+K'],
    ['Cholesterol', 'M+H-H2O'],
    ['Cholesterol', 'M+NH4'],
    ['CE', 'M+NH4'],
    ['MG', 'M+NH4'],
    ['MG', 'M+H'],
    ['MG', 'M+Na'],
    ['DG', 'M+NH4'],
    ['DG', 'M+H-H2O'],
    ['DG', 'M+Na'],
    ['DG', 'M+H'],
    ['TG', 'M+NH4'],
    ['TG', 'M+Na'],
    ['CAR', 'M+H'],
    ['CAR', 'M+Na'],
    ['FAHFA', 'M+NH4'],
    ['FAHFA', 'M+H'],
    ['FAHFA', 'M+H-H2O'],
    ['FA', 'M+H'],
    ['FA', 'M+H-H2O'],
    ['ST', 'M+H'],
    ['ST', 'M+H-H2O']
];

export default TPPSection