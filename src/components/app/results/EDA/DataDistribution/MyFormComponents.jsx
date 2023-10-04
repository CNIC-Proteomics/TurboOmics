import { Box, FormControlLabel, Switch } from '@mui/material';
import React, { useState } from 'react'
import Select from 'react-select';

export function MySwitch({ handleSwitch, label }) {
    // Desdoblamos el estado checked para que sea más fluido
    const [myChecked, setMyChecked] = useState(true);

    const handleClick = (e) => {
        setMyChecked(e.target.checked);
        setTimeout(() => { handleSwitch(e) }, 100);
    }

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={myChecked}//{checked}
                    onChange={handleClick}//{e => { setMyChecked(!myChecked); onChange(e) }}
                />
            }
            label={label}
        />
    )
}

export function MySelectGroupby({ options, handleSelect, label }) {

    const [groupby, setGroupby] = useState({ label: 'All values', value: 'All values' });

    const handleChange = e => {
        setGroupby({ label: e.value, value: e.value });
        setTimeout( () => handleSelect(e), 100);
    }
    
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
                value={groupby}
                onChange={handleChange}//{onChange}
            />
        </Box>
    )
}

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