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
import MyMotion from '@/components/MyMotion';

const StyledCell = styled(TableCell)(({ theme }) => ({
    textAlign: 'center'
}));

export default function SummaryTable({ qThr, mThr }) {

    const job = useJob();

    return (

        <TableContainer component={Paper} sx={{ width: 300 }}>
            <Table size="small" aria-label="a dense table">
                <TableBody>
                    {
                        job.user.mdata != null &&
                        <>
                            <TableRow>
                                <StyledCell>Observations</StyledCell>
                                <StyledCell>{job.user.mdata.shape[0]}</StyledCell>
                            </TableRow>
                            <TableRow>
                                <StyledCell>Meta-variables</StyledCell>
                                <StyledCell>{job.user.mdata.shape[1]}</StyledCell>
                            </TableRow>
                        </>
                    }
                    {
                        job.user.xq != null &&
                        <TableRow>
                            <StyledCell>Proteomic features</StyledCell>
                            <StyledCell>
                                {job.user.xq.isNa().sum({ axis: 0 }).div(job.user.xq.shape[0]).le(qThr).sum()} / {job.user.xq.shape[1]}
                            </StyledCell>
                        </TableRow>
                    }
                    {
                        job.user.xm != null &&
                        <TableRow>
                            <StyledCell>Metabolomic features</StyledCell>
                            <StyledCell>
                                {job.user.xm.isNa().sum({ axis: 0 }).div(job.user.xm.shape[0]).le(mThr).sum()} / {job.user.xm.shape[1]}
                            </StyledCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}
