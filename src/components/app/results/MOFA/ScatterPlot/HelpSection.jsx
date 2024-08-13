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
                        This subsection allows you to visualize the projection of your samples onto the latent factors calculated by MOFA,
                        providing insights into how these factors capture variability across your multi-omics data. The scatter plot can
                        be viewed in two modes:
                    </Typography>
                    <Box sx={{ pl: 3 }}>
                        <List sx={{ listStyleType: 'disc', border: '0px solid blue', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>1D Mode (Default)</strong>
                                <List sx={{ listStyleType: 'disc', border: '0px solid blue', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        In this mode, the Y axis represents the projection of samples on a single selected factor,
                                        while the X axis displays the different sample groups. This view is particularly useful for
                                        comparing how different groups of samples project onto the selected factor.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Further Exploration:</strong> When using the 1D mode, you can explore the selected factor in greater detail
                                        using additional sections below, which include further analyses or visualizations related to the factor.
                                    </ListItem>
                                </List>
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>2D Mode</strong>
                                <List sx={{ listStyleType: 'disc', border: '0px solid blue', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                    This mode allows you to visualize the relationship between two factors simultaneously. 
                                    You can select one factor to be displayed on the X axis and another on the Y axis.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Color-Coding by Group</strong>: The data points representing samples can be color-coded 
                                        based on different grouping criteria, such as experimental conditions or metadata categories. 
                                        This helps in identifying patterns, subgroups, or gradients within the data.
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