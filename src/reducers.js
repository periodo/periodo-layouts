"use strict";

const { createReducer } = require('redux-immutablejs')
    , { ApplicationState, LayoutGroup } = require('./records')

const {
  GENERAL_ERROR,

  ENABLE_EDITING,
  DISABLE_EDITING,

  CLEAR_LAYOUT_GROUPS,
  ADD_LAYOUT_GROUP,
  REMOVE_LAYOUT_GROUP,

  ADD_LAYOUT,
  REMOVE_LAYOUT,
  UPDATE_LAYOUT,
} = require('./consts')



module.exports = createReducer(new ApplicationState(),  {
  [GENERAL_ERROR]: (state, action) => {
    const { msg } = action

    return state.update('errors', errors => errors.push(msg))
  },

  [ENABLE_EDITING]: state =>
    state.set('editing', true),

  [DISABLE_EDITING]: state =>
    state.set('editing', false),

  [CLEAR_LAYOUT_GROUPS]: state =>
    state.delete('groups'),

  [ADD_LAYOUT_GROUP]: (state, action) => {
    const { before=Infinity } = action

    return state.update('groups', groups =>
      groups.splice(before, 0, new LayoutGroup()))
  },

  [REMOVE_LAYOUT_GROUP]: (state, action) => {
    const { groupIndex } = action

    return state.deleteIn(['groups', groupIndex])
  },


  [ADD_LAYOUT]: (state, action) => {
    const { groupIndex, layoutIndex, layout } = action

    return state.updateIn(['groups', groupIndex, 'layouts'], layouts =>
      layouts.splice(layoutIndex, 0, layout))
  },

  [REMOVE_LAYOUT]: (state, action) => {
    const { groupIndex, layoutIndex } = action

    return state.deleteIn(['groups', groupIndex, 'layouts', layoutIndex])
  },

  [UPDATE_LAYOUT]: (state, action) => {
    const { groupIndex, layoutIndex, layout } = action

    return state.setIn(['groups', groupIndex, 'layouts', layoutIndex], layout)
  },
})
