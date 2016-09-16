"use strict";

const Immutable = require('immutable')
    , { createReducer } = require('redux-immutablejs')
    , { ApplicationState } = require('./records')

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
    const { before } = action
        , insertionIndex = state.renderedGroups.indexOf(before)

    return state
      .update('groups', groups => groups.push(new LayoutGroup()))
      .update(state =>
        state.update('renderedGroups', renderedGroups =>
          renderedGroups.splice(
            insertionIndex === -1 ? Infinity : insertionIndex,
            0,
            state.groups.keySeq().last()
          )
        )
      )
  },

  [REMOVE_LAYOUT_GROUP]: (state, action) => {
    const { groupIndex } = action

    return state
      .update('groups', groups => groups.set(groupIndex, null))
      .update('renderedGroups', groups => groups.filter(i => i !== groupIndex))
  },


  [ADD_LAYOUT]: (state, action) => {
    const { groupIndex, layoutIndex, layout } = action

    return state.updateIn(['groups', groupIndex], group =>
      group.splice(layoutIndex, 0, layout))
  },

  [REMOVE_LAYOUT]: (state, action) => {
    const { groupIndex, layoutIndex } = action

    return state.deleteIn(['groups', groupIndex, layoutIndex])
  },

  [UPDATE_LAYOUT]: (state, action) => {
    const { groupIndex, layoutIndex, layout } = action

    return state.setIn(['groups', groupIndex, layoutIndex], layout)
  },
})
