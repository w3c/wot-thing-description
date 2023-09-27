/* Process assertions in index.html, combine with configuration
 * and test results data, and generate an implementation report.   
 * See testing/README.md
 */

// Dependencies
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const csvtojson=require('csvtojson'); // V2

// Parameters
//=======================================================================
const config = JSON.parse(fs.readFileSync("./implrep_config.json").toString());

//==== Flags

// include test specs appendix in report
const show_test_specs = (undefined != config.show_test_specs) ?
  config.show_test_specs : false;                                       

// include interop test results in report
const show_interop_results = (undefined != config.show_interop_results) ?
  config.show_interop_results : false;                                  

//==== Directories

// source directory (location of specification)
const src_dir = (undefined != config.src_dir) ?
  path.join(__dirname,config.src_dir) : __dirname;

// testing directory 
const testing_dir_rel = (undefined != config.testing_dir_rel) ?
  config.testing_dir_rel : "testing";                            
const testing_dir = (undefined != config.testing_dir) ?
  path.join(__dirname,config.testing_dir) : path.join(src_dir,testing_dir_rel);                            

// target directory for report output
const report_dir = (undefined != config.report_dir) ?
  path.join(__dirname,config.report_dir) : testing_dir;                                      

// location of other inputs
const inputs_dir_rel = (undefined != config.inputs_dir_rel) ?
  config.inputs_dir_rel : "inputs";                            
const inputs_dir = (undefined != config.inputs_dir) ?
  path.join(__dirname,config.inputs_dir) : path.join(testing_dir, inputs_dir_rel);                 

// location of HTML templates
const templates_dir_rel = (undefined != config.templates_dir_rel) ?
  config.templates_dir_rel : "templates";                            
const templates_dir = (undefined != config.templates_dir) ?
  path.join(__dirname,config.templates_dir) : path.join(inputs_dir, templates_dir_rel);            

// implementation descriptions
const descs_dir_rel = (undefined != config.descs_dir_rel) ?
  config.descs_dir_rel : "implementations";                            
const descs_dir = (undefined != config.descs_dir) ?
  path.join(__dirname,config.descs_dir) : path.join(inputs_dir, descs_dir_rel);          

// test results for each assertion and impl
const results_dir_rel = (undefined != config.results_dir_rel) ?
  config.results_dir_rel : "results";                            
const results_dir = (undefined != config.results_dir) ?
  path.join(__dirname,config.results_dir) : path.join(inputs_dir, results_dir_rel);                

// interop test results directory
const interop_dir_rel = (undefined != config.interop_dir_rel) ?
  config.interop_dir_rel : "interop";                            
const interop_dir = (undefined != config.interop_dir) ?
  path.join(__dirname,config.interop_dir) : path.join(inputs_dir, interop_dir_rel);                

//==== Inputs

// source specification (rendered)
const src_htmlfile_rel = (undefined != config.src_htmlfile_rel) ?
  config.src_htmlfile_rel : "index.html";               
const src_htmlfile = (undefined != config.src_htmlfile) ?
  path.join(__dirname,config.src_htmlfile) : path.join(src_dir, src_htmlfile_rel);               

// report template
const rt_htmlfile_rel = (undefined != config.rt_htmlfile_rel) ?
  config.rt_htmlfile_rel : "report.html";               
const rt_htmlfile = (undefined != config.rt_htmlfile) ?
  path.join(__dirname,config.rt_htmlfile) : path.join(templates_dir, rt_htmlfile_rel);         

// testspec template
const tt_htmlfile_rel = (undefined != config.tt_htmlfile_rel) ?
  config.tt_htmlfile_rel : "testspec.html";       
const tt_htmlfile = (undefined != config.tt_htmlfile) ?
  path.join(__dirname,config.tt_htmlfile) : path.join(templates_dir, tt_htmlfile_rel);       

// interop template
const it_htmlfile_rel = (undefined != config.it_htmlfile_rel) ?
  config.it_htmlfile_rel : "interop.html";        
const it_htmlfile = (undefined != config.it_htmlfile) ?
  path.join(__dirname,config.it_htmlfile) : path.join(templates_dir, it_htmlfile_rel);        

// test specifications for assertions
const ts_htmlfile_rel = (undefined != config.ts_htmlfile_rel) ?
  config.ts_htmlfile_rel : "testspec.html";          
const ts_htmlfile = (undefined != config.ts_htmlfile) ?
  path.join(__dirname,config.ts_htmlfile) : path.join(inputs_dir, ts_htmlfile_rel);          

// extra non-spec assertions (e.g. child assertions)
const ea_htmlfile_rel = (undefined != config.ea_htmlfile_rel) ?
  config.ea_htmlfile_rel : "extra-asserts.html";     
const ea_htmlfile = (undefined != config.ea_htmlfile) ?
  path.join(__dirname,config.ea_htmlfile) : path.join(inputs_dir, ea_htmlfile_rel);     

// assertion dependencies
const depends_csvfile_rel = (undefined != config.depends_csvfile_rel) ?
  config.depends_csvfile_rel : "depends.csv";        
const depends_csvfile = (undefined != config.depends_csvfile) ?
  path.join(__dirname,config.depends_csvfile) : path.join(inputs_dir, depends_csvfile_rel);        

// assertion categories
const categories_csvfile_rel = (undefined != config.categories_csvfile_rel) ?
  config.categories_csvfile_rel : "categories.csv";  
const categories_csvfile = (undefined != config.categories_csvfile) ?
  path.join(__dirname,config.categories_csvfile) : path.join(inputs_dir, categories_csvfile_rel);  

