/*
   This module deals with migrating old plugin data directory into
   one used by version 2.0.0.

   For all versions after 2.0.0, updates should be handled
   by p-state and goal-table related modules.

   Note that this module only deals with files and never pass structured
   Objects to either p-state or goal-table related modules, as this part
   isn't really concerned about performance but about setting up the directory
   that is easier for p-state and goal-table to access and do their updates if needed.
*/
import nodeFS from 'fs'
import _ from 'lodash'
import { join } from 'path-extra'
import {
  readJsonSync,
  writeJsonSync,
  ensureDirSync,
  statSync,
  moveSync,
} from 'fs-extra'

const { APPDATA_PATH } = window

// TODO: file-common.es
const getPluginDirPath = _.memoize(() => {
  const dirPath = join(APPDATA_PATH, 'leveling')
  ensureDirSync(dirPath)
  return dirPath
})

const getBackupDirPath = _.memoize(() => {
  const dirPath = getPluginDirPath()
  const backupPath = join(dirPath, 'backup')
  ensureDirSync(backupPath)
  return backupPath
})

const fileExists = path => {
  try {
    statSync(path)
    return true
  } catch (_e) {
    return false
  }
}

// just need to insert a version number
const migrateLegacyGoalTable = obj => ({
  ...obj,
  $version: '2.0.0',
})

const migrateLegacyConfig = oldConf => {
  let {goalSorter, templates} = oldConf
  if (_.isEmpty(goalSorter)) {
    console.warn(`goalSorter shouldn't be empty, using default value ...`)
    goalSorter = {
      method: 'rid',
      reversed: false,
    }
  }

  if (!Array.isArray(templates) || templates.length === 0) {
    console.warn(`templates shouldn't be empty, using default value ...`)
    // default template list (as of 2.0.0)
    templates = [{
      type: 'main',
      method: {
        type: 'sortie',
        flagship: 'maybe',
        rank: ['S','A','B'],
        mvp: 'maybe',
        baseExp: {
          type: 'standard',
          map: '5-4',
        },
      },
    }]
  }

  const pState = {
    ui: {
      activeTab: 'goal',
      goalTab: {
        sortMethod: goalSorter,
      },
    },
    templates,
    $version: '2.0.0',
  }
  return pState
}

/* eslint-disable camelcase */
const migrate = () => {
  const dirPath = getPluginDirPath()
  const pStateFilePath = join(dirPath, 'p-state.json')
  const configFilePath = join(dirPath, 'config.json')
  // step 1: if p-state.json exists, we are done.
  if (fileExists(pStateFilePath))
    return

  /*
     step 2:
     scan directory and deal with all files except 'config.json'
     we do this first to guarantee that, when 'p-state.json' exists,
     everything must have been updated properly.
   */
  const files = nodeFS.readdirSync(dirPath)
  files.map(fileOrDirName => {
    /*
       skip config.json as we want to deal with it later,
       also skip backup/ directory
     */
    if (fileOrDirName === 'config.json' || fileOrDirName === 'backup') {
      return
    }

    // update goal-table-<int>.json
    const reResult = /^goal-table-(\d+).json$/.exec(fileOrDirName)
    let processed = false
    if (reResult) {
      try {
        const path = join(dirPath, fileOrDirName)
        writeJsonSync(
          path,
          migrateLegacyGoalTable(readJsonSync(path)),
        )
        processed = true
      } catch (e) {
        console.error(`error while updating goal table file ${fileOrDirName}`, e)
      }
    }

    // move errored / unrecognized files into backup dir
    if (!processed) {
      const backupPath = getBackupDirPath()
      /*
         it's intentional not to have try-catch around for moveSync.
         because if it fails, the plugin should fail to prevent any further operation.
       */
      moveSync(
        join(dirPath, fileOrDirName),
        join(backupPath, fileOrDirName),
        {overwrite: true}
      )
    }
  })

  // step 3: update config.json into p-state.json if exists
  if (!fileExists(configFilePath))
    return

  try {
    writeJsonSync(
      pStateFilePath,
      migrateLegacyConfig(readJsonSync(configFilePath))
    )
  } catch (e) {
    console.error(`error while updating config.json into p-state.json`, e)
  }

  // step 4: move config.json into backup/
  moveSync(
    configFilePath,
    join(getBackupDirPath(), 'config.json')
  )

  /*
     after this is done, we should only have these things in plugin directory:
       - backup/ directory, optional if it turns out no backup is needed.
       - p-state.json, does not exist for new users
       - some updated goal-table-<int>.json files, could be none of course.
   */
}

export {
  migrate,
}
