# PeriodO Layouts

A visualization sandbox and gallery for the [PeriodO] dataset.

## Setup

`npm install` to install dependencies

`npm run build` to compile the application

`npm run watch` to compile whenever files are edited

Once the application has been compiled, open `index.html`.


## Architecture

```
Data flow      *   Components
============   *   ==============
               *
  Dataset      *
     |         *
     |         *
-----|------   *    -------- --------
     |         *   |        |        |  \            \
     |         *   |        |        |   |            |
  Dataset      *   | Layout | Layout |   |<-- Group   |
     |         *   |        |        |   |            |
     v         *   |        |        |  /             |
--(matcher)--  *    -------- --------                 |
     |         *       |        |        \            |
     |         *       |        |         |           |
  Dataset'     *       | Layout |         | <-- Group | <--- Panel
     |         *       |        |         |           |
     v         *       |        |        /            |
--(matcher)--  *    -------- --------                 |
     |         *   |        |        |  \             |
     |         *   |        |        |   |            |
  Dataset''    *   | Layout | Layout |   |<-- Group   |
               *   |        |        |   |            |
               *   |        |        |  /            /
------------   *    -------- --------
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

## Creating a Layout

Layouts are generated from *handlers* which are registered in
`./src/layouts/index.js`. A handler can be understood as an object with a
certain set of fields:

### Layout.label

*String*

The name of this layout. For example, "Stacked timeline", or "Faceted browser"

### Layout.description

*String*

A brief description of what this layout does

#### Layout.deriveOpts

*function(prevDerivedOpts, serializedOpts, dataset)*

An optional function that can derive simply serialized options into more
complex datatypes. See notes on the render cycle below.

#### Layout.makePeriodMatcher

*function(derivedOpts, dataset)*

An optional function that is passed a layout's derived options and a dataset
and should return a function used to determine which periods match the criteria
of this layout (e.g., matching a certain string, falling within a boundary on
a map). Again, see notes on the render cycle below.

### Layout.renderer

A. *Object: {
   init(el, dataset, opts)
   render(dataset, opts, updateOpts)
}*

`.init()` is called as soon as the layout is mounted in the DOM. `.update()`
is called every time the system updates. It is also called after `init()`.

`updateOpts` is a callback which can be executed to update the `opts` Map.
After this update, the system will be updated according to the values of those
new parameters.  This new value will be the value of `opts` in the next render
cycle, and will also be the value of `opts`.

B. *ReactComponent*

If the renderer is a React Component, it will receive `dataset` and
`updateOpts` as props. It will not receive an `opts` prop– rather, it will
receive a prop for every key-value pair present in `opts`.

NOTE: Renderers that are not React components are only rendered after a DOM
node is available. For this this reason, they are *not* rendered on the server
(i.e. into a static HTML string). For server rendering, always use a React
component.


## Render cycle

The render algorithm performs two consecutive steps. First, it initializes
the layouts and computes how the dataset should flow between their respective
groups. Second, it mounts these layouts in the DOM and waits for external
stimuli (e.g., user interaction) to trigger another render cycle.


### Initialization and dataflow

In this process, layouts are given a chance to derive their own
internal state. Importantly, this derivation will occur *before the component
is rendered in the browser*, meaning it will be used via the CLI interface
to render static HTML.

#### .deriveOpts: Establishing internal state

Layouts must be completely generated from JSON-serializable paramters. This
includes, strictly: strings, numbers, lists, and objects. However, a layout
may depend on more complex datatypes that are not necessarily serializable and
deserializable from strings. For example, an Immutable.js data structures like
sets or ordered maps.

This mapping takes place in a property that can be defined on a layout handler:

```js
Layout.deriveOpts(prevDerivedOpts, serializedOpts, dataset)
```

*serializedOpts* an Immutable.Map reflecting the state of the current set of
serialized options that have been passed to this system, consisting only of
values that are strings, numbers, objects and lists (the latter two transformed
into Immutable.Map and Immutable.List objects). *dataset* is the dataset
as it has been passed to the current Layout's Group. *prevDerivedOpts* is the
value returned by `deriveOpts` in the previous render cycle. If the render cycle
has never run, the value of prevDerivedOpts will be an empty Immutable.Map.

So, if I wanted to use a Set in the internal state of my Layout, which is set
by the "members" option in serializedOpts, I could write the following:

```js
layout.deriveOpts = (prevDerivedOpts, serializedOpts) =>
  prevDerivedOpts
    .update('members', m =>
      m.intersect(serializedOpts.get('members')))
```

### .makePeriodMatcher: Transforming dataflow

Layouts are able to specify which periods should pass on to lower levels of
the panel (that is, groups after their own group).

```js
Layout.makePeriodMatcher(derivedOpts)
```

This function should return a function that will take four arguments and return
`true` or `false`:

```
function (period, periodKey, authority, authorityKey)
```

*period* is one of the periods in the dataset, represented as an Immutable.Map.
*periodKey* is the string that identifies that period. It is the same as the
`id` field in the period. *authority* is the authority in which this period is
defined. *authorityKey* is the string identifying that authority.

The function should return `true` if the period should go on to the next level,
and `false` if not. If *any* layout in a certain Group returns `true`, the
period will move on to the following Group. In this way, Layouts enact logical
OR relationships. (A period will proceed if it matches in Layout A, Layout B, OR
Layout C).

This function always runs *after* `.deriveOpts`. So, in the example above, the
period filter can use that derived Immutable.Set, and not just the limited set
of datatypes in the serialized options.


### Example layout

```js
const TextSearch = React.createClass({
  render() {
    const { searchString, updateOpts } = this.props

    return (
      h('label', [
        'Search: ',
        h('input', {
          type: 'text',
          value: searchString,
          onChange: e => updateOpts({ searchString: e.target.value })
        })
      ])
    )
  }
})

module.exports = {
  label: 'Text searcher',
  description: 'Search for a text string in a period label.'
  renderer: TextSearch,

  makePeriodMatcher(opts) {
    const { searchString } = opts

    return period =>
      searchString
        ? period.get('label').indexOf(searchString) > 1
        : true
  }
}
```

## Rendering to static HTML


## Creating a new layout

To create a layout, first create a new module in the `layouts` folder.
Then add the module to `module.exports` in `layouts/index.js`.


[PeriodO]: https://perio.do/