// at-risk assertions (input)
const atrisk_csvfile_rel = (undefined != config.atrisk_csvfile_rel) ?
  config.atrisk_csvfile_rel : "atrisk.csv";          
const atrisk_csvfile = (undefined != config.atrisk_csvfile) ?
  path.join(__dirname,config.atrisk_csvfile) : path.join(inputs_dir, atrisk_csvfile_rel);          

// structured implementation data
const impls_csvfile_rel = (undefined != config.impls_csvfile_rel) ?
  config.impls_csvfile_rel : "impl.csv";             
const impls_csvfile = (undefined != config.impls_csvfile) ?
  path.join(__dirname,config.impls_csvfile) : path.join(inputs_dir, impls_csvfile_rel);             

// assertions to be tested manually
const manual_csvfile_rel = (undefined != config.manual_csvfile_rel) ?
  config.manual_csvfile_rel : "manual.csv";         
const manual_csvfile = (undefined != config.manual_csvfile) ?
  path.join(__dirname,config.manual_csvfile) : path.join(testing_dir, manual_csvfile_rel);         

// assertions to be suppressed from IR
const suppressed_csvfile_rel = (undefined != config.suppressed_csvfile_rel) ?
  config.suppressed_csvfile_rel : "suppressed.csv"; 
const suppressed_csvfile = (undefined != config.suppressed_csvfile) ?
  path.join(__dirname,config.suppressed_csvfile) : path.join(testing_dir, suppressed_csvfile_rel); 

//==== Outputs 

// report filename
const report_htmlfile_rel = (undefined != config.report_htmlfile_rel) ?
  config.report_htmlfile_rel : "report.html";
const report_htmlfile = (undefined != config.report_htmlfile) ?
  path.join(__dirname,config.report_htmlfile) : path.join(report_dir, report_htmlfile_rel);

// all assertions
const report_csvfile_rel = (undefined != config.report_csvfile_rel) ?
  config.report_csvfile_rel : "template.csv";
const report_csvfile = (undefined != config.report_csvfile) ?
  path.join(__dirname,config.report_csvfile) : path.join(report_dir, report_csvfile_rel);

// at-risk assertion styling
const atrisk_cssfile_rel = (undefined != config.atrisk_cssfile_rel) ?
  config.atrisk_cssfile_rel : "atrisk.css";         
const atrisk_cssfile = (undefined != config.atrisk_cssfile) ?
  path.join(__dirname,config.atrisk_cssfile) : path.join(testing_dir, atrisk_cssfile_rel);         

// at-risk assertions (output)
const atrisk_out_csvfile_rel = (undefined != config.atrisk_out_csvfile_rel) ?
  config.atrisk_out_csvfile_rel : "atrisk.csv";         
const atrisk_out_csvfile = (undefined != config.atrisk_out_csvfile) ?
  path.join(__dirname,config.atrisk_out_csvfile) : path.join(testing_dir, atrisk_out_csvfile_rel);     

// Base URL to use for internal links (necessary since we use <base> in
// the HTML template to resolve hyperlinks included from index.html,
// so this needs to link back to the report from the location of that
// file...
const report_base = (undefined != config.report_base) ?
  config.report_base : ""; 
// path.join(report_dir, "report.html");

// Base URL for specification. 
// const src_base = "https://www.w3.org/TR/wot-thing-description";
const src_base = (undefined != config.src_base) ?
  config.src_base : "https://w3c.github.io/wot-thing-description";

// Whether or not to duplicate category and assertion in test spec appendix.
// Off by default since it is redundant, but is convenient sometimes.
const repeat_assertion_in_appendix = (undefined != config.repeat_assertion_in_appendix) ?
  config.repeat_assertion_in_appendix : false;

//==== Other

// Verbosity level
const verbosity = (undefined != config.verbosity) ?
  config.verbosity : 0;

//=======================================================================

// Map to track dependencies
var depends = new Map();

// Verbosity flags
const silent_v = (verbosity == 0);
const warn_v = (verbosity >= 1);
const info_v = (verbosity >= 2);
const chatty_v = (verbosity >= 3);
const debug_v = (verbosity >= 4);
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
var descs = {};
var desc_names = {};
var desc_files = fs.readdirSync(descs_dir);
function get_descs() {
   for (let fi=0; fi<desc_files.length; fi++) {
       var file = path.join(descs_dir, desc_files[fi]);
       if (file.match(/.html$/g)) {
           if (info_v) console.log("processing implementation descriptions in",file);
           let desc_raw = fs.readFileSync(file,'UTF-8');
           let desc_dom = cheerio.load(desc_raw);
           desc_dom('div[class="impl"]').each(function(i,elem) {
               let id = desc_dom(this).attr('id');
               if (undefined === id) {
                   console.log("Warning: implementation description file without id:\n",desc_dom(this).html());
               } else {
                   if (chatty_v) console.log("Adding implementation description for",id);
                   if (debug_v) console.log("  implementation description is:\n",desc_dom(this).html());
                   descs[id] = desc_dom(this);
                   desc_names[id] = desc_dom("h4").text();
               }
           });
       }
   } 
}
get_descs();

// Initialize report document dom with template
// (Synchronous)
var report_template_raw = fs.readFileSync(rt_htmlfile, 'UTF-8');
const testspec_template_raw = fs.readFileSync(tt_htmlfile, 'UTF-8');
const interop_template_raw = fs.readFileSync(it_htmlfile, 'UTF-8');

// Set version date

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let lastModified = new Date();
let lastModifiedString = lastModified.getDate() + ' ' + monthNames[lastModified.getMonth()] + ' ' + lastModified.getFullYear();
report_template_raw = report_template_raw.replace("{{LastModified}}", lastModifiedString);

