/* Merge test results.
 * Read from all assertion test results CSV files given on the
 * command line, send a merged file to stdout.
 *
 * For file format and usage, see testing/README.md and testing/results.
 *
 * Results mentioned in only one input will be output as-is. 
 * Results for the same assertion mentioned in more
 * than one file with different statuses will be combined 
 * as follows (order of inputs does not matter):
 *   {pass, fail} -> fail
 *   {not-impl, fail} -> fail
 *   {not-impl, pass} -> pass 
 * In other words, one failure in any test means the entire
 * result is considered a failure.  Passes also dominate
 * not-implemented statuses.
 *
 * The purpose of this script is to combine results
 * for a single implementation (eg from different test runs
 * or for different test cases) so each implementation is
 * counted only once in the implementation report.
 * Each file in testing/results is considered to be
 * for a separate implementation so results for such
 * multiple internal tests should be combined into a single
 * file before generating the implementation report.
 * 
 */

// Dependencies
const csvtojson=require('csvtojson'); // V2

// Parameters
const debug_v = false;

// Get all results from files, store in an array of JSON objects
// (Asynchronous)
function get_results(files,results,done_callback) {
    // handle boundary cases
    if (undefined === files || 0 == files.length) {
        done_callback(results);	    
    }	    
    // process one file, tail-recurse if more
    csvtojson().fromFile(files[0]).then((data) => {
        results.push(data);
        if (1 == files.length) {
            done_callback(results);
        } else {
            get_results(files.slice(1),results,done_callback);
        }
    });
}

function merge_results(results,done_callback) {
    let merged_results = new Map();
    for (let i=0; i<results.length; i++) {
        let data = results[i];
        for (let j=0; j<data.length; j++) {
           let id = data[j]["ID"];
	   let st = data[j]["Status"];
           let cm = data[j]["Comment"];
           if (undefined  === id) {
               console.error(new Error("Missing ID CSV header"));
               // Failure
               process.exit(1);
           }
           if (undefined  === st) {
               console.error(new Error("Missing Status CSV header"));
               // Failure
               process.exit(1);
           }
           if (undefined  === cm) {
               cm = "";
           }
           let current = merged_results.get(id);
           if (undefined === current) {
               merged_results.set(id,[st, cm]);
           } else {
               let current_st = current[0];
               let current_cm = current[1];
               if ("fail" === st || "fail" === current_st) {
                   // failure dominates anything else
                   merged_results.set(id,["fail", get_comment(st,current_st,"fail",cm,current_cm)]);
               } else if ("pass" === st || "pass" === current_st) {
                   // pass dominates not-impl
                   merged_results.set(id,["pass", get_comment(st,current_st,"pass",cm,current_cm)]);
               } else {
                   // No change actually needed, both must be "not-impl". 
                   // merged_results.set(id,st);
               }
           }
        }
    }
    done_callback(merged_results);
}

function get_comment(st,current_st,value_st,cm,current_cm) {
    let comment = "";
    if ((current_cm) && (value_st === current_st)) {
        comment = current_cm;
    }
    if ((cm) && (value_st === st)) {
        if ((comment) && (comment.indexOf(cm) < 0)) {
            comment = comment + " + " + cm;
        } else {
            comment = cm;
        }
    }
    return comment;
}

function output_results(merged_results) {
  process.stdout.write('"ID","Status","Comment"\n');
  merged_results.forEach((st,id) => {
     process.stdout.write('"'+id+'","'+st[0]+'","'+st[1]+'"\n');
  });
}

if (process.argv.length > 2) {
   let files = process.argv.slice(2);
   get_results(files,[],function(input_results) {
      if (debug_v) console.warn("input results:\n",input_results);
      merge_results(input_results,function(merged_results) {
          if (debug_v) console.warn("merged results:\n",merged_results);
          output_results(merged_results);
          // Success
          process.exit(0);
      });
   });
} else {
   // Usage
   console.warn("Usage:",process.argv[0],process.argv[1],"file1.csv file2.csv ...");
   console.warn("See testing/README.md and testing/results");
   process.exit(1);
}

