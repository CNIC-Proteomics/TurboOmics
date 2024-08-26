import React, { useState } from "react";
import { Card, Typography, Box } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";

import { useDispatchJob, useJob } from "../JobContext";

import { tsvToDanfo } from "../../../utils/tsvToDanfo.js";
const fileFormat = ["TSV"];


export default function DragFile({ title, fileType, traspose = false, DialogHelp }) {

    const fileName = useJob().userFileNames[fileType];
    const dispatchJob = useDispatchJob();

    async function handleChange(file) {
        const fileText = await file.text();
        let [dfJson, idCol] = await tsvToDanfo(fileText, '\t', traspose);

        dispatchJob({
            type: 'user-upload',
            fileType: fileType,
            userFileName: file.name,
            dfJson: dfJson,
            idCol: idCol
        });
    };

    return (
        <div style={{ width: '30%', textAlign: 'center' }}>
            <Card sx={{
                transition: "all 1s ease",
                backgroundColor: fileName ? 'rgba(220,220,220,0.5)' : 'rgba(250,250,250,0.5)'
            }}>
                <Typography sx={{pt:2}} variant="h6" >{title}</Typography>
                {DialogHelp}
                <Box sx={{ width: 400, margin: 'auto' }}>
                    <FileUploader
                        multiple={false}
                        handleChange={handleChange}
                        name={fileType}
                        types={fileFormat}
                    />
                </Box>
                <Box sx={{py:2}}>{fileName ? `File name: ${fileName}` : "no file uploaded yet"}</Box>
            </Card>
        </div>
    );
}