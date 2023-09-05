//import * as dfd from "danfojs";

const NA_values = ["", "#N/A", "#N/A", "N/A", "#NA", "-1.#IND", "-1.#QNAN", "-NaN", "-nan", "1.#IND", "1.#QNAN", "<NA>", "N/A", "NA", "NULL", "NaN", "None", "n/a", "nan", "null"]

export function tsvToJSON(tsvString, sep = '\t') {
    return new Promise(resolve => {

        
        const lines = tsvString.trim().split(/[\r\n]+/);
        
        if (lines.length < 2) {
            throw new Error('String text does not have expected DataFrame format');
        }
        
        const headers = lines[0].split(sep).map(header => header.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(sep).map(value => value.trim());
            if (values.length === headers.length) {
                const record = {};
                for (let j = 0; j < headers.length; j++) {
                    record[headers[j]] = NA_values.includes(values[j]) ? undefined : values[j];
                }
                data.push(record);
            } else {
                console.log(`Row number ${i} could not be read`)
            }
        }

        let df = new dfd.DataFrame(data).setIndex({column: headers[0]});
        df.drop({ columns: [headers[0]], inplace: true });
        resolve(df);
    })
}