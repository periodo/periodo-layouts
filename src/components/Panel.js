"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { pick } = require('lodash')
    , { bindActionCreators } = require('redux')
    , { connect } = require('react-redux')
    , { Block } = require('rebass')
    , { Flex } = require('reflexbox')
    , enabledLayouts = require('../layouts')
    , LayoutGroup = require('./Group')
    , EditBar = require('./EditBar')
    , { processGroups } = require('../utils')

const baseStyles = {
  fontFamily: 'sans-serif',
  lineHeight: 1.33,
  height: '100%',
}

function layoutRenderer(props, propName) {
  const val = props[propName]

  if ('isReactComponent' in (val.prototype || {})) return;

  const isValid = (
    typeof val === 'object' &&
    typeof val.init === 'function' &&
    typeof val.update === 'function'
  )

  if (isValid) return;

  let msg = `Layout ${props.label} `;

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
  displayName: 'LayoutPanel',

  propTypes: {
    enabledLayouts: React.PropTypes.objectOf(
      React.PropTypes.shape({
        label: React.PropTypes.string.isRequired,
        description: React.PropTypes.string.isRequired,
        deriveOpts: React.PropTypes.func,
        getFilters: React.PropTypes.func,
        renderer: layoutRenderer
      })
    ),

    dataset: React.PropTypes.instanceOf(Immutable.Map).isRequired,

    editing: React.PropTypes.bool.isRequired,
    errors: React.PropTypes.instanceOf(Immutable.List).isRequired,
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
    if (groups.size > 0 && processFrom === groups.size) return;

    const nextProcessedGroups = processGroups(
      enabledLayouts,
      dataset,
      groups,
      processedGroups,
      processFrom
    )

    this.setState({ processedGroups: nextProcessedGroups });
  },
  
  render() {
    const { editing, errors, groupActions } = this.props

    const { processedGroups } = this.state

    return (
      h(Flex, { column: true, style: baseStyles }, [
        errors.size > 0 && h('pre', {
          style: {
            background: 'red',
            fontWeight: 'bold',
          }
        }, errors.toArray().map((err, i) =>
          h('li', { key: i }, err.stack || err.toString())
        )),

        h(Block, {
          p: 2,
          style: {
            flexGrow: 1
          }
        }, processedGroups.toArray().map((group, i) =>
          h(LayoutGroup,Object.assign({}, {
            key: i,
            groupIndex: i,
            enabledLayouts,
            editing,
          }, group.toObject(), groupActions))
        )),

        h(EditBar),
      ])
    )
  }
})

module.exports = connect(
  state => state.toObject(),
  dispatch => ({
    groupActions: bindActionCreators(pick(require('../actions'), [
      'addLayout',
      'removeLayout',
      'updateLayoutOpts',
      'addLayoutGroup',
      'removeLayoutGroup',
    ]), dispatch)
  })
)(LayoutPanel);
