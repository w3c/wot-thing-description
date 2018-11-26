/* Process assertions in index.html, combine with configuration
 * and test results data in testing, and generate an implementation
 * report.   
 * See testing/README.md
 */

// Dependencies
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const csvtojson=require('csvtojson'); // V2

// Parameters
//=======================================================================
// TODO: allow these to be specified with options, eg with commander

// Directories
const src_dir = __dirname;
const testing_dir = path.join(__dirname, "testing");                 // test data directory
const report_dir = path.join(__dirname, "testing");                  // target directory for report output
const impls_dir = path.join(testing_dir, "implementations");         // implementation descriptions
const results_dir = path.join(testing_dir, "results");               // test results for each assertion and impl

// Inputs
const src_htmlfile = path.join(src_dir, "index.html");               // source specification (rendered)
const template_htmlfile = path.join(testing_dir, "template.html");   // report template
const ts_htmlfile = path.join(testing_dir, "testspec.html");         // test specifications for assertions
const ea_htmlfile = path.join(testing_dir, "extra-asserts.html");    // extra non-spec assertions

const depends_csvfile = path.join(testing_dir, "depends.csv");       // assertion dependencies
const categories_csvfile = path.join(testing_dir, "categories.csv"); // assertion categories
const atrisk_csvfile = path.join(testing_dir, "atrisk.csv");         // at-risk assertions
const interop_csvfile = path.join(testing_dir, "interop.csv");       // implementation interop data
//-----------------------------------------------------------------------

// Verbosity level
const verbosity = 2;
const silent_v = (verbosity == 0);
const warn_v = (verbosity >= 1);
const info_v = (verbosity >= 2);
const chatty_v = (verbosity >= 3);
const debug_v = (verbosity >= 4);

// Outputs
const report_htmlfile = path.join(report_dir, "report.html");
const results_csvfile = path.join(results_dir,"template.csv");
//=======================================================================


// Read in test specs and store as a map
// (Synchronous)
const ts_raw = fs.readFileSync(ts_htmlfile,'UTF-8');
var ts_dom = cheerio.load(ts_raw);
var testspec = {};
ts_dom('span[class="testspec"]').each(function(i,elem) {
    let id = ts_dom(this).attr('id');
    if (undefined === id) {
        if (warn_v) console.log("Warning: testspec without id:\n",ts_dom(this).html());
    } else {
        if (chatty_v) console.log("Adding testspec for",id);
        if (debug_v) console.log("  testspec is:\n",ts_dom(this).html());
        testspec[id] = ts_dom(this);
    }
});
if (debug_v) console.log("test specs:",ts_dom.html());

// Read in implementation descriptions, store as a map from name to doms
// (Synchronous)
var impls = {};
var impl_names = {};
var impls_files = fs.readdirSync(impls_dir);
function get_impls() {
   for (let fi=0; fi<impls_files.length; fi++) {
       var file = path.join(impls_dir, impls_files[fi]);
       if (file.match(/.html$/g)) {
           if (info_v) console.log("processing implementation descriptions in",file);
           let impl_raw = fs.readFileSync(file,'UTF-8');
           let impl_dom = cheerio.load(impl_raw);
           impl_dom('div[class="impl"]').each(function(i,elem) {
               let id = impl_dom(this).attr('id');
               if (undefined === id) {
                   console.log("Warning: implementation without id:\n",impl_dom(this).html());
               } else {
                   if (chatty_v) console.log("Adding implementation for",id);
                   if (debug_v) console.log("  implementation is:\n",impl_dom(this).html());
                   impls[id] = impl_dom(this);
                   impl_names[id] = impl_dom("h3").text();
               }
           });
       }
   } 
}
get_impls();

// Initialize report document dom with template
// (Synchronous)
const template_raw = fs.readFileSync(template_htmlfile, 'UTF-8');
var report_dom = cheerio.load(template_raw);

// Read in index.html store as a dom
// (Synchronous)
const src_raw = fs.readFileSync(src_htmlfile, 'UTF-8');
var src_dom = cheerio.load(src_raw);
var src_title = src_dom('title').text();

