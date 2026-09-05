/**
 * tests/harness/mock_browser.js
 * Zero-dependency headless browser environment mock for Meow Meow Ôn Viên Chức.
 * Provides complete DOM, localStorage, Web Audio API, and Time-Travel capabilities.
 */

const vm = require('vm');
const fs = require('fs');
const path = require('path');

class MockLocalStorage {
  constructor(initialData = {}) {
    this._store = { ...initialData };
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._store, key) ? this._store[key] : null;
  }

  setItem(key, value) {
    this._store[key] = String(value);
  }

  removeItem(key) {
    delete this._store[key];
  }

  clear() {
    this._store = {};
  }

  get length() {
    return Object.keys(this._store).length;
  }

  key(index) {
    const keys = Object.keys(this._store);
    return keys[index] || null;
  }

  dump() {
    return { ...this._store };
  }

  __getRawStore() {
    return this._store;
  }
}

class MockDOMElement {
  constructor(tagName = 'DIV') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.eventListeners = {};
    this._textContent = '';
    this._innerHTML = '';
    this.disabled = false;
    this.value = '';
    this.id = '';
    this.className = '';
    this.classList = {
      _classes: new Set(),
      add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
      remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c) => {
        if (this.classList._classes.has(c)) {
          this.classList._classes.delete(c);
          return false;
        } else {
          this.classList._classes.add(c);
          return true;
        }
      }
    };
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(val) {
    this._textContent = String(val);
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = String(val);
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'id') this.id = String(val);
    if (name === 'class') {
      this.className = String(val);
      this.classList._classes = new Set(String(val).split(/\s+/).filter(Boolean));
    }
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentElement = null;
    }
    return child;
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
  }

  dispatchEvent(evt) {
    const handlers = this.eventListeners[evt.type] || [];
    for (const h of handlers) {
      h.call(this, evt);
    }
    return true;
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this });
  }

  querySelector(selector) {
    // Basic element selector
    for (const child of this.children) {
      if (child.matches && child.matches(selector)) return child;
      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    for (const child of this.children) {
      if (child.matches && child.matches(selector)) results.push(child);
      results.push(...child.querySelectorAll(selector));
    }
    return results;
  }

  matches(selector) {
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    return this.tagName === selector.toUpperCase();
  }
}

function createBrowserEnvironment(options = {}) {
  const localStorage = new MockLocalStorage(options.initialStorage || {});
  let currentTime = options.initialTime ? new Date(options.initialTime).getTime() : Date.now();

  const CustomDate = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super(currentTime);
      } else {
        super(...args);
      }
    }
    static now() {
      return currentTime;
    }
  };

  const body = new MockDOMElement('BODY');
  const head = new MockDOMElement('HEAD');
  const documentElement = new MockDOMElement('HTML');
  documentElement.appendChild(head);
  documentElement.appendChild(body);

  const document = {
    documentElement,
    head,
    body,
    createElement: (tag) => new MockDOMElement(tag),
    getElementById: (id) => documentElement.querySelector(`#${id}`),
    querySelector: (sel) => documentElement.querySelector(sel),
    querySelectorAll: (sel) => documentElement.querySelectorAll(sel),
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const audioEvents = [];
  class MockAudioContext {
    constructor() {
      this.state = 'suspended';
    }
    async resume() {
      this.state = 'running';
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime: (val) => audioEvents.push({ type: 'freq', val }) },
        connect: () => {},
        start: () => audioEvents.push({ type: 'start' }),
        stop: () => audioEvents.push({ type: 'stop' })
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {}
      };
    }
    get destination() {
      return {};
    }
  }

  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Date: CustomDate,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    TypeError,
    localStorage,
    document,
    AudioContext: MockAudioContext,
    window: {},
    audioEvents,
    // Helper to advance time
    advanceTimeDays: (days) => {
      currentTime += days * 86400000;
    },
    setTime: (dateStrOrMs) => {
      currentTime = typeof dateStrOrMs === 'number' ? dateStrOrMs : new Date(dateStrOrMs).getTime();
    }
  };

  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.self = sandbox;

  return sandbox;
}

function loadScriptIntoSandbox(filePath, sandbox) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Script file not found: ${filePath}`);
  }
  const code = fs.readFileSync(filePath, 'utf-8');
  return vm.runInNewContext(code, sandbox, { filename: path.basename(filePath) });
}

module.exports = {
  MockLocalStorage,
  MockDOMElement,
  createBrowserEnvironment,
  loadScriptIntoSandbox
};
