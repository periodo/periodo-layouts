"use strict";

const h = require('react-hyperscript')
    , { Block, LinkBlock, Heading, Text } = require('rebass')
    , enabledLayouts = require('../layouts')

module.exports = function LayoutPicker({ onSelectLayout }) {
  return (
    h('div .LayoutPicker', [
      h(Heading, { level: 2 }, 'Select layout'),
      h(Block, {
        tagName: 'ul',
        p: 0,
        style: {
          listStyleType: 'none'
        }
      }, Object.keys(enabledLayouts).map(name =>
        h(Block, { tagName: 'li', key: name }, [
          h(LinkBlock, {
            color: 'primary',
            href: '',
            onClick: e => {
              e.preventDefault();
              onSelectLayout(name);
            }
          }, h(Heading, { level: 3 }, enabledLayouts[name].label)),

          h(Text, enabledLayouts[name].description)
        ])
      ))
    ])
  )
}
