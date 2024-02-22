export function danfo2Json(job) {

    const omicsDataJson = {};
    job.myomics.map(myomic => {
        if (job.omics.includes(myomic)) {
            omicsDataJson[`x${myomic}`] = dfd.toJSON(job.user[`x${myomic}`]);
            omicsDataJson[`${myomic}2i`] = dfd.toJSON(job.user[`${myomic}2i`]);
        } else {
            omicsDataJson[`x${myomic}`] = null;
            omicsDataJson[`${myomic}2i`] = null;
        }
        
    })

    return {
        ...job,
        'user': {
            'mdata': dfd.toJSON(job.user.mdata),
            ...omicsDataJson
            /*'xq': dfd.toJSON(job.user.xq),
            'xm': dfd.toJSON(job.user.xm),
            'q2i': dfd.toJSON(job.user.q2i),
            'm2i': dfd.toJSON(job.user.m2i)*/
        },
        /*"norm": {
            "xq": null,
            "xm": null
        },*/
    }
}

export function json2Danfo(job) {

    const omicsDataJson = {};
    job.myomics.map(myomic => {
        if (job.omics.includes(myomic)) {
            omicsDataJson[`x${myomic}`] = new dfd.DataFrame(
                job.user[`x${myomic}`], 
                { index: job.index[`x${myomic}`] }
            );
            omicsDataJson[`${myomic}2i`] = new dfd.DataFrame(
                job.user[`${myomic}2i`], 
                { index: job.index[`${myomic}2i`] }
            );
        } else {
            omicsDataJson[`x${myomic}`] = null;
            omicsDataJson[`${myomic}2i`] = null;
        }
    });

    const omicsNormDataJson = {};
    job.myomics.map(myomic => {
        if (job.omics.includes(myomic)) {
            omicsNormDataJson[`x${myomic}`] = new dfd.DataFrame(
                job.norm[`x${myomic}`], 
                { index: job.index[`x${myomic}`] }
            );
        } else {
            omicsNormDataJson[`x${myomic}`] = null;
        }
    })

    return {
        ...job,
        'user': {
            'mdata': new dfd.DataFrame(job.user.mdata, { index: job.index.mdata }),
            ...omicsDataJson
            /*'xq': new dfd.DataFrame(job.user.xq, { index: job.index.xq }),
            'xm': new dfd.DataFrame(job.user.xm, { index: job.index.xm }),
            'q2i': new dfd.DataFrame(job.user.q2i, { index: job.index.q2i }),
            'm2i': new dfd.DataFrame(job.user.m2i, { index: job.index.m2i })*/
        },
        'norm': {
            ...omicsNormDataJson
            /*'xq': new dfd.DataFrame(job.norm.xq, { index: job.index.xq }),
            'xm': new dfd.DataFrame(job.norm.xm, { index: job.index.xm }),*/
        }
    }
}

export function danfo2RowColJson(df) {
    let dfRowColJson = {};
    let dfJson = dfd.toJSON(df);
    dfJson.map(
        (record, i) => {
            dfRowColJson[df.index[i]] = record;
        }
    )
    return dfRowColJson;
}