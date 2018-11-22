// Parameters
// TODO: allow these to be specified with options, eg with commander
const src_htmlfile = "index.html";
const template_htmlfile = "testing/template.html";
const ts_htmlfile = "testing/testspec.html";
const ea_htmlfile = "testing/extra-asserts.html";
const plan_htmlfile = "testing/plan.html";

// Dependencies
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const csvtojson=require('csvtojson'); // V2

// Read in test specs and store as a map
// (Synchronous)
const ts_raw = fs.readFileSync(ts_htmlfile,'UTF-8');
var ts_dom = cheerio.load(ts_raw);
var testspec = {};
ts_dom('span[class="testspec"]').each(function(i,elem) {
    let id = ts_dom(this).attr('id');
    if (undefined === id) {
        console.log("Warning: testspec without id:\n",ts_dom(this).html());
    } else {
        // console.log("Adding testspec for",id,":\n",ts_dom(this).html());
        testspec[id] = ts_dom(this);
    }
});
// console.log("test specs:",ts_dom.html());

// Read in implementation descriptions, store as a map from name to doms
// (Synchronous)
const impls_dir = path.join(__dirname, 'testing', 'implementations');
var impls = {};
var impls_files = fs.readdirSync(impls_dir);
function get_impls() {
   for (let fi=0; fi<impls_files.length; fi++) {
       var file = path.join(impls_dir, impls_files[fi]);
       if (file.match(/.html$/g)) {
           console.log("processing implementation descriptions in",file);
           let impl_raw = fs.readFileSync(file,'UTF-8');
           let impl_dom = cheerio.load(impl_raw);
           impl_dom('div[class="impl"]').each(function(i,elem) {
               let id = impl_dom(this).attr('id');
               if (undefined === id) {
                   console.log("Warning: implementation without id:\n",impl_dom(this).html());
               } else {
                   // console.log("Adding implementation for",id,":\n",impl_dom(this).html());
                   impls[id] = ts_dom(this);
               }
           });
       }
   } 
}
get_impls();

// Initialize plan dom with template
// (Synchronous)
const template_raw = fs.readFileSync(template_htmlfile, 'UTF-8');
var plan_dom = cheerio.load(template_raw);

// Read in index.html store as a dom
// (Synchronous)
const src_raw = fs.readFileSync(src_htmlfile, 'UTF-8');
var src_dom = cheerio.load(src_raw);
var src_title = src_dom('title').text();

// Extract assertions
// (Synchronous)
var src_assertions = {};
src_dom('span[class="rfc2119-assertion"]').each(function(i,elem) {
    let id = src_dom(this).attr('id');
    if (undefined === id) {
        console.log("WARNING: rfc2119-assertion without id:",
                    src_dom(this).html());
    } else {
        src_assertions[id] = src_dom(this);
    }
});

// Read in extra assertions and store as a dom
// (Synchronous)
const ea_raw = fs.readFileSync(ea_htmlfile, 'UTF-8');
var ea_dom = cheerio.load(ea_raw);

// Extract assertions
// (Synchronous)
var extra_assertions = {};
ea_dom('span[class="rfc2119-assertion"]').each(function(i,elem) {
    let id = ea_dom(this).attr('id');
    if (undefined === id) {
        console.log("WARNING: rfc2119-assertion without id:",
                    ea_dom(this).html());
    } else {
        extra_assertions[id] = ea_dom(this);
    }
});

