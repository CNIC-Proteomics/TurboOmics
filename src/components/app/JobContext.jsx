import React, { createContext, useContext } from 'react';
import { useImmerReducer } from 'use-immer';

const JobContext = createContext(null);
const DispathJobContext = createContext(null);

export function useJob() {
    return useContext(JobContext);
}

export function useDispatchJob() {
    return useContext(DispathJobContext);
}

export function JobProvider({ children }) {

    const [job, dispatchJob] = useImmerReducer(jobReducer, jobTemplate);

    return (
        <JobContext.Provider value={job}>
            <DispathJobContext.Provider value={dispatchJob}>
                {children}
            </DispathJobContext.Provider>
        </JobContext.Provider>
    )
}

function jobReducer(draft, action) {
    console.log(`jobReducer called: ${action.type}`);
    switch (action.type) {
        case 'find-job': {
            return action.results;
        }

        case 'user-upload': {
            draft.user[action.fileType] = action.df;
        }
    }

}

const jobTemplate = {
    "jobID": null,
    "user": {
        "xq": null,
        "xm": null,
        "mdata": null,
        "q2i": null,
        "m2i": null
    },
    "results": {
        "EDA": null,
        "MOFA": null,
        "CORR": null,
        "ML": null
    }
}
