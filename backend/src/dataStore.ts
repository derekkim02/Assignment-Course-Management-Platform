// YOU SHOULD MODIFY THIS OBJECT BELOW

import * as fs from 'fs';
// import { getTimestamp } from './helpers';
import { DataStore } from './types';

const FILENAME = 'datastore.json';

/** @type {import("./types/internal").DataStore} */
// let data : DataStore = {
//   channels: {},
//   messages: {},
//   users: {},
//   lastId: {
//     channels: -1,
//     messages: -1,
//     users: -1
//   },
//   globalOwnerId: undefined
// };

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/


/**
 * Returns a new empty datastore
 * @returns {DataStore}
 */
const getInitialState: () => DataStore = () => {
  // const curTime = getTimestamp();
  return {
    users: {},
    accommodations: {},
    courses: {},
    assignments: {},
    testCases: {},
    terms: {},
    lectures: {},
    groups: {},
    inGroups: {},
    submissions: {},
    grades: {},
  };
};

// Use get() to access the data
/**
 * Returns the current state of the datastore (or a new one if it does not exist)
 * @returns {DataStore}
 */
function getData(): DataStore {
  if (fs.existsSync(FILENAME)) {
    return JSON.parse(fs.readFileSync(FILENAME, { encoding: 'utf-8' }));
  } else {
    setData(getInitialState());
    return getData();
  }
}

// Use set(newData) to pass in the entire data object, with modifications made
/**
 * Saves the provided data to the datastore file
 * @param {ReturnType<typeof getData>} newData
 */
function setData(newData: DataStore) {
  fs.writeFileSync(FILENAME, JSON.stringify(newData), { encoding: 'utf-8' });
}

/**
 * Clears the datastore by deleting it
 */
function clearData() {
  if (fs.existsSync(FILENAME)) {
    fs.rmSync(FILENAME);
  }
}

export { getData, setData, getInitialState, clearData };
