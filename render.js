let fs = require('fs');
let rdf = require('rdfstore');
let dust = require('dustjs-helpers');
let jd = require("jsdom/lib/old-api.js");
//let jsdom = require("jsdom");



// extraction of rendering context from the RDF store

let classQuery = fs.readFileSync('ontology/class.sparql', 'UTF-8');
let fieldQuery = fs.readFileSync('ontology/field.sparql', 'UTF-8');
let subclassQuery = fs.readFileSync('ontology/subclass.sparql', 'UTF-8');

function context(store, cb) {
    store.execute(classQuery, function(err, bindings) {
		    console.log(err + " " + bindings);
        let classes = bindings.map(function(c) {
            c.fields = {
                query: fieldQuery.replace('?class', '<' + c.uri.value + '>'),
                defer: function(bindings) {
                    let fields = bindings.map(function(f) {
                        if (!f.otherClass && f.oc) {
                            // no label, take local name
                            let uri = f.oc.value;
                            f.otherClass = {
                                value: uri.substr(uri.lastIndexOf('#') + 1),
                                id: uri
                            };
                        } else if (f.otherClass) {
                            f.otherClass.id = '#' + f.otherClass.value.toLowerCase();
                        }
                        return f;
                    });
                    return fields;
                }
            };

            c.subclasses = {
                query: subclassQuery.replace('?class', '<' + c.uri.value + '>'),
                defer: function(bindings) {
                    let subclasses = bindings.map(function(sub) {
                        sub.subclass.id = '#' + sub.subclass.value.toLowerCase();
                        return sub;
                    });
                    return subclasses;
                }
            };

            return c;
        });

        // executes SPARQL queries in a serial fashion
        // TODO clean all this?
        let call = function(classes) {
            for (i in classes) {
                let c = classes[i];
                for (key in c) {
                    if (c[key].defer) {
                        let deferred = c[key];
                        store.execute(deferred.query, function(err, bindings) {
                            if (err) {
                                console.error(err);
                                // execution stopped
                            } else {
                                c[key] = deferred.defer(bindings);
                                call(classes);
                            }
                        });
                        return;
                    }
                }
            }
            cb({ classes: classes });
        };
        call(classes);
    });
}

// rendering

let vocSrc = fs.readFileSync('vocabulary.template', 'UTF-8');
let src = fs.readFileSync('index.html.template', 'UTF-8');

function render(context) {
    dust.renderSource(vocSrc, context, function(err, out) {
	
        let result = src.replace('{vocabulary.template}', out);
        fs.writeFileSync('index.html', result, 'UTF-8');
    });
}

// main function

let onto = fs.readFileSync('ontology/td.ttl', 'UTF-8');

rdf.create(function(err, store) {
    store.load('text/turtle', onto, function(err) {
 console.log(err + " "  );
        context(store, function(classes) {

		var orderedClasses = {classes : []};
		var i, s,  len = classes.classes.length;
		if(len >0) {
 			for (i=0; i<len; ++i) {

	   			if(classes.classes[i].label.value=="Thing")
					{
					orderedClasses.classes[0] = classes.classes[i];
					}
 			   	if(classes.classes[i].label.value=="InteractionPattern")
					{
					orderedClasses.classes[1] = classes.classes[i];
					}
 			   	if(classes.classes[i].label.value=="Property")
					{
					orderedClasses.classes[2] = classes.classes[i];
					}
 			   	if(classes.classes[i].label.value=="Action")
					{
					orderedClasses.classes[3] = classes.classes[i];
					}
 			   	if(classes.classes[i].label.value=="Event")
					{
					orderedClasses.classes[4] = classes.classes[i];
					}
		   		if(classes.classes[i].label.value=="DataSchema")
					{
					orderedClasses.classes[5] = classes.classes[i];
					}
		   		if(classes.classes[i].label.value=="Form")
					{
					orderedClasses.classes[6] = classes.classes[i];
					}
		   		if(classes.classes[i].label.value=="Security")
					{
					orderedClasses.classes[7] = classes.classes[i];
					}
	}

            render(orderedClasses);
	}
        });
    });
});


/*
// do some post processing ager index.html generating
var rawhtml = fs.readFileSync("index.html","utf8")

jd.env(
  rawhtml,
  ["https://code.jquery.com/jquery-1.10.2.js"],
  function (err, window) {
   // console.log(window.$("html").html())
    var $ = require('jquery')(window);
    //let t = $( "#interactionpattern" );
    $( "#interactionpattern" ).replaceWith( $( "#thing" ) );
    //$( "#thing" ).replaceWith( t );

 console.log(window.$( "#acknowledgements" ).html())
	fs.writeFile('index.html', window.document.documentElement.outerHTML,
                     function (error){
            if (error) throw error;
        });

  }

);*/
