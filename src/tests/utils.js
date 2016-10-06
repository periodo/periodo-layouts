"use strict";

const Immutable = require('immutable')
    , $ = Immutable.fromJS
    , test = require('tape')
    , { processGroups } = require('../utils')

const layoutHandlers = {
  noop: {},

  callTracker: {
    deriveOpts() {
      return { called: true }
    }
  },

  datasetFilterer: {
    getFilters() {
      return {
        keptPeriods: ['p1']
      }
    }
  }
}

const dataset = $({
  authorities: {
    a1: {
      definitions: {
        p1: {},
        p2: {},
      }
    },

    a2: {
      definitions: {
        p3: {},
        p4: {},
      }
    },
  }
})

test('Group processor', t => {
  t.plan(6);

  t.ok(Immutable.is(
    processGroups(layoutHandlers, dataset, $([
      {
        layouts: [
          { name: 'noop' }
        ]
      }
    ])),
    $([
      {
        dataset,
        layouts: [
          { name: 'noop', opts: undefined, derivedOpts: {} }
        ]
      }
    ])
  ), 'should add a dataset, and set `opts` and `derivedOpts`')

  t.ok(Immutable.is(
    processGroups(layoutHandlers, dataset, $([
      {
        layouts: [
          { name: 'noop', opts: { foo: 'bar' } }
        ]
      }
    ])),
    $([
      {
        dataset,
        layouts: [
          { name: 'noop', opts: { foo: 'bar' }, derivedOpts: { foo: 'bar' } }
        ]
      }
    ])
  ), 'should pass through opts as derivedOpts without a deriveOpts function')


  t.throws(
    processGroups.bind(null, layoutHandlers, dataset,
      $([
          {
            layouts: [
              { name: 'noop', opts: { foo: 'bar' } }
            ]
          }
      ]),

      $([
          {
            layouts: [
              { name: 'callTracker', opts: { foo: 'bar' } }
            ]
          }
      ])
    ),
    /Cannot change the name of a layout/,
    'should throw if a layout\'s handler is changed.'
  )

  t.ok(Immutable.is(
    processGroups(layoutHandlers, dataset, $([
      {
        layouts: [
          { name: 'callTracker' }
        ]
      }
    ])),
    $([
      {
        dataset,
        layouts: [
          { name: 'callTracker', opts: undefined, derivedOpts: { called: true } }
        ]
      }
    ])
  ), 'should call deriveOpts() function on layout handler')

  t.ok(Immutable.is(
    processGroups(layoutHandlers, dataset,
      $([
          {
            layouts: [
              { name: 'callTracker' }
            ]
          }
      ]),

      $([
          {
            dataset,
            layouts: [
              { name: 'callTracker', opts: undefined, derivedOpts: { test: 1 } }
            ]
          }
      ])
    ),
    $([
      {
        dataset,
        layouts: [
          { name: 'callTracker', opts: undefined, derivedOpts: { test: 1 } }
        ]
      }
    ])
  ), 'should not call deriveOpts() if opts have not been changed since previous processing outcome')

  t.ok(Immutable.is(
    processGroups(layoutHandlers, dataset, $([
      {
        layouts: [
          { name: 'datasetFilterer' }
        ]
      },

      {
        layouts: [
          { name: 'noop' }
        ]
      }
    ])),
    $([
        {
          dataset,
          layouts: [
            { name: 'datasetFilterer', opts: undefined, derivedOpts: {} }
          ]
        },

        {
          dataset: {
            authorities: {
              a1: {
                definitions: {
                  p1: {}
                }
              }
            }
          },
          layouts: [
            { name: 'noop', opts: undefined, derivedOpts: {} }
          ]
        }
    ])
    ), 'should filter data between layout groups')

})
