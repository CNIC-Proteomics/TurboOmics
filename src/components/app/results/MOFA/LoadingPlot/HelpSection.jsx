import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Box, List, ListItem } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function HelpSection() {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Box>
            <IconButton aria-label="question" size="large" onClick={handleClickOpen} >
                <HelpOutlineIcon fontSize="inherit" />
            </IconButton>
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth='lg'
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Multi-Omics Factor Analysis (MOFA) - Loading Plot
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
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
                        This subsection provides insights into how individual biomolecules contribute to each latent
                        factor calculated by MOFA. For each omic, users can visualize the 
                        <strong>loading distribution</strong> of biomolecules,
                        which represents the strength and direction (positive or negative) of their
                        association within the selected factor.
                    </Typography>
                    <Typography gutterBottom>
                        Users can <strong>select the top most positively and negatively associated</strong> biomolecules
                        for the chosen factor within each omic. This selection is crucial for deeper
                        analysis as these biomolecules are the key drivers of the factor’s influence.
                        The selected biomolecules are used to generate a heatmap, allowing for visual 
                        exploration of their expression patterns across samples.
                    </Typography>
                    <Typography gutterBottom>
                        At the bottom of the page, a button directs users to a <strong>detailed exploratory 
                        subsection</strong> where the selected biomolecules can be further analyzed, 
                        helping to reveal more about their roles and significance within the dataset.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ textAlign: 'justify', p: 2 }}>
                        <Typography gutterBottom>
                            [1] Argelaguet R, Velten B, Arnol D, Dietrich S, Zenz T, Marioni JC, Buettner F, Huber W, Stegle O. Multi-Omics Factor Analysis-a framework for unsupervised integration of multi-omics data sets. Mol Syst Biol. 2018 Jun 20;14(6):e8124. doi: 10.15252/msb.20178124. PMID: 29925568; PMCID: PMC6010767.
                        </Typography>
                    </Box>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}