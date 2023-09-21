"use client"

import React, { useState } from 'react';

import { JobProvider } from './JobContext';
import MyMotion from '../MyMotion'
import Menu from './menu/Menu';

import NewJob from './newJob/NewJob'
import FindJob from './findJob/FindJob';
import Results from './results/Results'
import CreateJob from './createJob/CreateJob';



export default function App() {

    const [page, setPage] = useState('new-job'); // "new-job", "create-job", "find-job", "results"

    return (
        <div>
            <JobProvider>
                <Menu page={page} setPage={setPage} />

                {
                    page == 'new-job' &&
                    <MyMotion>
                        <NewJob />
                    </MyMotion>
                }

                {
                    page == 'create-job' &&
                    <CreateJob page={page} setPage={setPage} />
                }

                {
                    page == 'find-job' &&
                    <MyMotion>
                        <FindJob setPage={setPage} />
                    </MyMotion>
                }

                {
                    page == 'results' &&
                    <MyMotion>
                        <Results />
                    </MyMotion>
                }
            </JobProvider>
        </div>
    )
}


