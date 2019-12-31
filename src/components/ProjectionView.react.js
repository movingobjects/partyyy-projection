
import * as React from 'react';
import * as _ from 'lodash';
import { random, maths, colors } from 'varyd-utils';
import SimplexNoise from 'simplex-noise';

import imgParticle from '../images/particle.png';
import shaderFrag from '../shaders/frag.glsl';
import shaderVert from '../shaders/vert.glsl';

import ThreeComponent from './base/ThreeComponent.react';

const VIS_PROPS = {
  camFov: { min: 0, max: 180 },
  camPosX: { min: -20, max: 20 },
  camPosY: { min: -20, max: 20 },
  camPosZ: { min: -20, max: 20 },
  particleAreaH: { min: 1, max: 50 },
  particleAreaW: { min: 1, max: 50 },
  particleSize: { min: 0.25, max: 2 },
  particleSpacing: { min: 0.25, max: 0.75 },
  noiseColorScale: { min: 0, max: 1 },
  noiseColorSpeed: { min: 0, max: 1 },
  noiseALevel: { min: 0, max: 2 },
  noiseAScale: { min: 0, max: 1 },
  noiseASpeed: { min: 0, max: 1 },
  noiseBLevel: { min: 0, max: 2 },
  noiseBScale: { min: 0, max: 1 },
  noiseBSpeed: { min: 0, max: 1 }
};

export default class ProjectionView extends ThreeComponent {

  constructor(props) {

    super({
      className: 'projection-view',
      scene: {
        fog: THREE.Fog('#163646', 5, 15)
      },
      camera: {
        x: 0,
        y: -7,
        z: 3
      }
    }, props);

    window.scene = this.scene;

    this.initState();
    this.makeParticles();
    this.nextScene();

  }

  onAnimFrame(timeNow) {

    if (!this.timeStart) {
      this.timeStart = timeNow;
    }
    this.timeElapsed = timeNow - this.timeStart;

    this.updateParticles();
    this.updateVals();

    this.pts.material.uniforms.uElapsed.value = this.timeElapsed;

    super.onAnimFrame(timeNow);

  }

  onResize(w, h) {
    this.w = w;
    this.h = h;
  }

  initState() {

    this.w = -1;
    this.h = -1;

    this.simplexA     = new SimplexNoise();
    this.simplexB     = new SimplexNoise();
    this.simplexColor = new SimplexNoise();

    this.pts    = null;
    this.values = { };

    this.colorA = '#ffffff';
    this.colorB = '#000000';

    Object.keys(VIS_PROPS).forEach((id) => {

      const prop = VIS_PROPS[id],
            val  = random.num(prop.min, prop.max);

      this.values[id] = {
        cur: val,
        trgt: val
      };

    });

  }

  updateCamera(value) {
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.aspect = this.winW / this.winH;
    this.camera.updateProjectionMatrix();
  }

  resetParticles(value) {

    this.clearParticles();
    this.makeParticles();

  }
  clearParticles() {
    if (this.pts !== null) {
      this.scene.remove(this.pts);
      this.pts.geometry.dispose();
      this.pts.material.dispose();
      this.pts = null;
    }
  }
  makeParticles() {

    let verts       = this.generateVerts(),
        count       = verts.length / 3,
        colorRatios = _.times(count, (i) => 0.5);

    let geom = new THREE.BufferGeometry();
        geom.setAttribute(  'position', new THREE.BufferAttribute(new Float32Array(verts), 3));
        geom.setAttribute('colorRatio', new THREE.BufferAttribute(new Float32Array(colorRatios), 1));
        geom.computeBoundingSphere();

    let mat = new THREE.ShaderMaterial({
      uniforms: {
        uElapsed: {
          type: 'f',
          value: 0
        },
        uParticleSize: {
          type: 'f',
          value: this.getVal('particleSize')
        },
        uColorA: {
          type: 'c',
          value: this.toThreeColor(this.colorA)
        },
        uColorB: {
          type: 'c',
          value: this.toThreeColor(this.colorB)
        },
        uTextureParticle: {
          type: 't',
          value: new THREE.TextureLoader().load(imgParticle)
        },
      },
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexShader: shaderVert,
      fragmentShader: shaderFrag
    });

    this.pts = new THREE.Points(geom, mat);

    this.scene.add(this.pts);

  }
  updateParticles() {

    let verts       = this.pts.geometry.attributes.position.array,
        colorRatios = this.pts.geometry.attributes.colorRatio.array;

    for (let i = 0; i < verts.length; i += 3) {

      // Z Position

      let x = verts[i + 0],
          y = verts[i + 1],
          z = verts[i + 2];

      let noiseA = this.getVal('noiseALevel') * this.simplexA.noise3D(
        x * this.getVal('noiseAScale'),
        y * this.getVal('noiseAScale'),
        this.getVal('noiseASpeed') * (this.timeElapsed / 1000)
      );

      let noiseB = this.getVal('noiseBLevel') * this.simplexB.noise3D(
        x * this.getVal('noiseBScale'),
        y * this.getVal('noiseBScale'),
        this.getVal('noiseBSpeed') * (this.timeElapsed / 1000)
      );

      let trgtZ = noiseA + noiseB;

      if (verts[i + 2] != trgtZ) {
        verts[i + 2] = trgtZ;
      }

      // Color

      let colorIndex = Math.floor(i / 3);

      let noiseColor = this.simplexColor.noise3D(
        x * this.getVal('noiseColorScale'),
        y * this.getVal('noiseColorScale'),
        this.getVal('noiseColorSpeed') * (this.timeElapsed / 1000)
      );
      noiseColor = Math.pow(maths.clamp((0.5 * noiseColor) + 0.5), 2);

      colorRatios[colorIndex] = noiseColor;

    }

    this.pts.geometry.attributes.position.needsUpdate   = true;
    this.pts.geometry.attributes.colorRatio.needsUpdate = true;

  }

