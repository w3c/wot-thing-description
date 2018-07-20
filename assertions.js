// Parameters
// TODO: allow these to be specified with options, eg with commander
const src_htmlfile = "index.html";
const template_htmlfile = "testing/template.html";
const ts_htmlfile = "testing/testspec.html";
const plan_htmlfile = "testing/plan.html";

// Dependencies
var fs = require('fs');
var cheerio = require('cheerio');

// Read in test specs and store as a map
const ts_raw = fs.readFileSync(ts_htmlfile, 'UTF-8');
var ts_dom = cheerio.load(ts_raw);
var ts = {};
ts_dom('span[class="testspec"]').each(function(i,elem) {
    let id = ts_dom(this).attr('id');
    if (undefined === id) {
        console.log("Warning: testspec without id:",elem.html());
    } else {
        ts[id] = ts_dom(this).text();;
    }
});
console.log(ts);

// Initialize plan dom with template
const template_raw = fs.readFileSync(template_htmlfile, 'UTF-8');
var plan_dom = cheerio.load(template_raw);

// Read in index.html store as a dom
const src_raw = fs.readFileSync(src_htmlfile, 'UTF-8');
var src_dom = cheerio.load(src_raw);

// Extract assertions and merge with test specs into plan dom
var assertions = {};
src_dom('span[class="rfc2119"]').each(function(i,elem) {
    let id = elem.attr('id');
    if (undefined === id) {
        console.log("Warning: rfc2119 assertion without id:",elem.html());
    } else {
        assertion[id] = elem.text();;
    }
});
console.log(assertions);

// Output plan
fs.writeFile(plan_htmlfile, plan_dom.html(), function(error) {
    if (error) {
        return console.log(err);
    } else {
        console.log("Test plan output to "+plan_htmlfile);
    }
}); 
