"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
    , enabledLayouts = require('./layouts')
    , LayoutContainer = require('./LayoutContainer')
    , { Filter, Layout } = require('./records')


function keepItemsInSet(toKeep) {
  return set => set.filter((_, id) => toKeep.has(id))
}

const LayoutChooser = ({ onSelectLayout }) =>
  h('div', [
    h('h2', 'Select layout'),
    h('ul', Object.keys(enabledLayouts).map(name =>
      h('li', { key: name }, [
        h('h3', [
          h('a', {
            href: '',
            onClick: e => {
              e.preventDefault();
              onSelectLayout(new Layout({ name }));
            }
          }, enabledLayouts[name].label)
        ]),
        h('p', enabledLayouts[name].description)
      ])
    ))
  ])

function mapStateToProps(state) {
  return {
    groups: state.groups,
    errors: state.errors,
  }
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

      const keptCollections = filters
        .map(f => f.collections)
        .map(cs => Immutable.List().equals(cs) ? null : cs)
        .flatten()
        .toSet()
        .filter(x => x !== undefined)

      const keptPeriods = filters
        .map(f => f.periods)
        .map(cs => Immutable.List().equals(cs) ? null : cs)
        .flatten()
        .toSet()
        .filter(x => x !== undefined)

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
    const {
      groups,
      errors,
      addLayout,
      updateLayout,
      addLayoutGroup,
      removeLayoutGroup,
    } = this.props

    const layoutGroups = groups.map((group, i) =>
      h('div', { style: { position: 'relative' }}, [
        h('div', {
          style: {
            position: 'absolute',
            top: -38,
            right: -17,
          }
        }, h('a', {
          href: '',
          onClick: e => {
            e.preventDefault();
            removeLayoutGroup(i);
          },
          style: {
            padding: '0px 6px',
            fontSize: 50,
            background: 'red',
            color: 'white',
            fontWeight: 'bold',
            textDecoration: 'none',
          }
        }, 'X')),

        group.size === 0
          ? h(LayoutChooser, {
              onSelectLayout: layout => addLayout(i, Infinity, layout)
            })
          : group.map((layout, j) =>
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
            ).toArray()
      ])
    ).toArray()

    return (
      h('div', [
        errors.size > 0 && h('pre', {
          style: {
            background: 'red',
            fontWeight: 'bold',
          }
        }, errors.toArray().map((err, i) =>
          h('li', { key: i }, err.stack || err.toString())
        )),

        h('div', {
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
        }, group))),

        h('div', { style: { textAlign: 'center', marginTop: '1em' }}, [
          h('button', {
            onClick: () => { addLayoutGroup() },
            style: {
              fontSize: '50px'
            }
          }, ' + ')
        ])

      ]
      )
    )
  }
})

module.exports = connect(
  mapStateToProps,
  dispatch => bindActionCreators(require('./actions'), dispatch)
)(LayoutPanel);
