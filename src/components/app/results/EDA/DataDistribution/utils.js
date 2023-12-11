/*
A partir de un Array obtener valores para histograma de densidad
*/
export function getHistogramValues (x, numBins) {
    // Find the minimum and maximum values in the array
    const minValue = Math.min(...x);
    const maxValue = Math.max(...x);

    // Calculate the width of each bin
    const binWidth = (maxValue - minValue) / numBins;

    // Initialize an array to count frequencies for each bin
    const frequencies = new Array(numBins).fill(0);

    // Count frequencies for each bin
    x.forEach((value) => {
        const binIndex = Math.floor((value - minValue) / binWidth);
        if (binIndex >= 0 && binIndex < numBins) {
            frequencies[binIndex]++;
        }
    });

    // Normalize frequencies to obtain density
    const density = frequencies.map((count) => count / (x.length * binWidth));

    // Calculate the midpoints of each bin
    const binCenters = new Array(numBins).fill(0).map((_, index) => {
        return minValue + (index + 0.5) * binWidth;
    });

    const histVals = []
    for (let i=0; i<numBins; i++) {
        histVals.push({
            'binCenter': binCenters[i],
            'density': density[i]
        });
    }

    return histVals
    //return { binCenters, density };
}


/*
Calcular cuantil de un array
*/
export function calculateQuantile(values, quantile) {
    // Sort the array in ascending order
    const sortedValues = values.slice().sort((a, b) => a - b);

    // Calculate the position corresponding to the provided quantile
    const quantilePosition = Math.floor(sortedValues.length * quantile);

    // Get the value at the quantile position
    const quantileValue = sortedValues[quantilePosition];

    return quantileValue;
}

/*
Calcular Array con ticks para el eje X
*/
export function calculateXTicks(valueMin, valueMax, desiredNumTicks) {
    // Calculate the total range length
    const rangeLength = valueMax - valueMin;

    // Calculate the tick interval
    const tickInterval = rangeLength / (desiredNumTicks - 1);

    // Initialize an array to store tick values
    let ticks = [];

    // Add tick values based on the interval
    for (let i = 0; i < desiredNumTicks; i++) {
        const tickValue = valueMin + i * tickInterval;
        ticks.push(tickValue);
    }

    if (
        ticks.filter(x => x < 0).length > 0 &&
        ticks.filter(x => x > 0).length > 0
    ) {
        ticks.push(0);
    }
    ticks.sort((a, b) => a - b);
    ticks = ticks.map(x => {
        if (x<=0) return Math.floor(100 * x) / 100;
        if (x>0) return Math.ceil(100 * x) / 100;
    })

    return ticks;
}