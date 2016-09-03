# PeriodO Layouts

A visualization sandbox and gallery for the [PeriodO] dataset.

## Setup

`npm install` to install dependencies

`npm run build` to compile the application

`npm run watch` to compile whenever files are edited

Once the application has been compiled, open `index.html`.


## Architecture

   Data flow     *          DOM Components
  ===========    *         ================
                 *
   Dataset       *
      |          *
      |          *
------|--------  *    -------- --------
      |          *   |        |        |  \            \
      |          *   |        |        |   |            |
   Dataset       *   | Layout | Layout |   |<-- Group   |
      |          *   |        |        |   |            |
      v          *   |        |        |  /             |
---(filters)---  *    -------- --------                 |
      |          *       |        |        \            |
      |          *       |        |         |           |
   Dataset'      *       | Layout |         | <-- Group | <--- Panel
      |          *       |        |         |           |
      v          *       |        |        /            |
---(filters)---  *    -------- --------                 |
      |          *   |        |        |  \             |
      |          *   |        |        |   |            |
   Dataset''     *   | Layout | Layout |   |<-- Group   |
                 *   |        |        |   |            |
                 *   |        |        |  /            /
---------------  *    -------- --------

A Panel consists of one or more Groups, and a Group consists of one or
more Layouts.

Layouts are passed a dataset and are expected to render some HTML or SVG.
Layouts can indicate that they have filtered some subset of that dataset, for
example, by brushing a range on a timeline or map. Layouts will only be aware
of the parts of the dataset that have been filtered by preceeding groups.

Layouts can either be React components, or JavaScript objects which contain
an `init()` method (and an optional `update()` method).

## Creating a new layout

To create a layout, first create a new module in the `layouts` folder.
Then add the module to `module.exports` in `layouts/index.js`.


[PeriodO]: https://perio.do/