// Extract span assertions
// (Synchronous)
var src_assertions = {};
src_dom('span[class="rfc2119-assertion"]').each(function(i,elem) {
    let id = src_dom(this).attr('id');
    if (undefined === id) {
        if (warn_v) console.log("WARNING: rfc2119-assertion without id:",src_dom(this).html());
    } else {
        src_assertions[id] = src_dom(this);
    }
});

// Extract tabulated assertions
var tab_assertions = {};
src_dom('tr[class="rfc2119-table-assertion"]').each(function(i,elem) {
    let id = src_dom(this).attr('id');
    if (undefined === id) {
        if (warn_v) console.log("WARNING: rfc2119-table-assertion without id:", src_dom(this).html());
    } else {
        let assertion_data = src_dom(this).children('td').map(function(i, el) {
            return src_dom(this).html();
        }).get();
        let assertion = '<span class="rfc2119-table-assertion">' 
                      + assertion_data[0]         // vocab term
                      + ': ' + assertion_data[1]  // vocab text
                      + (("yes" === assertion_data[2]) ? ' (MUST be included)' : ' (MAY be included)')
                      + (("." === assertion_data[3]) ? '' : ' (default: '+assertion_data[3]+')')
                      +'</span>';
        if (chatty_v) console.log("table assertion",id,"added");
        if (debug_v) console.log("  text:",assertion);
        tab_assertions[id] = cheerio.load(assertion)("span");
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
        if (warn_v) console.log("WARNING: rfc2119-assertion without id:", ea_dom(this).html());
    } else {
        extra_assertions[id] = ea_dom(this);
    }
});

// Get all results, convert from CSV to JSON
// (Asynchronous)
var results = new Map();
var results_files = fs.readdirSync(results_dir);
function get_results(i,done_callback) {
    if (0 == results_files.length) {
        done_callback(results);	    
    }	    
    var file = path.join(results_dir, results_files[i]);
    if (file.match(/.csv$/g)) {
        if (info_v) console.log("processing results in",file);
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
               if (undefined !== current.fail) {
                   if (undefined !== fail) {
                       current.fail += fail;
                       merged_results.set(id,current);
                   }
               } else {
                   if (undefined !== fail) {
                       current.fail = fail;
                       merged_results.set(id,current);
                   }
               }
               // not-implemented
               if (undefined !== current.notimpl) {
                   if (undefined !== notimpl) {
                       current.notimpl += notimpl;
                       merged_results.set(id,current);
                   }
               } else {
                   if (undefined !== notimpl) {
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

// Get depends
// (Asynchronous)
var depends = new Map();
function get_depends(done_callback) {
    if (info_v) console.log("processing dependencies in",depends_csvfile);
    var filedata = fs.readFileSync(depends_csvfile).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let id = item["ID"];
                if (undefined !== id) {
                    depends.set(id,{
                        "parents": item["Parents"],
                        "contexts": item["Contexts"]
                    });
                }
                if (debug_v) console.log(id," depends ",depends.get(id));
            }
            done_callback();
        });
}

// Get categories
// (Asynchronous)
var categories = new Map();
function get_categories(done_callback) {
    if (info_v) console.log("processing categories in",categories_csvfile);
    var filedata = fs.readFileSync(categories_csvfile).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let id = item["ID"];
                let cat = item["Category"];
                if (undefined !== id && undefined !== cat) {
                    categories.set(id,cat);
                    if (chatty_v) console.log("add category record for id",id+":",categories.get(id));
                } else {
                    if (warn_v) console.log("WARNING: category record for id",id,"in unexpected format");
                }
            }
            done_callback();
        });
}

// At-Risk Items
// (Asynchronous)
var risks = new Map();
function get_risks(done_callback) {
    if (info_v) console.log("processing risks in",atrisk_csvfile);
    var filedata = fs.readFileSync(atrisk_csvfile).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let id = item["ID"];
                if (undefined !== id) {
                    risks.set(id,true);
                    if (chatty_v) console.log("add at-risk record for",id);
                } else {
                    if (warn_v) console.log("WARNING: at-risk record for id",id,"in unexpected format");
                }
            }
            done_callback();
        });
}

