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

  getMatchedPeriods(onlyInRange) {
    let { facetedQuery } = this.state

    return this.state.selectedValues
      .reduce((fq, values, name) => fq.select({ name, values }), facetedQuery)
      .selectedItems()
  },

  */


