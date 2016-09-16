"use strict";

const test = require('tape')
    , Immutable = require('immutable')

test('Selector extracting filter aggregations from groups', t => {
  t.plan(3);

  const { filtersByGroupSelector } = require('../selectors')

  const state1 = Immutable.fromJS({
    groups: [
      { layouts: [] }
    ]
  })

  t.deepEqual(
    filtersByGroupSelector(state1),
    Immutable.fromJS([
      { keptPeriods: null, keptCollections: null }
    ]), 'should be empty when applied to a group without layouts.')


  const state2 = Immutable.fromJS({
    groups: [
      {
        layouts: [
          {
            derived: {
              keptPeriods: [1, 2],
              keptCollections: ['a'],
            }
          },
          {
            derived: {
              keptPeriods: [3],
              keptCollections: ['b', 'c'],
            }
          }
        ]
      }
    ]
  })

  t.deepEqual(
    filtersByGroupSelector(state2),
    Immutable.fromJS([
      {
        keptPeriods: Immutable.Set([1, 2, 3]),
        keptCollections: Immutable.Set(['a', 'b', 'c'])
      }
    ]), 'should combine the union of filters from groups on the same level')


  const state3 = Immutable.fromJS({
    groups: [
      {
        layouts: [
          {
            derived: {
              keptPeriods: [1, 2],
              keptCollections: ['a', 'b'],
            }
          },
        ]
      },

      {
        layouts: [
          {
            derived: {
              keptPeriods: [1],
              keptCollections: ['a'],
            }
          },
        ]
      },
    ]
  })

  t.deepEqual(
    filtersByGroupSelector(state3),
    Immutable.fromJS([
      {
        keptPeriods: Immutable.Set([1, 2]),
        keptCollections: Immutable.Set(['a', 'b'])
      },
      {
        keptPeriods: Immutable.Set([1]),
        keptCollections: Immutable.Set(['a'])
      }
    ]), 'should return aggregations of filters from each level')

})
