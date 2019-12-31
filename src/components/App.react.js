
import * as React from 'react';

import ProjectionView from './ProjectionView.react';

export default class App extends React.Component {

  constructor() {

    super();

    this.state = {
      config: null,
      serverConnected: false
    };

    this.loadConfig(`config.json`);

  }

  onConfigLoad = (config) => {

    this.setState({ config });

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
      this.setState({ serverConnected: true });
    }
    this.socket.onclose = () => {
      this.setState({ serverConnected: false });
    }
    this.socket.onerror = () => {
      this.setState({ serverConnected: false });
    }

    this.socket.onmessage = ({ data }) => this.onServerMessage(data);

  }

  sendToServer(message) {

    if (!this.socket) return;

    this.socket.send(message)

  }

  render() {

    if (!this.state.config) return null;

    return (
      <ProjectionView />
    );

  }

}
