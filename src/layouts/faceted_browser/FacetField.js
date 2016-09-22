"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { isIterable } = Immutable.Iterable
    , { Block, Button, Heading, LinkBlock } = require('rebass')
    , { Flex } = require('reflexbox')

function preventDefault(fn) {
  return e => {
    e.preventDefault();
    e.stopPropagation();

    fn(e);
  }
}

const Value = ({ value='(no value)' , count , handleClick, format }) =>
  h('tr', { key: isIterable(value) ? value.hashCode() : value }, [
    h('td', count),
    h('td', [
      h(LinkBlock, {
        href: '',
        color: 'primaryDarker',
        onClick: preventDefault(handleClick)
      }, [
        format ? format(value) : value
      ])
    ])
  ])

module.exports = React.createClass({
  displayName: 'FacetField',

  toggleShown() {
    const { updateOptions, field } = this.props

    updateOptions(options =>
      options.update('fields', fields =>
        fields.contains(field)
          ? fields.remove(fields.indexOf(field))
          : fields.push(field)
      )
    )
  },

  render() {
    const { minWidth, resultsMaxHeight, label, expanded } = this.props

    return (
      h(Block, {
        border: true,
        style: {
          minWidth,
          border: '1px solid #ccc',
          borderWidth: '2px',
        }
      }, [
        h(Flex, { column: true }, [
          h(Block, {
            backgroundColor: 'grayLightest',
            m: 0,
            p: 1,
            onClick: preventDefault(this.toggleShown),
          }, [
            h(Flex, { justify: 'space-between' }, [
              h(Heading, { level: 4, mr: 2 }, label),
              h('span', expanded ? 'x' : '+'),
            ]),
          ]),

          expanded && h(Block, {
            m: 0,
            px: 2,
            style: {
              maxHeight: resultsMaxHeight,
              overflowY: 'scroll'
            }
          }, [
            h('table', [
              h('tbody', unselectedFacetValues.map((ids, value) =>
                h(FacetValue, {
                  value,
                  format,
                  count: ids.size,
                  handleClick: onSelectFacet.bind(null, value),
                })).toArray()
              )
            ])
          ])
        ])
      ])
    )
  }
})
/*


module.exports = React.createClass({
  displayName: 'FacetField',

  propTypes: {
    label: React.PropTypes.string.isRequired,
    values: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    format: React.PropTypes.func,
    selectedValues: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    onSelectFacet: React.PropTypes.func,
    onDeselectFacet: React.PropTypes.func,
    onResetFacet: React.PropTypes.func
  },


  getFacetValues() {
    const { values, selectedValues } = this.props
        , selected = Immutable.Map().asMutable()
        , unselected = Immutable.Map().asMutable()

    values.forEach((val, key) => {
      if (selectedValues.has(key)) {
        selected.set(key, val);
      } else {
        unselected.set(key, val)
      }
    });

    return [selected.asImmutable(), unselected.asImmutable()]
      .map(map => map.asImmutable())
      .map(values => values.sortBy(ids => ids ? -ids.size : 0));
  },

  render() {
    const { facetName
          , format
          , onResetFacet
          , onSelectFacet
          , onDeselectFacet
          , minWidth
          , resultsMaxHeight } = this.props
        , [ selectedFacetValues, unselectedFacetValues ] = this.getFacetValues()

    return (
      h(Block, {
        border: true,
        style: {
          minWidth,
          border: '1px solid #ccc',
          borderWidth: '2px',
        }
      }, [
        h(Flex, { column: true }, [
          h(Block, { backgroundColor: 'grayLightest', m: 0, p: 2 }, [
            h(Heading, { level: 4, mr: 2 }, facetName),
          ]),

          /*
          h('div', [
            selectedFacetValues.size > 0 && (
              h('div', [
                h('h4', 'Selected'),
                h('table', [
                  h('tbody', selectedFacetValues.map((ids, value) =>
                    h(FacetValue, {
                      value,
                      format,
                      count: ids.size,
                      handleClick: onDeselectFacet.bind(null, value),
                    })).toArray()
                  )
                ])
              ])
            ),

          h(Block, {
            m: 0,
            px: 2,
            style: {
              maxHeight: resultsMaxHeight,
              overflowY: 'scroll'
            }
          }, [
            h('table', [
              h('tbody', unselectedFacetValues.map((ids, value) =>
                h(FacetValue, {
                  value,
                  format,
                  count: ids.size,
                  handleClick: onSelectFacet.bind(null, value),
                })).toArray()
              )
            ])
          ])
        ])
      ])
    )
  }
});
            */
