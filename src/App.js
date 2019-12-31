
import DebugView from './components/DebugView';
import VisView from './components/VisView';

export default class App {

  constructor() {

    this.vis   = new VisView(document.getElementById('vis'));
    this.debug = new DebugView(document.getElementById('debug'));

    this.loadConfig(`config.json`);

  }

  onConfigLoad = (config) => {

    App.config = config;

    this.debug.log('Config loaded');

    this.connectToServer(config.serverUrl);

  }
  onServerMessage = (message) => {

    this.debug.log(`Message from Server: "${message}"`);

  }

  loadConfig(path) {

    fetch(path)
      .then((response) => response.json())
      .then((json) => this.onConfigLoad(json))
      .catch((error) => {
        this.debug.log(`Error loading config: ${error}`);
      })

  }

  connectToServer(url) {

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {

      this.debug.log(`Server connection opened`);

      this.sendToServer({
        type: 'identify',
        group: 'projection'
      });

    }
    this.socket.onclose = () => {
      this.debug.log(`Server connection closed`);
    }
    this.socket.onerror = () => {
      this.debug.log(`Server connection error`);
    }

    this.socket.onmessage = ({ data }) => this.onServerMessage(data);

  }
  sendToServer(data) {

    if (!this.socket) return;

    this.socket.send(JSON.stringify(data));

  }

  makeElem(id, elemWrap) {

    const elem = document.createElement('div');
    elem.id = 'vis-view';
    elemWrap.appendChild(elem);

    return elem;

  }

}
