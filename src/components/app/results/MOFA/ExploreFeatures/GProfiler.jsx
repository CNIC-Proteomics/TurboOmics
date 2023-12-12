import { useJob } from '@/components/app/JobContext'
import React, { useEffect, useMemo, useState } from 'react'

function GProfiler({ fRef }) {

    const [qSet, setQSet] = useState([]);

    const q2i = useJob().user.q2i;
    const { OS } = useJob()
    const myBackg = useMemo(() => q2i.index, [q2i]);
    const mySet = fRef.map(e => e[q2i.columns[0]]);

    if (
        !mySet.map(e => qSet.includes(e)).every(e => e) ||
        !qSet.map(e => mySet.includes(e)).every(e => e)
    ) {
        setQSet(mySet);
    }

    const gProfiler = async () => {
        const res = await fetch(
            'https://biit.cs.ut.ee/gprofiler/api/gost/profile/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "organism": OS.id,
                    "query": qSet,
                    "domain_scope": "custom",
                    "background": myBackg,
                    "user_threshold": 1e-1,
                    "significance_threshold_method": "bonferroni",
                    'sources': ['GO:MF', 'GO:BP']//, 'GO:CC', 'KEGG', 'REAC']
                })
            }
        )
        const resJson = await res.json();
        console.log(resJson);
        console.log(resJson.result.map(e => e.name))
    }

    useEffect(() => {
        const myTimeOut = setTimeout(gProfiler, 100);
        return () => clearTimeout(myTimeOut);
    }, [qSet, myBackg])

    return (
        <div>
            GProfiler
        </div>
    )
}

export default GProfiler