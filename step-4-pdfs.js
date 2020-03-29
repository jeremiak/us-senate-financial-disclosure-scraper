
const util = require('util')

const glob = util.promisify(require("glob"));

const files = Promise.all([
  `data/reports/*.pdf`, `data/reports/*.html`
].map(d => glob(d)))

files.then(files => {
  console.log(`There are ${files[0].length} pdfs`)
  console.log(`There are ${files[1].length} html files`)
})
