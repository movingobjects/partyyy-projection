
import * as React from 'react';
import * as _ from 'lodash';
import { random, maths, colors } from 'varyd-utils';

import ThreeComponent from './base/ThreeComponent.react';
import NoisePlanes from '../three/NoisePlanes.three';

const NEXT_SCENE_INTERVAL = {
  min: 3000,
  max: 9000
}

const CAM_SETTINGS = {
  x: { min: -20, max: 20 },
  y: { min: -20, max: 20 },
  z: { min: -20, max: 20 },
  fov: { min: -20, max: 20 }
}

export default class ProjectionView extends ThreeComponent {

  constructor(props) {

    super({
      className: 'projection-view'
    }, props);

    this.initScene();
    this.resetCamTrgt();
    this.nextScene();

  }

  initScene() {

    this.noisePlanes = new NoisePlanes();
    this.scene.add(this.noisePlanes);

  }
  nextScene() {

    this.resetCamTrgt();
    this.noisePlanes.randomizeView();

    const delay = random.num(NEXT_SCENE_INTERVAL.min, NEXT_SCENE_INTERVAL.max);

    setTimeout(() => {
      this.nextScene()
    }, delay);

  }

  onAnimFrame(timeNow) {

    this.easeCamera();
    this.noisePlanes.nextFrame(timeNow);

    super.onAnimFrame(timeNow);

  }

  onResize(w, h) {
    this.w = w;
    this.h = h;
  }

  resetCamTrgt() {

    const trgt = { };

    Object.keys(CAM_SETTINGS).forEach((propId) => {
      const prop = CAM_SETTINGS[propId];
      trgt[propId] = random.num(prop.min, prop.max);
    })

    this.camTrgt = trgt;

  }
  updateCamera() {
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
  }
  easeCamera() {

    const { position }     = this.camera;
    const { x, y, z, fov } = this.camTrgt;

    position.x   = maths.ease(position.x, x, 0.0025, 0);
    position.y   = maths.ease(position.y, y, 0.0025, 0);
    position.z   = maths.ease(position.z, z, 0.0025, 0);
    position.fov = maths.ease(position.fov, fov, 0.0025, 0);

    this.updateCamera();

  }

}
