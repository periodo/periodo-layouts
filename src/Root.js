"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , thunk = require('redux-thunk').default
    , { Provider } = require('react-redux')
    , { createStore, applyMiddleware, compose } = require('redux')
    , rootReducer = require('./reducers')
    , LayoutPanel = require('./components/Panel')
    , { ApplicationState } = require('./records')


const Root = React.createClass({
  propTypes: {
    store: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    prov: React.PropTypes.object.isRequired,
  },

  childContextTypes: {
    rebass: React.PropTypes.object,
  },

  getChildContext() {
    return {
      rebass: {
        colors: {
          // From https://standards.usa.gov/colors/

          // "Primary colors"
          primary: '#0071bc',
          primaryDarker: '#205493',
          primaryDarkest: '#112e51',

          base: '#212121',
          // grayDark: '#323a45',
          // grayLight: '#aeb0b5',
          white: '#fff',

          // "Secondary colors"
          primaryAlt: '#02bfe7',
          primaryAltDarkest: '#046b99',
          primaryAltDark: '#00a6d2',
          primaryAltLight: '#9bdaf1',
          primaryAltLightest: '#elf3f8',

          secondary: '#e31c3d',
          secondaryDarkest: '#981b1e',
          secondaryDark: '#cd2026',
          secondaryLight: '#e59c93',
          secondaryLightest: '#f9dede',

          // "Background colors"
          grayDark: '#323a45',
          gray: '#5b616b',
          grayLight: '#aeb0b5',
          grayLighter: '#d6d7d9',
          grayLightest: '#f1f1f1',
          grayWarmDark: '#494440',
          grayWarmLight: '#e4e2e0',
          grayCoolLight: '#dce4ef',

          // "Primary colors"
          gold: '#fdb81e',
          goldLight: '#fdb81e',
          goldLighter: '#fdb81e',
          goldLightest: '#fdb81e',
          green: '#fdb81e',
          greenLight: '#fdb81e',
          greenLighter: '#fdb81e',
          greenLightest: '#fdb81e',
          coolBlue: '#fdb81e',
          coolBlueLight: '#fdb81e',
          coolBlueLighter: '#fdb81e',
          coolBlueLightest: '#fdb81e',

          // "Special state colors"
          focus: '#3e94cf',
          visited: '#4c2c92',
        }

      }
    }
  },


  render() {
    const { store, data, prov } = this.props

    return (
      h(Provider, { store }, [
        h(LayoutPanel, { dataset: data, prov, enabledLayouts: require('./layouts') })
      ])
    )
  }
})

module.exports = ({ initialState, data, prov }) => {
  const store = createStore(
    rootReducer,
    (initialState || new ApplicationState()).set('dataset', data),
    compose(
      applyMiddleware(thunk),
      (window || {}).devToolsExtension ? window.devToolsExtension() : a => a
    )
  )


  return h(Root, { store, data, prov });

}
