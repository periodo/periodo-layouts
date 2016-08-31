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

//   List([
//     List([
//       Layout({ name, opts }),
//       Layout({ name, opts }),
//     ]),
//
//     List([
//       Layout({ name, opts, Filter({ collections, periods }) }),
//       Layout({ name, opts })
//       Layout({ name, opts, })
//     ]),
//
//     List([
//     ])
//   ])
const State = Immutable.Record({
  editing: false,
  groups: Immutable.fromJS([ [] ]),
  errors: Immutable.List()
})

module.exports = createReducer(new State(),  {
  [GENERAL_ERROR]: (state, action) => {
    const { msg } = action

    return state.update('errors', errors => errors.push(msg))
  },

  [ENABLE_EDITING]: state => state.set('editing', true),

  [DISABLE_EDITING]: state => state.set('editing', false),

  [RESET_LAYOUT_GROUPS]: (state, action) => {
    const { groups } = action

    return state.set('groups', groups)
  },

  [ADD_LAYOUT_GROUP]: (state, action) => {
    const { groupIndex } = action

    return state.update('groups', groups =>
      groups.splice(groupIndex, 0, Immutable.List()))
  },

  [REMOVE_LAYOUT_GROUP]: (state, action) => {
    const { groupIndex } = action

    return state.deleteIn(['groups', groupIndex])
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
    const { groupIndex, layoutIndex, options, filters } = action

    return state.updateIn(['groups', groupIndex, layoutIndex], layout => {
      if (filters) layout = layout.set('filters', filters);
      if (options) layout = layout.set('options', options);

      return layout;
    })
  },
})
