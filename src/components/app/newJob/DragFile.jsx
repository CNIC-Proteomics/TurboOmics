import React, { useState } from "react";
import { Card, Typography } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";

import { useDispatchJob, useJob } from "../JobContext";

import DialogHelp from './DialogHelp';
import { tsvToDanfo } from "../../../utils/tsvToDanfo.js";
const fileFormat = ["TSV"];


export default function DragFile({ title, fileType }) {

    const fileName = useJob().userFileNames[fileType];
    const dispatchJob = useDispatchJob();

    async function handleChange(file) {
        const fileText = await file.text();
        let df = await tsvToDanfo(fileText);

        dispatchJob({
            type: 'user-upload',
            fileType: fileType,
            userFileName: file.name,
            df: df
        });

        if (fileType == 'xq' || fileType == 'xm') {
            dispatchJob({
                type: 'get-mv-data',
                fileType: fileType,
                df: df
            });
        }
    };

    return (
        <div className="DragFile mx-2 text-center" style={{ width: '30%' }}>
            <Card variant='outlined' className={`px-4 ${fileName && "border-dark"}`} style={{transition: "all 1s ease"}} >
                <Typography variant="h5" className="pt-2">{title}</Typography>
                <DialogHelp title={title} />
                <FileUploader
                    multiple={false}
                    handleChange={handleChange}
                    name={fileType}
                    types={fileFormat}
                />
                <p className="mt-3">{fileName ? `File name: ${fileName}` : "no files uploaded yet"}</p>
            </Card>
        </div>
    );
}