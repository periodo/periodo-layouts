"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , { Block, Button } = require('rebass')
    , { Flex } = require('reflexbox')
    , LayoutPicker = require('./Picker')
    , Layout = require('./Layout')

module.exports = React.createClass({
  displayName: 'LayoutGroup',

  getInitialState() {
    return { showAddLayout: false }
  },

  render() {
    const {
      groupIndex,
      editing,

      dataset,
      layouts,
      enabledLayouts,

      addLayout,
      removeLayout,
      updateLayoutOpts,
      removeLayoutGroup,
    } = this.props

    const { showAddLayout } = this.state

    return (
      h(Block, {
        style: !editing ? undefined : {
          border: '1px solid #ccc',
        }
      },
        h(Flex, layouts.toArray().map((layout, layoutIndex) =>
          h(Layout, Object.assign({}, layout.toObject(), {
            key: `${layoutIndex}-${layout.name}`,
            dataset,
            editing,
            groupIndex,
            layoutIndex,

            removeLayout,
            enabledLayouts,
            updateLayoutOpts,
          }))
        ).concat([
          editing && (showAddLayout || layouts.size === 0) && (
            h(LayoutPicker, {
              onSelectLayout: layout => addLayout(groupIndex, undefined, layout)
            })
          ),

          editing && (
            h(Flex, {
              style: { width: 120, background: '#f0f0f0' },
              column: true,
              justify: 'space-around'
            }, [
              h(Button, {
                mx: 1,
                my: 2,
                onClick: () => this.setState(prev => ({ showAddLayout: !prev.showAddLayout }))
              }, [
                'Add layout'
              ]),

              h(Button, {
                mx: 1,
                my: 2,
                backgroundColor: 'red',
                onClick: () => removeLayoutGroup(groupIndex)
              }, [
                'Remove group'
              ])
            ])
          )
        ]))
      )
    )
  }
})
