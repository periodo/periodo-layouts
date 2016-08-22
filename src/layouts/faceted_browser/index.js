"use strict";

exports.label = 'Faceted browser';

exports.description = 'Create a browseable faceted classification based on all periods.';

const FacetBrowser = require('./FacetBrowser');

exports.handler = FacetBrowser;
