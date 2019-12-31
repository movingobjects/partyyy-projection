
import * as _ from 'lodash';

export default class DebugView {

  constructor(elem) {

    this.elem       = elem;
    this.elemOutput = elem.querySelector('textarea#output');

    this.on = true;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'd') {
        this.elem.classList.toggle('on');
      }
    })

  }

  set on(val) {
    this.elem.classList.toggle('on', val);
  }

  log(message) {

    const textarea  = this.elemOutput,
          stayAtBtm = (textarea.scrollTop + textarea.clientHeight) >= textarea.scrollHeight;

    const timestamp = `${new Date().toTimeString()}`.substr(0, 8);

    textarea.value    += `[${timestamp}] ${message}\n`;

    if (stayAtBtm) {
      textarea.scrollTop = textarea.scrollHeight;
    }

  }

}
