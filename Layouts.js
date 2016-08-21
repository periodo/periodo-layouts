"use strict";

const h = require('react-hyperscript')
    , qs = require('qs')
    , React = require('react')
    , Immutable = require('immutable')
    , layouts = require('./layouts')


const Filter = Immutable.Record({
  collections: undefined,
  periods: undefined,
})

const Layout = Immutable.Record({
  name: undefined,
  options: '',
})



function notEmpty(set) {
  return set.equals(Immutable.Set([undefined]))
}

function keepItemsInSet(toKeep) {
  return set => set.filter((_, id) => toKeep.has(id))
}

function isReactComponent(obj) {
  return 'isReactComponent' in (obj.prototype || {})
}


const LayoutBlock = React.createClass({
  propTypes: {
    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    prov: React.PropTypes.object.isRequired,

    name: React.PropTypes.oneOf(Object.keys(layouts)).isRequired,
    options: React.PropTypes.string,

    setKeptCollections: React.PropTypes.func.isRequired,
    setKeptPeriods: React.PropTypes.func.isRequired,
    setOptions: React.PropTypes.func.isRequired,
  },

  componentWillUpdate(nextProps) {
    const layout = this.getLayout()

    if (nextProps.name !== nextProps.name) {
      if (this._layout) {
        this.unmountNonReactComponent();
      }

      if (!isReactComponent(layout.handler)) {
        this.mountNonReactComponent();
      }
    } else if (!isReactComponent(layout.handler)) {
      this.updateNonReactComponent();
    }
  },

  componentDidMount() {
    const layout = this.getLayout()

    if (!isReactComponent(layout.handler)) {
      this.mountNonReactComponent();
    }
  },

  getLayout() {
    return layouts[this.props.name]
  },

  updateNonReactComponent() {
    if (this._layout.update) {
      this._layout.update.call(this._layout, this.props);
    }
  },

  mountNonReactComponent() {
    const { container } = this.refs

    this._layout = Object.create(this.getLayout().handler)
    this._layout.init.call(this._layout, container, this.props);
    this.updateNonReactComponent();
  },

  unmountNonReactComponent() {
    const { container } = this.refs

    Array.from(container.childNodes).forEach(el => {
      container.removeChild(el);
    })

    delete this._layout;
  },

  render() {
    const layout = this.getLayout()

    return (
      h('div', { style: { margin: '1em' }}, [
        h('h3', { title: layout.description }, layout.label),

        isReactComponent(layout.handler)
          ? h(layout.handler, this.props)
          : h('div', { ref: 'container' })
      ])
    )
  }
})


// (e.g.):
//
// {
//   layouts: [
//     [
//       { name, opts },
//       { name, opts } ,
//     ],
//
//     [
//       { name, opts, Filter({ collections, periods }) }),
//       { name, opts })
//       { name, opts, Filter({ periods } })
//     ],
//
// List(),
const LayoutOrganizer = React.createClass({
  propTypes: {
    layouts: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(
        React.PropTypes.shape({
          name: React.PropTypes.oneOf(Object.keys(layouts)).isRequired,
          opts: React.PropTypes.string
        })
      )
    ),

    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    prov: React.PropTypes.object.isRequired,
  },

  addLayout(groupIndex, layoutIndex=Infinity, layout) {
    const { groups } = this.state

    layout = new Layout().merge(layout)

    if (!groups.has(groupIndex)) {
      throw new Error(
        `Not a valid group index ${groupIndex}.\n` +
        `Valid keys are ${groups.keySeq()}`
      );
    }

    const updatedGroups = groups.update(groupIndex, group =>
        group.splice(layoutIndex, 0, layout))

    return this.setState({ groups: updatedGroups })
  },

  removeLayout(groupIndex, layoutIndex) {
    return this.setState(prev => ({
      groups: prev.groups.deleteIn([groupIndex, layoutIndex])
    }))
  },

  addLayoutGroup(groupIndex=Infinity) {
    return this.setState(prev => ({
      groups: prev.groups.splice(groupIndex, 0, Immutable.List())
    }))
  },

  removeLayoutGroup(groupIndex) {
    return this.setState(prev => ({
      groups: prev.groups.delete(groupIndex)
    }))
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
              key: layout.hashCode() + j,
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

const Application = React.createClass({
  getInitialState() {
    return { layouts: null }
  },

  componentDidMount() {
    window.onhashchange = ({ newURL }) => {
      this.updateLayoutsFromString(newURL.slice(newURL.indexOf('#') + 1))
    }

    this.updateLayoutsFromString(window.location.hash.slice(1));
  },

  updateLayoutsFromString(string) {
    let { layouts } = qs.parse(string)

    layouts = (layouts || [ [] ]);

    if (!Array.isArray(layouts)) {
      throw new Error('"layouts" value in spec string is not an array');
    }

    if (!layouts.length || !layouts.every(l => Array.isArray(l))) {
      throw new Error('"layouts" value in spec string is not an array of arrays');
    }

    try {
      layouts = layouts.map(group => group.map(obj => new Layout(obj)))
    } catch (e) {
      throw new Error('Malformed spec string.')
    }


    this.setState({ layouts })
  },

  render() {
    return this.state.layouts && (
      h(LayoutOrganizer, Object.assign({}, this.props, this.state))
    )
  }
})



module.exports = Application;
