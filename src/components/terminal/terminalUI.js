/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-static-element-interactions: 0 */
import React, { Component } from 'react'
import TerminalHistory from './terminalHistory'
import TerminalInput from './terminalInput'
import styles from './style.css'

class TerminalUI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focus: false
    }

    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, true);
  }

  handleOutsideClick(e) {
    if (this.node.contains(e.target)) {
      this.focusElement()
      return;
    }
    if (this.state.focus === true) {
      this.setState({ focus: false })
    }
  }

  focusElement() {
    this.messagesInput.focus();
    if (this.state.focus === false) {
      this.setState({ focus: true })
    }
  }

  handleReturn(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.props.doCommand(this.messagesInput.value);
    } else if (e.keyCode === 38) {
      this.props.history();
    }
  }

  updateMessageOutput() {
    this.props.updateUserInput(this.messagesInput.value);
  }

  render() {
    return (
      <div
        className={styles.wrapper}
        ref={(node) => { this.node = node; }}
      >
        <div className={styles.pre}>
          <TerminalHistory messages={this.props.messages} updating={this.props.updating} />
          {!this.props.updating &&
            <TerminalInput input={this.props.input} focus={this.state.focus} />
          }
        </div>
        <input
          type="text"
          value={this.props.input || ''}
          ref={(el) => { this.messagesInput = el; }}
          onChange={() => this.updateMessageOutput()}
          onKeyDown={e => this.handleReturn(e)}
          style={{ zIndex: -1 }}
        />
      </div>
    )
  }
}

export default TerminalUI