// Make conditional substitutions

if (show_test_specs) {
  report_template_raw = report_template_raw.replace("{{TestSpecTOC}}",
    '<li class="tocline"><a href="testing/report.html#testspecsB">Test specifications</a></li>');
  report_template_raw = report_template_raw.replace("{{TestSpec}}",testspec_template_raw); 
} else {
  report_template_raw = report_template_raw.replace("{{TestSpecTOC}}","");
  report_template_raw = report_template_raw.replace("{{TestSpec}}",""); 
}

if (show_interop_results) {
  report_template_raw = report_template_raw.replace("{{InteropTOC}}",
    '<li class="tocline">8.3 <a href="testing/report.html#test_interop">Interoperability results</a></li>');
  report_template_raw = report_template_raw.replace("{{Interop}}",interop_template_raw); 
} else {
  report_template_raw = report_template_raw.replace("{{InteropTOC}}","");
  report_template_raw = report_template_raw.replace("{{Interop}}",""); 
}

var report_dom = cheerio.load(report_template_raw);

// Read in index.html store as a dom
// (Synchronous)
const src_raw = fs.readFileSync(src_htmlfile, 'UTF-8');
var src_dom = cheerio.load(src_raw);

// Check if an dom object is in an array.  Does deep comparison.
// Used to check for assertion variants/duplicates.  We can't just 
// use the built-in Set since it does not do a deep compare and there
// is no way to customize it (insert swearing here).
function is_object_in_array(o,a) {
  let t1 = o.toString();
  for (let i=0; i<a.length; i++) {
    let t2 = a[i].toString();
    if (t1 == t2) return true;
  }
  return false;
}

// push a new item onto an array only if it is unique, using above
// deep compare to check for duplicates; return new array.
// also converts undefined values to arrays with just one element.
function push_uniq(a,o) {
  if (undefined === a) return [o];
  if (!is_object_in_array(o,a)) {
    a.push(o);
  }
  return a;
}

// Extract assertions
// Assertions are generally in spans or divs and a previous version
// of this code looked for those separately.  This version looks only for the 
// class, so in theory it could be used in other tags.  However, to avoid
// conflicts with other classes it is still recommended to use separate spans/divs
// for assertions.   This code also looks for all assertion classes at once, including
// table and default assertions, rather than separately, in an attempt to preserve the order.  
// In order to avoid breaking other code, the index of each id is maintained in a separate map.
// This index is then used later to sort results.
//
// What makes indexing annoyingly complicated is the presence of child assertions, some
// of which (not all) appear in the body, but some of which are given as "extra" assertions
// in a separate input file (these break complex assertions down into more testable components).
// We'd *like* these to appear in order directly after their parent
// but the ones in the separate document aren't scanned at
// the same time.  The solution is to use indexes of the form i.x for child assertions
// with i being the index of the parent assertions and the x being between 01 and 99 (max
// of 98 child assertions).
// (Synchronous)
var assertion_index = {};
var max_child_assertion_index = {};
var max_assertion_index = 1; // start indices at 1, consistent with children starting at .01
var src_assertions = {};
var tab_assertions = {};
var def_assertions = {};
src_dom('.rfc2119-assertion, .rfc2119-table-assertion, .rfc2119-default-assertion').each(function(i,elem) {
    let id = src_dom(this).attr('id');
    let cl = src_dom(this).attr('class');
    if ("rfc2119-assertion" === cl) {
        if (undefined === id) {
            if (warn_v) console.log("WARNING: rfc2119-assertion without id:",src_dom(this).html());
        } else {
            src_assertions[id] = push_uniq(src_assertions[id],src_dom(this));
            if (id.indexOf('_') > -1) { // is this a child assertion?
                let p_id = id.substr(0,id.indexOf('_')); // find parent id
                let p_ix = assertion_index[p_id]; // find parent index
                if (undefined == p_ix) {
                    if (warn_v) console.log("WARNING: Child assertion "+a+" defined before parent:",src_dom(this).html);
                } else {
                    // find last child assertion assigned, increment it, and assign it
                    max_child_assertion_index[p_id] += 1;
                    let c_ix = p_ix + max_child_assertion_index[p_id]/100.0;
                    assertion_index[id] = c_ix;
                }
            } else {
                // new parent assertion
                assertion_index[id] = max_assertion_index;
                max_assertion_index = max_assertion_index+1;
                max_child_assertion_index[id] = 0; // for any possible future children
            }
        }
    }
    if ("rfc2119-table-assertion" === cl) {
        if (undefined === id) {
            if (warn_v) console.log("WARNING: rfc2119-table-assertion without id:", src_dom(this).html());
        } else {
            let assertion_data = src_dom(this).children('td').map(function(i, el) {
                return src_dom(this).html();
            }).get();
            console.log("TTTTABLE " + assertion_data[2]);
            let assertion = '<span class="rfc2119-table-assertion">' 
                          + assertion_data[0]         // vocab term
                          + ': ' + assertion_data[1]  // vocab text
                          + (("mandatory" === assertion_data[2]) ? '<hr/>\nMUST be included.' : '<hr/>\nMAY be included.')
                          + (("." === assertion_data[3]) ? '' : '\nType: '+assertion_data[3]+'.')
                          +'</span>';
            if (chatty_v) console.log("table assertion",id,"added");
            if (debug_v) console.log("  text:",assertion);
            tab_assertions[id] = push_uniq(tab_assertions[id],cheerio.load(assertion)("span"));
            if (id.indexOf('_') > -1) { // is this a child assertion?
                let p_id = id.substr(0,id.indexOf('_')); // find parent id
                let p_ix = assertion_index[p_id]; // find parent index
                if (undefined == p_ix) {
                    if (warn_v) console.log("WARNING: Child assertion "+a+" defined before parent:",src_dom(this).html);
                } else {
                    // find last child assertion assigned, increment it, and assign it
                    max_child_assertion_index[p_id] += 1;
                    let c_ix = p_ix + max_child_assertion_index[p_id]/100.0;
                    assertion_index[id] = c_ix;
                }
            } else {
                // new parent assertion
                assertion_index[id] = max_assertion_index;
                max_assertion_index = max_assertion_index+1;
                max_child_assertion_index[id] = 0; // for any possible future children
            }
        }
    }
    if ("rfc2119-default-assertion" === cl) {
        if (undefined === id) {
            if (warn_v) console.log("WARNING: rfc2119-default-assertion without id:", src_dom(this).html());
        } else {
            let assertion_data = src_dom(this).children('td').map(function(i, el) {
                return src_dom(this).html();
            }).get();
            let assertion = '<span class="rfc2119-default-assertion">' 
                          + 'The value associated with member '
                          + '"<code>'
                          + assertion_data[1]  // vocab term
                          + '</code>"'
                          + ' if not given MUST be assumed to have the default value ' 
                          + '"<code>' 
                          + assertion_data[2]  // default value
                          + '</code>".' 
                          +'</span>';
            let contexts = assertion_data[0];
            if (undefined !== contexts && "null" !== contexts) {
               // get rid of any markup (convert to spaces)
               contexts = contexts.replace(/<\/?[a-zA-Z]+>/gi,' ');
            }
            depends.set(id,{
              "parents": "td-serialization-default-values",
              "contexts": contexts
            });
            if (chatty_v) console.log("default assertion",id,"added");
            if (debug_v) console.log("  text:",assertion);
            def_assertions[id] = push_uniq(def_assertions[id],cheerio.load(assertion)("span"));
            if (id.indexOf('_') > -1) { // is this a child assertion?
                let p_id = id.substr(0,id.indexOf('_')); // find parent id
                let p_ix = assertion_index[p_id]; // find parent index
                if (undefined == p_ix) {
                    if (warn_v) console.log("WARNING: Child assertion "+a+" defined before parent:",src_dom(this).html);
                } else {
                    // find last child assertion assigned, increment it, and assign it
                    max_child_assertion_index[p_id] += 1;
                    let c_ix = p_ix + max_child_assertion_index[p_id]/100.0;
                    assertion_index[id] = c_ix;
                }
            } else {
                // new parent assertion
                assertion_index[id] = max_assertion_index;
                max_assertion_index = max_assertion_index+1;
                max_child_assertion_index[id] = 0; // for any possible future children
            }
        }
    }
});

