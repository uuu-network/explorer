const commandExistsSync = require('command-exists').sync;
const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const tmp = require('tmp');

const potentialSolvers = [
  {
    name: 'z3',
    params: ''
  },
  {
    name: 'cvc4',
    params: '--lang=smt2'
  }
];
const solvers = potentialSolvers.filter(solver => commandExistsSync(solver.name));

function solve (query) {
  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, query);
  // TODO For now only the first SMT solver found is used.
  // At some point a computation similar to the one done in
  // SMTPortfolio::check should be performed, where the results
  // given by different solvers are compared and an error is
  // reported if solvers disagree (i.e. SAT vs UNSAT).
  const solverOutput = execSync(solvers[0].name + ' ' + solvers[0].params + ' ' + tmpFile.name);
  // Trigger early manual cleanup
  tmpFile.removeCallback();
  return solverOutput.toString();
}

// This function checks the standard JSON output for auxiliaryInputRequested,
// where smtlib2queries represent the queries created by the SMTChecker.
// The function runs an SMT solver on each query and adjusts the input for
// another run.
// Returns null if no solving is requested.
function handleSMTQueries (inputJSON, outputJSON) {
  const auxInputReq = outputJSON.auxiliaryInputRequested;
  if (!auxInputReq) {
    return null;
  }

  const queries = auxInputReq.smtlib2queries;
  if (!queries || Object.keys(queries) === 0) {
    return null;
  }

  if (solvers.length === 0) {
    throw new Error('No SMT solver available. Assertion checking will not be performed.');
  }

  const responses = {};
  for (const query in queries) {
    responses[query] = solve(queries[query]);
  }

  // Note: all existing solved queries are replaced.
  // This assumes that all neccessary queries are quested above.
  inputJSON.auxiliaryInput = { smtlib2responses: responses };
  return inputJSON;
}

module.exports = {
  handleSMTQueries: handleSMTQueries
};
