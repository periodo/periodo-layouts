"use strict";

require('isomorphic-fetch');

const qs = require('qs')
    , ReactDOM = require('react-dom')
    , Immutable = require('immutable')
    , { resetLayoutGroups } = require('./actions')
    , { renderToString } = require('react-dom/server')


// TODO: Make configurable/load from static file?
function loadData() {
  const PERIODO_URL = 'http://localhost:5001'

  return Promise.all([
    fetch(`${PERIODO_URL}/d.jsonld`).then(resp => resp.json()),
    fetch(`${PERIODO_URL}/h`).then(resp => resp.json())
  ])
}

function getInitialLayouts() {
  /*
  if (process.browser) {
    return window.location.hash.slice(1);
  }
  */

  // TODO: Improve!
  return process.argv[2]
}

function renderToDOM(component) {
  const loadingEl = document.getElementById('layout-loading')
      , listEl = document.getElementById('layout-list')
      , containerEl = document.getElementById('layout-container')
      , { store } = component.props

  listEl.classList.remove('hide');
  loadingEl.classList.add('hide');

  /*
  store.subscribe(() => {
    const groups = store.getState().groups
      .filter(group => group && group.size)
      .toJS()

    if (groups.length) {
      window.location.hash = qs.stringify({
        groups
      })
    }
  });
  */

  ReactDOM.render(component, containerEl);
}

function renderToStdout(component) {
  process.stdout.write(renderToString(component));
}

function init() {
  return loadData().then(([dataJSON, prov]) => {
    const data = Immutable.fromJS(dataJSON)
        , component = require('./Root')({ data, prov })
        , render = process.browser ? renderToDOM : renderToStdout
        , { store } = component.props

    Promise.resolve(store.dispatch(
      resetLayoutGroups(getInitialLayouts())
    )).then(() => {
      render(component)
    })

  })
}

init();
