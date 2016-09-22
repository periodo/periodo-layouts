"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { connect } = require('react-redux')
    , { Close, Block, Heading } = require('rebass')
    , { Flex } = require('reflexbox')
    , enabledLayouts = require('../layouts')
    , { updateLayoutOptions, removeLayout } = require('../actions')
    , { Derivations } = require('../records')


function isReactComponent(obj) {
  return 'isReactComponent' in (obj.prototype || {})
}

function mapStateToProps(state, ownProps) {
  const { groupIndex, layoutIndex } = ownProps
      , layout = state.groups.getIn([groupIndex, 'layouts', layoutIndex])

  return Object.assign(layout.toObject(), {
    layout: enabledLayouts[layout.name],
    editing: state.editing
  })
}

function mapDispatchToProps(dispatch, ownProps) {
  const { groupIndex, layoutIndex } = ownProps

  return {
    updateOptions: options =>
      dispatch(updateLayoutOptions(groupIndex, layoutIndex, options)),

    removeLayout: () =>
      dispatch(removeLayout(groupIndex, layoutIndex))
  }
}

const Layout = React.createClass({
  displayName: 'Layout',

  propTypes: {
    editing: React.PropTypes.bool,

    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    //prov: React.PropTypes.object.isRequired,

    name: React.PropTypes.oneOf(Object.keys(enabledLayouts)).isRequired,
    options: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    derived: React.PropTypes.instanceOf(Derivations),
    layout: React.PropTypes.object.isRequired,
  },

  componentWillUpdate(nextProps) {
    const { layout } = this.props

    // Layout type has changed
    if (nextProps.name !== this.props.name) {
      // Unmount existing non-react layout
      if (this._nonReactLayoutRenderer) {
        this.unmountNonReactComponent();
      }

      // If layout is not a react component, mount it
      if (!isReactComponent(layout.renderer)) {
        this.mountNonReactComponent();
      }
    }
  },

  componentDidUpdate() {
    const { layout } = this.props

    // Layout type has not changed, but we do need to manually update
    // non-react layouts
    if (!isReactComponent(layout.renderer)) {
      this.updateNonReactComponent();
    }
  },

  componentDidMount() {
    const { layout } = this.props

    if (!isReactComponent(layout.renderer)) {
      this.mountNonReactComponent();
      this.updateNonReactComponent();
    }
  },

  updateNonReactComponent() {
    const renderer = this._nonReactLayoutRenderer

    if (renderer.update) {
      renderer.update.call(renderer, this.getChildProps());
    }
  },

  mountNonReactComponent() {
    const { layout } = this.props
        , { container } = this.refs
        , renderer = this._nonReactLayoutRenderer = Object.create(layout.renderer)

    renderer.init.call(renderer, container, this.getChildProps());
  },

  unmountNonReactComponent() {
    const { container } = this.refs

    Array.from(container.childNodes).forEach(el => {
      container.removeChild(el);
    })

    delete this._nonReactLayoutRenderer;
  },

  getChildProps() {
    const { data, options, updateOptions, editing, derived } = this.props

    return Object.assign({}, derived && derived.attributes && derived.attributes.toObject(), {
      data,
      options,
      updateOptions,
      editing,
    })
  },

  render() {
    const { layout, name, editing, removeLayout } = this.props

    return (
      h(`div .Layout .Layout-${name}`, {
        style: {
          display: 'inline-block'
        }
      }, [
        editing && h(Block, {
          m: 0,
          color: 'white',
          backgroundColor: 'primaryAltDarkest'
        }, [
          h(Flex, {
            px: 1,
            justify: 'space-between'
          }, [
            h(Heading, {
              level: 3,
              title: layout.description,
              my: 1
            }, layout.label),

            h(Close, {
              onClick: removeLayout
            }),
          ])
        ]),

        isReactComponent(layout.renderer)
          ? h(layout.renderer, this.getChildProps())
          : h('div', { ref: 'container' })
      ])
    )
  }
})

module.exports = connect(mapStateToProps, mapDispatchToProps)(Layout);
