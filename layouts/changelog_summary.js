
"use strict";

const React = require('react')
    , h = require('react-hyperscript')

const CollectionList = React.createClass({
  render() {
    const { prov } = this.props

    const changes = prov.history
      .filter(node => node['@id'].indexOf('#change-') === 0)

    const dates = changes
      .map(change => new Date(change.mergedAt))
      .sort((a, b) => a.getTime() - b.getTime())

    return (
      h('div', [
        h('p', `There have been ${changes.length} changes to the dataset.`),

        h('p', [
          'Earliest change: ',
          dates[0].toLocaleString()
        ]),

        h('p', [
          'Latest change: ',
          dates[dates.length - 1].toLocaleString()
        ])
      ])
    )
  }
})

module.exports = {
  id: 'changelog-summary',
  label: 'Changelog summary',
  description: 'Simple summary of the changes to the dataset.',
  handler: CollectionList
}