  updateVals() {

    this.values['particleSize'].cur = maths.ease(this.getVal('particleSize'), this.getTrgt('particleSize'), 0.025, 0);
    this.pts.material.uniforms.uParticleSize.value = this.getVal('particleSize');

    this.camera.position.x   = maths.ease(this.camera.position.x, this.getVal('camPosX'), 0.0025, 0);
    this.camera.position.y   = maths.ease(this.camera.position.y, this.getVal('camPosY'), 0.0025, 0);
    this.camera.position.z   = maths.ease(this.camera.position.z, this.getVal('camPosZ'), 0.0025, 0);
    this.camera.position.fov = maths.ease(this.camera.position.fov, this.getVal('camFov'), 0.0025, 0);
    this.updateCamera();

  }

  getVal(id) {
    return this.values[id] ? this.values[id].cur : 0;
  }
  getTrgt(id) {
    return this.values[id] ? this.values[id].trgt : 0;
  }
  randomizeVal(id, applyTrgt = false) {

    const prop = VIS_PROPS[id],
          val  = random.num(prop.min, prop.max);

    if (applyTrgt) {
      this.values[id].trgt = val;
    } else {
      this.values[id].cur = val;
    }

  }

  randomizeView() {

    this.randomizeVal('particleSize', true);

    this.randomizeVal('particleAreaW');
    this.randomizeVal('particleAreaH');
    this.randomizeVal('particleSpacing');
    this.resetParticles();

    this.randomizeVal('camPosX', true);
    this.randomizeVal('camPosY', true);
    this.randomizeVal('camPosZ', true);
    this.randomizeVal('camFov', true);

    this.colorA = colors.toHex(random.color());
    this.colorB = colors.toHex(random.color());
    this.pts.material.uniforms.uColorA.value = this.toThreeColor(this.colorA);
    this.pts.material.uniforms.uColorB.value = this.toThreeColor(this.colorB);

    this.randomizeVal('noiseColorScale');
    this.randomizeVal('noiseColorSpeed');

    this.randomizeVal('noiseAScale');
    this.randomizeVal('noiseASpeed');
    this.randomizeVal('noiseALevel');
    this.randomizeVal('noiseBScale');
    this.randomizeVal('noiseBSpeed');
    this.randomizeVal('noiseBLevel');

  }

  nextScene() {

    this.randomizeView();

    setTimeout(() => {
      this.nextScene()
    }, random.num(3000, 10000));

  }


  // Helpers

  generateVerts() {

    const colCount = Math.ceil(this.getVal('particleAreaW') / this.getVal('particleSpacing')),
          rowCount = Math.ceil(this.getVal('particleAreaH') / this.getVal('particleSpacing'));

    let verts = [];

    _.times(rowCount, (row) => {
      _.times(colCount, (col) => {

        let x = (-this.getVal('particleAreaW') / 2) + (col * this.getVal('particleSpacing')) + ((row % 2) * (this.getVal('particleSpacing') / 2)),
            y = (-this.getVal('particleAreaH') / 2) + (row * this.getVal('particleSpacing')),
            z = 0;

        verts.push(x, y, z);

      })
    });

    return verts;

  }

  toThreeColor(hex) {
    return new THREE.Color(colors.fromHex(hex));
  }

}
