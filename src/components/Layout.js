"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { Close, Block, Heading } = require('rebass')
    , { Flex, Box } = require('reflexbox')
    , { isReactComponent } = require('../utils')


module.exports = React.createClass({
  displayName: 'Layout',

  propTypes: {
    editing: React.PropTypes.bool,

    dataset: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    //prov: React.PropTypes.object.isRequired,

    opts: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    derivedOpts: React.PropTypes.instanceOf(Immutable.Map).isRequired,

    removeLayout: React.PropTypes.func.isRequired,
    updateLayoutOpts: React.PropTypes.func.isRequired,
  },

  getLayoutHandler() {
    const { name, enabledLayouts } = this.props

    return enabledLayouts[name]
  },

  getInitialState() {
    return { error: false }
  },

  componentWillUpdate(nextProps) {
    const layoutHandler = this.getLayoutHandler()

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
    const layoutHandler = this.getLayoutHandler()

    // Layout type has not changed, but we do need to manually update
    // non-react layouts
    if (!isReactComponent(layoutHandler.renderer)) {
      this.updateNonReactComponent();
    }
  },

  componentDidMount() {
    const layoutHandler = this.getLayoutHandler()

    if (!isReactComponent(layoutHandler.renderer)) {
      this.mountNonReactComponent();
      this.updateNonReactComponent();
    }
  },

  unstable_handleError(e) {
    this.setState({ error: e })
  },

  updateNonReactComponent() {
    const renderer = this._nonReactLayoutRenderer

    if (renderer.update) {
      renderer.update.call(renderer, this.getChildProps());
    }
  },

  mountNonReactComponent() {
    const layoutHandler = this.getLayoutHandler()
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
    const {
      opts,
      editing,
      dataset,
      groupIndex,
      layoutIndex,
      derivedOpts,
      updateLayoutOpts,
    } = this.props

    return Object.assign({},
      opts && opts.toObject(),
      derivedOpts.toObject(), {
        data: dataset,
        updateOpts: updateLayoutOpts.bind(null, groupIndex, layoutIndex),
        editing,
      })
  },

  render() {
    const { description, label, renderer } = this.getLayoutHandler()
        , { editing, removeLayout, groupIndex, layoutIndex } = this.props
        , { error } = this.state

    return (
      h(Box, { flexAuto: true }, [
        editing && h(Block, {
          m: 0,
          color: 'white',
          backgroundColor: 'primaryAltDarkest'
        }, [
          h(Flex, { px: 1, justify: 'space-between' }, [
            h(Heading, {
              level: 3,
              title: description,
              my: 1
            }, label),

            h(Close, {
              onClick: () => removeLayout(groupIndex, layoutIndex)
            }),
          ])
        ]),

        !error && isReactComponent(renderer)
          ? h(renderer, this.getChildProps())
          : h('div', { ref: 'container' }),

        error !== false && h('pre', error.stack || error.toString())
      ])
    )
  }
})
