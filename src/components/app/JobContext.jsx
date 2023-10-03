import generateArray from '@/utils/generateArray';
import React, { createContext, useContext } from 'react';
import { useImmerReducer } from 'use-immer';

const JobContext = createContext(null);
const DispatchJobContext = createContext(null);

export function useJob() {
    return useContext(JobContext);
}

export function useDispatchJob() {
    return useContext(DispatchJobContext);
}

export function JobProvider({ children }) {

    const [job, dispatchJob] = useImmerReducer(jobReducer, jobTemplate);

    return (
        <JobContext.Provider value={job}>
            <DispatchJobContext.Provider value={dispatchJob}>
                {children}
            </DispatchJobContext.Provider>
        </JobContext.Provider>
    )
}


function jobReducer(draft, action) {
    console.log(`jobReducer called: ${action.type}`);
    //console.log(action);
    switch (action.type) {
        case 'find-job': {
            console.log('findJob')
            return action.results;
        }

        case 'user-upload': {
            let df = new dfd.DataFrame(action.dfJson)
            df.setIndex({ column: df.columns[0], inplace: true });

            if (action.fileType == 'xq' || action.fileType == 'xm') {
                df.drop({ columns: [df.columns[0]], inplace: true });
                let dfMV = df.isNa().sum({ axis: 0 }).div(df.shape[0]);
                let thr = generateArray(0, 1.05, 0.05);
                thr = thr.map(i => ({ MVThr: Math.round(i * 100) / 100, Features: dfMV.le(i).sum() }))
                draft.results.PRE.MV[action.fileType] = thr;
            }

            draft.user[action.fileType] = df;
            draft.userFileNames[action.fileType] = action.userFileName;
            draft.index[action.fileType] = df.index;
            break;
        }

        case 'set-mv-thr': {
            draft.results.PRE.MVThr[action.fileType] = action.thr;
            break;
        }

        case 'set-mv-type': {
            draft.results.PRE.MVType[action.fileType] = action.MVType;
            break;
        }

        case 'set-annotations-mode': {
            draft.annotations.mode = action.mode;
            break;
        }

        case 'set-annotations-column': {
            draft.annotations.column = action.column;
            break;
        }

        case 'set-job-id': {
            draft.jobID = action.jobID;
            break;
        }

        case 'set-job-context': {
            return action.jobContext;
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
    "index": { // Index of danfo dataframes (we need it to preserve it after json conversion)
        "xq": null,
        "xm": null,
        "mdata": null,
        "q2i": null,
        "m2i": null
    },
    "norm": { // Feature-center and scaled Danfo dataframes
        "xq": null,
        "xm": null
    },
    "annotations": {
        "mode": 0, // 0 --> User defined annotations by column; 1 --> Perform annotations (CMM-TP)
        "column": null
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
            },
            'MVType': { // Type of missing value imputation
                'xq': 'KNN',
                'xm': 'KNN'
            }
        },
        "EDA": null,
        "MOFA": null,
        "CORR": null,
        "ML": null
    }
}
