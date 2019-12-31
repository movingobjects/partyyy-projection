
import * as _ from 'lodash';
import { random, maths, colors } from 'varyd-utils';

import SimplexNoise from 'simplex-noise';

import imgParticle from '../images/particle.png';
import shaderFrag from '../shaders/frag.glsl';
import shaderVert from '../shaders/vert.glsl';

const SETTINGS = {
  particles: {
    areaH:   { min: 1.00, max: 50.00 },
    areaW:   { min: 1.00, max: 50.00 },
    size:    { min: 0.25, max:  2.00 },
    spacing: { min: 0.25, max:  0.75 }
  },
  colors: {
    a: { kind: 'color' },
    b: { kind: 'color' }
  },
  noiseColor: {
    level: { min: 1, max: 1 },
    scale: { min: 0, max: 1 },
    speed: { min: 0, max: 1 }
  },
  noiseA: {
    level: { min: 0, max: 2 },
    scale: { min: 0, max: 1 },
    speed: { min: 0, max: 1 }
  },
  noiseB: {
    level: { min: 0, max: 2 },
    scale: { min: 0, max: 1 },
    speed: { min: 0, max: 1 }
  }
};

export default class NoisePlanes extends THREE.Group {

  constructor() {

    super();

    this.timeStart    = 0;
    this.timeElapsed  = 0;

    this.simplex = {
      a: new SimplexNoise(),
      b: new SimplexNoise(),
      color: new SimplexNoise()
    };

    this.randomizeView();

  }

  randomizeView() {

    this.disposeParticles();

    this.settings = this.resetSettings();
    this.pts      = this.makeParticles();
    this.add(this.pts);

  }
  resetSettings() {

    const settings = { };

    Object.keys(SETTINGS).forEach((groupId) => {

      const group = SETTINGS[groupId];

      settings[groupId] = { };

      Object.keys(group).forEach((propId) => {

        const prop = group[propId];

        if (prop.kind === 'color') {
          settings[groupId][propId] = colors.toHex(random.color());

        } else {

          const val = random.num(prop.min, prop.max);

          settings[groupId][propId] = {
            cur: val,
            trgt: val
          };

        }

      });

    });

    return settings;

  }

  disposeParticles() {
    if (this.pts) {
      this.remove(this.pts);
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
          value: this.settings.particles.size.cur
        },
        uColorA: {
          type: 'c',
          value: this.toThreeColor(this.settings.colors.a)
        },
        uColorB: {
          type: 'c',
          value: this.toThreeColor(this.settings.colors.b)
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

    return new THREE.Points(geom, mat);

  }
  generateVerts() {

    const {
      areaH,
      areaW,
      size,
      spacing
    } = this.settings.particles;

    const colCount = Math.ceil(areaW.cur / spacing.cur),
          rowCount = Math.ceil(areaH.cur / spacing.cur);

    let verts = [];

    _.times(rowCount, (row) => {
      _.times(colCount, (col) => {

        let x = (-areaW.cur / 2) + (col * spacing.cur) + ((row % 2) * (spacing.cur / 2)),
            y = (-areaH.cur / 2) + (row * spacing.cur),
            z = 0;

        verts.push(x, y, z);

      })
    });

    return verts;

  }

  nextFrame(timeNow) {

    if (!this.timeStart) {
      this.timeStart = timeNow;
    }
    this.timeElapsed = timeNow - this.timeStart;

    this.easeSettings();
    this.updateParticles();

  }
  easeSettings() {

    const ease = (groupId, propId, ease, threshold) => {
      const setting = this.settings[groupId][propId];
      setting.cur   = maths.ease(setting.cur, setting.trgt, ease, threshold);
    }

    ease('particles', 'size', 0.025, 0);

  }
  updateParticles() {

    const {
      geometry,
      material
    } = this.pts;

    const {
      particles,
      noiseA,
      noiseB,
      noiseColor
    } = this.settings;

    const secsElapsed = this.timeElapsed / 1000,
          verts       = geometry.attributes.position.array,
          colorRatios = geometry.attributes.colorRatio.array;

    for (let i = 0; i < verts.length; i += 3) {

      let x = verts[i + 0],
          y = verts[i + 1],
          z = verts[i + 2];

      let trgtZA = noiseA.level.cur * this.simplex.a.noise3D(
        x * noiseA.scale.cur,
        y * noiseA.scale.cur,
        noiseA.speed.cur * secsElapsed
      );

      let trgtZB = noiseB.level.cur * this.simplex.b.noise3D(
        x * noiseB.scale.cur,
        y * noiseB.scale.cur,
        noiseB.speed.cur * secsElapsed
      );

      verts[i + 2] = (trgtZA + trgtZB);

      let colorIndex = Math.floor(i / 3);

      let colorRatio = noiseColor.level.cur * this.simplex.color.noise3D(
        x * noiseColor.scale.cur,
        y * noiseColor.scale.cur,
        noiseColor.speed.cur * secsElapsed
      );
      colorRatio = Math.pow(maths.clamp((0.5 * colorRatio) + 0.5), 2);

      colorRatios[colorIndex] = colorRatio;

    }

    geometry.attributes.position.needsUpdate   = true;
    geometry.attributes.colorRatio.needsUpdate = true;

    material.uniforms.uElapsed.value      = this.timeElapsed;
    material.uniforms.uParticleSize.value = particles.size.cur;

  }

  toThreeColor(hex) {
    return new THREE.Color(colors.fromHex(hex));
  }

}
