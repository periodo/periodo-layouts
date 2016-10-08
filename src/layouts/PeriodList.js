"use strict";

/* eslint no-unused-vars: 0 */

const h = require('react-hyperscript')
    , React = require('react')

exports.label = 'Period list';

exports.description = 'Simple list of periods';

const reactRenderer = React.createClass({
  render() {
    const { data, prov, setOpts } = this.props

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

const domRenderer = {
  init(el, { data, prov, setOpts }) {
    this.el = el;
  },

  update({ data, prov, setOpts }) {
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

exports.renderer = domRenderer;
