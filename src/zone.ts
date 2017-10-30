'use strict';

import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { Subscriber } from 'rxjs/Subscriber';

import { TeardownLogic } from 'rxjs/Subscription';

import { getZone } from './utils';

export function zoneOperator<T>(zone?: Zone): Observable<T> {
  return this.lift(new ZoneOperator(zone || getZone()));
}

class ZoneOperator<T> implements Operator<T, T> {
  constructor(private zone: Zone) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source._subscribe(new ZoneSubscriber(subscriber, this.zone));
  }
}

class ZoneSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>,
              private zone: Zone) {
    super(destination);
  }

  protected _next(value: T) {
    this.zone.run(() => {
      this.destination.next(value);
    });
  }

  protected _complete() {
    this.zone.run(() => {
      this.destination.complete();
    });
  }

  protected _error(err?: any) {
    this.zone.run(() => {
      this.destination.error(err);
    });
  }
}

export interface ZoneSignature<T> {
  (zone?: Zone): Observable<T>;
}

Observable.prototype.zone = zoneOperator;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    zone: ZoneSignature<T>;
  }
}
