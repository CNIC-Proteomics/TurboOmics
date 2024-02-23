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
import { Box } from '@mui/material';

const StyledCell = styled(TableCell)(({ theme }) => ({
    textAlign: 'center'
}));

export default function SummaryTable() {

    const qThr = useJob().results.PRE.MVThr.xq;
    const mThr = useJob().results.PRE.MVThr.xm;
    const tThr = useJob().results.PRE.MVThr.xt;
    const user = useJob().user;

    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ width: 300 }}>
                <TableContainer component={Paper} sx={{ width: 300 }}>
                    <Table size="small" aria-label="a dense table">
                        <TableBody>
                            {
                                user.mdata != null &&
                                <>
                                    <TableRow>
                                        <StyledCell>n</StyledCell>
                                        <StyledCell>{user.mdata.shape[0]}</StyledCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledCell>Meta-variables</StyledCell>
                                        <StyledCell>{user.mdata.shape[1]}</StyledCell>
                                    </TableRow>
                                </>
                            }
                            {
                                user.xt != null &&
                                <TableRow>
                                    <StyledCell>Transcriptomic features</StyledCell>
                                    <StyledCell>
                                        {user.xt.isNa().sum({ axis: 0 }).div(user.xt.shape[0]).le(tThr).sum()} / {user.xt.shape[1]}
                                    </StyledCell>
                                </TableRow>
                            }
                            {
                                user.xq != null &&
                                <TableRow>
                                    <StyledCell>Proteomic features</StyledCell>
                                    <StyledCell>
                                        {user.xq.isNa().sum({ axis: 0 }).div(user.xq.shape[0]).le(qThr).sum()} / {user.xq.shape[1]}
                                    </StyledCell>
                                </TableRow>
                            }
                            {
                                user.xm != null &&
                                <TableRow>
                                    <StyledCell>Metabolomic features</StyledCell>
                                    <StyledCell>
                                        {user.xm.isNa().sum({ axis: 0 }).div(user.xm.shape[0]).le(mThr).sum()} / {user.xm.shape[1]}
                                    </StyledCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    )
}
