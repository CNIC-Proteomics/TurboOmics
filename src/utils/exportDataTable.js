import { download, generateCsv, mkConfig } from 'export-to-csv';

export default function handleExportData (data, columnNames, fileName) {
    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        //useKeysAsHeaders: true,
        columnHeaders:columnNames,
        filename: fileName
    });
    const csv = generateCsv(csvConfig)(data);//.replace(/,null/g, ',');
    download(csvConfig)(csv);
};