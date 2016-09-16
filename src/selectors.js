"use strict";

const Immutable = require('immutable')
    , { createSelector } = require('reselect')

function keepItemsInSet(toKeep) {
  return set => set.filter((_, id) => toKeep.has(id))
}

const datasetSelector = state => state.dataset

const filtersByGroupSelector = state =>
  state.get('groups').map(group =>
    group.get('layouts').reduce((acc, layout) =>
      acc.map((setA, key) => {
        const setB = layout.getIn(['derived', key])

        return setB
          ? (setA || Immutable.Set()).union(setB)
          : setA
      }),
      Immutable.Map({ keptPeriods: null, keptCollections: null }))
  )

const datasetByGroupSelector = createSelector(
  datasetSelector,
  filtersByGroupSelector,
  (dataset, filtersByGroup) =>
    filtersByGroup
      .reduce((acc, filters) => {
        let nextDataset = acc.pop()

        const keptCollections = filters.get('keptCollections')
            , keptPeriods = filters.get('keptPeriods')

        if (keptCollections) {
          nextDataset = nextDataset
            .update('periodCollections', keepItemsInSet(keptCollections))
        }

        if (keptPeriods) {
          nextDataset = nextDataset
            .update('periodCollections', collections =>
              collections
                .map(c => c.update('definitions', keepItemsInSet(keptPeriods)))
                .filter(c => c.get('definitions').size > 0)
            )
        }

        return acc.push(nextDataset)
      }, Immutable.List.of([dataset]))
      .butLast()
)

module.exports = {
  datasetSelector,
  filtersByGroupSelector,
  datasetByGroupSelector
}
