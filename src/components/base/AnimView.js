
export default class AnimView {

  constructor() {

    this.animId = null;

    this.startAnimFrame();

  }

  startAnimFrame() {

    if (this.animId) {
      window.cancelAnimationFrame(this.animId);
    }

    this.animId = window.requestAnimationFrame((timeNow) => this.handleAnimFrame(timeNow));

  }
  stopAnimFrame() {

    window.cancelAnimationFrame(this.animId);

    this.animId = null;

  }

  handleAnimFrame(timeNow) {

    if (!this.timeStart) {
      this.timeStart = timeNow;
    }
    this.timeElapsed = timeNow - this.timeStart;

    if (this.animId) {
      this.onAnimFrame(timeNow);
      this.animId = window.requestAnimationFrame((timeNow) => this.handleAnimFrame(timeNow));
    }

  }

  onAnimFrame(timeNow) { }

}
