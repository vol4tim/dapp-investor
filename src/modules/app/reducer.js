import { SET_LANGUAGE, SET_VIDEO } from './actionTypes'

const initialState = {
  language: 'en',
  video: ''
}

export default function app(state = initialState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return { ...state, language: action.payload }

    case SET_VIDEO:
      return { ...state, video: action.payload }

    default:
      return state;
  }
}
