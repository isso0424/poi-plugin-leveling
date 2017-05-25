import React, { Component } from 'react'
import { Checkbox, FormControl, ButtonGroup, Button } from 'react-bootstrap'

import { ExpValueEdit } from './exp-value-edit'
import { sortedMapKeys, getMapExpInfo } from '../../map-exp'

class MethodSortieEdit extends Component {
  handleFlagshipChange = e => {
    const { sortieInput, onSortieInputChange } = this.props
    onSortieInputChange({
      ...sortieInput,
      flagship: e.target.checked,
    })
  }

  handleMVPChange = e => {
    const { sortieInput, onSortieInputChange } = this.props
    onSortieInputChange({
      ...sortieInput,
      mvp: e.target.value,
    })
  }

  handleRankButtoToggle = (rank,selected) => () => {
    const { sortieInput, onSortieInputChange } = this.props
    const rankArr = sortieInput.rank

    const afterRank =
      selected
      ? rankArr.filter(x => x !== rank)
      : [...rankArr, rank]

    if (afterRank.length > 0) {
      onSortieInputChange({
        ...sortieInput,
        rank: afterRank,
      })
    }
  }

  handleExpValueChange = newValue => {
    const { sortieInput, onSortieInputChange } = this.props
    onSortieInputChange({
      ...sortieInput,
      expValue: newValue,
    })
  }

  handleBaseExpTypeToggle = e => {
    const { sortieInput, onSortieInputChange } = this.props
    onSortieInputChange({
      ...sortieInput,
      baseExpType: e.target.checked ? 'custom' : 'standard',
    })
  }

  handleExpMapChange = e => {
    const { sortieInput, onSortieInputChange } = this.props
    onSortieInputChange({
      ...sortieInput,
      expMap: e.target.value,
    })
  }

  render() {
    const { visible, sortieInput } = this.props
    const isCustomExp = sortieInput.baseExpType === 'custom'
    return (
      <div
          className="sortie-edit"
          style={{display: visible ? "flex" : "none"}}>
        <div className="base-exp-row">
          <Checkbox
              style={{flex: 2}}
              onChange={this.handleBaseExpTypeToggle}
              checked={isCustomExp}>
            Custom Base Exp
          </Checkbox>
          <FormControl
              onChange={this.handleExpMapChange}
              style={{flex: 5, display: isCustomExp ? "none" : "initial" }}
              componentClass="select"
              value={sortieInput.expMap} >
            {
              sortedMapKeys.map( map => (
                <option key={map} value={map}>
                  {`${map}: ${getMapExpInfo(map).name}`}
                </option>
              ))
            }
          </FormControl>
          <div style={{flex: 5, display: isCustomExp ? "initial" : "none" }}>
            <ExpValueEdit
                expValue={sortieInput.expValue}
                onValueChange={this.handleExpValueChange}
            />
          </div>
        </div>
        <div className="sortie-misc">
          <Checkbox
              onChange={this.handleFlagshipChange}
              style={{flex: 1}}
              checked={sortieInput.flagship}>
            Flagship
          </Checkbox>
          <FormControl
              onChange={this.handleMVPChange}
              style={{flex: 1}}
              componentClass="select"
              value={sortieInput.mvp} >
            <option value="maybe">MVP: ✓/❌</option>
            <option value="yes">MVP: ✓</option>
            <option value="no">MVP: ❌</option>
          </FormControl>
        </div>
        <div className="rank-row">
          <div>Rank:</div>
          <ButtonGroup className="bg-rank" style={{flex: 1}}>
            {
              ['S','A','B','C','D','E'].map( rank => {
                const selected = sortieInput.rank.indexOf(rank) !== -1
                return (
                  <Button
                      onClick={this.handleRankButtoToggle(rank,selected)}
                      bsStyle={selected ? "primary" : "default"}
                      key={rank}>{rank}</Button>
                )
              })
            }
          </ButtonGroup>
        </div>
      </div>
    )
  }
}

export { MethodSortieEdit }