// Read in extra assertions and store as a dom
// (Synchronous)
const ea_raw = fs.readFileSync(ea_htmlfile, 'UTF-8');
var ea_dom = cheerio.load(ea_raw);

// Extract extra assertions, store in map
// (Synchronous)
var extra_assertions = {};
ea_dom('.rfc2119-assertion').each(function(i,elem) {
    let id = ea_dom(this).attr('id');
    if (undefined === id) {
        if (warn_v) console.log("WARNING: rfc2119-assertion without id:", ea_dom(this).html());
    } else {
        extra_assertions[id] = push_uniq(extra_assertions[id],ea_dom(this));
        if (id.indexOf('_') > -1) { // is this a child assertion?
            let p_id = id.substr(0,id.indexOf('_')); // find parent id
            let p_ix = assertion_index[p_id]; // find parent index
            if (undefined == p_ix) {
                if (warn_v) console.log("WARNING: Child assertion "+a+" defined before parent:",ea_dom(this).html);
            } else {
                // find last child assertion assigned, increment it, and assign it
                max_child_assertion_index[p_id] += 1;
                let c_ix = p_ix + max_child_assertion_index[p_id]/100.0;
                assertion_index[id] = c_ix;
            }
        } else {
            // new parent assertion
            assertion_index[id] = max_assertion_index;
            max_assertion_index = max_assertion_index+1;
            max_child_assertion_index[id] = 0; // for any possible future children
        }
    }
});

// Utility function to format indices
// If an integer, format without decimals.  If not an integer, format with two decimal places.
// Returns a string.
function fIx(ix) {
  let rix = Math.round(ix);
  if (rix == ix) return ix.toString(); // is an integer
  return ix.toFixed(2);
}

// Get all results, convert from CSV to JSON, Merge
// Note: this only looks at ID and Status columns.  Other columns are ignored.
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

// Get dependencies
// (Asynchronous)
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

// Get suppressed assertions
// (Asynchronous)
var suppressed = new Map();
function get_suppressed(done_callback) {
    if (info_v) console.log("processing suppressed assertions in",suppressed_csvfile);
    var filedata = fs.readFileSync(suppressed_csvfile).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let id = item["ID"];
                let st = item["Status"];
                if (undefined !== id && undefined !== st) {
                    suppressed.set(id,st);
                    if (chatty_v) console.log("add suppressed record for id",id+":",suppressed.get(id));
                } else {
                    if (warn_v) console.log("WARNING: suppressed record for id",id,"in unexpected format");
                }
            }
            done_callback();
        });
}

