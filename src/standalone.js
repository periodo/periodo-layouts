"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , ReactDOM = require('react-dom')
    , Immutable = require('immutable')
    , LayoutPanel = require('./LayoutPanel')
    , LayoutSpec = require('./spec')


const loadingEl = document.getElementById('layout-loading')
    , listEl = document.getElementById('layout-list')
    , containerEl = document.getElementById('layout-container')


const PERIODO_URL = 'http://localhost:5001'

const StandaloneGallery = React.createClass({
  getInitialState() {
    let spec = new LayoutSpec(window.location.hash.slice(1))

    if (!spec.layouts.get(-1).slice(-1).isEmpty()) {
      spec = spec.addLayoutGroup();
    }

    return { spec }
  },

  componentDidMount() {
    window.onhashchange = ({ newURL }) => {
      let spec = newURL.slice(newURL.indexOf('#') + 1);

      spec = new LayoutSpec(spec);

      if (!spec.layouts.get(-1).slice(-1).isEmpty()) {
        spec = spec.addLayoutGroup();
      }

      this.setState({ spec });
    }
  },

  render() {
    return h(LayoutPanel, Object.assign({
      onSpecChange: spec => {
        window.location.hash = spec.toString()
        this.setState({ spec })
      }
    }, this.props, this.state))
  }
})


function init() {
  Promise.all([
    fetch(`${PERIODO_URL}/d.jsonld`).then(resp => resp.json()),
    fetch(`${PERIODO_URL}/h`).then(resp => resp.json())
  ]).then(([dataset, prov]) => {
    window.dataset = Immutable.fromJS(dataset);
    window.prov = prov;

    listEl.classList.remove('hide');
    loadingEl.classList.add('hide');

    ReactDOM.render(h(StandaloneGallery, {
      data: window.dataset,
      prov: window.prov,
    }), containerEl);
  })
}


init();
