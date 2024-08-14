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

export default function HelpOmicMetadata({ title, tableFile }) {

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
                        The Omic Metadata Table provides <strong>detailed information about the biomolecules </strong>
                        (transcripts, proteins, or metabolites) included in your analysis.
                    </Typography>
                    <Typography gutterBottom>
                        <strong> Each row represents an individual biomolecule</strong> in your dataset. This could include
                        transcripts, proteins, or metabolites, depending on the omic data you are analyzing.
                        <strong> The first column of the table must contain the biomolecule identifier</strong>. This unique
                        identifier is crucial for matching the metadata to the corresponding quantitative data.
                        <strong> Any additional column can be included</strong> that provide useful information about each
                        biomolecule, such as biomolecule name, description or database identifier
                        (e.g. KEGG, ChEBI or UniProt).
                    </Typography>
                    <Typography gutterBottom>
                        For <strong>untargeted metabolomics</strong>, you may want to include specific columns
                        that aid in putative annotations: Apex m/z, Retention Time (min) or Ionization Mode.
                        These columns are particularly useful as they can be leveraged by TurboOmics to
                        perform putative annotations, helping to identify the metabolites in your data.
                    </Typography>

                    <div style={{textAlign: 'center', padding:3}}>
                        <img src={`${BASE_URL}/${tableFile}`} alt="OmicMetadataTable" />
                    </div>
                </DialogContent>
            </BootstrapDialog>
        </Box>
    )
}