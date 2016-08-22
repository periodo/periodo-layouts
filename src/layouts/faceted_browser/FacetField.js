"use strict";

const h = require('react-hyperscript')
    , React = require('react')
    , Immutable = require('immutable')
    , { isIterable } = Immutable.Iterable

function preventDefault(fn) {
  return e => {
    e.preventDefault();
    e.stopPropagation();

    fn(e);
  }
}

const FacetValue = ({ value='(undefined)' , count , handleClick, format }) =>
  h('tr', { key: isIterable(value) ? value.hashCode() : value }, [
    h('td', count),
    h('td', [
      h('a', { href: '', onClick: preventDefault(handleClick) }, [
        format ? format(value) : value
      ])
    ])
  ])


module.exports = React.createClass({
  displayName: 'FacetField',

  propTypes: {
    facetName: React.PropTypes.string.isRequired,
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
          , onDeselectFacet } = this.props
        , [ selectedFacetValues, unselectedFacetValues ] = this.getFacetValues()

    return (
      h('div .border', [
        h('div', [
          h('span', facetName),
          h('button', { onClick: onResetFacet }, 'Reset')
        ]),

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
    )
  }
});
