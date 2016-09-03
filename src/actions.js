"use strict";

const qs = require('qs')
    , Immutable = require('immutable')
    , registeredLayouts = Object.keys(require('./layouts'))
    , { Layout } = require('./records')

const {
  GENERAL_ERROR,

  RESET_LAYOUT_GROUPS,
  ADD_LAYOUT_GROUP,
  REMOVE_LAYOUT_GROUP,

  ADD_LAYOUT,
  REMOVE_LAYOUT,
  UPDATE_LAYOUT,

  ENABLE_EDITING,
  DISABLE_EDITING,
} = require('./consts')

module.exports = {
  addError,

  enableEditing,
  disableEditing,

  resetLayoutGroups,
  addLayoutGroup,
  removeLayoutGroup,

  addLayout,
  removeLayout,
  updateLayoutOptions,
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
  try {
    if (typeof groupSpec === 'string') {
      groupSpec = qs.parse(groupSpec).groups
    } else {
      groupSpec = JSON.parse(JSON.stringify(groupSpec));
    }

    if (!groupSpec) {
      groupSpec = [ [] ]
    }

    if (!Array.isArray(groupSpec)) {
      throw new Error('Layout groups should be an array of arrays');
    }

    const groups = Immutable.List().withMutations(groupList => {
      groupSpec.forEach((group, i) => {

        if (!Array.isArray(group)) {
          throw new Error('Layout groups should be an array of arrays');
        }

        groupList.push(Immutable.List().withMutations(layoutList => {
          group.forEach((layout, j) => {
            try {
              if (registeredLayouts.indexOf(layout.name) === -1) {
                throw new Error(
                  `Layout "${layout.name} is not a registered layout. ` +
                  `Valid layout choices: ${registeredLayouts.join(', ')}`
                )
              }

              layoutList.push(new Layout().merge(layout));
            } catch (e) {
              throw new Error(`Problem adding layout from ${i},${j}:\n${e}`);
            }
          })
        }))
      })
    })

    return {
      type: RESET_LAYOUT_GROUPS,
      groups
    }
  } catch (e) {
    return addError(e);
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

function addLayout(groupIndex, layoutIndex=Infinity, layout) {
  return (dispatch, getState) => {
    if (!getState().groups.has(groupIndex)) {
      return dispatch(addError(
        `Not a valid group index ${groupIndex}.\n` +
        `Valid keys are ${getState().groups.keySeq()}`
      ))
    }

    try {
      layout = new Layout().merge(layout)
    } catch (e) {
      return dispatch(addError(e))
    }

    dispatch({
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

function updateLayoutOptions(groupIndex, layoutIndex, options) {
  return (dispatch, getState) => {
    if (!options) return;

    if (!getState().groups.hasIn([groupIndex, layoutIndex])) {
      dispatch(addError(`No layout at (${groupIndex},${layoutIndex})`))
      return;
    }

    try {
      options = Immutable.fromJS(JSON.parse(JSON.stringify(options)));

      dispatch({
        type: UPDATE_LAYOUT,
        groupIndex,
        layoutIndex,
        options,
      })
    } catch (e) {
      dispatch(addError(e));
    }
  }
}
