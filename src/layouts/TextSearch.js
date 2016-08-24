"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { getAlternateLabels } = require('periodo-utils/items/period')

exports.label = 'Text search';

exports.description = 'Search for periods by text.';

exports.filterer = (dataset, options) => {
  let matchedPeriods = null;

  const text = options.get('text')

  if (text) {
    const regex = text && new RegExp(text, 'i')

    matchedPeriods = dataset.get('periodCollections')
      .flatMap(collection => collection.get('definitions'))
      .filter(period => (
        regex.test(period.get('label', '')) ||
        getAlternateLabels(period).some(label => regex.test(label))
      ))
      .map(period => period.get('id'))
      .toList()

    return { periods: matchedPeriods }
  }
}

exports.handler = React.createClass({
  displayName: 'TextSearch',

  propTypes: {
    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    options: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    updateOptions: React.PropTypes.func.isRequired,
  },

  render() {
    const { options, updateOptions } = this.props
        , text = options.get('text') || ''

    return (
      h('label', [
        'Search: ',
        h('input', {
          type: 'text',
          value: text,
          onChange: e => { updateOptions({ text: e.target.value }) }
        })
      ])
    )
  }
})
