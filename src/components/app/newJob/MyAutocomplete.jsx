import { Autocomplete, Box, TextField } from "@mui/material";
import { useDispatchJob, useJob } from "../JobContext";
const { os } = require('@/utils/os');

const { useState, useEffect } = require("react");

function MyAutocomplete() {

    let initOS = useJob().OS;
    //initOS = initOS == null ? os[52] : initOS;

    const [expOS, setExpOS] = useState(initOS);
    const dispatchJob = useDispatchJob();

    const handleInput = (e, newValue) => {
        setExpOS(newValue);
        dispatchJob({ type: 'set-os', OS: newValue });
    }

    /*useEffect(() => {
        dispatchJob({ type: 'set-os', OS: expOS });
    }, [expOS, dispatchJob]);*/

    return (
        <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%' }}>
            <Box sx={{ width: 300 }}>
                <Autocomplete
                    id="virtualize-demo"
                    sx={{ width: 300 }}
                    disableListWrap
                    value={expOS}
                    onChange={(e, newValue) => handleInput(e, newValue)}
                    //PopperComponent={StyledPopper}
                    //ListboxComponent={ListboxComponent}
                    options={os}
                    //groupBy={(option) => option[0].toUpperCase()}
                    renderInput={(params) => <TextField {...params} label="Organism" />}
                    renderOption={(props, option) => {
                        return (
                            <li {...props} key={option.id}>
                                {option.label}
                            </li>
                        );
                    }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                //renderOption={(props, option, state) => [props, option, state.index]}
                //renderGroup={(params) => params}
                />
            </Box>
        </Box>
    )
}

export default MyAutocomplete