/*const calculateBackgroundColor = (pv) => {
    const exponent = 1/10;
    let value = Math.pow(pv, exponent);
    console.log(pv, value)
    let red = value * 1/Math.pow(0.1, exponent) * 255;
    let green = 200 + value * 1/Math.pow(0.1, exponent) * 55;
    let blue = value * 1/Math.pow(0.1, exponent) * 255;
    return { backgroundColor: pv < 0.1 ? `rgba(${red},${green},${blue}, 0.5)` : `rgba(255,255,255,0.5)` };
};*/

export function calculateBackgroundColor (pv) {
    const log10 = Math.min(10, Math.max(1, -Math.log10(pv)));
    //console.log(pv, value)
    let red = 255 - (log10 - 1) * 255 / 9;
    let green = -55 / 9 * log10 + 255 + 55 / 9;
    let blue = 255 - (log10 - 1) * 255 / 9;
    return { backgroundColor: pv < 0.1 ? `rgba(${red},${green},${blue}, 0.25)` : `rgba(255,255,255,0.5)` };
};

export function calculateBackgroundColorRed (value, min, max, alpha = 0.2) {

    let red = 255;
    let green = 255 - 255 / (max - min) * (value - min);
    let blue = 255 - 255 / (max - min) * (value - min);
    return { backgroundColor: `rgba(${red},${green},${blue}, ${alpha})` };
};

export function calculateBackgroundColorBlueRed (value, min, max, alpha = 0.2) {

    const center = 1/2*(min+max);
    if (value > center) {   
        let red = 255;
        let green = 255 - 255 / (max - center) * (value - center);
        let blue = 255 - 255 / (max - center) * (value - center);
        return { backgroundColor: `rgba(${red},${green},${blue}, ${alpha})` };
    }
    if (value < center) {   
        let blue = 255;
        let green = 255 - 255 / (-min + center) * (-value + center);
        let red = 255 - 255 / (-min + center) * (-value + center);
        return { backgroundColor: `rgba(${red},${green},${blue}, ${alpha})` };
    } else {
        return { backgroundColor: `rgba(255,255,255, ${alpha})` };
    }
};