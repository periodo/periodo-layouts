# PeriodO Layouts

A visualization sandbox and gallery for the [PeriodO] dataset.

## Setup

`npm install` to install dependencies

`npm run build` to compile the application

`npm run watch` to compile whenever files are edited

Once the application has been compiled, open `index.html`.


## Architecture

```
Data flow     *   Components
============  *   ==============
              *
  Dataset     *
     |        *
     |        *
-----|------  *    -------- --------
     |        *   |        |        |  \            \
     |        *   |        |        |   |            |
  Dataset     *   | Layout | Layout |   |<-- Group   |
     |        *   |        |        |   |            |
     v        *   |        |        |  /             |
--(filter)--  *    -------- --------                 |
     |        *       |        |        \            |
     |        *       |        |         |           |
  Dataset'    *       | Layout |         | <-- Group | <--- Panel
     |        *       |        |         |           |
     v        *       |        |        /            |
--(filter)--  *    -------- --------                 |
     |        *   |        |        |  \             |
     |        *   |        |        |   |            |
  Dataset''   *   | Layout | Layout |   |<-- Group   |
              *   |        |        |   |            |
              *   |        |        |  /            /
------------  *    -------- --------
```

A Panel consists of one or more Groups, and a Group consists of one or
more Layouts.

Layouts have two functions in this system. First, they correspond to rendered
DOM nodes which can render a graphical representation of the dataset (e.g., a
timeline, map, or list). A layout controls this process through the `.render`
property.

Second, layouts act as points of transformation in the flow of data through the
system. Specifically, they are able to specify the set of periods should be
passed on to the following Group. By default, all periods are passed along,
but a Layout may, for example, not allow periods to pass which do not satisfy
some criteria measuring to textual, temporal, or spatial similarity.

## Render cycle


## Layout

A layout can be understood as types with the following fields:

### Layout.label

*String*

The name of this layout. For example, "Stacked timeline", or "Faceted browser"

### Layout.description

*String*

A brief description of what this layout does


### Layout.render
A. *Object: { init(el, dataset, opts), render(dataset, opts, updateOpts) }*

`.init()` is called as soon as the layout is mounted in the DOM. `.update()`
is called every time the system updates. It is also called after `init()`.

`updateOpts` is a callback which can be executed to update the `opts` Map.
After this update, the system will be updated according to the values of those
new parameters.

For example, if I were writing a simple text input which filters out periods
with matching labels, I would need to keep track of the state of the text
entered into the input. To update that state to a new value, I would call:

    `updateOpts(opts => opts.set('text', 'newvalue'))`

This value will be the value of `opts` in the next render cycle, and will also
be the value of `opts`.

B. *ReactComponent*

If the renderer is a react component, it will receive `dataset` and
`updateOpts` as props. It will not receive an `opts` prop- rather, it will
receive a prop for every key-value pair present in `opts`.

NOTE: Renderers that are not React components are only rendered after a DOM
node is available. For this this reason, they are *not* rendered on the server
(i.e. into a static HTML string). For server rendering, always use a React
component.

#### Layout.makePeriodFilter(...)
A function that is passed the layout's derived options and should return a
function that will be used to filter periods. It is called with the arguments:
`period, periodKey, authority, authorityKey`. The function should return
`false` if the period should be filtered out, else `true`.

#### .deriveOpts(prevDerivedOpts, serializedOpts, dataset)
**(FIXME)**

A function that is passed a Map of options and a dataset and must return a Map
which will be given to the `.renderer` function or React component and rendered
into HTML.  By default, the options will be returned without any changes.

The usefulness of this setting lies in allowing layouts to have complexly-
derived properties not need to be recalculated on every change.


## Rendering to static HTML


## Creating a new layout

To create a layout, first create a new module in the `layouts` folder.
Then add the module to `module.exports` in `layouts/index.js`.


[PeriodO]: https://perio.do/
