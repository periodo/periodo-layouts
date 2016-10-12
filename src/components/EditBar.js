"use strict";

const h = require('react-hyperscript')
    , { pick } = require('lodash')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
    , { Button } = require('rebass')
    , { Flex } = require('reflexbox')
    , actions = require('../actions')

function mapStateToProps(state) {
  return pick(state, ['editing', 'groups'])
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    pick(actions, [
      'enableEditing',
      'disableEditing',
      'resetLayoutGroups',
      'addLayoutGroup',
    ]),
    dispatch
  )
}

const EditBar = ({
  editing,
  enableEditing,
  disableEditing,
  addLayoutGroup,
  resetLayoutGroups
}) => 
  h(Flex, {
    justify: 'space-around',
    p: 2,
    style: {
      backgroundColor: '#f0f0f0',
      flexShrink: 0
    }
  }, [
    h('label', [
      'Edit ',
      h('input', {
        type: 'checkbox',
        checked: editing,
        onChange: editing ? disableEditing : enableEditing
      })
    ]),

    h(Button, {
      onClick: () => addLayoutGroup(),
    }, 'Append group'),

    h(Button, {
      href: '',
      backgroundColor: 'secondary',
      onClick: e => {
        e.preventDefault();
        resetLayoutGroups([]);
      }
    }, 'Reset')
  ])

module.exports = connect(mapStateToProps, mapDispatchToProps)(EditBar)
