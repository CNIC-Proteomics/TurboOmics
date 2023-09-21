export function danfo2Json (job) {
    return {
        ...job,
        'user': {
            'xq': dfd.toJSON(job.user.xq),
            'xm': dfd.toJSON(job.user.xm),
            'mdata': dfd.toJSON(job.user.mdata),
            'q2i': dfd.toJSON(job.user.q2i),
            'm2i': dfd.toJSON(job.user.m2i)
        }
    }
}

export function json2Danfo (job) {
    return {
        ...job,
        'user': {
            'xq': new dfd.DataFrame(job.user.xq),
            'xm': new dfd.DataFrame(job.user.xm),
            'mdata': new dfd.DataFrame(job.user.mdata),
            'q2i': new dfd.DataFrame(job.user.q2i),
            'm2i': new dfd.DataFrame(job.user.m2i)
        },
        'norm': {
            'xq': new dfd.DataFrame(job.norm.xq),
            'xm': new dfd.DataFrame(job.norm.xm),
        }
    }
}