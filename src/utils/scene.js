import _ from 'lodash'
import PubSub from 'pubsub-js'

class Session {
  constructor() {
    this.store = {}
  }

  getStore() {
    return this.store
  }

  set(key, value) {
    this.store[key] = value
  }

  get(key) {
    if (!this.has(key)) {
      return new Error('not found key');
    }
    return this.store[key]
  }

  has(key) {
    return _.has(this.store, key)
  }

  remove(key) {
    this.store = _.omit(this.store, key);
  }
}

class Scene {
  constructor(command, steps, session = null, modules = {}) {
    this.command = command
    this.modules = modules
    this.session = (session !== null) ? session : new Session()
    if (_.isArray(steps)) {
      this.stepsName = [];
      for (let i = 0; i < steps.length; i += 1) {
        this.stepsName.push(i)
      }
      this.steps = steps
    } else {
      this.stepsName = _.keys(steps)
      this.steps = _.values(steps)
    }
  }

  run(msg) {
    this.session.set('current_command', this.command)
    this.session.set(this.command, {})
    this.step(msg)
  }

  step(msg) {
    if (this.session.has(this.command)) {
      const session = this.session.get(this.command)
      const currentStep = _.keys(session).length
      const result = this.steps[currentStep](this, msg, session)
      if (_.isObject(result) && _.isFunction(result.then)) {
        result
          .then((r) => {
            if (r === false) {
              this.stop(currentStep, null, true)
            } else {
              this.stop(currentStep, r)
            }
          })
          .catch(() => {
            this.stop(currentStep, null, true)
          })
      } else if (result === false) {
        this.stop(currentStep, null, true)
      } else {
        this.stop(currentStep, result)
      }
    }
  }

  stop(currentStep, result, isForce = false) {
    if (isForce || !_.has(this.steps, (currentStep + 1))) {
      this.session.remove(this.command)
      this.session.set('current_command', null)
    } else {
      const session = this.session.get(this.command)
      this.session.set(this.command, { ...session, [this.stepsName[currentStep]]: result })
    }
  }
}

let current = null
const getCurrent = () => current
const addScene = (scene) => {
  PubSub.subscribe(scene.command, (m, data) => {
    current = scene
    scene.run(data)
  });
  PubSub.subscribe('next', (m, data) => {
    scene.step(data)
  });
}
const sendScene = (command, data = {}) => {
  PubSub.publish(command, data);
}

export {
  addScene,
  sendScene,
  Scene,
  Session,
  getCurrent
}
