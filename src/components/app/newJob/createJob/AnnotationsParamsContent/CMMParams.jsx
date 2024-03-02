import { Autocomplete, Box, Card, CardContent, CardHeader, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'


function CMMParams({ annParams, setAnnParams }) {
    return (
        <Box>

            <Box sx={{ display: 'block', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
                <Box>
                    <Typography variant='h6'>Tolerance (ppm)</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        sx={{ width: 80 }}
                        id="filled-number"
                        label="Number"
                        type="number"
                        value={annParams.mzError}
                        onChange={
                            (e) => setAnnParams(prev => ({ ...prev, mzError: e.target.value }))
                        }
                        InputLabelProps={{
                            shrink: true,
                        }}
                    //variant="filled"
                    />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', textAlign: 'center', mt: 4 }}>
                <Box sx={{ width: '70%' }}>
                    <Typography variant='h6'>Positive Adducts</Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={POSITIVE_ADDUCTS.every(e => annParams.posAdd.includes(e))}
                                onChange={() => {
                                    POSITIVE_ADDUCTS.every(e => annParams.posAdd.includes(e)) ?
                                        setAnnParams(prev => ({ ...prev, posAdd: [] })) :
                                        setAnnParams(prev => ({ ...prev, posAdd: POSITIVE_ADDUCTS }))
                                }}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        }
                        label="Select All"
                    />
                </Box>
                <Box sx={{ width: '30%' }}>
                    <Typography variant='h6'>Negative Adducts</Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={NEGATIVE_ADDUCTS.every(e => annParams.negAdd.includes(e))}
                                onChange={() => {
                                    NEGATIVE_ADDUCTS.every(e => annParams.negAdd.includes(e)) ?
                                        setAnnParams(prev => ({ ...prev, negAdd: [] })) :
                                        setAnnParams(prev => ({ ...prev, negAdd: NEGATIVE_ADDUCTS }))
                                }}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        }
                        label="Select all"
                    />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', textAlign: 'center', mt: 2 }}>

                <Box sx={{ width: '65%' }}>
                    <Card variant='outlined'><CardContent>
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-evenly'
                        }}>
                            {POSITIVE_ADDUCTS.map(e => (
                                <AdductItem
                                    key={e}
                                    name={e}
                                    attr='posAdd'
                                    setAnnParams={setAnnParams}
                                    annParams={annParams}
                                />
                            ))}
                        </Box>
                    </CardContent></Card>
                </Box>
                <Box sx={{ width: '29%' }}>
                    <Card variant='outlined'><CardContent>
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-evenly'
                        }}
                        >
                            {NEGATIVE_ADDUCTS.map(e => (
                                <AdductItem
                                    key={e}
                                    name={e}
                                    attr='negAdd'
                                    setAnnParams={setAnnParams}
                                    annParams={annParams}
                                />
                            ))}
                        </Box>
                    </CardContent></Card>
                </Box>
            </Box>
        </Box>
    )
}


const AdductItem = ({ name, attr, setAnnParams, annParams }) => {

    const [hover, setHover] = useState(false);

    let bgColor = 'rgba(255,255,255,1)';

    if (hover || annParams[attr].includes(name)) {
        bgColor = 'rgba(0,0,0,0.2)';
    }

    const handleClick = () => {
        if (annParams[attr].includes(name)) {
            setAnnParams(
                prev => ({ ...prev, [attr]: annParams[attr].filter(e => e != name) })
            )
        } else {
            setAnnParams(
                prev => ({ ...prev, [attr]: [...annParams[attr], name] })
            )
        }
    }

    return (
        <Box sx={{
            px: 2, py: 0.5, mx: 0.5, my: 0.5,
            backgroundColor: bgColor,
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 2,
            userSelect: 'none',
            cursor: 'pointer',
            transition: 'all 1s ease'
        }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={handleClick}
        >
            {name}
        </Box>
    )
}

const POSITIVE_ADDUCTS = [
    'M+H',
    'M+2H',
    'M+Na',
    'M+K',
    'M+NH4',
    'M+H-H2O',
    'M+H+NH4',
    '2M+H',
    '2M+Na',
    'M+H+HCOONa',
    '2M+H-H2O',
    'M+3H',
    'M+2H+Na',
    'M+H+2K',
    'M+H+2Na',
    'M+3Na',
    'M+H+Na',
    'M+H+K',
    'M+ACN+2H',
    'M+2Na',
    'M+2ACN+2H',
    'M+3ACN+2H',
    'M+CH3OH+H',
    'M+ACN+H',
    'M+2Na-H',
    'M+IsoProp+H',
    'M+ACN+Na',
    'M+2K-H',
    'M+DMSO+H',
    'M+2ACN+H',
    'M+IsoProp+Na+H',
    '2M+NH4',
    '2M+K',
    '2M+ACN+H',
    '2M+ACN+Na',
    '3M+H',
    '3M+Na',
    'M+H-2H2O',
    'M+NH4-H2O',
    'M+Li',
    '2M+2H+3H2O',
    'M+H+CH3COOH',
    'M+H+CH3COONa',
    'M+F+H'
];

const NEGATIVE_ADDUCTS = [
    'M-H',
    'M+Cl',
    'M+HCOOH-H',
    'M-H-H2O',
    'M-H+HCOONa',
    'M-H+CH3COONa',
    '2M-H',
    'M-3H',
    'M-2H',
    'M+Na-2H',
    'M+K-2H',
    'M+CH3COOH-H',
    'M+Br',
    'M+TFA-H',
    '2M+HCOOH-H',
    '2M+CH3COOH-H',
    '3M-H',
    'M+F',
    'M+F+H'
]


export default CMMParams