// Get all results, convert from CSV to JSON
// (Asynchronous)
const results_dir = path.join(__dirname, 'testing', 'results');
var results = new Map();
var results_files = fs.readdirSync(results_dir);
function get_results(i,done_callback) {
    if (0 == results_files.length) {
        done_callback(results);	    
    }	    
    var file = path.join(results_dir, results_files[i]);
    if (file.match(/.csv$/g)) {
        console.log("processing results in",file);
        var basename = path.basename(file,'.csv');
        var filedata = fs.readFileSync(file).toString();
        csvtojson()
            .fromString(filedata)
            .then((data)=> {
                results.set(basename,data);
                if (results_files.length - 1 == i) {
                    done_callback(results);
                } else {
                    get_results(i+1,done_callback);
                }
            })
    } else {
        if (results_files.length - 1 == i) {
            done_callback(results);
        } else {
            get_results(i+1,done_callback);
        }
    }
}
var merged_results = new Map();
function cleanInt(x) {
   x = Number(x);
   return x >= 0 ? Math.floor(x) : Math.ceil(x);
}
function merge_results(done_callback) {
    for (let [impl,data] of results.entries()) {
        for (let i=0; i<data.length; i++) {
           let id = data[i]["ID"];
	   let st = data[i]["Status"];
           let pass = undefined;
           if ("pass" === st) pass = 1;
           let fail = undefined;
           if ("fail" === st) fail = 1;
           let notimpl = undefined;
           if ("not-impl" === st) notimpl = 1;
           let current = merged_results.get(id);
           // there has GOT to be an easier way to do this... oh, well
           if (undefined != current) {
               // passes
               if (undefined != current.pass) {
                   if (undefined != pass) {
                       current.pass += pass;
                       merged_results.set(id,current);
                   }
               } else {
                   if (undefined != pass) {
                       current.pass = pass;
                       merged_results.set(id,current);
                   }
               }
               // failures
               if (undefined != current.fail) {
                   if (undefined != fail) {
                       current.fail += fail;
                       merged_results.set(id,current);
                   }
               } else {
                   if (undefined != fail) {
                       current.fail = fail;
                       merged_results.set(id,current);
                   }
               }
               // not-implemented
               if (undefined != current.notimpl) {
                   if (undefined != notimpl) {
                       current.notimpl += notimpl;
                       merged_results.set(id,current);
                   }
               } else {
                   if (undefined != notimpl) {
                       current.notimpl = notimpl;
                       merged_results.set(id,current);
                   }
               }
           } else {
               merged_results.set(id,{"pass": pass,"fail": fail,"notimpl": notimpl});
           }
        }
    }
    done_callback(merged_results);
}

// Get categories
// (Asynchronous)
var categories = new Map();
function get_categories(done_callback) {
    var file = path.join(__dirname,"testing","categories.csv");
    console.log("processing categories in",file);
    var filedata = fs.readFileSync(file).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let id = item["ID"];
                let cat = item["Category"];
                if (undefined != id && undefined != cat) {
                    categories.set(id,cat);
                }
            }
            done_callback();
        });
}

// At-Risk Items
// (Asynchronous)
var risks = new Map();
function get_risks(done_callback) {
    var file = path.join(__dirname,"testing","atrisk.csv");
    console.log("processing risks in",file);
    var filedata = fs.readFileSync(file).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let id = item["ID"];
                if (undefined != id) {
                    risks.set(id,true);
                }
            }
            done_callback();
        });
}

// Clear (well, write headers for) results template
// (Synchronous)
var results_template = path.join(results_dir,'template.csv');
fs.writeFileSync(results_template,'"ID","Status"\n');

