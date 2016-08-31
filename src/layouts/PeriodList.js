"use strict";

/* eslint no-unused-vars: 0 */

const h = require('react-hyperscript')
    , React = require('react')

exports.label = 'Period list';

exports.description = 'Simple list of periods';

const reactHandler = React.createClass({
  render() {
    const { data, prov, setOptions } = this.props

    const periods = data
      .get('periodCollections')
      .flatMap(c => c.get('definitions'))
      .take(15)
      .toArray()

    return h('ul', periods.map(period =>
      h('li', { key: period.get('id') }, period.get('label'))
    ))
  }
})

const domHandler = {
  init(el, { data, prov, setOptions }) {
    this.el = el;
  },

  update({ data, prov, setOptions }) {
    const periods = data
      .get('periodCollections')
      .flatMap(c => c.get('definitions'))
      .take(15)
      .toArray()

    this.el.innerHTML = `
      <ul>
        ${periods.map(p => `<li>${p.get('label')}</li>`).join('')}
      </ul>
    `

  }
}

exports.handler = domHandler;
