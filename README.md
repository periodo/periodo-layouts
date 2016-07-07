# PeriodO Layouts

A visualization sandbox and gallery for the [PeriodO] dataset.

## Setup

`npm install` to install dependencies

`npm run build` to compile the application

`npm run watch` to compile whenever files are edited

Once the application has been compiled, open `index.html`.

## Creating a new visualization

To create a visualization, first create a new module in the `layouts` folder.
Visualizations can be React components (see `layouts/changelog_summary`) or
simply work with a DOM node (see `layouts/statistics`). Then add the module to
the `enabledLayouts` array in `browser.js`.

Visualizations have access to the dataset itself (exposed as an ImmutableJS
Map) as well as its provenance graph (exposed as a plain object). See the
examples above for guidance.

Once your visualization is complete, submit a pull request to this repository
if you would would like it to be considered for inclusion in this gallery.

[PeriodO]: https://perio.do/
