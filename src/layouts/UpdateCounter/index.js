"use strict";

const Immutable = require('immutable')

exports.label = 'Update counter';

exports.description = 'Count the number of times layout has been updated (for debugging purposes)';

exports.renderer = {
  init(el) {
    this.el = el;
    this.counter = 0;
    this.lastProps = {}
  },

  update(nextProps) {
    const updatedProps = Object.keys(nextProps)
      .reduce((acc, key) => {
        return !Immutable.is(nextProps[key], this.lastProps[key])
          ? acc.concat(key)
          : acc
      }, [])

    this.lastProps = nextProps;

    this.el.innerHTML = `
      <p>No. updates: ${this.counter}</p>
      <p>
        Properties changed in last update: ${updatedProps.join(', ')}
      </p>
    `

    this.counter += 1;
  }
}
