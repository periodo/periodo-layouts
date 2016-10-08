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

## API

### Layout

#### .name
String. The name of this layout. For example, "Stacked timeline", or "Faceted browser"

#### .description
String. A brief description of what this layout will render

#### .renderer
One of the following:

1. A React class

2. An object with "init" and "update" properties that are functions.

#### .makePeriodFilter(props)
A function that is passed the layout's derived options and should return a
function that will be used to filter periods. It is called with the arguments:
`period, periodKey, authority, authorityKey`. The function should return
`false` if the period should be filtered out, else `true`.

#### .deriveOpts(prevDerivedOpts, serializableOpts, dataset)
**(FIXME)**

A function that is passed a Map of options and a dataset and must return a Map
which will be given to the `.renderer` function or React component and rendered
into HTML.  By default, the options will be returned without any changes.

The usefulness of this setting lies in allowing layouts to have complexly-
derived properties not need to be recalculated on every change.


## Creating a new layout

To create a layout, first create a new module in the `layouts` folder.
Then add the module to `module.exports` in `layouts/index.js`.


[PeriodO]: https://perio.do/
