import React, { useState } from "react";

import { Box, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import CloseIcon from '@mui/icons-material/Close';
import { useVars } from '../../../VarsContext';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function HelpOmicQuant({ title, tableFile }) {

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
                    {title}
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
                <DialogContent sx={{ textAlign: 'justify' }} dividers>
                    <Typography gutterBottom>
                        The Quantitative Table is where the core data for your analysis is stored.
                        It contains the quantitative values of each biomolecule across all samples,
                        serving as the foundation for the analyses within the TurboOmics platform.
                    </Typography>
                    <Typography gutterBottom>
                        <strong>Each row represents a different biomolecule</strong> in your dataset (transcripts, proteins, or metabolites).
                        <strong> The first column must contain the unique identifier</strong> for each biomolecule. This identifier is crucial
                        for linking the quantitative values to the corresponding metadata.
                    </Typography>
                    <Typography gutterBottom>
                        Each column, after the first, corresponds to a different sample in your study.
                        <strong> The first row must contain the unique identifier for each sample</strong>. This ensures
                        that the quantitative values are correctly matched with the corresponding samples
                        in the metadata tables.
                    </Typography>

                    <div style={{textAlign: 'center', padding:3}}>
                        <img src={`${BASE_URL}/${tableFile}`} alt="OmicMetadataTable" />
                    </div>
                </DialogContent>
            </BootstrapDialog>
        </Box>
    )
}