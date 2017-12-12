// import axios from 'axios'
// import { SET_LANGUAGE, SET_VIDEO } from './actionTypes'
//
// export function flashMessage(message, type = 'info', isSave = false) {
//   return (dispatch) => {
//     const notificationOpts = {
//       // title: 'Hey, it\'s good to see you!',
//       message,
//       position: 'tr',
//       autoDismiss: 10
//     };
//     if (type === 'error') {
//       dispatch(Notifications.error(notificationOpts))
//     } else {
//       dispatch(Notifications.info(notificationOpts))
//     }
//     if (isSave) {
//       console.log(message);
//     }
//   }
// }
//
// export function getVideo() {
//   return (dispatch) => {
//     axios.get('https://static.aira.life/liveid?' + (new Date()).getTime())
//       .then((result) => {
//         dispatch({
//           type: SET_VIDEO,
//           payload: result.data
//         })
//       })
//   }
// }
