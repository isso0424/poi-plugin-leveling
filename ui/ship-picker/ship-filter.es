import React, { Component } from 'react'
import { Table, Button, DropdownButton, MenuItem, ButtonGroup } from 'react-bootstrap'

class ShipFilter extends Component {
  handleSelectFilter = key => value => {
    const { onModifyFilters } = this.props
    onModifyFilters(filters => ({
      ...filters,
      [key]: value,
    }))
  }

  render() {
    const { filters, stypes, stypeInfo } = this.props
    return (
      <div className="filter-group">
        <ButtonGroup justified>
          <DropdownButton
              onSelect={this.handleSelectFilter('type')}
              id="ship-filter-type"
              title={`Type: ${filters.type}`}>
            <MenuItem
                key="all" eventKey="all">
              All
            </MenuItem>
            {
              (stypeInfo || []).map( ([stypeId, sName]) =>
                stypes.indexOf(stypeId) !== -1 && (
                  <MenuItem
                      key={stypeId} eventKey={stypeId}>
                    {`${stypeId}: ${sName}`}
                  </MenuItem>
                ))
            }
          </DropdownButton>
        </ButtonGroup>
        <ButtonGroup justified>
          <DropdownButton
              onSelect={this.handleSelectFilter('level')}
              id="ship-filter-level"
              title={`Level: ${filters.level}`}>
            <MenuItem key="all" eventKey="all">
              All
            </MenuItem>
            <MenuItem key="ge-100" eventKey="ge-100">
              Lv. ≥ 100
            </MenuItem>
            <MenuItem key="lt-99" eventKey="lt-99">
              {"Lv. < 99"}
            </MenuItem>
          </DropdownButton>
        </ButtonGroup>
        <ButtonGroup justified>
          <DropdownButton
              onSelect={this.handleSelectFilter('fleet')}
              id="ship-filter-fleet"
              title={`Fleet: ${filters.fleet}`}>
            <MenuItem key="all" eventKey="all">
              All
            </MenuItem>
            {
              [1,2,3,4].map( fleet => (
                <MenuItem key={fleet} eventKey={fleet}>
                  {`Fleet ${fleet}`}
                </MenuItem>
              ))
            }
          </DropdownButton>
        </ButtonGroup>
        <ButtonGroup justified>
          <DropdownButton
              onSelect={this.handleSelectFilter('lock')}
              id="ship-filter-lock"
              title={`Lock: ${filters.lock}`}>
            <MenuItem key="all" eventKey="all">
              All
            </MenuItem>
            <MenuItem key={true} eventKey={true}>
              Locked
            </MenuItem>
            <MenuItem key={false} eventKey={false}>
              Unlocked
            </MenuItem>
          </DropdownButton>
        </ButtonGroup>
      </div>
    )
  }
}

export { ShipFilter }
