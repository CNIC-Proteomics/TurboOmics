import { useJob } from '@/components/app/JobContext'
import { Box } from '@mui/material';
import React from 'react'
import { MySelect } from '../../EDA/DataDistribution/MyFormComponents';
import { useDispatchResults } from '@/components/app/ResultsContext';

function SelectorFactor2D({ factorNames, rowNames, selectedPlot2D, setSelectedPlot2D }) {
    const dispatchResults = useDispatchResults();
    const { mdataType } = useJob();
    return (
        <Box sx={{ height: 75, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ width: '25%' }}>
                <MySelect
                    options={factorNames.map(e => ({ label: e, value: e }))}
                    onChange={
                        e => {
                            setSelectedPlot2D(prev => ({ ...prev, x: e.value }));
                            dispatchResults({ type: 'set-selected-plot-2d-mofa', option: 'x', value: e.value });
                        }
                    }
                    value={{ label: `${selectedPlot2D.x}`, value: selectedPlot2D.x }}
                    label='X axis'
                />
            </Box>
            <Box sx={{ width: '25%' }}>
                <MySelect
                    options={factorNames.map(e => ({ label: e, value: e }))}
                    onChange={
                        e => {
                            setSelectedPlot2D(prev => ({ ...prev, y: e.value }));
                            dispatchResults({ type: 'set-selected-plot-2d-mofa', option: 'y', value: e.value });
                        }
                    }
                    value={{ label: `${selectedPlot2D.y}`, value: selectedPlot2D.y }}
                    label='Y axis'
                />
            </Box>
            <Box sx={{ width: '40%' }}>
                <MySelect
                    options={[
                        { label: 'No color', value: 'No color' },
                        ...rowNames.filter(
                            e => mdataType[e].type == 'categorical'
                        ).map(e => ({ label: e, value: e }))]}
                    onChange={
                        e => {
                            setSelectedPlot2D(prev => ({ ...prev, g: e.value }));
                            dispatchResults({ type: 'set-selected-plot-2d-mofa', option: 'g', value: e.value });
                        }
                    }
                    value={{ label: selectedPlot2D.g, value: selectedPlot2D.g }}
                    label='Color by'
                />
            </Box>
        </Box>
    )
}

export default SelectorFactor2D