// Get manual assertions
// (Asynchronous)
var manual = new Map();
function get_manual(done_callback) {
    if (info_v) console.log("processing manual assertions in",manual_csvfile);
    var filedata = fs.readFileSync(manual_csvfile).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let id = item["ID"];
                let st = item["Status"];
                if (undefined !== id && undefined !== st) {
                    manual.set(id,st);
                    if (chatty_v) console.log("add manual record for id",id+":",manual.get(id));
                } else {
                    if (warn_v) console.log("WARNING: manual record for id",id,"in unexpected format");
                }
            }
            done_callback();
        });
}

// Get implementation data
// (Asynchronous)
var impls = new Map();
function get_impls(done_callback) {
    if (info_v) console.log("processing implementation data in",impls_csvfile);
    var filedata = fs.readFileSync(impls_csvfile).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let id = item["Implementation"];
                let org = item["Organization"];
                let name = item["Name"];
                let roles = item["Roles"];
                if (undefined !== roles) {
                    roles = roles.split(' ');
                }
                if (undefined !== id) {
                    impls.set(id,{
                        "org": org,
                        "name": name,
                        "roles": roles
                    });
                    if (chatty_v) console.log("add impl record for id",id+":",impls.get(id));
                } else {
                    if (warn_v) console.log("WARNING: impl record for id",id,"in unexpected format");
                }
            }
            done_callback();
        });
}

// At-Risk Items
// (Asynchronous)
var risks = new Map();
function get_risks(done_callback) {
    var risks_css = "";
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
                    risks_css += '#' + id + ' {\n'
                               + '  background-color: yellow;\n'
                               + '}\n';
                    if (chatty_v) console.log("add at-risk record for",id);
                } else {
                    if (warn_v) console.log("WARNING: at-risk record for id",id,"in unexpected format");
                }
            }
            fs.writeFileSync(atrisk_cssfile,risks_css);
            done_callback();
        });
}

// Interop Data
// (Asynchronous)
var interop = new Set();
var interop_producers = new Set();
var interop_consumers = new Set();
var interop_table = new Map();
function get_interop_file(interop_csvfile,done_callback) {
    if (info_v) console.log("processing interop data in",interop_csvfile);
    let filedata = fs.readFileSync(interop_csvfile).toString();
    csvtojson()
        .fromString(filedata)
        .then((data)=> {
            for (let i=0; i<data.length; i++) {
                let item = data[i];
                let producer = item["Producer"];
                let consumer = item["Consumer"];
                let security = item["Security"];
                let teststatus = item["Status"];
                if (undefined !== producer && 
                    undefined !== consumer &&
                    undefined !== security) {
                    interop.add({
                       "producer": producer,
                       "consumer": consumer,
                       "security": security
                    });
                    interop_producers.add(producer);
                    interop_consumers.add(consumer);
                    let entry_key = producer+"=>"+consumer;
                    let entry = interop_table.get(entry_key);
                    let new_entry = ("fail" === teststatus) 
                                    ? "Fail" : (("nosec" === security)
                                                ? "Pass" : "Secure"); 
                    if (undefined === entry) {
                        entry = new_entry; 
                        if (chatty_v) console.log("new interop record for",entry_key,"=",entry);
                    } else {
                        // Secure overrides "Pass" (but not "Fail"...)
                        if ("Secure" === entry && "Pass" === new_entry) {
                            entry = "Secure";
                        }
                        if ("Secure" === new_entry && "Pass" === entry) {
                            entry = "Secure";
                        }
                        if (chatty_v) console.log("update interop record for",entry_key,"=",entry);
                    }
                    interop_table.set(entry_key,entry);
                } else {
                    if (warn_v) console.log("WARNING: interop record in unexpected format:",item);
                }
            }
            done_callback();
        });
}
function get_interop_files(interop_files,done_callback) {
    if (debug_v) console.log("(D) interop files:",interop_files);
    if (0 == interop_files.length) {
        done_callback();	    
    }	    
    let interop_file = path.join(interop_dir,interop_files[0]); 
    if (debug_v) console.log("(D) interop file:",interop_file);
    if (interop_file.match(/.csv$/g)) {
        get_interop_file(interop_file,function() {
           if (interop_files.length > 1) {
               get_interop_files(interop_files.slice(1),done_callback);
           } else {
               done_callback();
           }
        });
    } else {
       if (interop_files.length > 1) {
           get_interop_files(interop_files.slice(1),done_callback);
       } else {
           done_callback();
       }
    }
}
function get_interops(done_callback) {
    let interop_files = fs.readdirSync(interop_dir);
    get_interop_files(interop_files,done_callback);
}

// Clear (well, write headers for) assertions table 
// (Synchronous)
fs.writeFileSync(report_csvfile,'"Index","ID","Status","Comment","Assertion"\n');

// Merge implementation descriptions
// (Asynchronous)
function merge_implementations(done_callback) {
  // insert implementation descriptions
  let i = 1;
  for (desc_id in descs) {
      let desc = descs[desc_id];
      let desc_name = desc_names[desc_id];
      report_dom('ul#systems-toc').append('<li class="tocline"></li>\n');
      let report_li = report_dom('ul#systems-toc>li:last-child');
      report_li.append('\n\t6.'+i+' <a href="'+report_base+'#'+desc_id+'">'+desc_name+'</a>');
      i++;
      report_dom('#systems-impl').append(desc);
  }
  done_callback();
}

