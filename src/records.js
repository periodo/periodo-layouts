"use strict";

const Immutable = require('immutable')

const ApplicationState = Immutable.Record({
  dataset: null,
  editing: true,
  groups: Immutable.List(),
  errors: Immutable.List(),
})

const Layout = Immutable.Record({
  name: null,
  opts: Immutable.Map(),
})

const LayoutGroup = Immutable.Record({
  layouts: Immutable.List(),
})

module.exports = {
  ApplicationState,
  Layout,
  LayoutGroup,
}
