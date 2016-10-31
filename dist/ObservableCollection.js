import { Observable } from 'rxjs';
import { ObservableCursor } from './ObservableCursor';
import { removeObserver } from './utils';
export var MongoObservable;
(function (MongoObservable) {
    'use strict';
    function fromExisting(collection) {
        return new MongoObservable.Collection(collection);
    }
    MongoObservable.fromExisting = fromExisting;
    var Collection = (function () {
        function Collection(nameOrExisting, options) {
            if (nameOrExisting instanceof Mongo.Collection) {
                this._collection = nameOrExisting;
            }
            else {
                this._collection = new Mongo.Collection(nameOrExisting, options);
            }
        }
        Object.defineProperty(Collection.prototype, "collection", {
            get: function () {
                return this._collection;
            },
            enumerable: true,
            configurable: true
        });
        Collection.prototype.allow = function (options) {
            return this._collection.allow(options);
        };
        Collection.prototype.deny = function (options) {
            return this._collection.deny(options);
        };
        Collection.prototype.rawCollection = function () {
            return this._collection.rawCollection();
        };
        Collection.prototype.rawDatabase = function () {
            return this._collection.rawDatabase();
        };
        Collection.prototype.insert = function (doc) {
            var observers = [];
            var obs = this._createObservable(observers);
            this._collection.insert(doc, function (error, docId) {
                observers.forEach(function (observer) {
                    error ? observer.error(error) :
                        observer.next(docId);
                    observer.complete();
                });
            });
            return obs;
        };
        Collection.prototype.remove = function (selector) {
            var observers = [];
            var obs = this._createObservable(observers);
            this._collection.remove(selector, function (error, removed) {
                observers.forEach(function (observer) {
                    error ? observer.error(error) :
                        observer.next(removed);
                    observer.complete();
                });
            });
            return obs;
        };
        Collection.prototype.update = function (selector, modifier, options) {
            var observers = [];
            var obs = this._createObservable(observers);
            this._collection.update(selector, modifier, options, function (error, updated) {
                observers.forEach(function (observer) {
                    error ? observer.error(error) :
                        observer.next(updated);
                    observer.complete();
                });
            });
            return obs;
        };
        Collection.prototype.upsert = function (selector, modifier, options) {
            var observers = [];
            var obs = this._createObservable(observers);
            this._collection.upsert(selector, modifier, options, function (error, affected) {
                observers.forEach(function (observer) {
                    error ? observer.error(error) :
                        observer.next(affected);
                    observer.complete();
                });
            });
            return obs;
        };
        Collection.prototype.find = function (selector, options) {
            var cursor = this._collection.find.apply(this._collection, arguments);
            return ObservableCursor.create(cursor);
        };
        Collection.prototype.findOne = function (selector, options) {
            return this._collection.findOne.apply(this._collection, arguments);
        };
        Collection.prototype._createObservable = function (observers) {
            return Observable.create(function (observer) {
                observers.push(observer);
                return function () {
                    removeObserver(observers, observer);
                };
            });
        };
        return Collection;
    }());
    MongoObservable.Collection = Collection;
})(MongoObservable || (MongoObservable = {}));