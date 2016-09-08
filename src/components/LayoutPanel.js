"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
    , { Button, Space } = require('rebass')
    , LayoutGroup = require('./LayoutGroup')

const baseStyles = {
  fontFamily: 'sans-serif',
  lineHeight: 1.33,
}

function mapStateToProps(state) {
  return {
    editing: state.editing,
    groupIDs: state.renderedGroups,
    errors: state.errors,
  }
}

LayoutPanel.propTypes = {
  data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  editing: React.PropTypes.bool.isRequired,
  groupIDs: React.PropTypes.instanceOf(Immutable.List).isRequired,
  errors: React.PropTypes.instanceOf(Immutable.List).isRequired,
  addLayout: React.PropTypes.func.isRequired,
}

function LayoutPanel ({
  data,

  editing,
  groupIDs,
  errors,

  enableEditing,
  disableEditing,

  addLayoutGroup,
  resetLayoutGroups,
}) {
  return (
    h('main .LayoutPanel', { style: baseStyles }, [
      h('div', [
        h('label', [
          'Edit ',
          h('input', {
            type: 'checkbox',
            checked: editing,
            onChange: editing ? disableEditing : enableEditing
          })
        ]),

        h(Space, { x: 4 }),

        h('span', [
          'No. of groups: ',
          groupIDs.size
        ]),

        h(Space, { x: 4 }),

        h(Button, {
          href: '',
          backgroundColor: 'secondary',
          onClick: e => {
            e.preventDefault();
            resetLayoutGroups('');
          }
        }, 'Reset')
      ]),

      h('hr'),

      errors.size > 0 && h('pre', {
        style: {
          background: 'red',
          fontWeight: 'bold',
        }
      }, errors.toArray().map((err, i) =>
        h('li', { key: i }, err.stack || err.toString())
      )),

      h('div', groupIDs.toArray().map((groupIndex, i) =>
        h(LayoutGroup, {
          key: groupIndex,
          data,
          groupIndex
        })
      )),

      editing && h('div', [
        h(Button, {
          onClick: () => { addLayoutGroup() },
        }, 'Add')
      ])
    ])
  )
}


module.exports = connect(
  mapStateToProps,
  dispatch => bindActionCreators(require('../actions'), dispatch)
)(LayoutPanel);
