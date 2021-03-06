/// <reference types="zone.js" />
import { Observable } from 'rxjs/Observable';
export declare function zoneOperator<T>(zone?: Zone): Observable<T>;
export interface ZoneSignature<T> {
    (zone?: Zone): Observable<T>;
}
declare module 'rxjs/Observable' {
    interface Observable<T> {
        zone: ZoneSignature<T>;
    }
}
