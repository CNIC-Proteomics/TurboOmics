export default function generateArray(start, end, step) {
    if (typeof start !== 'number' || typeof end !== 'number' || typeof step !== 'number') {
        throw new Error('All arguments must be numbers');
    }

    if (start > end && step > 0) {
        throw new Error('The "step" value must be negative if "start" is greater than "end"');
    }

    if (start < end && step < 0) {
        throw new Error('The "step" value must be positive if "start" is less than "end"');
    }

    const result = [];
    let currentValue = start;

    while ((start <= end && currentValue <= end) || (start >= end && currentValue >= end)) {
        result.push(currentValue);
        currentValue += step;
    }

    return result;
}