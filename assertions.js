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
// TODO: allow these to be specified with options, eg with commander

// Directories
const src_dir = __dirname;
const testing_dir = path.join(__dirname, "testing");                 // test data directory
const report_dir = testing_dir;                                      // target directory for report output
const inputs_dir = path.join(testing_dir, "inputs");                 // location of other inputs
const descs_dir = path.join(inputs_dir, "implementations");          // implementation descriptions
const results_dir = path.join(inputs_dir, "results");                // test results for each assertion and impl
const interop_dir = path.join(inputs_dir, "interop");                // interop test results directory


// Inputs
const src_htmlfile = path.join(src_dir, "index.html");               // source specification (rendered)
const template_htmlfile = path.join(inputs_dir, "template.html");    // report template
const ts_htmlfile = path.join(inputs_dir, "testspec.html");          // test specifications for assertions
const ea_htmlfile = path.join(inputs_dir, "extra-asserts.html");     // extra non-spec assertions

const depends_csvfile = path.join(inputs_dir, "depends.csv");        // assertion dependencies
const categories_csvfile = path.join(inputs_dir, "categories.csv");  // assertion categories
const atrisk_csvfile = path.join(inputs_dir, "atrisk.csv");          // at-risk assertions
const impls_csvfile = path.join(inputs_dir, "impl.csv");             // structured implementation data
//-----------------------------------------------------------------------

// Outputs
const report_htmlfile = path.join(report_dir, "report.html");
const results_csvfile = path.join(results_dir,"template.csv");

// Base URL to use for internal links (necessary since we use <base> in
// the HTML template to resolve hyperlinks included from index.html,
// so this needs to link back to the report from the location of that
// file...
const report_base = "file://"+path.join(report_dir, "report.html");

// Base URL for specification.  Empty since it is set in <base> in
// the HTML template.
const src_base = "";

// Whether or not to duplicate category and assertion in test spec appendix.
// Off by default since it is redundant, but is convenient sometimes.
const repeat_assertion_in_appendix = false;
//=======================================================================

// Verbosity level
const verbosity = 3;
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
                   desc_names[id] = desc_dom("h3").text();
               }
           });
       }
   } 
}
get_descs();

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
                      + (("yes" === assertion_data[2]) ? '<hr/>\nMUST be included.' : '<hr/>\nMAY be included.')
                      + (("." === assertion_data[3]) ? '' : '\nDefault: '+assertion_data[3]+'.')
                      + ('\nType: '+assertion_data[4]+'.')
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

// Get implementation data
// (Asynchronous)
var impls = new Map();
function get_impls(done_callback) {
    if (info_v) console.log("processing implementationt data in",impls_csvfile);
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

// Clear (well, write headers for) results template
// (Synchronous)
fs.writeFileSync(results_csvfile,'"ID","Status"\n');

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
      report_li.append('\n\t6.'+i+' <a href="'+report_base+'#'+desc_id+'" shape="rect">'+desc_name+'</a>');
      i++;
      report_dom('#systems-impl').append(desc);
  }
  done_callback();
}

