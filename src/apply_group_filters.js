"use strict";

const Immutable = require('immutable')
    , { Filter } = require('./records')
    , noop = () => null


function keepItemsInSet(toKeep) {
  return set => set.filter((_, id) => toKeep.has(id))
}

function flattenFilters(type, filters) {
  return filters
    .map(f => f[type])
    .map(cs => Immutable.List().equals(cs) ? null : cs)
    .flatten()
    .toSet()
    .filter(x => x !== undefined)
}

module.exports = function applyGroupFilters(enabledLayouts, data, groups) {
  return groups.reduce((data, group) => {
    const filters = group
      .map(layout => {
        const { filterer=noop } = enabledLayouts[layout.name]

        return new Filter().merge(filterer(data, layout.options))
      })
      .filter(x => x)

    const keptCollections = flattenFilters('collections', filters)
        , keptPeriods = flattenFilters('periods', filters)

    if (keptCollections.size) {
      data = data.update('periodCollections', keepItemsInSet(keptCollections))
    }

    if (keptPeriods.size) {
      data = data.update('periodCollections', collections =>
        collections
          .map(c => c.update('definitions', keepItemsInSet(keptPeriods)))
          .filter(c => c.get('definitions').size > 0)
      )
    }

    return data;
  }, data)
}
