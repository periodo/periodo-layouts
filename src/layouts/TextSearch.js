"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { getAlternateLabels } = require('periodo-utils/items/period')

exports.label = 'Text search';

exports.description = 'Search for periods by text.';

exports.handler = React.createClass({
  displayName: 'TextSearch',

  propTypes: {
    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    options: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    onLayoutChange: React.PropTypes.func.isRequired,
  },

  handleChange(e) {
    const { onLayoutChange } = this.props
        , text = e.target.value

    onLayoutChange({
      options: { text },
      filters: this.getFilters(text)
    })
  },

  componentDidMount() {
    const { onLayoutChange } = this.props

    const filters = this.getFilters()

    onLayoutChange({ filters })
  },

  getFilters(text) {
    const { data } = this.props

    let matchedPeriods = null;

    if (text) {
      const regex = text && new RegExp(text, 'i')

      matchedPeriods = data.get('periodCollections')
        .flatMap(collection => collection.get('definitions'))
        .filter(period => (
          regex.test(period.get('label', '')) ||
          getAlternateLabels(period).some(label => regex.test(label))
        ))
        .map(period => period.get('id'))
        .toList()
    }

    return { periods: matchedPeriods }
  },

  render() {
    const text = this.props.options.get('text')

    return (
      h('label', [
        'Search: ',
        h('input', {
          type: 'text',
          value: text,
          onChange: this.handleChange
        })
      ])
    )
  }
})
