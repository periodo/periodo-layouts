"use strict";

const h = require('react-hyperscript')
    , ReactDOM = require('react-dom')
    , Immutable = require('immutable')
    , Layouts = require('./Layouts')


const loadingEl = document.getElementById('layout-loading')
    , listEl = document.getElementById('layout-list')
    , containerEl = document.getElementById('layout-container')


const PERIODO_URL = 'http://localhost:5001'

/*
const StandaloneGallery = React.createClass({
  getInitialState() {
    return { layoutSpec: '' }
  },

  componentDidMount() {
    window.onhashchange = ({ newURL }) => {
      const layoutSpec = newURL.slice(newURL.indexOf('#') + 1);
      this.setState({ layoutSpec });
    }
  },

  render() {
    return h(LayoutOrganizer, this.state)
  }
})
*/


function init() {
  Promise.all([
    fetch(`${PERIODO_URL}/d.jsonld`).then(resp => resp.json()),
    fetch(`${PERIODO_URL}/h`).then(resp => resp.json())
  ]).then(([dataset, prov]) => {
    window.dataset = Immutable.fromJS(dataset);
    window.prov = prov;

    listEl.classList.remove('hide');
    loadingEl.classList.add('hide');

    ReactDOM.render(h(Layouts, {
      data: window.dataset,
      prov: window.prov,
    }), containerEl);
  })
}


init();
