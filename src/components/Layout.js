"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { connect } = require('react-redux')
    , enabledLayouts = require('../layouts')
    , { updateLayoutOptions } = require('../actions')


function isReactComponent(obj) {
  return 'isReactComponent' in (obj.prototype || {})
}

function mapStateToProps(state, ownProps) {
  const { groupIndex, layoutIndex } = ownProps
      , layout = state.groups.getIn([groupIndex, layoutIndex])

  return Object.assign(layout.toObject(), {
    layout: enabledLayouts[layout.name],
    editing: state.editing
  })
}

const Layout = React.createClass({
  displayName: 'Layout',

  propTypes: {
    editing: React.PropTypes.bool,

    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    //prov: React.PropTypes.object.isRequired,

    name: React.PropTypes.oneOf(Object.keys(enabledLayouts)).isRequired,
    options: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    layout: React.PropTypes.object.isRequired,
  },

  componentWillUpdate(nextProps) {
    const { layout } = this.props

    // Layout type has changed
    if (nextProps.name !== this.props.name) {
      // Unmount existing non-react layout
      if (this._nonReactLayoutHandler) {
        this.unmountNonReactComponent();
      }

      // If layout is not a react component, mount it
      if (!isReactComponent(layout.handler)) {
        this.mountNonReactComponent();
      }
    }
  },

  componentDidUpdate() {
    const { layout } = this.props

    // Layout type has not changed, but we do need to manually update
    // non-react layouts
    if (!isReactComponent(layout.handler)) {
      this.updateNonReactComponent();
    }
  },

  componentDidMount() {
    const { layout } = this.props

    if (!isReactComponent(layout.handler)) {
      this.mountNonReactComponent();
      this.updateNonReactComponent();
    }
  },

  updateNonReactComponent() {
    const handler = this._nonReactLayoutHandler

    if (handler.update) {
      handler.update.call(handler, this.getChildProps());
    }
  },

  mountNonReactComponent() {
    const { layout } = this.props
        , { container } = this.refs
        , handler = this._nonReactLayoutHandler = Object.create(layout.handler)

    handler.init.call(handler, container, this.getChildProps());
  },

  unmountNonReactComponent() {
    const { container } = this.refs

    Array.from(container.childNodes).forEach(el => {
      container.removeChild(el);
    })

    delete this._nonReactLayoutHandler;
  },

  getChildProps() {
    const { data, options, updateOptions } = this.props

    return {
      data,
      options,
      updateOptions
    }
  },

  render() {
    const { layout, name, editing } = this.props

    return (
      h(`div .Layout .Layout-${name}`, [
        editing && h('h3', { title: layout.description }, layout.label),

        isReactComponent(layout.handler)
          ? h(layout.handler, this.getChildProps())
          : h('div', { ref: 'container' })
      ])
    )
  }
})

module.exports = connect(
  mapStateToProps,
  (dispatch, { groupIndex, layoutIndex }) => ({
    updateOptions: options =>
      dispatch(updateLayoutOptions(groupIndex, layoutIndex, options))
  })
)(Layout);
