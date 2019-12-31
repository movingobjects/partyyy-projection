
import * as React from 'react';

export default class AnimatingComponent extends React.Component {

  constructor(props) {

    super(props);

    this.animId    = -1;
    this.animating = false;

  }

  onAnimFrame(timeNow) { }

  startAnimFrame() {

    if (this.animId) {
      window.cancelAnimationFrame(this.animId);
    }

    this.animating = true;
    this.animId    = window.requestAnimationFrame((timeNow) => this.handleAnimFrame(timeNow));

  }
  stopAnimFrame() {

    window.cancelAnimationFrame(this.animId);

    this.animId    = null;
    this.animating = false;

  }

  handleAnimFrame(timeNow) {

    if (this.animating) {
      this.onAnimFrame(timeNow);
      this.animId = window.requestAnimationFrame((timeNow) => this.handleAnimFrame(timeNow));
    }

  }

  componentDidMount() {

    if (!this.props.startPaused) {
      this.startAnimFrame();
    }

  }
  componentWillUnmount() {

    this.stopAnimFrame();

  }

}
