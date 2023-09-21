import * as React from 'react';
import Select from 'react-select';
import { useDispatchJob, useJob } from '../JobContext';
import { Box, Typography } from '@mui/material';

export default function SelectColumn() {

    const xmColumns = useJob().user.m2i.columns.map(e => ({ label: e, value: e }));
    const dispatchJob = useDispatchJob();
    //const annotationColumn = 'Name'//useJob().annotations.column;

    return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant='h6'>Please select the column containing metabolomic annotations</Typography>
            <div>
                <Box sx={{ width: "50%", pt: 2, mx: 'auto', my: 2 }}>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        isClearable={true}
                        options={xmColumns}
                        onChange={
                            e => e != null && dispatchJob({
                                type: 'set-annotations-column',
                                column: e.value
                            })
                        }
                    />
                </Box>
            </div>
        </ Box>
    )
}
