"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { FacetedClassification, FacetedQuery } = require('immfacet')
    , FacetField = require('./FacetField')
    , facets = require('./facets')
    // , PeriodList = require('./period_list.jsx')



module.exports = React.createClass({
  displayName: 'FacetBrowser',

  getInitialState() {
    return {
      facetedQuery: this.getInitialFacetedQuery(),
      selectedValues: Immutable.Map(),
      brushedRange: null,
      searchText: null
    }
  },

  getInitialFacetedQuery() {
    const { dataset } = this.props

    const periods = dataset
      .get('periodCollections')
      .flatMap(collection => collection
        .get('definitions')
        .map(period => period.set('collection_id', collection.get('id'))))
      .toList()

    const fc = new FacetedClassification(periods)

    return new FacetedQuery(Object.keys(facets).reduce((fc, facetName) => {
      const field = facets[facetName]

      return fc.addFacet(
        facetName,
        field.fn.bind(this, dataset),
        { multiValue: field.multiValue }
      )
    }, fc.addFieldFacet('id')))
  },

  handleSelectFacet(facetName, value) {
    this.setState(prev => ({
      selectedValues: prev.selectedValues
        .update(facetName, Immutable.Set(), values => values.add(value))
    }))
  },

  handleDeselectFacet(facetName, value) {
    this.setState(prev => {
      let selectedValues = prev.selectedValues
        .update(facetName, values => values.remove(value))

      if (!selectedValues.get(facetName).size) {
        selectedValues = selectedValues.delete(facetName);
      }

      return { selectedValues }
    });
  },

  getFacetValues(fieldName) {
    const { brushedRange, searchText, selectedValues } = this.state

    let { facetedQuery } = this.state

    if (brushedRange) {
      facetedQuery = facetedQuery.select({
        name: '_range',
        values: [true]
      });
    }

    if (searchText) {
      facetedQuery = facetedQuery.select({
        name: '_searchText',
        values: [true]
      });
    }

    // First, get the matched documents for all other fields
    const intersectingIDs = selectedValues
      .delete(fieldName)
      .reduce((fq, values, name) => fq.select({ name, values }), facetedQuery)
      .selectedItems()
      .map(item => item.get('id'))

    // Now, get values matching all other constraints
    return facetedQuery
      .select({ name: 'id', values: intersectingIDs })
      .selectedFacetsByIndex([fieldName])
      .get(fieldName)
  },

  getMatchedPeriods(onlyInRange) {
    let { facetedQuery } = this.state

    if (this.state.brushedRange && onlyInRange) {
      facetedQuery = facetedQuery.select({
        name: '_range',
        values: [true]
      });
    }

    if (this.state.searchText) {
      facetedQuery = facetedQuery.select({
        name: '_searchText',
        values: [true]
      });
    }

    return this.state.selectedValues
      .reduce((fq, values, name) => fq.select({ name, values }), facetedQuery)
      .selectedItems()
  },

  handleResetFacet(facetName) {
    this.setState(prev => ({
      selectedValues: prev.selectedValues.delete(facetName)
    }));
  },

  handleRangeBrush({ start, end }) {
    const { getEarliestYear, getLatestYear } = require('periodo-utils/items/terminus')
        , intersects = require('./intersects')

    if (start === null && end === null) {
      this.setState(prev => ({
        brushedRange: null,
        facetedQuery: prev.facetedQuery.removeFacet('_range')
      }));
    } else {
      this.setState(prev => ({
        brushedRange: [start, end],
        facetedQuery: prev.facetedQuery.removeFacet('_range').addFacet('_range', period => {
          const earliest = period.get('start', null) && getLatestYear(period.get('start'))
              , latest = period.get('stop', null) && getEarliestYear(period.get('stop'))

          // Check if any part of the period lies within the given range [start,end]
          return (
            earliest !== null &&
            latest !== null &&
            intersects([start, end], [earliest, latest])
          )
        })
      }));
    }
  },


  handleSearchTextChange(text) {
    const { getAlternateLabels } = require('periodo-utils/items/period')

    if (!text) {
      this.setState(prev => ({
        searchText: null,
        facetedQuery: prev.facetedQuery.removeFacet('_searchText')
      }));
    } else {
      const regex = new RegExp(text, 'i')

      // TODO - maybe make search regex only with a checkbox
      this.setState(prev => ({
        searchText: text,
        facetedQuery: prev.facetedQuery.removeFacet('_searchText').addFacet('_searchText', period => {
          return (
            regex.test(period.get('label', '')) ||
            getAlternateLabels(period).some(label => regex.test(label))
          )
        })
      }));
    }
  },


  render() {
    const { facetedQuery } = this.state
        , anyPeriods = this.props.dataset.get('periodCollections').size > 0
        , periodsInRange = this.getMatchedPeriods(true)
        // , periods = this.getMatchedPeriods(false)
        // , RangeSelection = require('../shared/range_selection.jsx')
        // , TextMatch = require('./text_match.jsx')

    const facetFields = facetedQuery.selectedFacets()
      .keySeq()
      .filter(key => key[0] !== '_' && key !== 'id') // ignore facets that start with _ (this is a kludge)
      .map(facetName => {
        const field = facets[facetName]
            , values = this.getFacetValues(facetName)

        return h(FacetField, {
          values,
          key: facetName,
          facetName: field.label,
          format: field.format,
          getDisplayTitle: field.getDisplayTitle,
          selectedValues: this.state.selectedValues.get(facetName, Immutable.Map()),
          onSelectFacet: this.handleSelectFacet.bind(this, facetName),
          onDeselectFacet: this.handleDeselectFacet.bind(this, facetName),
          onResetFacet: this.handleResetFacet.bind(this, facetName)
        });
      })
      .toArray()

    return (
      h('div .clearfix', [
        h('div .col .col-7', [
          !anyPeriods
            ? h('p', 'No periods defined yet.')
            : h('p', `${periodsInRange.size} periods matched.`)
        ]),

        anyPeriods && h('div .col .col-5', [
          h('h2', 'Facets'),
          facetFields
        ])
      ])
    )

      /*
    return (
        <div className="row">
          <div className="col-md-7">
            <h2>Periods</h2>
            { !anyPeriods && <p>No periods yet defined.</p> }
            { anyPeriods && periodsInRange.size === 0 ?
                <p>No periods match filter criteria.</p> :
                <PeriodList
                  periods={periodsInRange}
                  dataset={this.props.dataset}
                  backend={this.props.backend} />
            }
          </div>
          {
            anyPeriods && (
              <div className="col-md-5">
                <h2>Filters</h2>

                <h3>Time range</h3>
                <RangeSelection
                    onChange={this.handleRangeBrush}
                    periods={periods} />

                <h3>Text</h3>
                <TextMatch onSearchTextChange={this.handleSearchTextChange} />

                <br />

                {facetFields}
              </div>
            )
          }
        </div>
    )
    */
  }
});