// Merge implementation descriptions, assertions, and test specs into plan
// (Asynchronous)
plan_dom('head>title').append(src_title);
// plan_dom('body>h2').append(src_title);
// plan_dom('body').append('<dl></dl>');
function merge_assertions(assertions,ac,done_callback) {
  let i = 1;
  for (impl_id in impls) {
      impl_dom = impls[impl_id];
      impl_name = "To Do";
      plan_dom('#systems-toc').append('<li class="tocline">6.'+i+'<a href="#'+impl_id+'" shape="rect">'+impl_name+'</a></li>');
      i++;
      plan_dom('#systems-impl').append(impl_dom);
  }

  for (a in assertions) {
    console.log("Processing assertion "+a);

    // Results template
    fs.appendFileSync(results_template, '"'+a+'","null"\n');

    // Test Specifications Appendix
    plan_dom('#testspecs').append('<dt></dt>');
    let plan_dt = plan_dom('#testspecs>dt:last-child');
    plan_dt.append('<a href="../index.html#'+a+'">'+a+'</a> ');
    if ("baseassertion" !== ac) {
       plan_dt.append('<em>(extra)</em>');
    }

    let category = undefined;
    let req = false;
    if (assertions[a].text().indexOf('MUST') > -1) {
        if (assertions[a].text().indexOf('MUST NOT') > -1) {
            category = 'MUST NOT';
        } else {
            category = 'MUST';
        }
        req = true;
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
        req = true;
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

    // retreive text of assertion
    a_text = assertions[a];

    // Table
    plan_dom('#testresults').append('<tr id="'+a+'" class="'+ac+'"></tr>');
    let plan_tr = plan_dom('tr#'+a);
    plan_tr.append('<td class="'+ac+'"><a href="../index.html#'+a+'">'+a+'</a></td>');
    if (undefined != categories.get(a)) {
       plan_tr.append('<td class="'+ac+'">'+categories.get(a)+'</td>');
    } else {
       plan_tr.append('<td class="'+ac+'"></td>');
    }
    if (undefined != risks.get(a)) {
       plan_tr.append('<td class="atrisk">'+a_text+'</td>');
    } else {
       plan_tr.append('<td class="'+ac+'">'+a_text+'</td>');
    }
    if (req) {
        plan_tr.append('<td class="'+ac+'">Y</td>');
    } else {
        plan_tr.append('<td class="'+ac+'">N</td>');
    }
    plan_tr.append('<td class="'+ac+'"></td>');
    let result = merged_results.get(a);
    if (undefined != result) {
       // Number of reported pass statuses
       let pass = result.pass;
       if (undefined != pass) {
          if (pass >= 2) {
             plan_tr.append('<td class="'+ac+'">'+pass+'</td>');
          } else {
             plan_tr.append('<td class="failed">'+pass+'</td>');
          }
       } else {
          plan_tr.append('<td class="missing"></td>');
	  pass = 0;
       }
       // Number of reported fail statuses
       let fail = result.fail;
       if (undefined != fail) {
          if (fail > 0) {
             plan_tr.append('<td class="failed">'+fail+'</td>');
          } else {
             plan_tr.append('<td class="'+ac+'">'+fail+'</td>');
          }
       } else {
          plan_tr.append('<td class="missing"></td>');
	  fail = 0;
       }
       // Number of reported not implemented statuses
       let notimpl = result.notimpl;
       if (undefined != notimpl) {
          plan_tr.append('<td class="'+ac+'">'+notimpl+'</td>');
       } else {
          plan_tr.append('<td class="missing"></td>');
	  notimpl = 0;
       }
       // Total number of reported statuses
       let totals = pass + fail + notimpl;
       if (0 == totals) {
           plan_tr.append('<td class="missing"></td>');
       } else if (totals < 2) {
           plan_tr.append('<td class="failed">'+totals+'</td>');
       } else {
           plan_tr.append('<td class="'+ac+'">'+totals+'</td>');
       }
    } else {
       plan_tr.append('<td class="missing"></td>');
       plan_tr.append('<td class="missing"></td>');
       plan_tr.append('<td class="missing"></td>');
       plan_tr.append('<td class="missing"></td>');
    }

    // Add to appendix
    plan_dom('#testspecs').append('<dd id="'+a+'" class="'+ac+'"></dd>');
    let plan_dd = plan_dom('dd#'+a);
    plan_dd.append(a_text);
    a_spec = testspec[a];
    plan_dd.append('<br/><span></span>');
    let plan_li = plan_dom('dd#'+a+'>span:last-child');
    if (undefined === a_spec) {
        console.log("  WARNING: no test spec");
        plan_li.append('<p><strong>NO TEST SPECIFICATION</strong></p>');
    } else {
        plan_li.append(a_spec);
    }
  }
  done_callback();
}

get_results(0,function(results) {
/*
    console.log("Results: {\n");
    for (let [key,data] of results.entries()) {
        console.log(key," => ",data);
    }
    console.log("}");
*/
    merge_results(function(merged_results) {
/*
      console.log("Merged Results: {\n");
      for (let [key,data] of merged_results.entries()) {
        console.log(key," => ",data);
      }
      console.log("}");
*/
     get_risks(function() {
      get_categories(function() {
       merge_assertions(src_assertions,"baseassertion",function() {
        merge_assertions(extra_assertions,"extraassertion",function() {
          // Output plan
          fs.writeFile(plan_htmlfile, plan_dom.html(), function(error) {
            if (error) {
                return console.log(err);
            } else {
                console.log("Test plan output to "+plan_htmlfile);
            }
          }); 
        }); 
       }); 
      }); 
     }); 
    });
});

