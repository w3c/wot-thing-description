// Assertion extractor, from file in current repo.
// Also sorts by ID (optional) and (optional) pulls in assertion text.
// First column is index of where it returns in results from Cheerio.
// Usage:
//  % npm i cheerio
//  % cd testing
//  % node extractFile.js > assertions.csv

const fs = require('fs');
const cheerio = require('cheerio');

const docFilename = '../index.html'
const addAssertionTxt = true; // set true to add assertion text on last column 
const sortData = true; // set to true to sort output data

fs.readFile(docFilename, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    // Load and parse HTML
    const $ = cheerio.load(data);

    // Extract assertion and put them into an array of objects
    var arr_data = [];
    $('.rfc2119-assertion').each(function (i) {
        arr_data.push({
            "html": $(this),
            "index": i
        });
    });

    // Optionally sort assertions by ID
    if (sortData) {
        // this is an in-place sort
        arr_data.sort((a, b) => {
            let sa = a.html.attr("id");
            let sb = b.html.attr("id");
            return (sb < sa) - (sb > sa); // case-sensitive order
        });
    }

    // Initialize headers in output CSV file
    console.log(`"ID","Status"${addAssertionTxt?',"Assertion"':''}`);

    // Output each row of array data into CSV, with optional assertion text
    for (j = 0; j < arr_data.length; j++) {
        let element = arr_data[j];
        let id = element.html.attr('id');
        let text = element.html.text();
        let assertionTxt = "";
        if (addAssertionTxt) {
            assertionTxt = ',"' + text.trim().replace(/\r?\n/g, '').replace(/\s+/g, ' ').replace(/"/g, '""') + '"';
        }
        console.log(`"${id}","null"${assertionTxt}`);
    }
});
