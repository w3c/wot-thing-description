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
var testspec = {};
ts_dom('span[class="testspec"]').each(function(i,elem) {
    let id = ts_dom(this).attr('id');
    if (undefined === id) {
        console.log("Warning: testspec without id:",
                    ts_dom(this).html());
    } else {
        testspec[id] = ts_dom(this).text();;
    }
});
console.log(testspec);

// Initialize plan dom with template
const template_raw = fs.readFileSync(template_htmlfile, 'UTF-8');
var plan_dom = cheerio.load(template_raw);

// Read in index.html store as a dom
const src_raw = fs.readFileSync(src_htmlfile, 'UTF-8');
var src_dom = cheerio.load(src_raw);

// Extract assertions
var assertions = {};
src_dom('span[class="rfc2119-assertion"]').each(function(i,elem) {
    let id = src_dom(this).attr('id');
    if (undefined === id) {
        console.log("Warning: rfc2119-assertion without id:",
                    src_dom(this).html());
    } else {
        assertions[id] = src_dom(this).text();;
    }
});
console.log(assertions);

// Merge assertions and test specs into plan
var plan_body = plan_dom('body');
var plan_list = plan_body.append('<ul></ul>');
for (a in assertions) {
    console.log("Processing assertion "+a);
    plan_elem = plan_list.append('<li></li>');
    a_text = assertions[a];
    plan_elem.append(a_text);
    a_spec = testspec[a];
    if (undefined === a_spec) {
        console.log("Warning: no test spec for "+a);
    } else {
        plan_elem.append(a_spec);
    }
}

// Output plan
fs.writeFile(plan_htmlfile, plan_dom.html(), function(error) {
    if (error) {
        return console.log(err);
    } else {
        console.log("Test plan output to "+plan_htmlfile);
    }
}); 
