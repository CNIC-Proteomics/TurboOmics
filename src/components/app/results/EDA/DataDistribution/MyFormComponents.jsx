import { useDispatchResults, useResults } from '@/components/app/ResultsContext';
import { Box, FormControlLabel, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react'
import Select from 'react-select';

export function MySwitch({ handleSwitch, label }) {

    const savedShowNorm = useResults().EDA.DD.showNorm;
    const dispatchResults = useDispatchResults();

    // Desdoblamos el estado checked para que sea más fluido
    const [myChecked, setMyChecked] = useState(savedShowNorm);

    const handleClick = (e) => {
        setMyChecked(e.target.checked);
        setTimeout(() => { handleSwitch(e) }, 100);
    }

    // Save showNorm state to be restored
    useEffect(() => {
        dispatchResults({ type: 'set-eda-dd-norm', showNorm: myChecked });
    }, [myChecked, dispatchResults])

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

    // Self-component state to change fluidly
    const savedGroupby = useResults().EDA.DD.groupby;
    const [groupby, setGroupby] = useState(savedGroupby);
    
    
    const handleChange = e => {
        setGroupby({ label: e.value, value: e.value });
        setTimeout(() => handleSelect(e), 100);
    }
    
    // Save state to be restored !!!!!! CHECK THIS
    const dispatchResults = useDispatchResults();
    useEffect(() => {
        dispatchResults({ type: 'set-eda-dd-groupby', groupby: groupby });
    }, [groupby, dispatchResults]);


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