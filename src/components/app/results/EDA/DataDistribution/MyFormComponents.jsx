import { Box, FormControlLabel, Switch } from '@mui/material';
import React from 'react'
import Select from 'react-select';

export function MySelect({ options, value, onChange, label }) {
    return (
        <Box>
            <label id="aria-label" htmlFor="aria-example-input">
                {label}
            </label>
            <Select
                aria-labelledby="aria-label"
                inputId="aria-example-input"
                className="basic-single"
                classNamePrefix="select"
                placeholder=""
                isSearchable={true}
                isClearable={false}
                options={options}
                value={value}
                onChange={onChange}
            />
        </Box>
    )
}

export function MySwitch({ checked, onChange, label }) {
    return (
        <FormControlLabel
            control={
                <Switch
                    checked={checked}
                    onChange={onChange}
                />
            }
            label={label}
        />
    )
}