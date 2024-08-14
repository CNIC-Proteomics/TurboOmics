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

export default function HelpSectionTop() {
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
                    Pathway Analysis - Model Summary
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
                        The results of your pathway analysis are displayed here, providing a detailed overview of the model’s performance
                        and the most relevant pathways to the condition of interest.
                    </Typography>
                    <Typography gutterBottom>
                        On the upper pane you can find:
                    </Typography>
                    <Box sx={{ pl: 4 }}>
                        <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Statistical Summary Table</strong> (Left-Side):
                                <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        At the top of the table, the R-squared (R²) value is displayed, representing
                                        the proportion of variance in the response variable explained by the model.
                                        An empirical p-value is also shown, calculated by performing ten permutations
                                        on the response vector (y) and comparing the simulated R² values with the actual one.
                                        The minimum p-value that can be obtained is 0.1, reflecting the reliability of the model.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Latent Variables</strong>: The table lists each latent variable calculated
                                        by the model, with the following columns:
                                        <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                                <strong>R² Value</strong>: Indicates how much of the variability
                                                is explained by each latent variable.
                                            </ListItem>
                                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                                <strong>P-Value</strong>: Shows the R² statistical
                                                significance of the each latent variable.
                                            </ListItem>
                                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                                <strong>Omic Contribution</strong> (Multi-View Only):
                                                An additional column shows the percentage contribution of each omic
                                                dataset to the corresponding latent variable, offering insight into
                                                how different omics contribute to the model.
                                            </ListItem>
                                        </List>
                                    </ListItem>
                                </List>
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                <strong>Sample Projection Scatter Plot</strong> (Right Side):
                                This scatter plot displays the projection of samples onto each latent variable,
                                with points color-coded according to their group in the analyzed condition.
                                This visualization helps in assessing how well the model separates the different
                                groups based on the latent variables.
                            </ListItem>
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}