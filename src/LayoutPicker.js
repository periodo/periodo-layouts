"use strict";

const h = require('react-hyperscript')
    , enabledLayouts = require('./layouts')
    , { Layout } = require('./records')

module.exports = function LayoutPicker({ onSelectLayout }) {
  return (
    h('div', [
      h('h2', 'Select layout'),
      h('ul', Object.keys(enabledLayouts).map(name =>
        h('li', { key: name }, [
          h('h3', [
            h('a', {
              href: '',
              onClick: e => {
                e.preventDefault();
                onSelectLayout(new Layout({ name }));
              }
            }, enabledLayouts[name].label)
          ]),
          h('p', enabledLayouts[name].description)
        ])
      ))
    ])
  )
}
