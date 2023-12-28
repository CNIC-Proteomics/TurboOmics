import React, { useEffect, useState } from 'react';

import { JobProvider } from './JobContext';
import MyMotion from '../MyMotion'
import Menu from './menu/Menu';

import NewJob from './newJob/NewJob'
import FindJob from './findJob/FindJob';
import Results from './results/Results'
import { ResultsProvider } from './ResultsContext';
import AskAnnotationsDialog from './newJob/createJob/AskAnnotationsDialog';
import CreateJobWaiting from './newJob/createJob/CreateJobWaiting';
import AnnotationsParamsDialog from './newJob/createJob/AnnotationsParamsDialog';



export default function App() {

    const [page, setPage] = useState('new-job'); // "new-job", "find-job", "results"
    const [creatingJob, setCreatingJob] = useState(''); // "", "waiting", "ask-annotations", 'annotations-params"

    return (
        <div>
            <JobProvider>
                <ResultsProvider>
                    <Menu page={page} setPage={setPage} setCreatingJob={setCreatingJob} />

                    {
                        page == 'new-job' &&
                        <MyMotion>
                            <NewJob />
                            {creatingJob == 'waiting' &&
                                <CreateJobWaiting creatingJob={creatingJob} />
                            }
                            {creatingJob == 'ask-annotations' &&
                                <AskAnnotationsDialog
                                    creatingJob={creatingJob}
                                    setCreatingJob={setCreatingJob}
                                    setPage={setPage}
                                />
                            }
                            {creatingJob == 'annotations-params' &&
                                <AnnotationsParamsDialog
                                    creatingJob={creatingJob}
                                    setCreatingJob={setCreatingJob}
                                />
                            }
                        </MyMotion>
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
                </ResultsProvider>
            </JobProvider>
        </div>
    )
}


