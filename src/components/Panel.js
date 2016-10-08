"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
    , { Button, Space } = require('rebass')
    , LayoutGroup = require('./Group')

const baseStyles = {
  fontFamily: 'sans-serif',
  lineHeight: 1.33,
}

function mapStateToProps(state) {
  return {
    groups: state.groups,
    editing: state.editing,
    errors: state.errors,
  }
}

function layoutRenderer(props, propName) {
  const val = props[propName]

  if ('isReactComponent' in val) return;

  const isValid = (
    typeof val === 'object' &&
    typeof val.init === 'function' &&
    typeof val.update === 'function'
  )

  if (isValid) return;

  let msg = `Layout ${props.name} `;

  if (val === undefined) {
    msg += 'has not defined a `render` property.';
  } else {
    msg += 'has defined an invalid `render` property.';
  }

  msg += (
    'A Layout renderer must be either:\n' + 
    '  1. An object with init() and update() properties\n' +
    '  2. A React component.'
  )

  return new Error(msg)
}



const LayoutPanel = React.createClass({
  propTypes: {
    enabledLayouts: React.PropTypes.objectOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        description: React.PropTypes.string.isRequired,
        deriveOpts: React.PropTypes.func,
        getFilters: React.PropTypes.func,
        renderer: layoutRenderer
      })
    ),

    dataset: React.PropTypes.instanceOf(Immutable.Map).isRequired,

    editing: React.PropTypes.bool.isRequired,
    errors: React.PropTypes.instanceOf(Immutable.List).isRequired,

    addLayout: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      processedGroups: Immutable.List()
    }
  },

  componentWillMount() {
    this.updateProcessedGroups(this.props.groups)
  },

  componentWillReceiveProps(nextProps) {
    this.updateProcessedGroups(nextProps.groups)
  },

  updateProcessedGroups(groups) {
    const { dataset } = this.props
        , { processedGroups } = this.state

    let processFrom = 0

    groups.forEach((group, i) => {
      const prevProcessedGroup = processedGroups.get(i)

      // There's never been a processed layout at this position. Process
      // from this group on.
      if (!prevProcessedGroup) return false;

      const optsHaveChanged = group.get('layouts').some((layout, j) =>
        !Immutable.is(layout.get('opts'), prevProcessedGroup.getIn(['layouts', j])))

      if (optsHaveChanged) return false;

      // Everything is the same- keep looking.
      processFrom += 1;
    })


    // The loop made it through all the groups without finding one that
    // needed cooking.
    if (processFrom + 1 === groups.size) return;

    const nextProcessedGroups = processGroups(
      enabledLayouts,
      dataset,
      groups,
      processGroups,
      processFrom
    )

    this.setState({ processedGroups: nextProcessedGroups });
  },
  
  render() {
    const {
      editing,
      errors,

      enableEditing,
      disableEditing,

      addLayoutGroup,
      resetLayoutGroups,
    } = this.props

    const { processGroups } = this.state

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
            processedGroups.size
          ]),

          h(Space, { x: 4 }),

          h(Button, {
            href: '',
            backgroundColor: 'secondary',
            onClick: e => {
              e.preventDefault();
              resetLayoutGroups([]);
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

        h('div', processedGroups.toArray().map((group, i) =>
          h(LayoutGroup, Object.assign({ key: i }, group.toObject()))
        )),

        editing && h('div', [
          h(Button, {
            onClick: () => { addLayoutGroup() },
          }, 'Add')
        ])
      ])
    )
  }
})


module.exports = connect(
  mapStateToProps,
  dispatch => bindActionCreators(require('../actions'), dispatch)
)(LayoutPanel);
