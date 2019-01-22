'use strict'

const Promise = require('bluebird')
const fs = require('fs');
const path = require('path');
const util = require('util');

// Promisify only readdir as we don´t need more
const readdirAsync = Promise.promisify(fs.readdir);
const writeFileAsync = Promise.promisify(fs.writeFile);

// Commandline handling
const optionDefinitions = [
  { name: 'folder', alias: 'f', type: String }
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)

// Add the path to your files
const folder = options.folder
// '/Users/frank-dieterstadtler/Downloads/customerdata';

// This will hold all entries from all files
//  Not unique
const all = []

// Read all files in our directory
return readdirAsync(folder)
  .then(files => {
    files
      .map(entry => {
        if(entry.indexOf('.') > 0 && path.extname(entry) === '.json') {
          // In case there are .json files in the folder that are not in JSON format
          try {
            const temp = require(path.join(folder, entry))

	    // I know for sure that all entries have an filled email column so I can just split here
            // and extract the domain name without checking
            temp.map(entry => (all.push(entry.email.split('@')[1])))
          } catch (e) {}
          return null
        }
      })

      console.log(all)
  })
  .then(() => {
    // Create a unique array
    // Use the new Set feature of ES 6
   return Promise.resolve([...new Set(all)])
  })
  .then(allUnique => {
    // Get a list of unique entries with the number of times it appears
    let newList = []

    allUnique.map(entry => {
      const t = all.filter(innerEntry => innerEntry === entry)
      newList.push({name: entry, count: t.length})
    })

    return Promise.resolve(newList)
  })
  .then(allUnique => {
    // Source: https://davidwalsh.name/array-sort
    allUnique.sort((a,b) => b.count - a.count)
    return Promise.resolve(allUnique)
   })
  .then(allUnique => {
    let content = allUnique.reduce((a, b) => a + `${b.name};${b.count}\n`, '')
    return writeFileAsync(path.join(folder, 'all.txt'), content)
  })
  .then(data => {
    console.log('Wrote file successfully')
  })
  .catch(err => {
    console.log('An error occured:', err)
  })
