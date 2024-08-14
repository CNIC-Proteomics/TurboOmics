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

export default function HelpSectionResults() {
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
                    Enrichment Analysis
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
                        Results of the Enrichment Analysis can be explored,
                        providing insights into the biological pathways, processes, or functions that
                        are significantly associated with the conditions or experimental groups in the study.
                    </Typography>
                    <Typography gutterBottom>
                        The results are displayed using various databases, allowing you to explore enriched categories
                        such as pathways, gene sets, or functional groups relevant to your data.
                    </Typography>
                    <Typography gutterBottom>
                        In addition to the enrichment analysis of predefined categories, <strong>custom 
                            enrichment analysis</strong> can also be performed.
                        For this purpose, begin by filtering the data table to define your <strong>target set</strong>.
                        The filtering options
                        allow you to select specific biomolecules based on criteria relevant to your study.
                        The entire set of biomolecules serves as the background for the enrichment analysis.
                        Once you have defined your target set through filtering, click the <strong>Plot GSEA </strong> 
                        button at the top of the table to perform the custom enrichment analysis. 
                        This will generate results specifically tailored to the filtered biomolecule set
                    </Typography>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}