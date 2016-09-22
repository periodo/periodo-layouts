"use strict";

const Immutable = require('immutable')
    , { FacetedClassification, FacetedQuery } = require('immfacet')
    , facets = require('./facets')
    , { Derivations } = require('../../records')


function updateFacetFields(dataset, facetedClassification, existing, desired) {
  existing.subtract(desired).forEach(field => {
    facetedClassification = facetedClassification.removeFacet(field);
  })

  desired.subtract(existing).forEach(field => {
    const { fn, multiValue } = facets[field]

    facetedClassification = facetedClassification
      .addFacet(field, fn.bind(null, dataset), { multiValue })
  })

  return facetedClassification;
}

module.exports = function processor(dataset, options, { attributes }) {
  let facetedClassification = attributes.get('facetedClassification')

  if (!facetedClassification) {
    const periods = dataset
      .get('periodCollections')
      .flatMap(collection => collection
        .get('definitions')
        .map(period => period.set('collection_id', collection.get('id'))))
      .toList()


    facetedClassification = new FacetedClassification(periods)
  }

  facetedClassification = updateFacetFields(
    dataset,
    facetedClassification,
    facetedClassification.facets().keySeq().toSet(),
    options.get('fields', Immutable.List()).toSet()
  )

  let facetedQuery = new FacetedQuery(facetedClassification)

  options.get('selectedValues', Immutable.Map()).forEach((values, name) => {
    facetedQuery = facetedQuery.select({ name, values });
  })

  attributes = attributes
    .set('facetedClassification', facetedClassification)
    .set('facetedQuery', facetedQuery);

  return new Derivations({
    keptPeriods: facetedQuery.selectedItems(),
    attributes
  })
}
