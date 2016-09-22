"use strict";

exports.label = 'Statistics';
exports.description = 'Simple stastics about the dataset.';

exports.renderer = {
  init(container, props) {
    this._container = container;
    this.update(props);
  },

  update({ data }) {
    const collections = data.get('periodCollections')
        , collectionCount = collections.size

    const periodCount = collections
      .reduce((acc, collection) => acc + collection.get('definitions').size, 0)

    this._container.innerHTML = `
      <p>There are ${periodCount} period definitions in ${collectionCount} collections.</p>
    `
  }
}
