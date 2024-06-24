import generateArray from '@/utils/generateArray';
import React, { createContext, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
const { os } = require('@/utils/os');

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
    console.log(action);

    switch (action.type) {
        case 'set-os': {
            draft.OS = action.OS;
            break;
        }
        case 'user-upload': {

            let df = new dfd.DataFrame(action.dfJson);

            df.setIndex({ column: df.columns[0], inplace: true });

            if (['xq', 'xm', 'xt'].includes(action.fileType)) {
                const omic = action.fileType.slice(-1)

                df.drop({ columns: [df.columns[0]], inplace: true });

                // Missing values calculations
                let dfMV = df.isNa().sum({ axis: 0 }).div(df.shape[0]);
                let thr = generateArray(0, 1.05, 0.05);
                thr = thr.map(i => ({ MVThr: Math.round(i * 100) / 100, Features: dfMV.le(i).sum() }));
                draft.results.PRE.MV[action.fileType] = thr;

                // Create omic2i in case it was not uploaded
                if (draft.user[`${omic}2i`] == null) {
                    let myKey = `${omic}ID`;
                    let omic2i = [];
                    df.columns.map(e => omic2i.push({ [myKey]: e }));
                    omic2i = new dfd.DataFrame(omic2i);
                    omic2i.setIndex({ column: myKey, inplace: true });
                    draft.user[`${omic}2i`] = omic2i;
                    draft.index[`${omic}2i`] = omic2i.index;
                }

                // Set omic
                const sOmics = [...draft.omics];
                sOmics.push(omic);
                draft.omics = sortOmics(sOmics);
            }

            if (action.fileType == 'mdata') {
                const df_ctypes = df.ctypes;
                df_ctypes.values.map((ctype, i) => {
                    let columnName = df_ctypes.index[i];

                    // Set variable type ({categorical, numeric})
                    if (
                        ctype.includes('string')
                    ) {
                        draft.mdataType[columnName] = { type: 'categorical' };
                    } else if (
                        columnName.toLowerCase().includes('[categorical]')
                    ) {
                        const parsedColumnName = columnName.replace(/\[categorical\]/i, '')
                        draft.mdataType[parsedColumnName] = { type: 'categorical' };
                        df.rename({ [columnName]: parsedColumnName }, { inplace: true });
                        columnName = parsedColumnName;
                    } else if (
                        ctype.includes('int') ||
                        ctype.includes('float')
                    ) {
                        draft.mdataType[columnName] = { type: 'numeric' };
                    } else {
                        draft.mdataType[columnName] = { type: null };
                    }

                    // If categorical, set levels (or number of posible values)
                    if (draft.mdataType[columnName].type == 'categorical') {
                        let levels = new Set(df.column(columnName).values);
                        levels = [...levels];
                        levels = levels.filter(e => e != null);
                        draft.mdataType[columnName].nlevels = levels.length;
                        draft.mdataType[columnName].levels = levels;

                        draft.mdataType[columnName].level2id = {}
                        levels.map(e => { draft.mdataType[columnName].level2id[e] = [] })

                        let myCol = df.column(columnName);
                        myCol.index.map((myID, i) => {
                            if (levels.includes(myCol.values[i])) {
                                draft.mdataType[columnName].level2id[myCol.values[i]].push(myID);
                            }
                        });
                    }
                })
            }

            draft.user[action.fileType] = df;
            draft.userFileNames[action.fileType] = action.userFileName;
            draft.index[action.fileType] = df.index;
            break;
        }

        case 'set-log': {
            if (draft.user[action.fileType].min().min() > 0) {
                draft.results.PRE.log[action.fileType] = action.checked;
            } else {
                alert('Logarithm cannot be calculated due to the presence of invalid values (<=0)');
            }
            break;
        }

        case 'set-scale': {
            draft.results.PRE.scale[action.fileType] = action.checked;
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

        case 'set-job-id': {
            draft.jobID = action.jobID;
            break;
        }

        case 'set-ann-params': {
            draft.annParams = action.annParams;
            break;
        }

        case 'set-job-context': {
            return action.jobContext;
        }

    }
}

const fileInfoTemplate = {
    "xq": null,
    "xm": null,
    "xt": null,
    "mdata": null,
    "q2i": null,
    "m2i": null,
    "t2i": null
};

const jobTemplate = {
    "OS": os[52], //organism
    "jobID": null,
    "myomics": ['q', 'm', 't'],
    "omics": [], // Omics selected by the user {q, m, t}
    "userFileNames": { // Name of the files uploaded by the user
        ...fileInfoTemplate
    },
    "user": { // Danfo dataframes uploaded by the user
        ...fileInfoTemplate
    },
    "index": { // Index of danfo dataframes (we need it to preserve it after json conversion)
        ...fileInfoTemplate
    },
    "norm": { // Feature-center, scaled and imputed Danfo dataframes
        "xq": null,
        "xm": null,
        "xt": null
    },
    "f2x": { // Boolean array indicating which f2i elements are in xi_norm
        "q": [],
        "m": [],
        "t": []
    },
    "mdataType": {}, // {mdata_columns} --> {categorical, numeric}

    "results": {
        "PRE": { // Results computed when user upload the files
            'log': { // log transformation
                'xq': false,
                'xm': false,
                'xt': false
            },
            'scale': { // center and scale
                'xq': false,
                'xm': true,
                'xt': false
            },
            'MV': { // Missing values --> Array of objects used to plot graph
                'xq': null, // [{thr: x, nFeatures: y}, ...]
                'xm': null,
                'xt': null
            },
            'MVThr': { // MV Threshold selected by the user
                'xq': 0.2,
                'xm': 0.2,
                'xt': 0.2
            },
            'MVType': { // Type of missing value imputation
                'xq': 'KNN',
                'xm': 'KNN',
                'xt': 'KNN'
            }
        },
    },
    annParams: null // Annotations params for putative annotations
}

const sortOmics = (sOmics) => {
    const res = [];

    if (sOmics.includes('t')) res.push('t');
    if (sOmics.includes('m')) res.push('m');
    if (sOmics.includes('q')) res.push('q');

    return res;
}