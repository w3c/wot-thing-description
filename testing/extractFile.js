// Assertion extractor, from file in current repo.
// Also sorts by ID (optional) and (optional) pulls in assertion text.
// First column is index of where it returns in results from Cheerio.
// Usage:
//  From the root of the repository, run:
//  % node testing/extractFile.js > testing/assertions.csv

const fs = require('fs');
const cheerio = require('cheerio');

const indexFileName = 'index.html'
const extraAssertsFileName = 'testing/inputs/extra-asserts.html'
const addAssertionTxt = true; // set true to add assertion text on last column 
const sortData = true; // set to true to sort output data

const dataIndex = fs.readFileSync(indexFileName, 'utf8');

// Load and parse HTML
const indexHTML = cheerio.load(dataIndex);

// Extract assertion and put them into an array of objects
var arr_data = [];
indexHTML('.rfc2119-assertion').each(function (i) {
    arr_data.push({
        "html": indexHTML(this),
        "index": i
    });
});

indexHTML('.rfc2119-default-assertion').each(function (i) {
    arr_data.push({
        "html": indexHTML(this),
        "index": i
    });
});

indexHTML('.rfc2119-table-assertion').each(function (i) {
    arr_data.push({
        "html": indexHTML(this),
        "index": i
    });
    // console.log({
    //     "html": indexHTML(this),
    //     "index": i
    // })
});

const data2 = fs.readFileSync(extraAssertsFileName, 'utf8');
extraAsserts = cheerio.load(data2);
extraAsserts('.rfc2119-assertion').each(function (i) {
    arr_data.push({
        "html": extraAsserts(this),
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