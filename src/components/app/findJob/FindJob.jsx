import React, { useState } from 'react'

import TextField from '@mui/material/TextField';
import { IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useVars } from '../../VarsContext';
import { useDispatchJob } from '../JobContext';

export default function FindJob({ setPage }) {

    const [searchedJobID, setSearchedJobID] = useState('');
    const [exist, setExist] = useState(true);
    
    const dispatchJob = useDispatchJob();
    const API_URL = useVars().API_URL;

    async function handleSearch(searchedJobID) {
        console.log(`Search Job ID: ${searchedJobID}`);
        const response = await fetch(`${API_URL}/search/${searchedJobID}`);
        const results = await response.json();
        console.log('Server response received:');
        //console.log(results);

        if (results.exist) {
            //updateJob(results.results);
            dispatchJob({
                type: 'find-job',
                results: results.results
            })
            setPage('results');
        } else {
            setExist(false)
        }
    }

    const SearchButton = () => (
        <IconButton onClick={() => handleSearch(searchedJobID)}>
            <SearchIcon />
        </IconButton>
    )

    return (
        <div className="mx-auto mt-4 text-center">
            <TextField
                id="outlined-basic"
                label="Search Job"
                variant="outlined"
                onChange={e => {setSearchedJobID(e.target.value); setExist(true);}}
                value={searchedJobID}
                InputProps={{ endAdornment: <SearchButton /> }}
                sx={{ width: "70%", marginTop: "20%" }}
                autoFocus
                error={!exist}
                helperText={!exist && 'Job not found'}
            />
        </div>
    )
}
