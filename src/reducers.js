"use strict";

const Immutable = require('immutable')
    , { createReducer } = require('redux-immutablejs')

const {
  GENERAL_ERROR,

  ENABLE_EDITING,
  DISABLE_EDITING,

  RESET_LAYOUT_GROUPS,
  ADD_LAYOUT_GROUP,
  REMOVE_LAYOUT_GROUP,

  ADD_LAYOUT,
  REMOVE_LAYOUT,
  UPDATE_LAYOUT,
} = require('./consts')

const State = Immutable.Record({
  editing: false,
  groups: Immutable.List([ [] ]),
  renderedGroups: Immutable.List([]),
  errors: Immutable.List()
})

module.exports = createReducer(new State(),  {
  [GENERAL_ERROR]: (state, action) => {
    const { msg } = action

    return state.update('errors', errors => errors.push(msg))
  },

  [ENABLE_EDITING]: state =>
    state.set('editing', true),

  [DISABLE_EDITING]: state =>
    state.set('editing', false),


  [RESET_LAYOUT_GROUPS]: (state, action) => {
    const { groups } = action

    return state
      .set('groups', groups)
      .set('renderedGroups', groups.map((_, i) => i))
  },

  [ADD_LAYOUT_GROUP]: (state, action) => {
    const { before } = action
        , insertionIndex = state.renderedGroups.indexOf(before)

    return state
      .update('groups', groups => groups.push(Immutable.List()))
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
    const { groupIndex, layoutIndex, options } = action

    return state.updateIn(['groups', groupIndex, layoutIndex], layout => {
      if (options) layout = layout.set('options', options);

      return layout;
    })
  },
})
