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

        case 'set-eda-pca-data': {
            draft.EDA.PCA[action.omic].data = action.data;
            break;
        }
    }
}


const resultsTemplate = {
    'EDA': {
        'DD': { // Data distribution section
            'showNorm': true,
            'groupby': { label: 'All values', value: 'All values' },
            'filterCol': {
                'q2i': 'All features',
                'm2i': 'All features'
            },
            'filterText': {
                'q2i': '',
                'm2i': ''
            },
        },

        'PCA': {
            'q': {
                data: null // {projections, loadings, explained_variance, anova}
            }, 
            'm': {
                data: null
            }
        }
    }
};