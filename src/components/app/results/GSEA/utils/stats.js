export const getTvalue = (x, y) => {
    const nx = x.length;
    const ny = y.length;
    const dfx = nx - 1;
    const dfy = ny - 1;

    const meanX = x.reduce((prev, curr) => prev + curr) / nx;
    const meanY = y.reduce((prev, curr) => prev + curr) / ny;

    const varX = x.map(e => (e - meanX) ^ 2)
        .reduce((prev, curr) => prev + curr) / dfx;

    const varY = y.map(e => (e - meanY) ^ 2)
        .reduce((prev, curr) => prev + curr) / dfy;

    const sp2 = (varX * dfx + varY * dfy) / (dfx + dfy);
    const tval = (meanX - meanY) / (Math.sqrt(sp2 * (1 / nx + 1 / ny)));

    return tval;
}

export const getMedian = (values) => {

    // Sorting values, preventing original array
    // from being mutated.
    values = [...values].sort((a, b) => a - b);

    const half = Math.floor(values.length / 2);

    return (values.length % 2
        ? values[half]
        : (values[half - 1] + values[half]) / 2
    );
}