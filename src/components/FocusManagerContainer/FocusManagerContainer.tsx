import React from 'react'

export interface FocusManagerContainerProps {
  onFocusIn?(e: React.FocusEvent<HTMLDivElement>): void
  onFocusOut?(e: React.FocusEvent<HTMLDivElement>): void
}

export interface FocusManagerContainerState {
  isManagingFocus: boolean
}

/**
 * Fires events when focus enters or leaves the container.
 */
export class FocusManagerContainer extends React.Component<FocusManagerContainerProps, FocusManagerContainerState> {
  state: FocusManagerContainerState = {
    isManagingFocus: false,
  }

  private timeoutId: any

  componentWillUnmount() {
    clearTimeout(this.timeoutId)
  }

  render() {
    return (
      <div onBlur={this.handleBlur} onFocus={this.handleFocus}>
        {this.props.children}
      </div>
    )
  }

  private handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // React reuses the event after this handler, and the callbacks get it later
    e.persist()
    this.timeoutId = setTimeout(() => {
      if (this.state.isManagingFocus) {
        this.setState({ isManagingFocus: false }, () => {
          if (this.props.onFocusOut) {
            this.props.onFocusOut(e)
          }
        })
      }
    }, 0)
  }

  private handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    e.persist()
    clearTimeout(this.timeoutId)
    if (!this.state.isManagingFocus) {
      this.setState({ isManagingFocus: true }, () => {
        if (this.props.onFocusIn) {
          this.props.onFocusIn(e)
        }
      })
    }
  }
}
