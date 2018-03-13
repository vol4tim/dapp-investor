/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react'
import { render } from 'react-dom'
import Promise from 'bluebird'
import _ from 'lodash'

class TerminalJQ extends Component {
  componentDidMount() {
    const { interpreter, command, ...options } = this.props;
    this.terminal = $(this.node).terminal(interpreter, options);
  }
  componentWillUnmount() {
    this.terminal.destroy();
  }
  isCommandControlled() {
    return this.props.command !== undefined;
  }
  render() {
    if (this.terminal && this.isCommandControlled()) {
      this.terminal.set_command(this.props.command, true);
    }
    return (
      <div ref={(node) => { this.node = node }} />
    );
  }
}

class Terminal extends Component {
  constructor(props) {
    super(props);
    this.state = { command: '' };
    this.interpreter = {}
    _.forEach(this.props.commands, (item, index) => {
      this.interpreter[index] = item.bind(this);
    })
  }
  update(command) {
    this.setState({
      command
    });
  }
  exec() {
    this.terminal.exec(this.state.command);
    this.update('');
  }
  render() {
    return (
      <div style={{ height: '100%' }}>
        <TerminalJQ
          interpreter={this.interpreter}
          // command={this.state.command}
          // onCommandChange={command => this.update(command)}
          onInit={(term) => {
            this.terminal = term
            this.terminal.echo(this.props.welcome, { raw: true });
            this.terminal.component = (component) => {
              this.terminal.echo('...', {
                // raw: true,
                finalize: (div) => {
                  render(component, div[0])
                }
              });
            }
            this.terminal.loader = () => {
              this.terminal.pause();
              this.terminal.echo('<div class="loader"></div>', { raw: true })
            }
            this.terminal.load = (str) => {
              this.terminal.resume();
              this.terminal.update(-1, str)
            }
            this.terminal.answer = (prompt = '') => (
              new Promise((resolve) => {
                this.terminal.push((input) => {
                  resolve(input)
                }, {
                  prompt
                });
              })
            )
          }}
          {...this.props}
        />
      </div>
    );
  }
}

export default Terminal
