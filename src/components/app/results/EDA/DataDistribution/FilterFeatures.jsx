import { useJob } from '@/components/app/JobContext';
import { Box, TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { MySelect } from './MyFormComponents';
import FilterTable from './FilterTable';
import MyMotion from '@/components/MyMotion';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';

export default function FilterFeatures({ omic, fileType, setFilteredID, updatePlot }) {

    const dispatchResults = useDispatchResults();
    
    // Component states to filter features
    const savedFilterText = useResults().EDA.DD.filterText[fileType];
    const [filterText, setFilterText] = useState(savedFilterText);
    
    const savedFilterCol = useResults().EDA.DD.filterCol[fileType];
    const [filterCol, setFilterCol] = useState(savedFilterCol);

    const f2i = useJob().user[fileType];

    const { filteredFeatures, columns } = useMemo(() => {
        console.log('calculating filteredFeatures');

        let filteredFeatures = [];
        let columns = [{
            accessorKey: ' ',
            header: ' ',
            size: 60,
        }];

        if (f2i.columns.includes(filterCol)) {

            filteredFeatures = f2i.column(filterCol);
            filteredFeatures = filteredFeatures.values.map(
                (value, i) => ({
                    ' ': filteredFeatures.index[i],
                    [filterCol]: value
                })
            )

            filteredFeatures = filteredFeatures.filter(
                featureObj => {
                    
                    let regex = new RegExp('');
                    try {
                        regex = new RegExp(filterText);

                    } catch (err) {
                        regex = new RegExp('')
                    }

                    return (
                        featureObj[filterCol] != null && 
                        regex.test(featureObj[filterCol])
                        )
                }
            );

            columns.push({
                accessorKey: filterCol,
                header: filterCol,
                //size: 170,
            })

        } else {
            filteredFeatures = f2i.index
            filteredFeatures = filteredFeatures.map(
                (value, i) => ({
                    ' ': value,
                })
            )
        }

        return { filteredFeatures, columns }
    }, [filterText, filterCol, f2i]);

    useEffect(() => {
        console.log('useEffect: Recalculating features');

        const myTimeout = setTimeout(() => {
            setFilteredID(prevState => ({
                ...prevState, [fileType]: filteredFeatures.map(feature => feature[' '])
            }));
            updatePlot([omic]);
            console.log('Features recalculated');
        }, 500);

        return () => clearTimeout(myTimeout);
    }, [filteredFeatures, fileType, setFilteredID, updatePlot, omic]);

    // Save data !!! CHECK THIS
    useEffect(() => {
        dispatchResults({ type: 'set-eda-dd-filter', filterCol: filterCol, fileType: fileType });
        dispatchResults({ type: 'set-eda-dd-filter-text', filterText: filterText, fileType: fileType });
    }, [filterCol, filterText, fileType, dispatchResults])

    return (
        <Box sx={{ width: "95%", margin: 'auto' }}>
            <Box sx={{ display: 'flex', height: '10vh' }}>
                <Box sx={{ width: '40%', pt: 1 }}>
                    <MySelect
                        options={[{ label: 'All features', value: 'All features' }, ...f2i.columns.map(c => ({ label: c, value: c }))]}
                        onChange={
                            e => setFilterCol(e.value)
                        }
                        value={{ label: filterCol, value: filterCol }}
                    />
                </Box>
                {f2i.columns.includes(filterCol) &&
                    <MyMotion><Box sx={{ mt: 3, ml: 3 }}>
                        <TextField
                            id="standard-name"
                            placeholder='Filter text'
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                    </Box></MyMotion>
                }
            </Box>
            <Box sx={{ mt: 0 }}>
                <FilterTable data={filteredFeatures} columns={columns} />
            </Box>
        </Box>
    )
}
