import React, { useState } from "react";

import { Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useVars } from '../../VarsContext';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function DialogHelp({ title }) {

    const [open, setOpen] = useState(false);
    const closeDialog = () => setOpen(false);
    const openDialog = () => setOpen(true);

    const BASE_URL = useVars().BASE_URL;

    return (
        <div className="mt-0 pt-0">
            <IconButton onClick={openDialog}>
                <InfoOutlinedIcon />
            </IconButton>
            <BootstrapDialog
                onClose={closeDialog}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth='md'
            >

                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    {title} Table
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
                <DialogContent dividers>
                    <Typography gutterBottom>
                        Paragraph 1Paragraph 1Paragraph 1Paragraph 1Paragraph 1Paragraph 1Paragraph 1Paragraph 1Paragraph 1Paragraph 1Paragraph 1
                    </Typography>
                    <Typography gutterBottom>
                        Paragraph 2Paragraph 2Paragraph 2Paragraph 2Paragraph 2Paragraph 2Paragraph 2Paragraph 2Paragraph 2Paragraph 2Paragraph 2
                    </Typography>

                    <div className='text-center mt-3'>
                        <img src={`${BASE_URL}/table.png`}></img>
                    </div>

                </DialogContent>

            </BootstrapDialog>
        </div>
    )
}