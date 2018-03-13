import _ from 'lodash'

export class Session {
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
      throw new Error('Session not found key')
    }
    return this.store[key]
  }

  has(key) {
    return _.has(this.store, key)
  }

  remove(key) {
    this.store = _.omit(this.store, key)
  }

  clear() {
    this.store = {}
  }
}

function makeid(length = 5) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class Scenes {
  constructor(list) {
    this.list = list
  }

  find(name) {
    return _.find(this.list, { name })
  }
}

export class Scene {
  constructor(name = null) {
    this.name = (name !== null) ? name : makeid()
  }

  question() {
    console.log(this);
    return true
  }

  answer() {
    console.log(this);
    return true
  }

  enter(ctx, session) {
    const result = this.question(ctx, session)
    if (_.isObject(result) && _.isFunction(result.then)) {
      result
        .then((r) => {
          if (r !== false) {
            this.answer(ctx, session)
          }
        })
    } else if (result !== false) {
      this.answer(ctx, session)
    }
  }
}

export class Wizard {
  constructor(name, session, list) {
    this.name = name
    this.session = session
    this.list = list
  }

  enter(ctx, i = 0) {
    if (i === 0) {
      this.session.clear()
    }
    const names = _.map(this.list, item => item.name);
    const sc = new Scenes(this.list)
    ctx.nextScene = () => {
      if (names.length > (i + 1)) {
        this.enter(ctx, (i + 1))
      }
    }
    sc.find(names[i]).enter(ctx, this.session)
  }
}
