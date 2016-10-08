"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , FacetField = require('./FacetField')
    , facets = require('./facets')


module.exports = React.createClass({
  displayName: 'FacetBrowser',

  getFacetValues(fieldName) {
    const { facetedQuery } = this.props

    /*
    // First, get the matched documents for all other fields
    const intersectingIDs = selectedValues
      .delete(fieldName)
      .reduce((fq, values, name) => fq.select({ name, values }), facetedQuery)
      .selectedItems()
      .map(item => item.get('id'))

      .select({ name: 'id', values: intersectingIDs })
    */

    // Now, get values matching all other constraints
    const fq = facetedQuery
      .selectedFacetsByIndex([fieldName])
      .get(fieldName)

    return fq && fq.sortBy(x => -x.size)
  },

  render() {
    const { updateOpts, facetedClassification } = this.props
        , allFields = Object.keys(facets)

    const expandedFields = facetedClassification
      .facetsByIndex()
      .keySeq()
      .toSet()

    return (
      h('div', allFields.map(field =>
        h(FacetField, Object.assign({}, facets[field], this.props, {
          key: field,
          field,
          updateOpts,

          unselectedValues: this.getFacetValues(field),
          expanded: expandedFields.includes(field),
        }))
      ))
    )
  }
})
