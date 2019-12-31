
import * as React from 'react';
import { defaultsDeep, debounce } from 'lodash';

import AnimComponent from './AnimComponent.react'

const CANVAS_MIN_SIZED_LEN = 500;

const DEFAULT_OPTS = {
  className: 'three-component',
  renderer: {
    alpha: true,
    antialias: false
  },
  scene: {
    fog: null
  },
  camera: {
    fov: 60,
    near: 0.1,
    far: 1000,
    x: 0,
    y: 0,
    z: 0,
    lookAtX: 0,
    lookAtY: 0,
    lookAtZ: 0
  }
};

export default class ThreeComponent extends AnimComponent {

  constructor(opts, props) {

    super(props);

    this.sized = false;
    this.w     = 1;
    this.h     = 1;
    this.opts  = defaultsDeep({ }, opts, DEFAULT_OPTS);

    this.debouncedResize = debounce(() => this.updateSize(), 100);

    this.initThree();

  }

  initThree() {

    const {
      camera,
      renderer,
      scene
    } = this.opts;

    let v3LookAt   = new THREE.Vector3(camera.lookAtX, camera.lookAtY, camera.lookAtZ);

    this.camera    = new THREE.PerspectiveCamera(camera.fov, 1, camera.near, camera.far);
    this.camera.position.set(camera.x, camera.y, camera.z);
    this.camera.lookAt(v3LookAt);

    this.scene     = new THREE.Scene();
    this.scene.fog = scene.fog;
    this.scene.add(this.camera);

    this.renderer  = new THREE.WebGLRenderer({
      alpha: renderer.alpha,
      antialias: renderer.antialias
    });

  }

  get domElem() {
    return this.renderer.domElement;
  }

  get canvasW() {
    return this.domElem.clientWidth;
  }
  get canvasH() {
    return this.domElem.clientHeight;
  }

  onAnimFrame(timeNow) {

    if (!this.sized) {
      this.updateSize();
    }

    this.renderer.render(this.scene, this.camera);

  }

  onResize(w, h) { }

  dispose() {

    if (this.elem) {
      this.elem.removeChild(this.renderer.domElement);
    }

    this.scene    = null;
    this.camera   = null;
    this.renderer = null;

  }

  updateSize() {

    if (!this.renderer) return;
    if (!this.elem) return;
    if (!this.camera) return;

    this.w     = this.elem.clientWidth;
    this.h     = this.elem.clientHeight;
    this.sized = (this.w > CANVAS_MIN_SIZED_LEN) && (this.h > CANVAS_MIN_SIZED_LEN);

    this.renderer.setPixelRatio(2);
    this.renderer.setSize(this.w, this.h);

    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();

    this.onResize(this.w, this.h);

  }

  componentDidMount() {

    window.addEventListener('resize', this.debouncedResize);

    if (this.elem) {
      this.elem.appendChild(this.renderer.domElement);
    }

    this.sized = false;

    super.componentDidMount();

  }
  componentWillUnmount() {

    window.removeEventListener('resize', this.debouncedResize);

    super.componentWillUnmount();

    this.dispose();

  }

  render() {

    return (
      <div
        className={this.opts.className}
        ref={(elem) => {
          this.elem = elem;
        }}
        onDragEnter={(e) => this.props.dragEnterHandler(e)}
        onDragOver={(e) => this.props.dragOverHandler(e)}
        onDragLeave={(e) => this.props.dragLeaveHandler(e)}
        onDrop={(e) => this.props.onArtworkUpload(e)} />
    );

  }

}
