import React, { Component } from 'react'
import TerminalCommand from './terminalCommand'
import TerminalError from './terminalError'
import TerminalMessage from './terminalMessage'

const Message = (props) => {
  if (props.updating === true && props.i === props.messages.length - 1) {
    return <span className="loader">...</span>
  }
  if (props.message.type === 'command') {
    return <TerminalCommand message={props.message.content} />
  } else if (props.message.type === 'error') {
    return <TerminalError message={props.message.content} />
  }
  return <TerminalMessage message={props.message.content} />
}

class TerminalHistory extends Component {
  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  }

  render() {
    return (
      <div>
        {this.props.children}
        {this.props.messages.map((message, i) => (
          <Message
            key={i}
            i={i}
            updating={this.props.updating}
            messages={this.props.messages}
            message={message}
          />
        ))}
        <div ref={(el) => { this.messagesEnd = el; }} />
      </div>
    )
  }
}

export default TerminalHistory