// Merge interop table
// (Asynchronous)
function merge_interops(done_callback) {
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
         if (warn_v) console.log("no name available for impl",item);
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
    report_dom('#testspecs').append('\n<dt></dt>');
    let report_dt = report_dom('#testspecs>dt:last-child');
    report_dt.append('\n\t<a href="'+report_base+'#'+a+'">'+a+'</a>:');
    if ("tabassertion" === ac) {
       report_dt.append(' <em>(table)</em>');
    }
    if ("extraassertion" === ac) {
       report_dt.append(' <em>(extra)</em>');
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
            }
            if (repeat_assertion_in_appendix) {
	        if (undefined === category) {
		    report_dt.append(': <strong>category is undefined</strong>');
	        } else {
		    report_dt.append(': <strong>'+category+'</strong>');
	        }
	    }
    }

    // retreive text of assertion
    a_text = assertions[a];

    // Table

    // ID
    report_dom('table#testresults>tbody:last-child')
        .append('\n<tr id="'+a+'" class="'+ac+'"></tr>');

    // Assertion
    let report_tr = report_dom('tr#'+a);
    report_tr.append('\n\t<td class="'+ac+'"><a target="spec" href="'+src_base+'#'+a+'">'+a+'</a></td>');
    if (undefined != categories.get(a)) {
       report_tr.append('\n\t<td class="'+ac+'">'+categories.get(a)+'</td>\n');
    } else {
       report_tr.append('\n\t<td class="'+ac+'"></td>');
    }
    if (undefined != risks.get(a)) {
       report_tr.append('\n\t<td class="atrisk">'+a_text+'</td>');
    } else {
       report_tr.append('\n\t<td class="'+ac+'">'+a_text+'</td>');
    }

    // Req
    if (req) {
        report_tr.append('\n\t<td class="'+ac+'">Y</td>');
    } else {
        report_tr.append('\n\t<td class="'+ac+'">N</td>');
    }

    // Parent(s) and Context(s)
    let d = depends.get(a);
    if (undefined != d) {
        let p = d.parents;
        if (undefined != p && "null" !== p) {
            let ps = p.split(' ');
            let h = '\n\t<td class="'+ac+'">';
            for (let i=0; i<ps.length; i++) {
                h = h + '\n\t\t<a href="'+report_base+'#' + ps[i] + '">' + ps[i] + '</a> ';
            }
            report_tr.append(h+'\n\t</td>');
        } else {
            report_tr.append('\n\t<td class="'+ac+'"></td>');
        }
        let c = d.contexts;
        if (undefined != c && "null" !== c) {
            let cs = c.split(' ');
            let h = '\n\t<td class="'+ac+'">';
            for (let i=0; i<cs.length; i++) {
                h = h + '\n\t\t<a href="'+report_base+'#' + cs[i] + '">' + cs[i] + '</a> ';
            }
            report_tr.append(h+'\n\t</td>');
        } else {
            report_tr.append('\n\t<td class="'+ac+'"></td>');
        }
    }

    // Test Results
    let result = merged_results.get(a);
    if (undefined != result) {
       // Number of reported pass statuses
       let pass = result.pass;
       if (undefined != pass) {
          if (pass >= 2) {
             report_tr.append('\n\t<td class="'+ac+'">'+pass+'</td>');
          } else {
             report_tr.append('\n\t<td class="failed">'+pass+'</td>');
          }
       } else {
          report_tr.append('\n\t<td class="missing"></td>');
	  pass = 0;
       }
       // Number of reported fail statuses
       let fail = result.fail;
       if (undefined != fail) {
          if (fail > 0) {
             report_tr.append('\n\t<td class="failed">'+fail+'</td>');
          } else {
             report_tr.append('\n\t<td class="'+ac+'">'+fail+'</td>');
          }
       } else {
          report_tr.append('\n\t<td class="'+ac+'"></td>');
	  fail = 0;
       }
       // Number of reported not implemented statuses
       let notimpl = result.notimpl;
       if (undefined != notimpl) {
          report_tr.append('\n\t<td class="'+ac+'">'+notimpl+'</td>');
       } else {
          report_tr.append('\n\t<td class="'+ac+'"></td>');
	  notimpl = 0;
       }
       // Total number of reported statuses
       let totals = pass + fail + notimpl;
       if (0 == totals) {
           report_tr.append('\n\t<td class="missing"></td>');
       } else if (totals < 2) {
           report_tr.append('\n\t<td class="failed">'+totals+'</td>');
       } else {
           report_tr.append('\n\t<td class="'+ac+'">'+totals+'</td>');
       }
    } else {
       report_tr.append('\n\t<td class="missing"></td>');
       report_tr.append('\n\t<td class="missing"></td>');
       report_tr.append('\n\t<td class="missing"></td>');
       report_tr.append('\n\t<td class="missing"></td>');
    }

    // Add to test spec appendix
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
        if (chatty_v) {
            console.log("categories: ",categories);
        }
       get_impls(function() {
         if (chatty_v) {
            console.log("impls: ",impls);
         }
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
  });
});

