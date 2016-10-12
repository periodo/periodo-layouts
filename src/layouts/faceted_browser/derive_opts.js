"use strict";

const Immutable = require('immutable')
    , { FacetedClassification, FacetedQuery } = require('immfacet')
    , facets = require('./facets')


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

module.exports = function deriveOpts(prev, opts, dataset) {
  let facetedClassification

  if (prev && dataset === prev.get('dataset')) {
    facetedClassification = prev.get('facetedClassification')
  } else {
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
    opts.get('fields', Immutable.List()).toSet()
  )

  let facetedQuery = new FacetedQuery(facetedClassification)

  opts.get('selectedValues', Immutable.Map()).forEach((values, name) => {
    facetedQuery = facetedQuery.select({ name, values });
  })

  return opts.merge({
    facetedClassification,
    facetedQuery,
  })
}
