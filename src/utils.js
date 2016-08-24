"use strict";

const Immutable = require('immutable')

function notEmpty(set) {
  return !set.equals(Immutable.Set([undefined]))
}

function keepItemsInSet(toKeep) {
  return set => set.filter((_, id) => toKeep.has(id))
}

function isReactComponent(obj) {
  return 'isReactComponent' in (obj.prototype || {})
}

module.exports = {
  notEmpty,
  keepItemsInSet,
  isReactComponent,
}
