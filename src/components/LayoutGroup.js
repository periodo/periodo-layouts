"use strict";

const h = require('react-hyperscript')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
    , { Block, Close } = require('rebass')
    , LayoutPicker = require('./LayoutPicker')
    , Layout = require('./Layout')

function mapStateToProps(state, ownProps) {
  const { groupIndex } = ownProps

  return {
    editing: state.editing,
    layouts: state.groups.getIn([groupIndex, 'layouts']),
  }
}

function LayoutGroup({
  data,
  groupIndex,

  editing,
  layouts,

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

      h('div', layouts.toArray().map((layout, layoutIndex) =>
        h(Layout, {
          key: layoutIndex,
          data,
          groupIndex,
          layoutIndex,
        })
      )),
    ])
  )
}

module.exports = connect(
  mapStateToProps,
  dispatch => bindActionCreators(require('../actions'), dispatch)
)(LayoutGroup)
