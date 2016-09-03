"use strict";

const h = require('react-hyperscript')
    , Immutable = require('immutable')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
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
    h('div', {
      style: {
        position: 'relative'
      }
    }, [
      editing && (
        h('a', {
          href: '',
          onClick: e => {
            e.preventDefault();
            removeLayoutGroup(groupIndex);
          },
          style: {
            float: 'left',
            textDecoration: 'none',
            color: 'black',
            background: 'red',
          }
        }, '❌')
      ),

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
