"use strict";

const qs = require('qs')
    , Immutable = require('immutable')
    , registeredLayouts = require('./layouts')
    , { Layout, Derivations } = require('./records')

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
        if (!Array.isArray(group)) {
          throw new Error('Layout groups should be an array of arrays');
        }

        dispatch(addLayoutGroup());

        const groupIndex = getState().keySeq().last()

        group.forEach(({ name, options }) => {
          dispatch(addLayout(groupIndex, name, options));
        })
      })
    } catch (e) {
      return addError(e);
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

function addLayout(groupIndex, layoutIndex=Infinity, name, options) {
  return (dispatch, getState) => {
    if (!getState().groups.has(groupIndex)) {
      return dispatch(addError(
        `Not a valid group index ${groupIndex}.\n` +
        `Valid keys are ${getState().groups.keySeq()}`
      ))
    }

    options = makeOptions(name, options);

    // FIXME: Check if layout exists in registered layouts

    const layout = new Layout({
      name,
      options,
      derived: derivationsFromOptions(getState().dataset, name, options)
    })

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

function updateLayoutOptions(groupIndex, layoutIndex, options) {
  return (dispatch, getState) => {
    if (!options) return;

    const { groups, dataset } = getState()

    let layout = groups.getIn([groupIndex, 'layouts', layoutIndex])

    options = makeOptions(layout.name, options);

    if (!layout) {
      dispatch(addError(`No layout at (${groupIndex},${layoutIndex})`))
      return;
    }

    layout = layout
      .set('options', options)
      .set('derived', derivationsFromOptions(
        dataset,
        layout.name,
        options,
        layout.derivations
      ))

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

function makeOptions(layoutName, options) {
  return Immutable.fromJS(copy(Immutable.Map().merge(
    registeredLayouts[layoutName].defaultOptions || {},
    options
  )))
}


// TODO: Allow this to be async?
function derivationsFromOptions(dataset, layoutName, options, prevDerivations) {
  let nextDerivations = null

  const { processor } = registeredLayouts[layoutName]

  if (processor) {
    nextDerivations = processor(dataset, options, prevDerivations || new Derivations())
  }

  return nextDerivations
}
