"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , LayoutBlock = require('./LayoutBlock')
    , LayoutSpec = require('./spec')
    , { Filter } = require('./records')
    , { notEmpty, keepItemsInSet } = require('./utils')

module.exports = React.createClass({
  displayName: 'LayoutPanel',

  propTypes: {
    layouts: React.PropTypes.instanceOf(LayoutSpec).isRequired,
    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    prov: React.PropTypes.object.isRequired,
  },

  getDataForLevel(i) {
    let { data } = this.props

    if (i === 0) return data;

    const { layoutFilters } = this.state

    layoutFilters.forEach(filters => {
      if (!filters) return true

      let cont = true

      const keptCollections = filters.map(f => f.collections).flatten()
          , keptPeriods = filters.map(f => f.periods).flatten()

      if (notEmpty(keptCollections)) {
        data = data.update('periodCollections', keepItemsInSet(keptCollections))

        cont = false
      }

      if (notEmpty(keptPeriods)) {
        data = data.update('periodCollections', collections =>
          collections
            .map(c => c.update('definitions', keepItemsInSet(keptPeriods))
            .filter(c => c.get('definitions').size > 0)
        ))

        cont = false
      }

      return cont;
    })

    return data
  },

  updateKeptItemsForLevel(i, j, category, keptIDs) {
    const { layoutFilters } = this.state

    // `category` will either be "period" or "collection"

    const newLayoutFilters = (
      layoutFilters.update(i, Immutable.List(), levelFilters =>
        levelFilters.update(j, new Filter(), filter =>
          filter.set(category, Immutable.Set(keptIDs)))))

    this.setState({ layoutFilters: newLayoutFilters });
  },

  render() {
    const { layouts } = this.props

    const layoutGroups = layouts.map((group, i) =>
      group.length === 0
        ? h('p', 'empty group')
        : group.map((layout, j) =>
            h(LayoutBlock, {
              key: j,
              name: layout.name,
              options: layout.options,
              data: this.getDataForLevel(i),
              prov: this.props.prov,

              setKeptCollections: collections => this.setState(prev => ({
                groups: prev.groups.setIn([i, j, 'filters', 'collections'], collections)
              })),

              setKeptPeriods: periods => this.setState(prev => ({
                groups: prev.groups.setIn([i, j, 'filters', 'periods'], periods)
              })),

              setOptions: options => this.setState(prev => ({
                groups: prev.groups.setIn([i, j, 'options'], options)
              }))
            }))
    )

    return h('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
      }
    }, layoutGroups)
  }
})
