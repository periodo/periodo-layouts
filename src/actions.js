"use strict";

const qs = require('qs')
    , Immutable = require('immutable')
    , registeredLayouts = require('./layouts')
    , { Layout } = require('./records')

const {
  GENERAL_ERROR,

  CLEAR_LAYOUT_GROUPS,
  ADD_LAYOUT_GROUP,
  REMOVE_LAYOUT_GROUP,

  ADD_LAYOUT,
  REMOVE_LAYOUT,
  UPDATE_LAYOUT,

  ENABLE_EDITING,
  DISABLE_EDITING,
} = require('./consts')


function copy(data) {
  return JSON.parse(JSON.stringify(data))
}


module.exports = {
  addError,

  enableEditing,
  disableEditing,

  resetLayoutGroups,
  addLayoutGroup,
  removeLayoutGroup,

  addLayout,
  removeLayout,
  updateLayoutOpts,
}


function addError(msg) {
  return {
    type: GENERAL_ERROR,
    msg
  }
}

function enableEditing() {
  return {
    type: ENABLE_EDITING
  }
}

function disableEditing() {
  return {
    type: DISABLE_EDITING
  }
}

function resetLayoutGroups(groupSpec) {
  return (dispatch, getState) => {
    try {
      dispatch({ type: CLEAR_LAYOUT_GROUPS });

      if (typeof groupSpec === 'string') {
        groupSpec = qs.parse(groupSpec).groups
      } else {
        groupSpec = copy(groupSpec)
      }

      if (!groupSpec) {
        groupSpec = [ [] ]
      }

      if (!Array.isArray(groupSpec)) {
        throw new Error('Layout groups should be an array of arrays');
      }

      groupSpec.forEach(group => {
        if (!Array.isArray(group.layouts)) {
          throw new Error('Layout groups should be an array of arrays');
        }

        dispatch(addLayoutGroup());

        const groupIndex = getState().groups.keySeq().last()

        group.layouts.forEach(({ name, opts }) => {
          dispatch(addLayout(groupIndex, undefined, name, opts));
        })
      })
    } catch (e) {
      return dispatch(addError(e));
    }
  }
}

function addLayoutGroup(groupIndex=Infinity) {
  return {
    type: ADD_LAYOUT_GROUP,
    groupIndex
  }
}

function removeLayoutGroup(groupIndex) {
  return {
    type: REMOVE_LAYOUT_GROUP,
    groupIndex
  }
}

function addLayout(groupIndex, layoutIndex=Infinity, name, initialOpts) {
  return (dispatch, getState) => {
    if (!getState().groups.has(groupIndex)) {
      return dispatch(addError(
        `Not a valid group index ${groupIndex}.\n` +
        `Valid keys are ${getState().groups.keySeq()}`
      ))
    }

    const opts = makeOpts(name, initialOpts);

    // FIXME: Check if layout exists in registered layouts

    const layout = new Layout({ name, opts, })

    return dispatch({
      type: ADD_LAYOUT,
      groupIndex,
      layoutIndex,
      layout,
    })
  }
}

function removeLayout(groupIndex, layoutIndex) {
  return {
    type: REMOVE_LAYOUT,
    groupIndex,
    layoutIndex
  }
}

function updateLayoutOpts(groupIndex, layoutIndex, opts) {
  return (dispatch, getState) => {
    if (!opts) return;

    const { groups } = getState()

    let layout = groups.getIn([groupIndex, 'layouts', layoutIndex])

    if (typeof opts === 'function') {
      opts = opts(layout.opts);
    }

    opts = makeOpts(layout.name, opts);

    if (!layout) {
      dispatch(addError(`No layout at (${groupIndex},${layoutIndex})`))
      return;
    }

    layout = layout.set('opts', opts)

    try {
      dispatch({
        type: UPDATE_LAYOUT,
        groupIndex,
        layoutIndex,
        layout,
      })
    } catch (e) {
      dispatch(addError(e));
    }
  }
}

function makeOpts(layoutName, opts) {
  return Immutable.fromJS(copy(Immutable.Map().merge(
    registeredLayouts[layoutName].defaultOpts || {},
    opts
  )))
}
