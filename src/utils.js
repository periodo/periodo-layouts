"use strict";

const Immutable = require('immutable')

const noop = {}


function isReactComponent(obj) {
  return 'isReactComponent' in (obj.prototype || {})
}

function keepItemsInSet(toKeep) {
  return set => set.filter((_, id) => toKeep.has(id))
}

function filterDataset(dataset, filters) {
  const keptAuthorities = filters.get('keptAuthorities')
      , keptPeriods = filters.get('keptPeriods')

  if (keptAuthorities) {
    dataset = dataset
      .update('authorities', keepItemsInSet(keptAuthorities))
  }

  if (keptPeriods) {
    dataset = dataset
      .update('authorities', authorities =>
        authorities
          .map(x => x.update('definitions', keepItemsInSet(keptPeriods)))
          .filter(c => c.get('definitions').size > 0)
      )
  }

  return dataset;
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
      const filters = acc.last().get('layouts').reduce((filtersAcc, layout) => {
        const name = layout.get('name')
            , { getFilters } = enabledLayouts[name]

        return !getFilters ? filtersAcc : filtersAcc.mergeWith(
          (prev, next) => Immutable.Set(prev || next).union(next),
          getFilters(dataset, layout.get('derivedOpts'))
        )
      }, Immutable.Map({ keptPeriods: null, keptAuthorities: null }))

      dataset = filterDataset(acc.last().get('dataset'), filters)
    }

    const layouts = group.get('layouts').map((layout, j) => {
      const path = [i, 'layouts', j]
          , prev = prevProcessedGroups.getIn(path)
          , { name, opts } = unprocessedGroups.getIn(path).toObject()

      if (prev && name !== prev.get('name')) {
        throw new Error('Cannot change the name of a layout.')
      }

      const { deriveOpts=noop } = enabledLayouts[name]

      const nextDerivedOpts = (
        (prev && opts === prev.get('opts'))
          ? prev.get('derivedOpts')
          : deriveOpts === noop
            ? opts
            : deriveOpts((prev || Immutable.Map()).get('derivedOpts'), opts, dataset))

      return Immutable.Map({ name, opts, derivedOpts: Immutable.Map(nextDerivedOpts) })
    })

    return acc.push(Immutable.Map({ dataset, layouts }));
  }, Immutable.List())
}

module.exports = {
  isReactComponent,
  filterDataset,
  processGroups,
}
