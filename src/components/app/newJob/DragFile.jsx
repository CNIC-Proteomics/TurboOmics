import React, { useState } from "react";
import { Card, Typography, Box } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";

import { useDispatchJob, useJob } from "../JobContext";

import DialogHelp from './DialogHelp';
import { tsvToDanfo } from "../../../utils/tsvToDanfo.js";
const fileFormat = ["TSV"];


export default function DragFile({ title, fileType, traspose = false }) {

    const fileName = useJob().userFileNames[fileType];
    const dispatchJob = useDispatchJob();

    async function handleChange(file) {
        const fileText = await file.text();
        let dfJson = await tsvToDanfo(fileText, '\t', traspose);

        dispatchJob({
            type: 'user-upload',
            fileType: fileType,
            userFileName: file.name,
            dfJson: dfJson
        });
    };

    return (
        <div style={{ width: '30%', textAlign: 'center' }}>
            <Card sx={{
                transition: "all 1s ease",
                backgroundColor: fileName ? 'rgba(220,220,220,0.5)' : 'rgba(250,250,250,0.5)'
            }}>
                <Typography variant="h6" className="pt-2">{title}</Typography>
                <DialogHelp title={title} />
                <Box sx={{ width: 400, margin: 'auto' }}>
                    <FileUploader
                        multiple={false}
                        handleChange={handleChange}
                        name={fileType}
                        types={fileFormat}
                    />
                </Box>
                <p className="mt-3">{fileName ? `File name: ${fileName}` : "no files uploaded yet"}</p>
            </Card>
        </div>
    );
}