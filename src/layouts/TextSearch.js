"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , { getAlternateLabels } = require('periodo-utils/lib/items/period')

exports.label = 'Text search';

exports.description = 'Search for periods by text.';

exports.makePeriodFilter = function (opts) {
  const text = opts.get('text')
      , regex = text && new RegExp(text, 'i')

  return period => {
    if (!text) return true;

    return (
      regex.test(period.get('label', '')) ||
      getAlternateLabels(period).some(label => regex.test(label))
    )
  }
}

exports.renderer = React.createClass({
  displayName: 'TextSearch',

  render() {
    const { options, updateOptions } = this.props
        , text = options.get('text', '')

    return (
      h('label', [
        'Search: ',
        h('input', {
          type: 'text',
          value: text,
          onChange: e => {
            updateOptions({ text: e.target.value })
          }
        })
      ])
    )
  }
})
