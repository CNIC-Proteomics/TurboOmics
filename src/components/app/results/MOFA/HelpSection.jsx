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
                    Multi-Omics Factor Analysis (MOFA)
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
                        This section presents the results of the Multi-Omics Factor Analysis (MOFA) [1], a multivariate statistical technique that
                        decomposes your omics data into latent factors. These factors capture the major sources of variation across different
                        data modalities, allowing for the identification of continuous molecular gradients or discrete subgroups of samples.
                        MOFA operates in an unsupervised manner and runs with default parameters.
                    </Typography>
                    <Typography gutterBottom>
                        At the top of this section you can find a <strong>Summary Table of Latent Factor</strong> with the following information:
                    </Typography>
                    <Box sx={{ pl: 3 }}>
                        <List sx={{ listStyleType: 'disc', border: '0px solid blue', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', textAlign:'justify' }}>
                                <strong>Variability Explained</strong>: For each latent factor, the table summarizes the percentage of
                                variability explained in each omic dataset. This information helps users understand the contribution
                                of each factor to the overall variability within each omic type.
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign:'justify' }}>
                                <strong>Metadata Associations</strong>: The table also includes additional rows corresponding to the variables
                                in the uploaded Experimental Metadata table. For each metadata variable, the table displays the p-value of
                                the linear regression between the variable and the sample projections on each latent factor.
                                These p-values indicate the significance of the association between the factors and the experimental
                                conditions or other metadata, helping to identify potentially meaningful biological or technical influences.
                            </ListItem>
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box sx={{textAlign:'justify', p:2}}>
                    <Typography gutterBottom>
                        [1] Argelaguet R, Velten B, Arnol D, Dietrich S, Zenz T, Marioni JC, Buettner F, Huber W, Stegle O. Multi-Omics Factor Analysis-a framework for unsupervised integration of multi-omics data sets. Mol Syst Biol. 2018 Jun 20;14(6):e8124. doi: 10.15252/msb.20178124. PMID: 29925568; PMCID: PMC6010767.
                    </Typography>
                    </Box>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}