// Merge interop table
// (Asynchronous)
function merge_interops(done_callback) {
  if (show_interop_results) {
		interop_consumers.forEach(function(consumer) {
				if (chatty_v) console.log("merge_interops consumer:",consumer);
				let report_tr = report_dom('table#testinterop>thead>tr:last-child');
				let impl = impls.get(consumer);
				let impl_org = "";
				let impl_name = "Unknown";
				if (undefined === impl) {
					 if (warn_v) console.log("no name available for impl",item);
				} else {
					 impl_org = impl.org;
					 impl_name = impl.name;
				}
				report_tr.append('\n\t<th class="rotate" id="'
												 +consumer
												 +'"><div><span>'
												 +impl_org
												 +'</span><br/><span>'
												 +impl_name
												 +'</span></div></th>\n');
		});
		interop_producers.forEach(function(producer) { 
				let impl = impls.get(producer);
				let impl_org = "";
				let impl_name = "Unknown";
				if (undefined === impl) {
					 if (warn_v) console.log("no name available for impl",producer);
				} else {
					 impl_org = impl.org;
					 impl_name = impl.name;
				}
				let report_tr = report_dom('table#testinterop>tbody:last-child');
				report_tr.append('\n<tr><th id="'
												 +producer
												 +'">'
												 + impl_org
												 + '<br/>'
												 + impl_name
												 +'</th></tr>');
				interop_consumers.forEach(function(consumer) {
						let pair_id = producer+"=>"+consumer;
						let item_status = interop_table.get(pair_id);
						let report_elem = report_dom('table#testinterop>tbody>tr:last-child');
						if (undefined === item_status) {
								report_elem.append('\n\t<td class="notimpl">Not Impl</td>');
						} else if ("Secure" === item_status) {
								report_elem.append('\n\t<td class="secure">'+item_status+'</td>');
						} else if ("Pass" === item_status) {
								report_elem.append('\n\t<td class="passed">'+item_status+'</td>');
						} else {
								report_elem.append('\n\t<td class="failed">'+item_status+'</td>');
						}
				});
		});
  }
  done_callback();
}

// Merge assertions into a single array
// (Asynchronous)
var assertion_array = [];

function merge_assertions(assertions,ac,done_callback) {
  // insert assertions
  for (a_id in assertions) {
    let n = assertions[a_id].length;
    for (let i = 0; i < n; i++) { 
      a_dom = assertions[a_id][i];
      let assertion_object = {};
      let a = a_id;
      if (n > 1) a += "-" + (i+1);
      if (chatty_v) console.log("Processing assertion "+a);

      assertion_object.ix = assertion_index[a];
      assertion_object.id = a;
      assertion_object.ac = ac;
      assertion_object.text = a_dom.text();
 
      assertion_array.push(assertion_object);
    }
  }
  done_callback();
}

// Scan assertions to identify children; clear parents
// of such child assertions, then rescan and assign to 
// parent the minimum pass and maximum fails of any child.
function process_children(done_callback) {
  // Find set of all parents
  let n = assertion_array.length;
  let ps = new Set();
  for (let i = 0; i < n; i++) { 
    a = assertion_array[i].id;
    if (undefined === suppressed.get(a)) { 
      if (a.indexOf('_') > -1) {
        let p = a.substr(0,a.indexOf('_'));
        ps.add(p);
      }
    }
  }
  console.log(ps);
  // for every parent, clear data in merged assertions 
  ps.forEach( p => {
    merged_results.set(p,undefined);
  });
  // rescan children, rederive parent's scores
  for (let i = 0; i < n; i++) { 
    a = assertion_array[i].id;
    if (undefined === suppressed.get(a)) { 
     if (a.indexOf('_') > -1) {
      let p = a.substr(0,a.indexOf('_'));
      let rp = merged_results.get(p);
      let rc = merged_results.get(a);
      if (undefined === rp) {
        if (undefined !== rc) merged_results.set(p,rc);
      } else {
        if (undefined !== rc) {
          let rp_pass = (undefined === rp.pass) ? 0 : rp.pass;
          let rp_fail = (undefined === rp.fail) ? 0 : rp.fail;
          let rp_notimpl = (undefined === rp.notimpl) ? 0 : rp.notimpl;
          let rc_pass = (undefined === rc.pass) ? 0 : rc.pass;
          let rc_fail = (undefined === rc.fail) ? 0 : rc.fail;
          let rc_notimpl = (undefined === rc.notimpl) ? 0 : rc.notimpl;
          merged_results.set(p,{
            "pass": Math.min(rp_pass, rc_pass),
            "fail": Math.max(rp_fail, rc_fail),
            "notimpl": Math.max(rp_notimpl, rc_notimpl)
          });
        }
      }
     }
    }
  }
  // next
  done_callback();
}

