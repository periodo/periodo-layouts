"use strict";

const Immutable = require('immutable')

module.exports = {
  label: 'Faceted browser',
  description: 'Create a browseable faceted classification based on all periods.',
  deriveOpts: require('./derive_opts'),
  renderer: require('./FacetBrowser'),
  defaultOpts: {
    minWidth: 300,
    resultsMaxHeight: 360,

    fields: Immutable.List(),
    selectedValues: Immutable.Map()
  }
}

