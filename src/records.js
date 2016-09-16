"use strict";

const Immutable = require('immutable')

const ApplicationState = Immutable.Record({
  editing: true,
  groups: Immutable.List([]),
  renderedGroups: Immutable.List([]),
  errors: Immutable.List(),
})


// These are all the assertions that can be derived from a layout given the
// combination of a set of options and a dataset. It is up to a layout to
// write a function with the signature:
//
// Dataset -> Options -> Derivations
//
// The output of the previous fn will also be passed, so the signature will
// actually be:
//
// Dataset -> Options -> Maybe Derivations -> Derivations
const Derivations = Immutable.Record({
  attributes: null,
  keptCollections: null,
  keptPeriods: null,
})

const Layout = Immutable.Record({
  name: null,
  options: Immutable.Map(),
  derived: new Derivations(),
})

const LayoutGroup = Immutable.Record({
  layouts: Immutable.List(),
  dataset: null,
})

module.exports = {
  ApplicationState,
  Output,
  Layout,
  LayoutGroup,
}
