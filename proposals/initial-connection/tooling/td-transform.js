// Takes a TD with initial connection information and transforms it to a TD 1.1

const tdInput = {};
let tdOutput = {};

// Find if there is a default in the root level

if (Object.hasOwn(tdInput, "form")) {
  const defaultForm = tdInput.form;
}

// Go into the forms and try to find each reference or inline

// separating inline security to secDef -> create sec1 as object key
// separating inline schema to schema definitions -> create schema1 as object key
