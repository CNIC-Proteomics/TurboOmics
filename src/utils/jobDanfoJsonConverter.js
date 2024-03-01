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
        
    });

    return {
        ...job,
        'user': {
            'mdata': dfd.toJSON(job.user.mdata),
            ...omicsDataJson
        },
        'norm': { // Set these in case of re-sending a job. Otherwise ERROR
            'xq': null,
            'xm': null,
            'xt': null
        }
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
        },
        'norm': {
            ...omicsNormDataJson
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