function format_assertions(done_callback) {
  assertion_array.sort((a,b) => {
    return (a.ix < b.ix) ? -1 : ((a.ix > b.ix) ? 1 : 0); 
  });
  let n = assertion_array.length;
  for (let i = 0; i < n; i++) { 
    let ix = assertion_array[i].ix;
    let a = assertion_array[i].id;
    let ac = assertion_array[i].ac;
    let a_text = assertion_array[i].text;
    a_text = a_text.replace(/[\r\n]/gm,' ').trim(); // clean up newlines 
    a_text = a_text.replace(/[ \t]+/gm,' '); // replace tabs and multiple spaces with one space
    a_text = a_text.trim(); // trim white space at start and end
    let qa_text = a_text.replace(/"/gm,'""'); // escape quotes (for CSV)

    // Determine if assertion is suppressed
    if (undefined !== suppressed.get(a)) { 
      if (chatty_v) console.log("Suppressing assertion "+a);
    } else {
      // Determine if is manual assertion
      let ma = (undefined !== manual.get(a));
      let tid = (ma ? "manualresults" : "testresults");

      if (chatty_v) console.log("Formatting assertion "+a);

      // Assertions table
      fs.appendFileSync(report_csvfile, fIx(ix)+',"'+a+'","null",,"'+qa_text+'"\n');

      if (show_test_specs) {
        // Test Specifications Appendix
        report_dom('#testspecs').append('\n<dt></dt>');
        let report_dt = report_dom('#testspecs>dt:last-child');
        report_dt.append('\n\t<a href="'+report_base+'#'+a+'">'+fIx(ix)+': '+a+'</a>:');
        if ("tabassertion" === ac) {
          report_dt.append(' <em>(table)</em>');
        }
        if ("extraassertion" === ac) {
          report_dt.append(' <em>(extra)</em>');
        }
      }

      let category = undefined;
      let req = false;
      {
        if (a_text.indexOf('MUST') > -1) {
          if (a_text.indexOf('MUST NOT') > -1) {
            category = 'MUST NOT';
          } else {
            category = 'MUST';
          }
          req = true;
        }
        if (a_text.indexOf('SHOULD') > -1) {
          if (a_text.indexOf('SHOULD NOT') > -1) {
            category = 'SHOULD NOT';
          } else {
            category = 'SHOULD';
          }
        }
        if (a_text.indexOf('MAY') > -1) {
          category = 'MAY';
        }
        if (a_text.indexOf('REQUIRED') > -1) {
          category = 'REQUIRED';
          req = true;
        }
        if (a_text.indexOf('RECOMMENDED') > -1) {
          category = 'RECOMMENDED';
        }
        if (a_text.indexOf('OPTIONAL') > -1) {
          category = 'OPTIONAL';
        }

        if (undefined === category) {
          if (warn_v) console.log("WARNING: RFC2119 category is not defined for",a);
        }
        if (show_test_specs) {
          if (repeat_assertion_in_appendix) {
            if (undefined === category) {
              report_dt.append(': <strong>category is undefined</strong>');
            } else {
              report_dt.append(': <strong>'+category+'</strong>');
            }
          }
        }
      }
  
      // Make table row
      let d = depends.get(a);
      report_dom('table#'+tid+'>tbody:last-child')
        .append('\n<tr id="'+a+'" class="'+ac+'"></tr>');
      let report_tr = report_dom('tr#'+a);

      // Generated subassertions still must link to the actual assertion in the TD spec
      let a_frag = a;
      if (a_frag.indexOf("_") !== -1) {
        a_frag = a_frag.split("_")[0];
      }

      // ID
      report_tr.append('\n\t<td class="'+ac+'"><a target="spec" href="'+src_base+'#'+a_frag+'">'+fIx(ix)+': '+a+'</a></td>');

      // Category
      if (undefined != categories.get(a)) {
        report_tr.append('\n\t<td class="'+ac+'">'+categories.get(a)+'</td>\n');
      } else {
        report_tr.append('\n\t<td class="'+ac+'"></td>');
      }

      // Required pass threshold
      let pass_threshold;
      if (req) {
        report_tr.append('\n\t<td class="'+ac+'">Y</td>');
        pass_threshold = 2;
      } else {
        report_tr.append('\n\t<td class="'+ac+'">N</td>');
        // pass_threshold = 1;
        pass_threshold = 2;
      }

      // Context(s)
      if (undefined != d) {
        let c = d.contexts;
        if (undefined != c && "null" !== c) {
          let cs = c.split(' ');
          let h = '\n\t<td class="'+ac+'">';
          for (let i=0; i<cs.length; i++) {
            if (0 != cs[i].trim().length) {
              if (cs[i].trim().startsWith("(")) {
                // no link for higher-level contexts such as TD Producers
                h = h + '\n\t\t' + cs[i] + '<br/>';
              } else {
                // link in column 4 to TD spec context -- must point to TD spec, where fragments are lower case
                h = h + '\n\t\t<a target="spec" href="'+src_base+'#' + cs[i].toLowerCase() + '">' + cs[i] + '</a><br/>';
              }
            }
          }
          report_tr.append(h+'\n\t</td>');
        } else {
          report_tr.append('\n\t<td class="'+ac+'"></td>');
        }
      } else {
        report_tr.append('\n\t<td class="'+ac+'"></td>');
      }

      // Assertion
      if (undefined != risks.get(a)) {
        report_tr.append('\n\t<td class="atrisk">'+a_text+'</td>');
      } else {
        report_tr.append('\n\t<td class="'+ac+'">'+a_text+'</td>');
      }

      // Parent(s)
      if (undefined != d) {
        let p = d.parents;
        if (undefined != p && "null" !== p) {
          // mk: I cannot see how there should be multiple parents and there is no such case currently
          let ps = p.split(' ');
          let h = '\n\t<td class="'+ac+'">';
          for (let i=0; i<ps.length; i++) {
            if (0 != ps[i].trim().length) {
              // link in column 6 to base assertion
              h = h + '\n\t\t<a href="'+report_base+'#' + ps[i] + '">' + ps[i] + '</a><br>';
            }
          }
          report_tr.append(h+'\n\t</td>');
        } else {
          report_tr.append('\n\t<td class="'+ac+'"></td>');
        }
      } else {
        report_tr.append('\n\t<td class="'+ac+'"></td>');
      }

      // Test Results
      let result = merged_results.get(a);
      if (undefined != result) {
        // Number of reported pass statuses
        let pass = result.pass;
        if (undefined != pass) {
          if (pass >= pass_threshold) {
            report_tr.append('\n\t<td class="result '+ac+'">'+pass+'</td>');
          } else {
            if (pass == 0) {
              report_tr.append('\n\t<td class="result missing">'+pass+'</td>');
            } else {
              report_tr.append('\n\t<td class="result failed">'+pass+'</td>');
            }
          }
        } else {
          report_tr.append('\n\t<td class="result missing">0</td>');
          pass = 0;
        }
        // Number of reported fail statuses
        let fail = result.fail;
        if (undefined != fail) {
          if (fail > 0) {
            report_tr.append('\n\t<td class="result failed">'+fail+'</td>');
          } else {
            report_tr.append('\n\t<td class="result '+ac+'">'+fail+'</td>');
          }
        } else {
          report_tr.append('\n\t<td class="result '+ac+'">0</td>');
          fail = 0;
        }
        // Number of reported not implemented statuses
        let notimpl = result.notimpl;
        if (undefined != notimpl) {
          report_tr.append('\n\t<td class="result '+ac+'">'+notimpl+'</td>');
        } else {
          report_tr.append('\n\t<td class="result '+ac+'">0</td>');
          notimpl = 0;
        }
        // Total number of reported statuses
        let totals = pass + fail + notimpl;
        if (0 == totals) {
          report_tr.append('\n\t<td class="result missing">0</td>');
        } else if (totals < 2) {
          report_tr.append('\n\t<td class="result failed">'+totals+'</td>');
        } else {
          report_tr.append('\n\t<td class="result '+ac+'">'+totals+'</td>');
        }
      } else {
        report_tr.append('\n\t<td class="result missing">0</td>');
        report_tr.append('\n\t<td class="result missing">0</td>');
        report_tr.append('\n\t<td class="result missing">0</td>');
        report_tr.append('\n\t<td class="result missing">0</td>');
      }

      // Add to test spec appendix
      if (show_test_specs) {
        report_dom('#testspecs').append('\n<dd id="'+a+'" class="'+ac+'"></dd>');
        let report_dd = report_dom('dd#'+a);
        if (repeat_assertion_in_appendix) {
          report_dd.append(a_text);
          report_dd.append('\n\t<br/>');
        }
        a_spec = testspec[a];
        report_dd.append('\n\t<span></span>');
        let report_li = report_dom('dd#'+a+'>span:last-child');
        if (undefined === a_spec) {
          if (warn_v) console.log("WARNING: no test spec for",a);
          report_li.append('\n\t\t<p><strong>NO TEST SPECIFICATION</strong></p>');
        } else {
          report_li.append('\n\t\t'+a_spec);
        }
      }
    }
  }
  done_callback(false); // success
}

function output_atrisk(done_callback) {
  let stream = fs.createWriteStream(atrisk_out_csvfile,{flags:'w'});
  stream.write('"Index","ID","Fix"\n');
  let n = assertion_array.length;
  for (let i = 0; i < n; i++) { 
    let ix = assertion_array[i].ix;
    let a = assertion_array[i].id;
    let ac = assertion_array[i].ac;
    let a_text = assertion_array[i].text;

    // Determine if assertion is suppressed
    if (undefined !== suppressed.get(a)) { 
      if (chatty_v) console.log("Suppressing assertion "+a);
    } else {
      if (chatty_v) console.log("Analysing assertion "+a);

      let category = undefined;
      let req = false;
      if (a_text.indexOf('MUST') > -1) req = true;
      if (a_text.indexOf('REQUIRED') > -1) req = true;

      // get depends
      let d = depends.get(a);

      // Compute required threshold
      let pass_threshold;
      if (req) {
        pass_threshold = 2;
      } else {
        // pass_threshold = 1;
        pass_threshold = 2;
      }

      // Test Results
      let result = merged_results.get(a);
      if (undefined === result) {
        stream.write(fIx(ix)+',"'+a+'","HELP, no results"\n');
      } else {
        // Check number of reported pass statuses
        let pass = result.pass;
        if (undefined === pass) {
          stream.write(fIx(ix)+',"'+a+'","HELP, pass undefined"\n');
        } else {
          if (pass < pass_threshold) {
            stream.write(fIx(ix)+',"'+a+'","HELP, pass='+pass+'"\n');
          }
        }
      }
    }
  }
  stream.end();
  done_callback(false); // success
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
       if (chatty_v) console.log("categories: ",categories);
       get_manual(function() {
        if (chatty_v) console.log("manual: ",manual);
        get_suppressed(function() {
         if (chatty_v) console.log("suppressed: ",suppressed);
         get_impls(function() {
          if (chatty_v) console.log("impls: ",impls);
          get_interops(function() {
           if (chatty_v) {
            console.log("interop: ",interop);
            console.log("interop producers: ",interop_producers);
            console.log("interop consumers: ",interop_consumers);
            console.log("interop table: ",interop_table);
           }
           merge_implementations(function() {
            merge_interops(function() {
             merge_assertions(src_assertions,"baseassertion",function() {
              merge_assertions(tab_assertions,"tabassertion",function() {
               merge_assertions(def_assertions,"defassertion",function() {
                merge_assertions(extra_assertions,"extraassertion",function() {
                 process_children(function() {
                  format_assertions(function() {
                   // Output report
                   fs.writeFile(report_htmlfile, report_dom.html(), function(error) {
                    if (error) {
                     return console.log(err);
                    } else {
                     if (info_v) console.log("Report output to "+report_htmlfile);
                     // Output at-risk items
                     output_atrisk(function(error) {
                      if (error) {
                       return console.log(err);
                      } else {
                       if (info_v) console.log("Flagged atrisk assertions output to "+atrisk_out_csvfile);
                      }
                     }); 
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
        }); 
       }); 
      }); 
     });
    });
  });
});

