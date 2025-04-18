import {spy as sinonSpy} from 'sinon';
import EventTarget from '../../../src/ol/events/Target.js';
import {listen, listenOnce, unlistenByKey} from '../../../src/ol/events.js';
import expect from '../expect.js';

describe('ol/events.js', function () {
  let add, target;

  beforeEach(function () {
    target = new EventTarget();
    add = sinonSpy(target, 'addEventListener');
  });

  afterEach(function () {
    target.addEventListener.restore();
  });

  describe('listen()', function () {
    it('calls addEventListener on the target', function () {
      listen(target, 'foo', function () {});
      expect(add.callCount).to.be(1);
    });
    it('returns a key', function () {
      const key = listen(target, 'foo', function () {});
      expect(key).to.be.a(Object);
    });
    it('does not add the same listener twice', function () {
      const listener = function () {};
      listen(target, 'foo', listener);
      listen(target, 'foo', listener);
      expect(target.listeners_['foo'].length).to.be(1);
    });
    it('only treats listeners as same when all args are equal', function () {
      const listener = function () {};
      listen(target, 'foo', listener, {});
      listen(target, 'foo', listener, {});
      listen(target, 'foo', listener, undefined);
      expect(target.listeners_['foo'].length).to.be(3);
    });
    it('stops propagation when false is returned', () => {
      const listener1 = sinonSpy(() => false);
      const listener2 = sinonSpy();
      const target = new EventTarget();
      listen(target, 'bar', listener1);
      listen(target, 'bar', listener2);
      target.dispatchEvent('bar');
      expect(listener1.calledOnce).to.be(true);
      expect(listener2.calledOnce).to.be(false);
    });
  });

  describe('listenOnce()', function () {
    it('creates a one-off listener', function () {
      const target = new EventTarget();
      const listener = sinonSpy();
      listenOnce(target, 'foo', listener);
      target.dispatchEvent('foo');
      expect(listener.callCount).to.be(1);
      target.dispatchEvent('foo');
      expect(listener.callCount).to.be(1);
    });
    it('Adds the same listener twice', function () {
      const listener = sinonSpy();
      listenOnce(target, 'foo', listener);
      listenOnce(target, 'foo', listener);
      target.dispatchEvent('foo');
      target.dispatchEvent('foo');
      target.dispatchEvent('foo');
      expect(listener.callCount).to.be(2);
    });
    it('is called with the provided this argument', () => {
      const listener = sinonSpy();
      const target = new EventTarget();
      const that = {};
      listenOnce(target, 'bar', listener, that);
      target.dispatchEvent('bar');
      expect(listener.thisValues[0]).to.be(that);
    });
    it('stops propagation when false is returned', () => {
      const listener1 = sinonSpy(() => false);
      const listener2 = sinonSpy();
      const target = new EventTarget();
      listenOnce(target, 'bar', listener1);
      listenOnce(target, 'bar', listener2);
      target.dispatchEvent('bar');
      expect(listener1.calledOnce).to.be(true);
      expect(listener2.calledOnce).to.be(false);
    });
  });

  describe('unlistenByKey()', function () {
    it('unregisters previously registered listeners', function () {
      const key = listen(target, 'foo', function () {});
      unlistenByKey(key);
      expect(target.listeners_['foo']).to.be(undefined);
    });
    it('works with multiple types', function () {
      const key = listen(target, ['foo', 'bar'], function () {});
      unlistenByKey(key);
      expect(target.listeners_['foo']).to.be(undefined);
      expect(target.listeners_['bar']).to.be(undefined);
    });
  });

  describe('Listener keys', function () {
    it('does not register duplicated listeners', function () {
      const target = new EventTarget();
      const listener = function () {};
      const key1 = listen(target, 'foo', listener);
      expect(target.listeners_['foo']).to.eql([listener]);
      const key2 = listen(target, 'foo', listener);
      expect(target.listeners_['foo']).to.eql([listener]);
      expect(key1.listener).to.equal(key2.listener);
    });
    it('registers multiple listeners if this object is different', function () {
      const target = new EventTarget();
      const listener = function () {};
      const key1 = listen(target, 'foo', listener, {});
      const key2 = listen(target, 'foo', listener, {});
      expect(key1.listener).to.not.equal(key2.listener);
      expect(target.listeners_['foo']).to.eql([key1.listener, key2.listener]);
    });
  });
});
