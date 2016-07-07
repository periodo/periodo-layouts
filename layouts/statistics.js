"use strict";

module.exports = {
  id: 'statistics',
  label: 'Statistics',
  description: 'Simple stastics about the dataset.',
  handler: function render(dataset, prov, container) {
    const collections = dataset.get('periodCollections')

    const collectionCount = collections.size

    const periodCount = collections
      .reduce((acc, collection) => acc + collection.get('definitions').size, 0)

    container.innerHTML = `
      <p>There are ${periodCount} period definitions in ${collectionCount} collections.</p>
    `
  }
}
