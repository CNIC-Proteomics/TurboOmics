import React, { useState } from "react";
import { Card, Typography } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";

import { useDispatchJob } from "../JobContext";

import DialogHelp from './DialogHelp';
import { tsvToJSON } from "../../../utils/tsvToJSON.js";
const fileTypes = ["TSV"];


export default function DragFile({ title, fileName }) {
    const [file, setFile] = useState(null);
    const dispatchJob = useDispatchJob();
    //const [table, setTable] = useState(null);

    async function handleChange(file) {
        setFile(file);
        const fileText = await file.text();
        let df = await tsvToJSON(fileText);
        //df.print()

        dispatchJob({
            type: 'user-upload',
            fileType: fileName,
            df: df
        })

        if (fileName == 'xq' || fileName == 'xm') {
            dispatchJob({
                type: 'get-mv-data',
                fileType: fileName,
                df: df
            })
        }

    };

    return (
        <div className="DragFile mx-2 text-center" style={{ width: '30%' }}>
            <Card variant='outlined' className="px-4">
                <Typography variant="h5" className="pt-2">{title}</Typography>
                <DialogHelp title={title} />
                <FileUploader
                    multiple={false}
                    handleChange={handleChange}
                    name={fileName}
                    types={fileTypes}
                />
                <p className="mt-3">{file ? `File name: ${file.name}` : "no files uploaded yet"}</p>
            </Card>
        </div>
    );
}