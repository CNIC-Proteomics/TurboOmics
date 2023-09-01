import React, { useState } from "react";
import { Card, Typography } from "@mui/material";
import { FileUploader } from "react-drag-drop-files";


import { tsvToJSON } from "../../utils/tsvToJSON.js";

//import "./styles.css";

const fileTypes = ["TSV"];

export default function DragFile({ title }) {
    const [file, setFile] = useState(null);
    const [table, setTable] = useState(null);
    
    async function handleChange(file) {
        setFile(file);
        const fileText = await file.text();
        const fileJson = await tsvToJSON(fileText)
        console.log(fileJson);
    };
    
    return (
        <div className="DragFile mx-2 text-center" style={{width:'30%'}}>
            <Card variant='outlined' className="px-4">
                <Typography variant="h5" className="py-2">{title}</Typography>
                <FileUploader
                    multiple={false}
                    handleChange={handleChange}
                    name="xq"
                    types={fileTypes}
                />
                <p className="mt-3">{file ? `File name: ${file.name}` : "no files uploaded yet"}</p>
            </Card>
        </div>
    );
}