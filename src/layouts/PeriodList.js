"use strict";

const h = require('react-hyperscript')
    , React = require('react')


exports.label = 'Period list';

exports.description = 'Simple list of periods';

/*
exports.handler = React.createClass({
  render() {
    const { data } = this.props

    const periods = data
      .get('periodCollections')
      .flatMap(c => c.get('definitions'))

    return h('ul', periods.map(period =>
      h('li', { key: period.get('id') }, period.get('label'))
    ).toArray())
  }
})
*/

exports.handler = {
  init(el, { data, prov, setOptions }) {
    this.el = el;
    this.counter = 1;
  },

  update({ prov, setOptions }) {
    this.el.innerHTML = `Updated ${this.counter} times`;
    this.counter += 1;
  }
}
