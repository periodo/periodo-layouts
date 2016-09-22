"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , FacetField = require('./FacetField')
    , facets = require('./facets')


module.exports = React.createClass({
  displayName: 'FacetBrowser',

  render() {
    const { options, updateOptions } = this.props
        , allFields = Object.keys(facets)

    const expandedFields = this.props.facetedClassification
      .facetsByIndex()
      .keySeq()
      .toSet()

    return (
      h('div', allFields.map(field =>
        h(FacetField, Object.assign({}, facets[field], options.toObject(), {
          key: field,
          field,
          updateOptions,
          expanded: expandedFields.includes(field),
        }))
      ))
    )
  }
})
