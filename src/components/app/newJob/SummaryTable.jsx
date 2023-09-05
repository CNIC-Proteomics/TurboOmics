import React from 'react'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { useJob } from '../JobContext';

import { styled } from '@mui/system';

const StyledCell = styled(TableCell)(({ theme }) => ({
    textAlign: 'center'
}));

export default function SummaryTable() {

    const job = useJob();

    return (
        <div>
            <TableContainer component={Paper} sx={{ width: 250 }}>
                <Table size="small" aria-label="a dense table">
                    <TableBody>
                        {
                            job.user.mdata != null &&
                            <TableRow>
                                <StyledCell>Observations</StyledCell>
                                <StyledCell>{job.user.mdata.shape[0]}</StyledCell>
                            </TableRow>
                        }
                        {
                            job.user.xq != null &&
                            <TableRow>
                                <StyledCell>Proteins</StyledCell>
                                <StyledCell>{job.user.xq.shape[1]}</StyledCell>
                            </TableRow>
                        }
                        {
                            job.user.xm != null &&
                            <TableRow>
                                <StyledCell>Features</StyledCell>
                                <StyledCell>{job.user.xm.shape[1]}</StyledCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}
