"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { connect } = require('react-redux')
    , { Close, Block, Heading } = require('rebass')
    , { Flex } = require('reflexbox')
    , enabledLayouts = require('../layouts')
    , { updateLayoutOpts, removeLayout } = require('../actions')


function isReactComponent(obj) {
  return 'isReactComponent' in (obj.prototype || {})
}

function mapStateToProps(state, ownProps) {
  const { groupIndex, layoutIndex } = ownProps
      , layout = state.groups.getIn([groupIndex, 'layouts', layoutIndex])

  return Object.assign(layout.toObject(), {
    layoutHandler: enabledLayouts[layout.name],
    editing: state.editing
  })
}

function mapDispatchToProps(dispatch, ownProps) {
  const { groupIndex, layoutIndex } = ownProps

  return {
    updateOpts: opts =>
      dispatch(updateLayoutOpts(groupIndex, layoutIndex, opts)),

    removeLayout: () =>
      dispatch(removeLayout(groupIndex, layoutIndex))
  }
}

const Layout = React.createClass({
  displayName: 'Layout',

  propTypes: {
    editing: React.PropTypes.bool,

    dataset: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    //prov: React.PropTypes.object.isRequired,

    name: React.PropTypes.oneOf(Object.keys(enabledLayouts)).isRequired,
    opts: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    derivedOpts: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    layoutHandler: React.PropTypes.object.isRequired,
  },

  componentWillUpdate(nextProps) {
    const { layoutHandler } = this.props

    // Layout type has changed
    if (nextProps.name !== this.props.name) {
      // Unmount existing non-react layout
      if (this._nonReactLayoutRenderer) {
        this.unmountNonReactComponent();
      }

      // If layout is not a react component, mount it
      if (!isReactComponent(layoutHandler.renderer)) {
        this.mountNonReactComponent();
      }
    }
  },

  componentDidUpdate() {
    const { layoutHandler } = this.props

    // Layout type has not changed, but we do need to manually update
    // non-react layouts
    if (!isReactComponent(layoutHandler.renderer)) {
      this.updateNonReactComponent();
    }
  },

  componentDidMount() {
    const { layoutHandler } = this.props

    if (!isReactComponent(layoutHandler.renderer)) {
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
    const { layoutHandler } = this.props
        , { container } = this.refs
        , renderer = this._nonReactLayoutRenderer = Object.create(layoutHandler.renderer)

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
    const { dataset, opts, updateOpts, editing, derivedOpts } = this.props

    return Object.assign({}, opts && opts.toObject(), derivedOpts.toObject(), {
      data: dataset,
      updateOpts,
      editing,
    })
  },

  render() {
    const { layoutHandler, name, editing, removeLayout } = this.props

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
              title: layoutHandler.description,
              my: 1
            }, layoutHandler.label),

            h(Close, {
              onClick: removeLayout
            }),
          ])
        ]),

        isReactComponent(layoutHandler.renderer)
          ? h(layoutHandler.renderer, this.getChildProps())
          : h('div', { ref: 'container' })
      ])
    )
  }
})

module.exports = connect(mapStateToProps, mapDispatchToProps)(Layout);
