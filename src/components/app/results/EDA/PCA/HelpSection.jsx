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
                    Principal Component Analysis (PCA)
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
                        This section allows users to explore and interpret the principal components of your omic data,
                        helping to reveal patterns and reduce data dimensionality. The PCA section is organized by omic type,
                        and users can navigate between different omics using the Omic Selector button at the top.
                        Each omic subsection includes the following components:
                    </Typography>
                    <Box sx={{ pl: 3 }}>
                        <List sx={{ listStyleType: 'disc', border: '0px solid blue', listStyle: 'outside' }}>
                            <ListItem sx={{ display: 'list-item', border: '0px solid red' }}>
                                <strong>Statistical Summary Table</strong>
                                <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Principal Components</strong>: The first row of the table displays the percentage of
                                        variability explained by each of the first ten principal components. This helps users understand
                                        how much of the total data variance is captured by each component.
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Regression p-values</strong>: For each variable in your Experimental Metadata table,
                                        a row is included that shows the regression p-value between that variable and each principal component.
                                        These values indicate the strength of the relationship between the principal components and your
                                        experimental conditions, helping to identify significant associations.
                                    </ListItem>
                                </List>
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', border: '0px solid red' }}>
                                <strong>Visualization Panes</strong>
                                <List sx={{ listStyleType: 'disc', listStyle: 'outside' }}>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Left Pane: Sample Projection Scatter Plot</strong>
                                        <List sx={{ listStyleType: 'disc', listStyle: 'none' }}>
                                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                                <strong>2D View</strong>: This scatter plot shows the sample projections on two selected
                                                principal components. Users can choose which components to display on the X and Y axes.
                                                The points on the plot can be color-coded based on different grouping criteria,
                                                such as experimental conditions or metadata categories.
                                            </ListItem>
                                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                                <strong>1D View</strong>: Here, the Y axis represents a single principal component,
                                                while the X axis shows the group to which each sample belongs. This view allows users
                                                to easily compare the distribution of samples across different groups within
                                                a single principal component.
                                            </ListItem>
                                        </List>
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                        <strong>Right Pane: Principal Component Loadings</strong>
                                        <List sx={{ listStyleType: 'disc', listStyle: 'none' }}>
                                            <ListItem sx={{ display: 'list-item', textAlign: 'justify' }}>
                                            This pane displays the loadings of each biomolecule on the selected principal components. 
                                            The loadings indicate the contribution of each biomolecule to the principal components, 
                                            helping to identify which variables are most influential in driving the observed patterns.
                                            </ListItem>
                                        </List>
                                    </ListItem>
                                </List>
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