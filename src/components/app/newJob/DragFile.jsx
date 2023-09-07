import React, { useState } from "react";
import { Card, Typography } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";

import { useDispatchJob, useJob } from "../JobContext";

import DialogHelp from './DialogHelp';
import { tsvToJSON } from "../../../utils/tsvToJSON.js";
import MyMotion from "@/components/MyMotion";
const fileFormat = ["TSV"];


export default function DragFile({ title, fileType }) {
    const [fileName, setFileName] = useState(useJob().userFileNames[fileType]);
    const [border, setBorder] = useState(false);
    const dispatchJob = useDispatchJob();

    // console.log(fileType, file);

    async function handleChange(file) {
        setFileName(file.name);
        const fileText = await file.text();
        let df = await tsvToJSON(fileText);
        //df.print()

        dispatchJob({
            type: 'user-upload',
            fileType: fileType,
            userFileName: file.name,
            df: df
        })

        if (fileType == 'xq' || fileType == 'xm') {
            dispatchJob({
                type: 'get-mv-data',
                fileType: fileType,
                df: df
            })
        }

        setBorder(true);
    };

    return (
        <div className="DragFile mx-2 text-center" style={{ width: '30%' }}>
            <Card variant='outlined' className={`px-4 ${border && "border-dark"}`} style={{transition: "all 1s ease"}} >
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