// Interop Data
// (Asynchronous)
var interop = new Set();
function get_interop(done_callback) {
    if (info_v) console.log("processing interop data in",interop_csvfile);
    var filedata = fs.readFileSync(interop_csvfile).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let impl1 = item["Implementation 1"];
                let role1 = item["Role 1"];
                let impl2 = item["Implementation 2"];
                let role2 = item["Role 2"];
                let security = item["Security"];
                if (undefined !== impl1 && undefined !== role1 &&
                    undefined !== impl2 && undefined !== role2 &&
                    undefined !== security) {
                    if ("producer" === role1 && "consumer" === role2) {
                        interop.add({
                           "producer": impl1,
                           "consumer": impl2,
                           "security": security
                        });
                        if (chatty_v) console.log("add interop record for ",
                                                  impl1,"("+role1+") to ",impl2,"("+role2+")");
                    } else if ("consumer" === role1 && "producer" === role2) {
                        interop.add({
                           "consumer": impl1,
                           "producer": impl2,
                           "security": security
                        });
                        if (chatty_v) console.log("add interop record for ",
                                                  impl1,"("+role1+") to ",impl2,"("+role2+")");
                    } else {
                    }
                } else {
                    if (warn_v) console.log("WARNING: interop record in unexpected format:",item);
                }
            }
            done_callback();
        });
}

// Clear (well, write headers for) results template
// (Synchronous)
fs.writeFileSync(results_csvfile,'"ID","Status"\n');

// Merge implementation descriptions
// (Asynchronous)
function merge_implementations(done_callback) {
  // insert implementation descriptions
  let i = 1;
  for (impl_id in impls) {
      impl = impls[impl_id];
      impl_name = impl_names[impl_id];
      report_dom('ul#systems-toc').append('<li class="tocline"></li>\n');
      let report_li = report_dom('ul#systems-toc>li:last-child');
      report_li.append('6.'+i+' <a href="#'+impl_id+'" shape="rect">'+impl_name+'</a>');
      i++;
      report_dom('#systems-impl').append(impl);
  }
  done_callback();
}

