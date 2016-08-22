"use strict";

const qs = require('qs')
    , Immutable = require('immutable')
    , registeredLayouts = Object.keys(require('./layouts'))
    , { Layout } = require('./records')


const EMPTY_SPEC = Immutable.List([ Immutable.List([]) ]);

function specFromString(string) {
  let { layouts } = qs.parse(string)

  layouts = (layouts || [ [] ]);

  if (!Array.isArray(layouts)) {
    throw new Error('"layouts" value in spec string is not an array');
  }

  if (!layouts.length || !layouts.every(l => Array.isArray(l))) {
    throw new Error('"layouts" value in spec string is not an array of arrays');
  }

  return layouts;
}

// A LayoutSpec is a structure that looks like:
//
//   List([
//     List([
//       Layout({ name, opts }),
//       Layout({ name, opts }),
//     ]),
//
//     List([
//       Layout({ name, opts, Filter({ collections, periods }) }),
//       Layout({ name, opts })
//       Layout({ name, opts, })
//     ]),
//
//     List([
//     ])
//   ])
class LayoutSpec {
  constructor(layouts) {
    if (layouts instanceof PassThrough) {
      this.layouts = layouts.value;
      return;
    }

    if (!layouts) {
      this.layouts = EMPTY_SPEC;
      return;
    }

    if (typeof layouts === 'string') {
      layouts = specFromString(layouts);
    } else {
      layouts = JSON.parse(JSON.stringify(layouts));
    }

    if (!Array.isArray(layouts)) {
      throw new Error('Layout object should be an array of arrays');
    }

    // the layouts
    this.layouts = Immutable.List().withMutations(groupList => {
      layouts.forEach((group, i) => {

        if (!Array.isArray(group)) {
          throw new Error('Layout object should be an array of arrays');
        }

        groupList.push(Immutable.List().withMutations(layoutList => {
          group.forEach((layout, j) => {
            try {
              if (registeredLayouts.indexOf(layout.name) === -1) {
                throw new Error(
                  `Layout "${layout.name} is not a registered layout. ` +
                  `Valid layout choices: ${registeredLayouts.join(', ')}`
                )
              }

              layoutList.push(new Layout().merge(layout));
            } catch (e) {
              throw new Error(`Problem adding layout from layout ${i},${j}:\n${e}`);
            }
          })
        }))
      })
    })
  }

  equals(cmp) {
    return this.layouts.equals(cmp)
  }

  // Serialize to URL-encoded string.
  toString() {
    if (this.equals(EMPTY_SPEC)) {
      return '';
    }

    return qs.stringify({ layouts: this.layouts.toJS() })
  }

  addLayoutBlock(groupIndex, layoutIndex=Infinity, layout) {
    layout = new Layout().merge(layout)

    if (!this.layouts.has(groupIndex)) {
      throw new Error(
        `Not a valid group index ${groupIndex}.\n` +
        `Valid keys are ${this.layouts.keySeq()}`
      );
    }

    return new LayoutSpec(new PassThrough(
      this.layouts.update(groupIndex, group =>
        group.splice(layoutIndex, 0, layout)
      )
    ))
  }

  removeLayoutBlock(groupIndex, layoutIndex) {
    return new LayoutSpec(new PassThrough(
      this.layouts.deleteIn([groupIndex, layoutIndex])
    ))
  }

  addLayoutGroup(groupIndex=Infinity) {
    return new LayoutSpec(new PassThrough(
      this.layouts.splice(groupIndex, 0, Immutable.List())
    ))
  }

  removeLayoutGroup(groupIndex) {
    return new LayoutSpec(new PassThrough(
      this.layouts.delete(groupIndex)
    ))
  }
}


function PassThrough(value) {
  this.value = value;
}


module.exports = LayoutSpec;
