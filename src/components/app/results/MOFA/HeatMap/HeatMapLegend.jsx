import { useJob } from '@/components/app/JobContext';
import { useDispatchResults } from '@/components/app/ResultsContext';
import { Box, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

const HeatMapLegend = ({ nFeatRef, zLegend, updateZLegend, plotHeatMap }) => {

    const omics = useJob().omics

    return (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <Box sx={{ width: '5%' }}></Box>
            {
                omics.map(omic => (
                    <Box key={omic} sx={{ mr: 0.7 }}>
                        {(nFeatRef.current[omic].up > 0 || nFeatRef.current[omic].down > 0) &&
                            <Box>
                                <Legend
                                    a={zLegend[omic].min}
                                    b={zLegend[omic].max}
                                    updateZLegend={updateZLegend}
                                    omic={omic}
                                    plotHeatMap={plotHeatMap}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                    {nFeatRef.current[omic].down > 0 &&
                                        <Box sx={{ width: 1160 / (2 * omics.length) }}></Box>
                                    }
                                    {nFeatRef.current[omic].up > 0 &&
                                        <Box sx={{ width: 1160 / (2 * omics.length) }}></Box>
                                    }
                                </Box>
                            </Box>
                        }
                    </Box>
                ))
            }
        </Box>
    )
}

const Legend = ({ a, b, updateZLegend, omic, plotHeatMap }) => {

    // User inserted values
    const [usrVal, setUsrVal] = useState({ min: a, max: b });

    // save user changes
    const dispatchResults = useDispatchResults();

    // Calcular el valor medio
    const media = (a + b) / 2;

    // Establecer los colores de gradiente
    const colorRojo = `#9e2a2b`;
    const colorBlanco = `rgb(255, 255, 255)`;
    const colorAzul = `#1f4e79`;

    // Calcular la posición del blanco en el gradiente
    const blancoPosicion = ((media - a) / (b - a)) * 100;

    // Establecer el estilo del componente
    const estilo = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        //width: '100%',
        padding: '10px',
        background: `linear-gradient(to right, ${colorAzul}, ${colorBlanco} ${blancoPosicion}%, ${colorRojo})`,
        color: '#fff',
        height: '15px'
    };

    const handleInput = (minmax, value) => {

        const numValue = Number(value);

        setUsrVal(prev => ({ ...prev, [minmax]: value }));

        if (typeof numValue == 'number' && (!isNaN(numValue))) {
            updateZLegend(draft => {
                draft[omic][minmax] = numValue
            });
            dispatchResults({type:'update-zlegend', omic, minmax, numValue});
            plotHeatMap();
        }
    }

    return (
        <div style={estilo}>
            <div>
                <input
                    type='text'
                    style={{ width: 30, height: 20, textAlign: 'center' }}
                    value={usrVal.min}
                    onChange={e => handleInput('min', e.target.value)}
                />
            </div>
            <div style={{ color: 'black' }}>{media.toFixed(0)}</div>
            <div>
                <input
                    type='text'
                    style={{ width: 30, height: 20, textAlign: 'center' }}
                    value={usrVal.max}
                    onChange={e => handleInput('max', e.target.value)}
                />
            </div>
        </div>
    );
};

export default HeatMapLegend;