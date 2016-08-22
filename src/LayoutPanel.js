"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , enabledLayouts = require('./layouts')
    , LayoutBlock = require('./LayoutBlock')
    , LayoutSpec = require('./spec')
    , { Filter, Layout } = require('./records')
    , { notEmpty, keepItemsInSet } = require('./utils')


const LayoutBlockChooser = ({ onSelectLayoutBlock }) =>
  h('div', [
    h('h2', 'Select layout'),
    h('ul', Object.keys(enabledLayouts).map(name =>
      h('li', { key: name }, [
        h('h3', [
          h('a', {
            href: '',
            onClick: e => {
              e.preventDefault();
              onSelectLayoutBlock(new Layout({ name }));
            }
          }, enabledLayouts[name].label)
        ]),
        h('p', enabledLayouts[name].description)
      ])
    ))
  ])


module.exports = React.createClass({
  displayName: 'LayoutPanel',

  propTypes: {
    onSpecChange: React.PropTypes.func.isRequired,
    spec: React.PropTypes.instanceOf(LayoutSpec).isRequired,
    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    prov: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      layoutFilters: []
    }
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
            .map(c => c.update('definitions', keepItemsInSet(keptPeriods)))
            .filter(c => c.get('definitions').size > 0)
        )

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
    const { spec, onSpecChange } = this.props

    const layoutGroups = spec.layouts.map((group, i) =>
      group.size === 0
        ? h(LayoutBlockChooser, {
            onSelectLayoutBlock: layout =>
              onSpecChange(spec
                .addLayoutBlock(i, Infinity, layout)
                .addLayoutGroup()
              )
          })
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
            })).toArray()
    ).toArray()

    return h('div', {
      style: {
        padding: '1em',
        width: '90%',
        background: '#999',
      }
    }, layoutGroups.map(group => h('div', {
      style: {
        display: group.size > 0 ? 'flex' : 'block',
        justifyContent: 'space-around',
        background: '#fcfcfc',
        margin: '1em',
        padding: '1em',
        border: '1px solid #666',

      }
    }, group)))
  }
})
