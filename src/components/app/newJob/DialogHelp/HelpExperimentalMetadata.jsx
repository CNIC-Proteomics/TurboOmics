import React, { useState } from "react";

import { Box, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useVars } from '../../../VarsContext';
import Image from 'next/image';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function HelpExperimentalMetadata() {

    const [open, setOpen] = useState(false);
    const closeDialog = () => setOpen(false);
    const openDialog = () => setOpen(true);

    const BASE_URL = useVars().BASE_URL;

    return (
        <Box>
            <IconButton sx={{p:0, pb:1}} onClick={openDialog}>
                <InfoOutlinedIcon />
            </IconButton>
            <BootstrapDialog
                onClose={closeDialog}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth='md'
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Experimental Metadata Table
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={closeDialog}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{textAlign: 'justify'}} dividers>
                    <Typography gutterBottom>
                        The Experimental Metadata Table contains information about each sample in your study.
                        <strong> Each row in the table represents a unique sample</strong>. 
                        This could be a biological replicate 
                        or any other unit of observation relevant to your experiment.
                        The first column of the table must contain the <strong>identifier for each sample</strong>.
                        Any additional column can be added to this table containing information of 
                        the <strong>experimental conditions or treatments</strong>.
                    </Typography>

                    <div style={{textAlign: 'center', padding:3}}>
                        <img src={`${BASE_URL}/ExperimentalMetadataTable.png`} alt="ExperimentalMetadataTable" />
                    </div>
                </DialogContent>
            </BootstrapDialog>
        </Box>
    )
}