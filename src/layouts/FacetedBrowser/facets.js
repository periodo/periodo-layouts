"use strict";

const Immutable = require('immutable')
    , { getDisplayTitle } = require('periodo-utils/lib/items/source')

const iso639_3 = require('iso-639-3').reduce((obj, lang) => {
  const key = lang.iso6393

  if (key) {
    obj[key] = lang;
  }

  return obj;
}, {});

module.exports = {
  source: {
    label: 'Source',
    fn: (data, period) =>
      getDisplayTitle(data.getIn([
        'periodCollections', period.get('collection_id'), 'source'
      ]))
  },

  language: {
    label: 'Language',
    multiValue: true,
    fn: (data, period) =>
      period
        .get('localizedLabels', Immutable.Map())
        .keySeq()
        .map(code => iso639_3[code.split('-')[0]].name)
  },

  spatialCoverage: {
    label: 'Spatial coverage',
    multiValue: true,
    fn: (data, period) => period.get('spatialCoverage'),
    format: val => val.get('label')
  }
}
