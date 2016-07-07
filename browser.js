"use strict";

const React = require('react')
    , ReactDOM = require('react-dom')
    , Immutable = require('immutable')



const enabledLayouts = [
  require('./layouts/statistics'),
  require('./layouts/changelog_summary')
]



const loadingEl = document.getElementById('layout-loading')
    , listEl = document.getElementById('layout-list')
    , containerEl = document.getElementById('layout-container')

const handlerByID = {}

enabledLayouts.forEach(layout => {
  handlerByID[layout.id] = layout.handler;
})

enabledLayouts.forEach(({ id, label, description }) => {
  const el = document.createElement('li')

  el.innerHTML = `
  <li>
    <h2>
      <a href="#${id}">${label}</a>
    </h2>

    <p>${description}</p>
  `

  listEl.appendChild(el);
});


/** Dealing with navigation/loading **/

function renderLayout(dataset, prov, handler) {
  const sandbox = document.createElement('div')

  containerEl.appendChild(sandbox);

  if ('isReactComponent' in handler.prototype) {
    ReactDOM.render(
      React.createElement(handler, { dataset, prov }),
      sandbox
    )
  } else {
    handler(dataset, prov, sandbox);
  }
}

function clearLayout() {
  while (containerEl.firstChild) {
    const child = containerEl.firstChild

    if (child.nodeType === document.ELEMENT_NODE) {
      ReactDOM.unmountComponentAtNode(child)
    }

    containerEl.removeChild(child);
  }
}

function handleHashChange(dataset, prov) {
  const id = window.location.hash.split('#')[1]

  clearLayout();

  if (!id) {
    listEl.classList.remove('hide');
  } else {
    const handler = handlerByID[id]

    listEl.classList.add('hide');

    if (!handler) {
      containerEl.innerHTML = `<p>Layout ${id} does not exist.`;
    } else {
      renderLayout(dataset, prov, handler)
    }
  }
}

function init() {
  Promise.all([
    fetch('https://test.perio.do/d.jsonld').then(resp => resp.json()),
    fetch('https://test.perio.do/h').then(resp => resp.json())
  ])
    .then(([dataset, prov]) => {
      window.dataset = Immutable.fromJS(dataset);
      window.prov = prov ;

      listEl.classList.remove('hide');
      loadingEl.classList.add('hide');

      window.onhashchange = handleHashChange.bind(null, window.dataset, window.prov);
      window.onhashchange();
    })
}

init();
