"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , layouts = require('./layouts')
    , { isReactComponent } = require('./utils')


const LayoutContainer = React.createClass({
  displayName: 'LayoutContainer',

  propTypes: {
    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    prov: React.PropTypes.object.isRequired,
    name: React.PropTypes.oneOf(Object.keys(layouts)).isRequired,
    options: React.PropTypes.instanceOf(Immutable.Map).isRequired,
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

module.exports = LayoutContainer;
