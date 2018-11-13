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
        testspec[id] = ts_dom(this);
    }
});
// console.log(testspec);

// Initialize plan dom with template
const template_raw = fs.readFileSync(template_htmlfile, 'UTF-8');
var plan_dom = cheerio.load(template_raw);

// Read in index.html store as a dom
const src_raw = fs.readFileSync(src_htmlfile, 'UTF-8');
var src_dom = cheerio.load(src_raw);
var src_title = src_dom('title').text();

// Extract assertions
var assertions = {};
src_dom('span[class="rfc2119-assertion"]').each(function(i,elem) {
    let id = src_dom(this).attr('id');
    if (undefined === id) {
        console.log("WARNING: rfc2119-assertion without id:",
                    src_dom(this).html());
    } else {
        assertions[id] = src_dom(this);
    }
});
// console.log(assertions);

// Merge assertions and test specs into plan
plan_dom('head>title').append(src_title);
// plan_dom('body>h2').append(src_title);
// plan_dom('body').append('<dl></dl>');
for (a in assertions) {
    console.log("Processing assertion "+a);

    plan_dom('#testspecs').append('<dt></dt>');
    let plan_dt = plan_dom('#testspecs>dt:last-child');
    plan_dt.append('<a href="../index.html#'+a+'">'+a+'</a>');

    let category = undefined;
    if (assertions[a].text().indexOf('MUST') > -1) {
        if (assertions[a].text().indexOf('MUST NOT') > -1) {
            category = 'MUST NOT';
        } else {
            category = 'MUST';
        }
    }
    if (assertions[a].text().indexOf('SHOULD') > -1) {
        if (assertions[a].text().indexOf('SHOULD NOT') > -1) {
            category = 'SHOULD NOT';
        } else {
            category = 'SHOULD';
        }
    }
    if (assertions[a].text().indexOf('MAY') > -1) {
        category = 'MAY';
    }
    if (assertions[a].text().indexOf('REQUIRED') > -1) {
        category = 'REQUIRED';
    }
    if (assertions[a].text().indexOf('RECOMMENDED') > -1) {
        category = 'RECOMMENDED';
    }
    if (assertions[a].text().indexOf('OPTIONAL') > -1) {
        category = 'OPTIONAL';
    }

    if (undefined === category) {
        console.log("  WARNING: RFC2119 category is not defined");
        plan_dt.append(': <strong>'+'undefined'+'</strong>');
    } else {
        plan_dt.append(': <strong>'+category+'</strong>');
    }

    plan_dom('#testspecs').append('<dd class="'+a+'"></dd>');
    let plan_dd = plan_dom('dd.'+a);
    a_text = assertions[a];
    plan_dd.append(a_text);
    a_spec = testspec[a];
    plan_dd.append('<ul><li></li></ul>');
    let plan_li = plan_dom('dd.'+a+'>ul>li:last-child');
    if (undefined === a_spec) {
        console.log("  WARNING: no test spec");
        plan_li.append('<strong>NO TEST SPECIFICATION</strong>');
    } else {
        plan_li.append(a_spec);
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
