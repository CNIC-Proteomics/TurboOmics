//import * as dfd from "danfojs";

const NA_values = ["", "#N/A", "#N/A", "N/A", "#NA", "-1.#IND", "-1.#QNAN", "-NaN", "-nan", "1.#IND", "1.#QNAN", "<NA>", "N/A", "NA", "NULL", "NaN", "None", "n/a", "nan", "null"]

export function tsvToDanfo(tsvString, sep = '\t', traspose = false) {
    return new Promise(resolve => {

        tsvString = tsvString.split(/[\r\n]+/).filter(e => e!="").join('\n');

        let lines = []

        if (traspose) {
            let tsvList = tsvString.split(/[\r\n]+/).map(
                row => row.split(sep).map( value => value.trim())
            );
            
            let trasposed = [];
            tsvList[0].map( e => trasposed.push([]));

            tsvList.map((row, ridx) => {
                row.map( (value, cidx) => {
                    trasposed[cidx].push(value);
                })
            });

            lines = trasposed.map(e => e.join('\t'));
            
        } else {    
            lines = tsvString.split(/[\r\n]+/);
        }


        //const lines = tsvString.split(/[\r\n]+/);

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
                    record[headers[j]] = NA_values.includes(values[j]) ? null : values[j];
                }
                data.push(record);
            } else {
                console.log(values);
                console.log(`Row number ${i} could not be read`)
            }
        }

        resolve(data);

    })
}