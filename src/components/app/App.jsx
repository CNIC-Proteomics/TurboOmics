import React, { useEffect, useState } from 'react';

import { JobProvider } from './JobContext';
import MyMotion from '../MyMotion'
import Menu from './menu/Menu';

import NewJob from './newJob/NewJob';
import FindJob from './findJob/FindJob';
import Results from './results/Results'
import { ResultsProvider } from './ResultsContext';
import AskAnnotationsDialog from './newJob/createJob/AskAnnotationsDialog';
import CreateJobWaiting from './newJob/createJob/CreateJobWaiting';
import AnnotationsParamsDialog from './newJob/createJob/AnnotationsParamsContent/AnnotationsParamsDialog';
import Annotating from './newJob/createJob/Annotating';


export default function App() {

    const [page, setPage] = useState('new-job'); // "new-job", "find-job", "results"
    const [creatingJob, setCreatingJob] = useState(''); // "", "waiting", "ask-annotations", "annotations-params"
    const [annotating, setAnnotating] = useState(false);

    return (
        <div>
            <JobProvider>
                <ResultsProvider>
                    <Menu
                        page={page}
                        setPage={setPage}
                        setCreatingJob={setCreatingJob}
                        setAnnotating={setAnnotating}
                    />

                    {annotating &&
                        <Annotating />
                    }

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
                                    setAnnotating={setAnnotating}
                                    setPage={setPage}
                                />
                            }
                        </MyMotion>
                    }

                    {
                        page == 'find-job' &&
                        <MyMotion>
                            <FindJob setPage={setPage} setAnnotating={setAnnotating} />
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


