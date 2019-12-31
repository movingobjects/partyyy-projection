
import * as React from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import ThreeComponent from './base/ThreeComponent.react';

export default class ProjectionView extends ThreeComponent {

  constructor(props) {

    super({
      className: 'projection-view'
    }, props);

  }

  onAnimFrame(timeNow) {

    super.onAnimFrame(timeNow);

  }

  onResize(w, h) { }

}
