import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import React from 'react'


const FieldSelector = ({ options, selectedField, setSelectedField, children }) => {

    const handleInput = (e, newValue) => {
        if (newValue)
            setSelectedField(newValue);
        else
            setSelectedField(options[0]);
    }

    return (
        <Box>
            <Typography variant='h6'>{children}</Typography>
            <Autocomplete
                id="feature-id-field"
                sx={{ width: 300, margin: 'auto', mt: 2 }}
                disableListWrap
                value={selectedField}
                onChange={(e, newValue) => handleInput(e, newValue)}
                options={options}
                renderInput={(params) => <TextField {...params} label="Field" />}
                renderOption={(props, option) => {
                    return (
                        <li {...props} key={option.label}>
                            {option.label}
                        </li>
                    );
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
            />
        </Box>
    )
}

export default FieldSelector