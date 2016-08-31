"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
    , enabledLayouts = require('./layouts')
    , LayoutContainer = require('./LayoutContainer')
    , LayoutPicker = require('./LayoutPicker')
    , { Filter } = require('./records')


function keepItemsInSet(toKeep) {
  return set => set.filter((_, id) => toKeep.has(id))
}

function flattenFilters(type, filters) {
  return filters
    .map(f => f[type])
    .map(cs => Immutable.List().equals(cs) ? null : cs)
    .flatten()
    .toSet()
    .filter(x => x !== undefined)
}

const LayoutPanel = React.createClass({
  displayName: 'LayoutPanel',

  propTypes: {
    addLayout: React.PropTypes.func.isRequired,
    updateLayout: React.PropTypes.func.isRequired,

    groups: React.PropTypes.instanceOf(Immutable.List).isRequired,
    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    prov: React.PropTypes.object.isRequired,
  },

  getDataForLevel(i) {
    const { groups } = this.props

    let { data } = this.props

    groups.slice(0, i).forEach(group => {
      const filters = group.map(layout => {
        const l = enabledLayouts[layout.name]

        if (l.filterer) {
          const filter = l.filterer(data, layout.options)

          if (filter) {
            return new Filter().merge(filter)
          }
        }

        return null
      }).filter(x => x)

      const keptCollections = flattenFilters('collections', filters)
          , keptPeriods = flattenFilters('periods', filters)

      if (keptCollections.size) {
        data = data.update('periodCollections', keepItemsInSet(keptCollections))
      }

      if (keptPeriods.size) {
        data = data.update('periodCollections', collections =>
          collections
            .map(c => c.update('definitions', keepItemsInSet(keptPeriods)))
            .filter(c => c.get('definitions').size > 0)
        )
      }
    })

    return data
  },

  render() {
    const {
      groups,
      errors,
      addLayout,
      updateLayout,
      addLayoutGroup,
      removeLayoutGroup,
    } = this.props

    const layoutGroups = groups.toArray().map((group, i) =>
      h('div', { style: { position: 'relative' }}, [
        h('a', {
          href: '',
          onClick: e => { e.preventDefault(); removeLayoutGroup(i); },
          style: {
            float: 'left',
            textDecoration: 'none',
            color: 'black',
            background: 'red',
          }
        }, '❌'),

        group.size === 0
          ? h(LayoutPicker, { onSelectLayout: addLayout.bind(null, i, Infinity) })
          : group.toArray().map((layout, j) =>
              h(LayoutContainer, {
                key: j,
                name: layout.name,
                options: layout.options,

                updateOptions: options => {
                  updateLayout(i, j, { options });
                  setTimeout(() => {
                    this.forceUpdate()
                  }, 0);
                },

                data: this.getDataForLevel(i),
                prov: this.props.prov,
              })
            )
      ])
    )

    return (
      h('main', [
        errors.size > 0 && h('pre', {
          style: {
            background: 'red',
            fontWeight: 'bold',
          }
        }, errors.toArray().map((err, i) =>
          h('li', { key: i }, err.stack || err.toString())
        )),

        h('div', layoutGroups),

        h('div', [
          h('button', {
            onClick: () => { addLayoutGroup() },
            style: {
              padding: '.2em 1em',
              fontSize: '36px'
            }
          }, 'Add')
        ])
      ])
    )
  }
})

module.exports = connect(
  state => ({
    groups: state.groups,
    errors: state.errors,
  }),
  dispatch => bindActionCreators(require('./actions'), dispatch)
)(LayoutPanel);
