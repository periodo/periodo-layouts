"use strict";

const h = require('react-hyperscript')
    , { createStore, applyMiddleware, compose } = require('redux')
    , thunk = require('redux-thunk').default
    , { Provider } = require('react-redux')
    , rootReducer = require('./reducers')
    , LayoutPanel = require('./LayoutPanel')



module.exports = ({ initialState, data, prov }) => {
  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(thunk),
      (window || {}).devToolsExtension ? window.devToolsExtension() : a => a
    )
  )

  return (
    h(Provider, { store }, [
      h(LayoutPanel, { data, prov })
    ])
  )
}
