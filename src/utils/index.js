import { Scene, addScene, sendScene } from './scene'

const steps = [
  (scene, msg) => {
    console.log(msg);
    return true
  },
  (scene, msg) => {
    console.log('qqqqqqq', msg);
    return true
  }
]
addScene(new Scene('asd', steps));

const steps2 = [
  (scene, msg) => {
    console.log('2', msg);
    return true
  },
  (scene, msg) => {
    console.log('2qqqqqqq', msg);
    return true
  }
]
addScene(new Scene('asd2', steps2));


sendScene('asd', 1, { text: 'asdasd0' });
setTimeout(() => {
  sendScene('next', 1, { text: 'wwwwwwwwwwww' });
  sendScene('asd2', 1, { text: 'fffffffff' });
  setTimeout(() => {
    sendScene('next', 1, { text: 'vvvvvvvvvvvvv' });
  }, 5000);
}, 5000);
