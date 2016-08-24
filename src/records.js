"use strict";

const Immutable = require('immutable')


const Filter = Immutable.Record({
  collections: undefined,
  periods: undefined,
})

const Layout = Immutable.Record({
  name: undefined,
  options: Immutable.Map(),
})

module.exports = { Filter, Layout }
