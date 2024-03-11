import { useJob } from '@/components/app/JobContext';
import { Box, Typography } from '@mui/material';
import React from 'react';

const HeatMapLegend = ({ nFeatRef, zLegend }) => {

    const omics = useJob().omics

    return (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <Box sx={{ width: '5%' }}></Box>
            {
                omics.map(omic => (
                    <Box sx={{ mr: 0.7 }}>
                        {(nFeatRef.current[omic].up > 0 || nFeatRef.current[omic].down > 0) &&
                            <Box>
                                <Legend a={zLegend[omic].min} b={zLegend[omic].max} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                    {nFeatRef.current[omic].down > 0 &&
                                        <Box sx={{ width: 1160/(2*omics.length) }}></Box>
                                    }
                                    {nFeatRef.current[omic].up > 0 &&
                                        <Box sx={{ width: 1160/(2*omics.length) }}></Box>
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

const Legend = ({ a, b }) => {
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

    return (
        <div style={estilo}>
            <div>{a}</div>
            <div style={{ color: 'black' }}>{media.toFixed(0)}</div>
            <div>{b}</div>
        </div>
    );
};

export default HeatMapLegend;

/*
            <Box sx={{mr:0.5}}>
                {(nFeatRef.current.q.up > 0 || nFeatRef.current.q.down > 0) &&
                    <Box>
                        <Legend a={zLegend.q.min} b={zLegend.q.max} />
                        <Box><Typography variant='h6'></Typography></Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            {nFeatRef.current.q.down > 0 &&
                                <Box sx={{ width: 290 }}></Box>
                            }
                            {nFeatRef.current.q.up > 0 &&
                                <Box sx={{ width: 290 }}></Box>
                            }
                        </Box>
                    </Box>
                }
            </Box>
            <Box sx={{mx:1}}>
                {(nFeatRef.current.m.up > 0 || nFeatRef.current.m.down > 0) &&
                    <Box>
                        <Legend a={zLegend.m.min} b={zLegend.m.max} />
                        <Box><Typography variant='h6'></Typography></Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            {nFeatRef.current.m.down > 0 &&
                                <Box sx={{ width: 290 }}></Box>
                            }
                            {nFeatRef.current.m.up > 0 &&
                                <Box sx={{ width: 290 }}></Box>
                            }
                        </Box>
                    </Box>
                }
            </Box>
*/