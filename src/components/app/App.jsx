"use client"

import React, { useState } from 'react';
import FileUploadView from './FileUploadView';

export default function App() {
  
  const [view, setView] = useState( 'file-upload' ); // "file-upload", "results"
  
  return (
    <div>
      {view=='file-upload' && <FileUploadView/>}
    </div>
)}
