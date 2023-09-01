//import * as dfd from "danfojs";

export function tsvToJSON(tsvString, sep = '\t') {
    return new Promise(resolve => {

        
        const lines = tsvString.trim().split(/[\r\n]+/);
        
        if (lines.length < 2) {
            throw new Error('String text does not have expected DataFrame format');
        }
        
        const headers = lines[0].split(sep).map(header => header.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split('\t').map(value => value.trim());
            if (values.length === headers.length) {
                const record = {};
                for (let j = 0; j < headers.length; j++) {
                    record[headers[j]] = values[j];
                }
                data.push(record);
            } else {
                console.log(`Row number ${i} could not be read`)
            }
        }

        const df = new dfd.DataFrame(data).setIndex({column: headers[0]});
        df.print();
        resolve(df);
    })
}