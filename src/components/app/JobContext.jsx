import generateArray from '@/utils/generateArray';
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
            console.log('findJob')
            return action.results;
        }

        case 'user-upload': {
            draft.user[action.fileType] = action.df;
            draft.userFileNames[action.fileType] = action.userFileName;
            break;
        }

        case 'get-mv-data': {
            let df = action.df;
            df = df.isNa().sum({ axis: 0 }).div(df.shape[0]);
            let thr = generateArray(0, 1.05, 0.05);
            thr = thr.map(i => ({MVThr: Math.round(i * 100) / 100, Features: df.le(i).sum()}))
            
            draft.results.PRE.MV[action.fileType] = thr;
            break;
        }

        case 'set-mv-thr': {
            draft.results.PRE.MVThr[action.fileType] = action.thr;
            break;
        }
    }
}

const jobTemplate = {
    "jobID": null,
    "userFileNames": { // Name of the files uploaded by the user
        "xq": null,
        "xm": null,
        "mdata": null,
        "q2i": null,
        "m2i": null
    },
    "user": { // Danfo dataframes uploaded by the user
        "xq": null,
        "xm": null,
        "mdata": null,
        "q2i": null,
        "m2i": null
    },
    "norm": { // Feature-center and scaled Danfo dataframes
        "xq": null,
        "xm": null,
        "mdata": null,
        "q2i": null,
        "m2i": null
    },
    "results": {
        "PRE": { // Results computed when user upload the files
            'MV': { // Missing values --> Array of objects used to plot graph
                'xq': null, // [{thr: x, nFeatures: y}, ...]
                'xm': null
            },
            'MVThr': { // MV Threshold selected by the user
                'xq': 0.2,
                'xm': 0.2
            }
        },
        "EDA": null,
        "MOFA": null,
        "CORR": null,
        "ML": null
    }
}
