"use strict";

const qs = require('qs')
    , ReactDOM = require('react-dom')
    , Immutable = require('immutable')
    , { resetLayoutGroups } = require('./actions')


const loadingEl = document.getElementById('layout-loading')
    , listEl = document.getElementById('layout-list')
    , containerEl = document.getElementById('layout-container')


const PERIODO_URL = 'https://n2t.net/ark:/99152/p0';

function init() {
  Promise.all([
    fetch(`${PERIODO_URL}/d.jsonld`).then(resp => resp.json()),
    fetch(`${PERIODO_URL}/h`).then(resp => resp.json())
  ]).then(([dataset, prov]) => {
    window.dataset = Immutable.fromJS(dataset);
    window.prov = prov;

    listEl.classList.remove('hide');
    loadingEl.classList.add('hide');

    const root = require('./Root')({
      data: window.dataset,
      prov: window.prov,
    });

    const { store } = root.props

    store.dispatch(resetLayoutGroups(window.location.hash.slice(1)));

    store.subscribe(() => {
      window.location.hash = qs.stringify({ groups: store.getState().groups.toJS() })
    });

    ReactDOM.render(root, containerEl);
  })
}


init();
