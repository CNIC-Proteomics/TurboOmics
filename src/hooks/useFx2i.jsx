import { useJob } from '@/components/app/JobContext'
import React, { useMemo } from 'react'

function useFx2i(omic) {

    const f2i = useJob().user[`${omic}2i`];
    const f2x = useJob().f2x[omic];

    const fx2i = useMemo( () => {
        let fx2i = dfd.toJSON(f2i).filter((e,i) => f2x[i]);
        fx2i = new dfd.DataFrame(fx2i);
        fx2i.setIndex({ column: fx2i.columns[0], inplace: true });
        return fx2i
    }, [f2i, f2x]);

    return [fx2i]
}

export default useFx2i