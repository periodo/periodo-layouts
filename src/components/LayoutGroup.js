"use strict";

const h = require('react-hyperscript')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
    , { Block, Close } = require('rebass')
    , enabledLayouts = require('../layouts')
    , applyGroupFilters = require('../apply_group_filters')
    , LayoutPicker = require('./LayoutPicker')
    , Layout = require('./Layout')

function mapStateToProps(state, ownProps) {
  const { groupIndex, data } = ownProps

  return {
    editing: state.editing,
    layouts: state.groups.get(groupIndex),
    data: applyGroupFilters(
      enabledLayouts,
      data,
      state.groups.slice(0, groupIndex).filter(x => x))
  }
}

function LayoutGroup({
  groupIndex,

  editing,
  layouts,
  data,

  addLayout,
  removeLayoutGroup,
}) {
  return (
    h(Block, {
      style: !editing ? undefined : {
        border: '1px solid #ccc',
      }
    }, [
    /*
      editing && h(Close, {
        onClick: () => removeLayoutGroup(groupIndex)
      }),
      */

      editing && layouts.size === 0 && (
        h(LayoutPicker, {
          onSelectLayout: layout => addLayout(groupIndex, null, layout)
        })
      ),

      layouts.toArray().map((layout, layoutIndex) =>
        h(Layout, {
          key: layoutIndex,
          data,
          groupIndex,
          layoutIndex,
        })
      ),
    ])
  )
}

module.exports = connect(
  mapStateToProps,
  dispatch => bindActionCreators(require('../actions'), dispatch)
)(LayoutGroup)
