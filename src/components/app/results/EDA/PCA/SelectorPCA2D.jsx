import { useJob } from '@/components/app/JobContext'
import { Box } from '@mui/material';
import React from 'react'
import { MySelect } from '../DataDistribution/MyFormComponents';
import { useDispatchResults } from '@/components/app/ResultsContext';

function SelectorPCA2D({ pvColNames, pvRowNames, selectedPlot2D, setSelectedPlot2D, omic }) {
    const dispatchResults = useDispatchResults();
    const { mdataType } = useJob();
    return (
        <Box sx={{ height:75, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ width: '25%' }}>
                <MySelect
                    options={pvColNames.map(e => ({ label: `PCA ${e}`, value: e }))}
                    onChange={
                        e => {
                            setSelectedPlot2D(prev => ({ ...prev, x: e.value }));
                            dispatchResults({type:'set-selected-plot-2d', option:'x', value: e.value, omic:omic});
                        }
                    }
                    value={{ label: `PCA ${selectedPlot2D.x}`, value: selectedPlot2D.x }}
                    label='X axis'
                />
            </Box>
            <Box sx={{ width: '25%' }}>
                <MySelect
                    options={pvColNames.map(e => ({ label: `PCA ${e}`, value: e }))}
                    onChange={
                        e => {
                            setSelectedPlot2D(prev => ({ ...prev, y: e.value }));
                            dispatchResults({type:'set-selected-plot-2d', option:'y', value: e.value, omic:omic});
                        }
                    }
                    value={{ label: `PCA ${selectedPlot2D.y}`, value: selectedPlot2D.y }}
                    label='Y axis'
                />
            </Box>
            <Box sx={{ width: '40%' }}>
                <MySelect
                    options={[
                        { label: 'No color', value: 'No color' },
                        ...pvRowNames.filter(
                            e => mdataType[e].type == 'categorical'
                        ).map(e => ({ label: e, value: e }))]}
                    onChange={
                        e => {
                            setSelectedPlot2D(prev => ({ ...prev, g: e.value }));
                            dispatchResults({type:'set-selected-plot-2d', option:'g', value: e.value, omic:omic});
                        }
                    }
                    value={{ label: selectedPlot2D.g, value: selectedPlot2D.g }}
                    label='Color by'
                />
            </Box>
        </Box>
    )
}

export default SelectorPCA2D