"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , { withRebass, Button } = require('rebass')

exports.label = 'Period List';

exports.description = 'Selectable list of periods.';

exports.makePeriodFilter = function (opts) {
  const selectedPeriodID = opts.get('selectedPeriodID')

  return period => {
    return selectedPeriodID && period.get('id') === selectedPeriodID
  }
}

exports.defaultOpts = {
  limit: 20,
  start: 0,
}

const ListRow = withRebass(React.createClass({
  getInitialState() {
    return { hovered: false }
  },

  render() {
    const { period, style, selected } = this.props
        , { hovered } = this.state

    return (
      h('div', {
        onMouseEnter: () => this.setState({ hovered: true }),
        onMouseLeave: () => this.setState({ hovered: false }),
        onClick: this.props.onClick,
        style: Object.assign({}, style, {
          backgroundColor: (hovered || selected) ? '#ccc' : '#fff'
        })
      }, period.get('label'))
    )
  }
}))

exports.renderer = React.createClass({
  displayName: 'PeriodList',

  render() {
    const { data, updateOpts, selectedPeriodID, start, limit } = this.props

    const periods = data.get('periodCollections')
      .flatMap(c => c.get('definitions'))

    const shownPeriods = periods
      .skip(start)
      .take(limit)
      .toArray()

    return (
      h('div', [
        h('div', [
          periods.size === 0
            ? 'No matched periods.'
            : `${start + 1}‒${start + limit} of ${periods.size}`,

          h(Button, {
            onClick: () =>
              updateOpts(opts =>
                opts.update('start', s => (s - limit < 0) ? 0 : s - limit))
          }, '<'),

          h(Button, {
            onClick: () =>
              updateOpts(opts =>
                opts.update('start', s => (s + limit > periods.size) ? s : s + limit))
          }, '>'),
        ]),

        h('div', shownPeriods.map(period =>
          h(ListRow, {
            key: period.get('id'),
            period,
            selected: period.get('id') === selectedPeriodID,
            onClick: () => updateOpts(opts =>
              opts.update('selectedPeriodID', id => id === period.get('id') ? null : period.get('id'))),
            p: 1,
          })))
      ])
    )
  }
})
