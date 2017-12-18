import React, { Component } from 'react'
import _ from 'lodash'
import TerminalUI from './terminalUI'

function encodeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

class TerminalApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      historyActiveIndex: -1,
      messages: (props.startupMessages !== undefined) ? props.startupMessages : [],
      userInput: props.startupInput,
      updating: false,
      wait: false
    }
  }

  updateUserInput(input) {
    const sanitizedInput = encodeHTML(input);
    this.setState({
      userInput: sanitizedInput
    })
  }

  history() {
    let historyActiveIndex = this.state.historyActiveIndex + 1
    if (historyActiveIndex > this.state.history.length - 1) {
      historyActiveIndex = this.state.history.length - 1
    }
    this.setState({ historyActiveIndex })
    let history = [...this.state.history]
    history = _.reverse(history)
    if (_.has(history, historyActiveIndex)) {
      const command = history[historyActiveIndex]
      this.updateUserInput(command)
    }
  }

  addMessages(message, showSpinner = false) {
    const { messages } = this.state;
    if (Array.isArray(message) === true) {
      message.map(msg => messages.push(msg))
    } else {
      messages.push(message)
    }
    this.setState({ messages, userInput: '', updating: showSpinner })
  }

  waitInput(input) {
    const lastCommand = this.state.history[this.state.history.length - 1]
    const params = lastCommand.split(' ')
    const cmd = params.shift()
    const messages = [{ content: input, type: 'command' }]
    messages.push({ content: '', type: 'message' });
    this.props.commands[cmd](input, true)
    this.addMessages(messages);
  }

  doCommand(input, showCmd = true) {
    if (this.state.wait === true) {
      this.waitInput(input)
      return
    }
    if (input === '') {
      return
    }
    const params = input.split(' ')
    const cmd = params.shift()
    this.setState({ history: [...this.state.history, input], historyActiveIndex: -1 })
    const messages = []
    if (showCmd) {
      messages.push({ content: input, type: 'command' })
    }
    const responseIndex = Object.keys(this.props.commands).indexOf(cmd)
    if (responseIndex !== -1) {
      const i = Object.keys(this.props.commands)[responseIndex];
      if (_.isFunction(this.props.commands[i])) {
        const result = this.props.commands[i](params)
        if (_.isObject(result) && _.isFunction(result.then)) {
          messages.push({ content: '', type: 'message' });
          this.addMessages(messages, true);
          result
            .then((r) => {
              this.addMessages({ content: r.toString(), type: 'message' });
            })
            .catch(() => {
              this.addMessages({ content: cmd, type: 'error' });
            })
          return
        } else if (result === true) {
          this.setState({ wait: true })
        } else {
          messages.push({ content: result.toString(), type: 'message' });
        }
      } else {
        messages.push({ content: this.props.commands[i], type: 'message' });
      }
    } else {
      messages.push({ content: cmd, type: 'error' });
    }
    this.addMessages(messages);
  }

  render() {
    return (
      <TerminalUI
        input={this.state.userInput}
        messages={this.state.messages}
        updating={this.state.updating}
        updateUserInput={input => this.updateUserInput(input)}
        doCommand={cmd => this.doCommand(cmd)}
        history={() => this.history()}
      />
    )
  }
}

export default TerminalApp
