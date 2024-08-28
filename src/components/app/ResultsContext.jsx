/*
Libraries
*/

import { createContext, useContext, useState } from 'react';
import { useImmerReducer } from 'use-immer';



/*
Context Component
*/

const ResultsContext = createContext();
const DispatchResultsContext = createContext();

export function useResults() {
    return useContext(ResultsContext);
}

export function useDispatchResults() {
    return useContext(DispatchResultsContext);
}

export function ResultsProvider({ children }) {

    const [results, dispatchResults] = useImmerReducer(resultsReducer, resultsTemplate);

    return (
        <ResultsContext.Provider value={results}>
            <DispatchResultsContext.Provider value={dispatchResults}>
                {children}
            </DispatchResultsContext.Provider>
        </ResultsContext.Provider>
    )
}

function resultsReducer(draft, action) {
    console.log(`Results object updated: ${action.type}`);
    console.log(action);

    switch (action.type) {

        /*
        Results Component
        */

        case 'reset-results': {
            return resultsTemplate;
        }

        case 'set-status': {
            draft.status = action.status;
            break;
        }

        case 'set-tab-value': {
            draft.value = action.value;
            break;
        }

        /*
        EDA - Data Distribution
        */

        case 'set-eda-dd-norm': {
            draft.EDA.DD.showNorm = action.showNorm;
            break;
        }

        case 'set-eda-dd-groupby': {
            draft.EDA.DD.groupby = action.groupby;
            break;
        };

        case 'set-eda-dd-filter': {
            draft.EDA.DD.filterCol[action.fileType] = action.filterCol;
            break;
        }

        case 'set-eda-dd-filter-text': {
            draft.EDA.DD.filterText[action.fileType] = action.filterText;
            break;
        }

        /*
        EDA - PCA
        */

        case 'set-eda-pca-data': {
            draft.EDA.PCA[action.omic].data = action.data;
            break;
        }

        case 'set-eda-pca-status': {
            draft.EDA.PCA[action.omic].status = action.status;
            break;
        }

        case 'set-scatter-mode': {
            draft.EDA.PCA[action.omic].displayOpts.scatterMode = action.mode;
            break;
        }

        case 'set-selected-plot-cell': {
            draft.EDA.PCA[action.omic].displayOpts.selectedCell = {
                rowIndex: action.rowIndex,
                colIndex: action.colIndex
            }
            draft.EDA.PCA[action.omic].displayOpts.selectedPlot = {
                mdataCol: action.mdataCol,
                PCA: action.PCA
            }
            break;
        }

        case 'set-selected-plot-2d': {
            draft.EDA.PCA[action.omic].displayOpts.selectedPlot2D[action.option] = action.value;
            break;
        }

        case 'set-filter-col': {
            draft.EDA.PCA[action.omic].displayOpts.filterCol = action.value;
            break;
        }

        /* 
        MOFA
        */

        case 'set-mofa-data': {
            draft.MOFA.data = action.data;
            break;
        }

        case 'set-selected-plot-cell-mofa': {
            draft.MOFA.displayOpts.selectedCell = {
                rowIndex: action.rowIndex,
                colIndex: action.colIndex
            };

            draft.MOFA.displayOpts.selectedPlot = {
                mdataCol: action.mdataCol,
                Factor: action.Factor
            };
            break;
        }

        case 'set-scatter-mode-mofa': {
            draft.MOFA.displayOpts.scatterMode = action.mode;
            break;
        }

        case 'set-selected-plot-2d-mofa': {
            //draft.MOFA.displayOpts.selectedPlot2D[action.option] = action.value;
            draft.MOFA.displayOpts.selectedPlot2D = action.mode;
            break;
        }

        case 'update-zlegend': {
            draft.MOFA.displayOpts.zLegend[action.omic][action.minmax] = action.numValue
            break;
        }

        /*
        GSEA
        */

        case 'set-g2info': {
            draft.GSEA[action.omic].gidCol = action.gidCol;
            draft.GSEA[action.omic].g2info = action.g2info;
            break;
        }

        case 'handle-rank-col-opts': {
            draft.GSEA[action.omic].rankParams = action.rankParams;
            break;
        }

        case 'set-sub-rank-col': {
            draft.GSEA[action.omic].rankParams.subRankCol = action.subRankCol;
            break;
        }

        case 'set-group-col-opts': {
            draft.GSEA[action.omic].rankParams.groupColOpts = action.groupColOpts;
            break;
        }

        case 'set-group': {
            draft.GSEA[action.omic].rankParams.groups[action.g] = action.value;
            break;
        }

        case 'set-m-params': {
            draft.GSEA.m.mParams[action.attr] = action.value;
            break;
        }

        case 'set-ion-val-opts': {
            draft.GSEA.m.ionValOpts = action.ionValOpts;
            break;
        }

        case 'set-ion-val': {
            draft.GSEA.m.mParams.ionVal[action.mode] = action.value;
            break;
        }

        case 'set-run-gsea': {
            draft.GSEA[action.omic].guiParams = action.guiParams;
            draft.GSEA[action.omic].db = action.omic == 'm' ? GSEA_DB.m : GSEA_DB.t
            break;
        }

        case 'set-gsea-data': {
            draft.GSEA[action.omic].gseaData = action.gseaData
        }

        case 'set-db': {
            draft.GSEA[action.omic].db = draft.GSEA[action.omic].db.map(e => {
                return e.db == action.db ?
                    {
                        ...e,
                        status: action.status,
                        gseaID: action.gseaID,
                        gseaRes: action.gseaRes
                    } : e
            })
            break;
        }

        /*
        PWA
        */
       
        case 'set-pwa-params': {
            draft.PWA.mdataCol = action.mdataCol;
            draft.PWA.mdataCategorical = action.mdataCategorical;
            draft.PWA.omicIdCol = action.omicIdCol;
            draft.PWA.omicIdType = action.omicIdType;
            draft.PWA.omicIdR = action.omicIdR;
            draft.PWA.OSsearch = action.OS;
            break;
        }
        
        case 'set-pwa-attr': {
            draft.PWA[action.attr] = action.value;
            break;
        }


    }
}

