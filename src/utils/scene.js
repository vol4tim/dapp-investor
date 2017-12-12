import _ from 'lodash'
import PubSub from 'pubsub-js'

class Scene {
  constructor(command, steps, modules = {}) {
    this.command = command
    this.modules = modules
    this.history = {}
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
    this.history[msg.userId] = {}
    this.step(msg)
  }

  step(msg) {
    const { userId } = msg
    if (_.has(this.history, userId)) {
      const currentStep = _.keys(this.history[userId]).length
      const result = this.steps[currentStep](this, msg, this.history[userId])
      if (_.isObject(result) && _.isFunction(result.then)) {
        result
          .then((r) => {
            if (r === false) {
              this.stop(userId, currentStep, true)
            } else {
              this.history[userId][this.stepsName[currentStep]] = r
              this.stop(userId, currentStep)
            }
          })
          .catch(() => {
            this.stop(userId, currentStep, true)
          })
      } else if (result === false) {
        this.stop(userId, currentStep, true)
      } else {
        this.history[userId][this.stepsName[currentStep]] = result
        this.stop(userId, currentStep)
      }
    }
  }

  stop(userId, currentStep, isForce = false) {
    if (isForce || !_.has(this.steps, (currentStep + 1))) {
      this.history = _.omit(this.history, userId);
    }
  }
}

const addScene = (scene) => {
  PubSub.subscribe(scene.command, (msg, data) => {
    scene.run(data)
  });
  PubSub.subscribe('next', (msg, data) => {
    scene.step(data)
  });
}
const sendScene = (command, userId, data) => {
  PubSub.publish(command, { userId, ...data });
}

export {
  addScene,
  sendScene,
  Scene
}
