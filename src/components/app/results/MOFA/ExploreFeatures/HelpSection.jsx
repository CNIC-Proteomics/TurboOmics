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
                    Multi-Omics Factor Analysis (MOFA) - Explore Features
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
                        This subsection provides a detailed exploration of the top most positively and negatively
                        associated biomolecules for the selected factor within each omic. This in-depth analysis
                        is crucial for interpreting the biological significance of the latent factors identified by MOFA.
                    </Typography>
                    <Typography gutterBottom>
                        At the top of the subsection, a <strong>navigation bar</strong> allows you to switch between
                        different omic datasets. Within each omic, you can also choose
                        to <strong>focus on either the positively or negatively associated biomolecules</strong>.
                    </Typography>
                    <Typography gutterBottom>
                        The two main components for the analysis are:
                    </Typography>
                    <Box sx={{pl:4}}>
                        <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Biomolecule Information Table</strong>: This table lists the selected biomolecules
                                and provides additional context by displaying the average quantitative value of each
                                biomolecule across different sample groups.
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Overrepresentation Analysis (ORA):</strong>
                                <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        To aid in the biological interpretation of your results, ORA is performed using
                                        databases such as KEGG, REACTOME, and GO. This analysis helps identify
                                        significantly enriched biological pathways, processes, or functions among
                                        the selected biomolecules.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Background and Target Sets</strong>:
                                        The enrichment analysis uses all uploaded biomolecules as the background set,
                                        while the target set consists of the biomolecules selected for the analyzed factor.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Exploration of Enriched Categories</strong>:
                                        By clicking on a category, you can view all biomolecules associated it,
                                        with the ones selected for the factor highlighted in blue.
                                    </ListItem>
                                </List>
                            </ListItem>
                        </List>
                    </Box>
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