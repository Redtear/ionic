import {defaults, assign} from '../util';

import * as hammer from 'hammerjs';

/**
 * @private
 * A gesture recognizer class.
 *
 * TODO(mlynch): Re-enable the DOM event simulation that was causing issues (or verify hammer does this already, it might);
 */

export class Gesture {
  private _hammer: HammerManager;
  private _options: any;
  private _callbacks: any = {};

  public element: HTMLElement;
  public direction: string;
  public isListening: boolean = false;

  constructor(element: HTMLElement, opts: any = {}) {
    defaults(opts, {
      domEvents: true
    });
    this.element = element;

    // Map 'x' or 'y' string to hammerjs opts
    this.direction = opts.direction || 'x';
    opts.direction = this.direction === 'x' ?
      hammer.DIRECTION_HORIZONTAL :
      hammer.DIRECTION_VERTICAL;

    this._options = opts;
  }

  options(opts: any) {
    assign(this._options, opts);
  }

  on(type: string, cb: (event: HammerInput) => any) {
    if (type === 'pinch' || type === 'rotate') {
      this._hammer.get('pinch').set({enable: true});
    }
    this._hammer.on(type, cb);
    (this._callbacks[type] || (this._callbacks[type] = [])).push(cb);
  }

  off(type: string, cb: (event: HammerInput) => any) {
    this._hammer.off(type, this._callbacks[type] ? cb : null);
  }

  listen() {
    if (!this.isListening) {
      this._hammer = new Hammer(this.element, this._options);
    }
    this.isListening = true;
  }

  unlisten() {
    let eventType: string;
    let i: number;

    if (this._hammer && this.isListening) {
      for (eventType in this._callbacks) {
        for (i = 0; i < this._callbacks[eventType].length; i++) {
          this._hammer.off(eventType, this._callbacks[eventType]);
        }
      }
      this._hammer.destroy();
    }
    this._callbacks = {};
    this._hammer = null;
    this.isListening = false;
  }

  destroy() {
    this.unlisten();
    this.element = this._options = null;
  }
}