const PCA_omicTemplate = {
    data: {
        projections: null,
        loadings: null,
        explained_variance: null,
        anova: null
    }, // {projections, loadings, explained_variance, anova}
    status: { status: 'waiting' }, // status -> {ok, waiting, error}
    displayOpts: {
        scatterMode: '2D',
        selectedPlot: null,
        selectedCell: null,
        selectedPlot2D: { x: 1, y: 2, g: 'No color' },
        filterCol: 'All features',
    }
}

const GSEA_DB = {
    t: [
        { db: 'Custom', label: 'Custom', status: 'ok', show: true },
        { db: 'HALLMARK', label: 'HALLMARK', status: '', gseaRes: null, show: false },
        { db: 'GO_MF', label: 'GO:MF', status: '', gseaRes: null, show: false },
        { db: 'GO_CC', label: 'GO:CC', status: '', gseaRes: null, show: false },
        { db: 'GO_BP', label: 'GO:BP', status: '', gseaRes: null, show: false },
        { db: 'KEGG', label: 'KEGG', status: '', gseaRes: null, show: false },
        { db: 'REACTOME', label: 'REACTOME', status: '', gseaRes: null, show: false },
    ],
    m: [
        { db: 'Custom', label: 'Custom', status: 'ok', show: true },
        { db: 'KEGG', label: 'KEGG', status: '', gseaRes: null, show: false },
        { db: 'ChEBI', label: 'REACTOME', status: '', gseaRes: null, show: false },
        { db: 'pos', label: 'Mummichog (+)', status: '', gseaRes: null, show: false },
        { db: 'neg', label: 'Mummichog (-)', status: '', gseaRes: null, show: false }
    ]
};

const GSEA_PARAMS = {
    //db: GSEA_DB.m,
    gseaData: null,
    //mParams: { mid: null, midType: null, mz: null, rt: null, ionCol: null, ionVal: { pos: null, neg: null } },
    //ionValOpts: [],
    rankParams: {
        rankCol: null,
        subRankCol: null,
        groups: { 'g1': null, 'g2': null },
        subRankColOpts: [],
        groupColOpts: [],
        showSubSection: false
    },
    guiParams: { gseaID: '', showGsea: false, titleGsea: '' }
}

const resultsTemplate = {
    'value': 0.1,
    'status': {
        EDA_PCA: { status: 'waiting' }, // waiting, ok, error
        MOFA: { status: 'waiting' },
    },
    'EDA': {
        'DD': { // Data distribution section
            'showNorm': true,
            'groupby': { label: 'All values', value: 'All values' },
            'filterCol': {
                'q2i': 'All features',
                'm2i': 'All features',
                't2i': 'All features'
            },
            'filterText': {
                'q2i': '',
                'm2i': '',
                't2i': ''
            },
        },

        'PCA': {
            'q': PCA_omicTemplate,
            'm': PCA_omicTemplate,
            't': PCA_omicTemplate
        }
    },
    'MOFA': {
        data: null, // {projections, loadings, explained_variance, anova}
        displayOpts: {
            selectedCell: null, // {rowIndex: 0, colIndex:0}
            selectedPlot: null, // {mdataCol: rowNames[0], Factor: factorNames[0]}
            scatterMode: '1D',
            selectedPlot2D: null, //{ x: 'Factor1', y: 'Factor2', g: 'No color' },
            zLegend: ['m', 'q', 't'].reduce(
                (o, e) => ({ ...o, [e]: { min: -2, max: 2 } }), {}
            )
        }
    },
    'GSEA': {
        'm': {
            ...GSEA_PARAMS,
            db: GSEA_DB.m,
            mParams: { mid: null, midType: null, mz: null, rt: null, ionCol: null, ionVal: { pos: null, neg: null } },
            ionValOpts: [],
        },
        'q': {
            ...GSEA_PARAMS,
            db: GSEA_DB.t,
            gidCol: null,
            g2info: null,
        },
        't': {
            ...GSEA_PARAMS,
            db: GSEA_DB.t,
            gidCol: null,
            g2info: null,
        }
    },
    'PWA': {
        view: 'Single-View',
        mdataCol: null,
        mdataCategorical: {
            isCategorical: false,
            colOpts: [],
            g1: null, g2: null
        },
        omicIdCol: null,
        omicIdType: null,
        omicIdR: null,
        workingOmics: [],
        mdataCategoricalRes: null,
        jobStatus: { status: '', pwa_res: null, runId: null },
        rId2info: null,
        MetaboID: null,
        OSsearch: null
    }
}

