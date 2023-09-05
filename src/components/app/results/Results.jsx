import React from 'react'

import { useJob } from '../JobContext'

export default function Results() {

    const job = useJob();
    
    console.log(job)

    return (
        <div>
            Results
        </div>
    )
}
