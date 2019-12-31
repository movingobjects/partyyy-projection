
import VisView from './components/VisView';

export default class App {

  constructor(elemWrap) {

    this.initVis(this.makeElem('vis-view', elemWrap));

    this.loadConfig(`config.json`);

  }

  initVis(elem) {

    this.visView = new VisView(elem);

  }

  onConfigLoad = (config) => {

    App.config = config;

    this.connectToServer(config.serverUrl);

  }
  onServerMessage = (message) => {

    console.log(`Message from Server: "${message}"`);

  }

  loadConfig(path) {

    fetch(path)
      .then((response) => response.json())
      .then((json) => this.onConfigLoad(json))
      .catch((error) => {
        console.log(error);
      })

  }

  connectToServer(url) {

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log(`Server open`);
    }
    this.socket.onclose = () => {
      console.log(`Server close`);
    }
    this.socket.onerror = () => {
      console.log(`Server error`);
    }

    this.socket.onmessage = ({ data }) => this.onServerMessage(data);

  }
  sendToServer(message) {

    if (!this.socket) return;

    this.socket.send(message)

  }

  makeElem(id, elemWrap) {

    const elem = document.createElement('div');
    elem.id = 'vis-view';
    elemWrap.appendChild(elem);

    return elem;

  }

}