// Merge assertions, and test specs into report
// (Asynchronous)
report_dom('head>title').append(src_title);
// report_dom('body>h2').append(src_title);
// report_dom('body').append('<dl></dl>');
function merge_assertions(assertions,ac,done_callback) {
  // insert assertions
  for (a in assertions) {
    if (chatty_v) console.log("Processing assertion "+a);

    // Results template
    fs.appendFileSync(results_csvfile, '"'+a+'","null"\n');

    // Test Specifications Appendix
    report_dom('#testspecs').append('<dt></dt>');
    let report_dt = report_dom('#testspecs>dt:last-child');
    report_dt.append('<a href="../index.html#'+a+'">'+a+'</a> ');
    if ("baseassertion" !== ac) {
       report_dt.append('<em>(extra)</em>');
    }

    let category = undefined;
    let req = false;
    {
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
		if (warn_v) console.log("WARNING: RFC2119 category is not defined for",a);
		report_dt.append(': <strong>'+'undefined'+'</strong>');
	    } else {
		report_dt.append(': <strong>'+category+'</strong>');
	    }
    }

    // retreive text of assertion
    a_text = assertions[a];

    // Table

    // ID
    report_dom('#testresults').append('<tr id="'+a+'" class="'+ac+'"></tr>');

    // Assertion
    let report_tr = report_dom('tr#'+a);
    report_tr.append('<td class="'+ac+'"><a href="../index.html#'+a+'">'+a+'</a></td>');
    if (undefined != categories.get(a)) {
       report_tr.append('<td class="'+ac+'">'+categories.get(a)+'</td>');
    } else {
       report_tr.append('<td class="'+ac+'"></td>');
    }
    if (undefined != risks.get(a)) {
       report_tr.append('<td class="atrisk">'+a_text+'</td>');
    } else {
       report_tr.append('<td class="'+ac+'">'+a_text+'</td>');
    }

    // Req
    if (req) {
        report_tr.append('<td class="'+ac+'">Y</td>');
    } else {
        report_tr.append('<td class="'+ac+'">N</td>');
    }

    // Parent(s) and Context(s)
    let d = depends.get(a);
    if (undefined != d) {
        let p = d.parents;
        if (undefined != p && "null" !== p) {
            let ps = p.split(' ');
            let h = '<td class="'+ac+'">';
            for (let i=0; i<ps.length; i++) {
                h = h + '<a href="#' + ps[i] + '">' + ps[i] + '</a> ';
            }
            report_tr.append(h+'</td>');
        } else {
            report_tr.append('<td class="'+ac+'"></td>');
        }
        let c = d.contexts;
        if (undefined != c && "null" !== c) {
            let cs = c.split(' ');
            let h = '<td class="'+ac+'">';
            for (let i=0; i<cs.length; i++) {
                h = h + '<a href="#' + cs[i] + '">' + cs[i] + '</a> ';
            }
            report_tr.append(h+'</td>');
        } else {
            report_tr.append('<td class="'+ac+'"></td>');
        }
    }

    // Test Results
    let result = merged_results.get(a);
    if (undefined != result) {
       // Number of reported pass statuses
       let pass = result.pass;
       if (undefined != pass) {
          if (pass >= 2) {
             report_tr.append('<td class="'+ac+'">'+pass+'</td>');
          } else {
             report_tr.append('<td class="failed">'+pass+'</td>');
          }
       } else {
          report_tr.append('<td class="missing"></td>');
	  pass = 0;
       }
       // Number of reported fail statuses
       let fail = result.fail;
       if (undefined != fail) {
          if (fail > 0) {
             report_tr.append('<td class="failed">'+fail+'</td>');
          } else {
             report_tr.append('<td class="'+ac+'">'+fail+'</td>');
          }
       } else {
          report_tr.append('<td class="'+ac+'"></td>');
	  fail = 0;
       }
       // Number of reported not implemented statuses
       let notimpl = result.notimpl;
       if (undefined != notimpl) {
          report_tr.append('<td class="'+ac+'">'+notimpl+'</td>');
       } else {
          report_tr.append('<td class="'+ac+'"></td>');
	  notimpl = 0;
       }
       // Total number of reported statuses
       let totals = pass + fail + notimpl;
       if (0 == totals) {
           report_tr.append('<td class="missing"></td>');
       } else if (totals < 2) {
           report_tr.append('<td class="failed">'+totals+'</td>');
       } else {
           report_tr.append('<td class="'+ac+'">'+totals+'</td>');
       }
    } else {
       report_tr.append('<td class="missing"></td>');
       report_tr.append('<td class="missing"></td>');
       report_tr.append('<td class="missing"></td>');
       report_tr.append('<td class="missing"></td>');
    }

    // Add to appendix
    report_dom('#testspecs').append('<dd id="'+a+'" class="'+ac+'"></dd>');
    let report_dd = report_dom('dd#'+a);
    report_dd.append(a_text);
    a_spec = testspec[a];
    report_dd.append('<br/><span></span>');
    let report_li = report_dom('dd#'+a+'>span:last-child');
    if (undefined === a_spec) {
        if (warn_v) console.log("WARNING: no test spec for",a);
        report_li.append('<p><strong>NO TEST SPECIFICATION</strong></p>');
    } else {
        report_li.append(a_spec);
    }
  }
  done_callback();
}

get_results(0,function(results) {
    if (debug_v) {
        console.log("Results: {\n");
        for (let [key,data] of results.entries()) {
            console.log(key," => ",data);
        }
        console.log("}");
    }
    merge_results(function(merged_results) {
    if (debug_v) {
      console.log("Merged Results: {\n");
      for (let [key,data] of merged_results.entries()) {
        console.log(key," => ",data);
      }
      console.log("}");
    }
    get_risks(function() {
     get_depends(function() {
      get_categories(function() {
       get_interop(function() {
        merge_implementations(function() {
         merge_assertions(src_assertions,"baseassertion",function() {
          merge_assertions(tab_assertions,"tabassertion",function() {
           merge_assertions(extra_assertions,"extraassertion",function() {
            // Output report
            fs.writeFile(report_htmlfile, report_dom.html(), function(error) {
              if (error) {
                return console.log(err);
              } else {
                if (info_v) console.log("Report output to "+report_htmlfile);
              }
            }); 
           }); 
          }); 
         }); 
        }); 
       }); 
      }); 
     }); 
    });
   });
});

