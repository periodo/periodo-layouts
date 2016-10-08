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
        .map(layout => enabledLayouts[layout.get('name')].makePeriodFilter)
        .filter(x => x)
        .map(f => f(acc.last().get('derivedOpts')))

      if (filters.size) {
        dataset = dataset
          .update('authorities', authorities =>
            authorities
              .map((authority, authorityKey) =>
                authority.update('definitions', definitions =>
                  definitions
                    .filter((period, periodKey) =>
                      filters.every(f => f(period, periodKey, authority, authorityKey)))))
              .filter(authority => authority.get('definitions').size))
      }
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
        (prev && opts === prev.get('opts') && name === prev.get('name'))
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
