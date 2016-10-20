"use strict";

const Immutable = require('immutable')

const noop = {}


function isReactComponent(obj) {
  return 'isReactComponent' in (obj.prototype || {})
}

function processGroups(
  enabledLayouts,
  baseDataset,
  unprocessedGroups,
  prevProcessedGroups=Immutable.List(),
  processFrom=0
) {
  return unprocessedGroups.reduce((acc, group, i) => {
    if (i < processFrom) {
      return acc.push(prevProcessedGroups.get(i))
    }

    let dataset

    if (i === 0) {
      dataset = baseDataset;
    } else {
      dataset = acc.last().get('dataset')

      const filters = acc.last()
        .get('layouts')
        .reduce((acc2, layout, j) => {
          const { makePeriodFilter } = enabledLayouts[layout.get('name')]

          return !makePeriodFilter
            ? acc2
            : acc2.push(
                makePeriodFilter(
                  acc.last().getIn(['layouts', j, 'derivedOpts'])))
        }, Immutable.List())

      if (filters.size) {
        dataset = dataset
          .update('periodCollections', periodCollections =>
            periodCollections
              .map((collection, collectionKey) =>
                collection.update('definitions', definitions =>
                  definitions
                    .filter((period, periodKey) =>
                      filters.every(f => f(period, periodKey, collection, collectionKey)))))
              .filter(collection => collection.get('definitions').size))
      }
    }

    const layouts = group.get('layouts').map((layout, j) => {
      const path = [i, 'layouts', j]
          , { name, opts } = unprocessedGroups.getIn(path).toObject()

      let prev = prevProcessedGroups.getIn(path)

      if (prev && name !== prev.get('name')) {
        prev = undefined;
      }

      const { deriveOpts=noop } = enabledLayouts[name]

      const noUpdateNeeded = (
        prev &&
        opts === prev.get('opts') &&
        name === prev.get('name') &&
        dataset === prevProcessedGroups.getIn([i, 'dataset'])
      )

      const nextDerivedOpts = (
        noUpdateNeeded
          ? prev.get('derivedOpts')
          : deriveOpts === noop
            ? opts
            : deriveOpts(
                (prev || Immutable.Map()).get('derivedOpts'),
                opts,
                dataset))

      return Immutable.Map({
        name,
        opts,
        derivedOpts: Immutable.Map(nextDerivedOpts)
      })
    })

    return acc.push(Immutable.Map({ dataset, layouts }));
  }, Immutable.List())
}

module.exports = {
  isReactComponent,
  processGroups,
}
