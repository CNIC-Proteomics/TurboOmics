import { useJob } from '@/components/app/JobContext';
import { useDispatchResults, useResults } from '@/components/app/ResultsContext';
import { Box, IconButton, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useMemo, useState } from 'react'
import { MySelect } from './MyFormComponents';
import FilterTable from './FilterTable';
import MyMotion from '@/components/MyMotion';

export default function FilterFeatures({ omic, fileType, filteredID, setFilteredID, updatePlot }) {
    //useResults().EDA.DD.filterText[fileType]

    const [filterText, setFilterText] = useState('');
    const [filterCol, setFilterCol] = useState('All features');
    //const filterCol = useResults().EDA.DD.filterCol[fileType];
    //const filterText = useResults().EDA.DD.filterText[fileType];


    //const dispatchResults = useDispatchResults();
    const f2i = useJob().user[fileType];

    const { filteredFeatures, columns } = useMemo(() => {
        console.log('calculating filteredFeatures')

        let filteredFeatures = {}
        let columns = [{
            accessorKey: 'ID',
            header: 'ID',
            size: 50,
        }]

        if (f2i.columns.includes(filterCol)) {

            filteredFeatures = f2i.column(filterCol);
            filteredFeatures = filteredFeatures.values.map(
                (value, i) => ({
                    ID: filteredFeatures.index[i],
                    [filterCol]: value
                })
            )

            filteredFeatures = filteredFeatures.filter(
                featureObj => {
                    return (
                        featureObj[filterCol] != null && 
                        `${featureObj[filterCol]}`.toLowerCase().includes(filterText.toLowerCase()))
                }
            );

            columns.push({
                accessorKey: filterCol,
                header: filterCol,
                size: 170,
            })

        } else {
            filteredFeatures = f2i.index
            filteredFeatures = filteredFeatures.map(
                (value, i) => ({
                    ID: value,
                })
            )
        }

        return { filteredFeatures, columns }
    }, [filterText, filterCol, f2i]);

    useEffect(() => {
        console.log('useEffect: Recalculating features');
        let newFilteredID = filteredFeatures.map(feature => feature.ID);
        if (
            newFilteredID.every(e => filteredID.includes(e)) && 
            filteredID.every(e => newFilteredID.includes(e))
         ) return;

        const myTimeout = setTimeout(() => {
            setFilteredID(prevState => ({
                ...prevState, [fileType]: filteredFeatures.map(feature => feature.ID)
            }));
            updatePlot([omic]);
            console.log('Features recalculated');
        }, 500);

        return () => clearTimeout(myTimeout);
    }, [filteredFeatures, fileType, setFilteredID, updatePlot, filteredID, omic]);

    /*const handlePlot = e => {
        console.log(filterText);
    }*/

    /*const MySearchBtn = () => (
        <IconButton aria-label="delete" onClick={handlePlot}>
            <SearchIcon />
        </IconButton>
    );*/

    return (
        <Box sx={{ width: "95%", margin: 'auto' }}>
            <Box sx={{ display: 'flex', height: '10vh' }}>
                <Box sx={{ width: '40%', pt: 1 }}>
                    <MySelect
                        options={[{ label: 'All features', value: 'All features' }, ...f2i.columns.map(c => ({ label: c, value: c }))]}
                        onChange={
                            e => {
                                /*e != null && dispatchResults({
                                    type: 'set-eda-dd-filter',
                                    fileType: fileType,
                                    filterCol: e.value
                                })*/
                                setFilterCol(e.value);
                            }
                        }
                        value={{ label: filterCol, value: filterCol }}
                    //label='Filter features by column'
                    />
                </Box>
                {f2i.columns.includes(filterCol) &&
                    <MyMotion><Box sx={{ mt: 3, ml: 3 }}>
                        <TextField
                            id="standard-name"
                            placeholder='Filter text'
                            //label="Filter text"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        //InputProps={{ endAdornment: <MySearchBtn /> }}
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
