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

export default function HelpSectionParams() {
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
                    Pathway Analysis
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
                        This section leverages the <strong>PathIntegrate</strong> library to identify 
                        pathways that are most strongly associated
                        with a condition of interest [1]. By using single-sample pathway analysis (ssPA) approaches [2],
                        PathIntegrate transforms molecular-level abundance data into pathway-level matrices, enabling a
                        more comprehensive understanding of how different pathways contribute to the observed biological outcomes.
                        In this implementation, Principal Component Analysis (PCA) is used for summarizing the data at the pathway level.
                    </Typography>
                    <Typography gutterBottom>
                        PathIntegrate was implemented with its two <strong>Supervised Learning Frameworks</strong>:
                    </Typography>
                    <Box sx={{ pl: 4 }}>
                        <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Multi-View Framework</strong>: This framework employs a multi-block partial
                                least squares (MB-PLS) latent variable model. It preserves the block structure of
                                each omic view, enabling you to see the contribution of each omic dataset to the
                                prediction of the outcome variable.
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Single-View Framework</strong>: This approach uses Partial Least Squares
                                Discriminant Analysis (PLS-DA) on a single pathway-level matrix that combines
                                information from all omics.
                            </ListItem>
                        </List>
                    </Box>
                    <Typography gutterBottom>
                        <strong>The user input requirements are</strong>:
                    </Typography>
                    <Box sx={{ pl: 4 }}>
                        <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Comparing Groups</strong>: Indicate the variable from your 
                                Experimental Metadata table that you want to use as the outcome of interest. 
                                You also need to specify the two groups within this variable that will be compared.
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Omic Identifiers</strong>: Specify the columns in your omic metadata 
                                table that contain the identifiers for the biomolecules, along with the type 
                                of identifier used.
                            </ListItem>
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ textAlign: 'justify', p: 2 }}>
                        <Typography gutterBottom>
                            [1] Wieder C, Cooke J, Frainay C, Poupin N, Bowler R, Jourdan F, Kechris KJ, Lai RP, Ebbels T. PathIntegrate: Multivariate modelling approaches for pathway-based multi-omics data integration. bioRxiv [Preprint]. 2024 Jan 9:2024.01.09.574780. doi: 10.1101/2024.01.09.574780. Update in: PLoS Comput Biol. 2024 Mar 25;20(3):e1011814. doi: 10.1371/journal.pcbi.1011814. PMID: 38260498; PMCID: PMC10802464.
                        </Typography>
                        <Typography gutterBottom>
                            [2] Wieder C, Lai RPJ, Ebbels TMD. Single sample pathway analysis in metabolomics: performance evaluation and application. BMC Bioinformatics. 2022 Nov 14;23(1):481. doi: 10.1186/s12859-022-05005-1. PMID: 36376837; PMCID: PMC9664704.
                        </Typography>
                    </Box>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}