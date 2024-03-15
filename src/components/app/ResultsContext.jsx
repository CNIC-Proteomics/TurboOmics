import { createContext, useContext, useState } from 'react';
import { useImmerReducer } from 'use-immer';

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

const resultsTemplate = {
    'value': 0.1,
    'status': {
        EDA_PCA: { status: 'waiting' }, // waiting, ok, error
        MOFA: { status: 'waiting' },
        //LEIDEN: 'waiting',
        //rCCA: 'waiting',
        //DCA: 'waiting',
        //ENET: 'waiting'
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
    }
}