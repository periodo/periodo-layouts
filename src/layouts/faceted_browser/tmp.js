  /*
  getInitialState() {
    return {
      facetedQuery: this.getInitialFacetedQuery(),
      selectedValues: Immutable.Map(),
    }
  },

  handleSelectFacet(facetName, value) {
    this.setState(prev => ({
      selectedValues: prev.selectedValues
        .update(facetName, Immutable.Set(), values => values.add(value))
    }))
  },

  handleDeselectFacet(facetName, value) {
    this.setState(prev => {
      let selectedValues = prev.selectedValues
        .update(facetName, values => values.remove(value))

      if (!selectedValues.get(facetName).size) {
        selectedValues = selectedValues.delete(facetName);
      }

      return { selectedValues }
    });
  },

  getFacetValues(fieldName) {
    const { brushedRange, searchText, selectedValues } = this.state

    let { facetedQuery } = this.state

    // First, get the matched documents for all other fields
    const intersectingIDs = selectedValues
      .delete(fieldName)
      .reduce((fq, values, name) => fq.select({ name, values }), facetedQuery)
      .selectedItems()
      .map(item => item.get('id'))

    // Now, get values matching all other constraints
    return facetedQuery
      .select({ name: 'id', values: intersectingIDs })
      .selectedFacetsByIndex([fieldName])
      .get(fieldName)
  },

  getMatchedPeriods(onlyInRange) {
    let { facetedQuery } = this.state

    return this.state.selectedValues
      .reduce((fq, values, name) => fq.select({ name, values }), facetedQuery)
      .selectedItems()
  },

  */


