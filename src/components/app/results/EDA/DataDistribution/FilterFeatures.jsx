import { useJob } from '@/components/app/JobContext';
import { Box, TextField } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { MySelect } from './MyFormComponents';
import FilterTable from './FilterTable';
import MyMotion from '@/components/MyMotion';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';
import useFx2i from '@/hooks/useFx2i';
import HelpSectionFilter from './HelpSectionFilter';

export default function FilterFeatures({ omic, setFilteredID, updatePlot }) {

    //const dispatchResults = useDispatchResults();

    // Component states to filter features
    const savedFilterText = useResults().EDA.DD.filterText[`${omic}2i`];
    const [filterText, setFilterText] = useState(savedFilterText);

    const savedFilterCol = useResults().EDA.DD.filterCol[`${omic}2i`];
    const [filterCol, setFilterCol] = useState(savedFilterCol);

    // get f2i with features in xi
    const [fx2i] = useFx2i(omic);

    const { filteredFeatures, columns } = useMemo(() => {
        console.log('calculating filteredFeatures');

        let filteredFeatures = [];
        let columns = [{
            accessorKey: ' ',
            header: ' ',
            size: 60,
        }];

        if (fx2i.columns.includes(filterCol)) {

            filteredFeatures = fx2i.column(filterCol);
            filteredFeatures = filteredFeatures.values.map(
                (value, i) => ({
                    ' ': filteredFeatures.index[i],
                    [filterCol]: value
                })
            );

            // Create regex to filter
            let regex = new RegExp('');
            try {
                regex = new RegExp(filterText);

            } catch (err) {
                regex = new RegExp('')
            }

            filteredFeatures = filteredFeatures.filter(
                featureObj => {
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
            });

        } else {
            filteredFeatures = fx2i.index
            filteredFeatures = filteredFeatures.map(
                (value, i) => ({
                    ' ': value,
                })
            )
        }

        return { filteredFeatures, columns }
    }, [filterText, filterCol, fx2i]);

    useEffect(() => {
        console.log('useEffect: Recalculating features');

        const myTimeout = setTimeout(() => {
            setFilteredID(filteredFeatures.map(feature => feature[' ']));
            updatePlot([omic]);
            console.log('Features recalculated');
        }, 1000);

        return () => clearTimeout(myTimeout);

    }, [filteredFeatures, setFilteredID, updatePlot, omic]);

    return (
        <Box sx={{ width: "95%", margin: 'auto' }}>
            <Box sx={{ display: 'flex', height:80 }}>
                <Box sx={{mt:3}}><HelpSectionFilter/></Box>
                <Box sx={{ width: '40%', pt: 1 }}>
                    <MySelect
                        options={[{ label: 'All features', value: 'All features' }, ...fx2i.columns.map(c => ({ label: c, value: c }))]}
                        onChange={
                            e => setFilterCol(e.value)
                        }
                        value={{ label: filterCol, value: filterCol }}
                    />
                </Box>
                {fx2i.columns.includes(filterCol) &&
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
            <Box sx={{ mt: 2 }}>
                <FilterTable data={filteredFeatures} columns={columns} />
            </Box>
        </Box>
    )
}
