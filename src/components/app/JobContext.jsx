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

            df.setIndex({ column: action.idCol, inplace: true });
            draft.idCol[action.fileType] = action.idCol;

            if (['xq', 'xm', 'xt'].includes(action.fileType)) {
                const omic = action.fileType.slice(-1)

                df.drop({ columns: [action.idCol], inplace: true });

                // Missing values calculations
                let dfMV = df.isNa().sum({ axis: 0 }).div(df.shape[0]);
                let thr = generateArray(0, 1.05, 0.05);
                thr = thr.map(i => ({ MVThr: Math.round(i * 100) / 100, Features: dfMV.le(i).sum() }));
                draft.results.PRE.MV[action.fileType] = thr;
                draft.results.PRE.norm[action.fileType] = 'None';

                // delete f2i in case it was associated to previous xi
                if (draft.x_f2i[`${omic}2i`]) {
                    draft.user[`${omic}2i`] = null;
                    draft.index[`${omic}2i`] = null;
                    draft.x_f2i[`${omic}2i`] = false;
                }

                // Create omic2i in case it was not uploaded
                if (draft.user[`${omic}2i`] == null) {
                    let myKey = `${omic}ID`;
                    let omic2i = [];
                    df.columns.map(e => omic2i.push({ [myKey]: e }));
                    omic2i = new dfd.DataFrame(omic2i);
                    omic2i.setIndex({ column: myKey, inplace: true });
                    draft.user[`${omic}2i`] = omic2i;
                    draft.index[`${omic}2i`] = omic2i.index;
                    draft.x_f2i[`${omic}2i`] = true;
                }

                // Set omic
                const sOmics = [...draft.omics];
                sOmics.push(omic);
                draft.omics = sortOmics(sOmics);
            }

            if (action.fileType == 'mdata') {
                draft.mdataType = {};
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

            if (['q2i', 't2i', 'm2i'].includes(action.fileType)) {
                draft.x_f2i[action.fileType] = false;
            }

            draft.user[action.fileType] = df;
            draft.userFileNames[action.fileType] = action.userFileName;
            draft.index[action.fileType] = df.index;
            break;
        }

        case 'delete-file': {
            draft.user[action.fileType] = null;
            draft.userFileNames[action.fileType] = null;
            draft.index[action.fileType] = null;

            // if removed file is xi, remove from omic list
            if (['xq', 'xm', 'xt'].includes(action.fileType)) {
                const omic = action.fileType.slice(-1);
                draft.omics = draft.omics.filter(o => o != omic)
                draft.results.PRE.MV[action.fileType] = null;
                draft.results.PRE.norm[action.fileType] = 'None';
                
                //remove its associated f2i (only if associated)
                if (draft.x_f2i[`${omic}2i`]) {
                    draft.user[`${omic}2i`] = null;
                    draft.userFileNames[`${omic}2i`] = null;
                    draft.index[`${omic}2i`] = null;
                    draft.x_f2i[`${omic}2i`] = false;
                }
            }

            // if removed file is f2i and there is xi, use this to generate f2i
            if(['q2i', 'm2i','t2i'].includes(action.fileType)) {
                const omic = action.fileType.slice(0,1);

                if (draft.user[`x${omic}`]) {
                    let myKey = `${omic}ID`;
                    let omic2i = [];
                    draft.user[`x${omic}`].columns.map(e => omic2i.push({ [myKey]: e }));
                    omic2i = new dfd.DataFrame(omic2i);
                    omic2i.setIndex({ column: myKey, inplace: true });
                    draft.user[action.fileType] = omic2i;
                    draft.index[action.fileType] = omic2i.index;
                    draft.x_f2i[action.fileType] = true;
                }
            }

            break;
        }

        case 'set-norm': {
            if (
                ['log2', 'log2+median'].includes(action.normType) &&
                draft.user[action.fileType].min().min() <= 0
            ) {
                alert('Logarithm cannot be calculated due to the presence of invalid values (<=0)');
            } else {
                draft.results.PRE.norm[action.fileType] = action.normType;
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
    "idCol": { // Name of the column containing id
        ...fileInfoTemplate
    },
    "x_f2i": { // is the f2i file created from quantitative file?
        "m2i": false, "q2i": false, "t2i": false
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
            'norm': { // Type of normalization applied {None, log2, log2+median, vsn}
                'xq': 'None',
                'xm': 'None',
                'xt': 'None'
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