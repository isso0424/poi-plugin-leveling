import _ from 'lodash'
import { bindActionCreators } from 'redux'
import { modifyObject } from 'subtender'
import { store } from 'views/create-store'

import { loadGoalTable } from '../goal-table'
import { recommended as recommendedTL } from '../default-template-list'
import { initState } from './init-state'

const reducer = (state = initState, action) => {
  if (action.type === '@poi-plugin-leveling@ready') {
    const {pState} = action
    return {
      ...state,
      ...pState,
      pReady: true,
    }
  }

  if (!state.pReady)
    return state

  if (action.type === '@poi-plugin-leveling@modify') {
    const {modifier} = action
    return modifier(state)
  }

  return state
}

const actionCreators = {
  ready: pStateOrNull => {
    const templates = _.get(pStateOrNull, 'templates')
    const ui = _.get(pStateOrNull, 'ui')

    const pState = {}
    if (!_.isEmpty(templates)) {
      pState.templates = templates
    } else {
      pState.templates = recommendedTL
    }

    if (!_.isEmpty(ui))
      pState.ui = ui

    return {
      type: '@poi-plugin-leveling@ready',
      pState,
    }
  },
  modify: modifier => ({
    type: '@poi-plugin-leveling@modify',
    modifier,
  }),
  loadGoalTable: admiralId => dispatch =>
    setTimeout(() => {
      const goalTable = loadGoalTable(admiralId)
      const goals = {
        admiralId,
        goalTable,
      }
      dispatch(actionCreators.modify(modifyObject('goals', () => goals)))
    }),
  uiModify: modifier =>
    actionCreators.modify(modifyObject('ui', modifier)),
  templatesModify: modifier =>
    actionCreators.modify(
      modifyObject('templates', templates => {
        if (Array.isArray(templates)) {
          return modifier(templates)
        } else {
          console.error(`templates not ready`, templates)
          return templates
        }
      })
    ),
  goalsModify: modifier =>
    actionCreators.modify(
      modifyObject('goals', goals => {
        if (
          goals && typeof goals === 'object' &&
          goals.admiralId !== null && goals.goalTable !== null
        ) {
          return modifier(goals)
        } else {
          console.error(`goals not ready`, goals)
          return goals
        }
      })
    ),
}

const mapDispatchToProps = _.memoize(dispatch =>
  bindActionCreators(actionCreators, dispatch))

const boundActionCreators = mapDispatchToProps(store.dispatch)

export * from './init-state'

export {
  reducer,
  actionCreators,
  mapDispatchToProps,
  boundActionCreators,
}