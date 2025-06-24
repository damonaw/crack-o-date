import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const html = `<!DOCTYPE html>
<div id="date-buttons"></div>
<div id="operator-buttons"></div>
<div id="left-side"></div>
<div id="right-side"></div>
<div id="header-date"></div>
<button id="theme-toggle"></button>
<div id="error-message"></div>
<span id="left-value"></span>
<span id="right-value"></span>
<div id="equals-sign"></div>
<button id="clear-button"></button>
<button id="check-button"></button>`;

test('numbers must be used in order', async () => {
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;

  class MockDate extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super('2025-06-23T00:00:00Z');
      } else {
        super(...args);
      }
    }
    static now() {
      return new Date('2025-06-23T00:00:00Z').getTime();
    }
  }
  window.Date = MockDate;
  global.Date = MockDate;

  await import('../static/scripts/script.js');
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

  const buttons = window.document.querySelectorAll('#date-buttons button');
  const messageEl = window.document.getElementById('error-message');

  // Click second button first - should be invalid
  buttons[1].click();
  assert.strictEqual(messageEl.textContent, 'Use numbers in order');
  assert.strictEqual(buttons[1].disabled, false);

  // Click first button then second - both become disabled
  buttons[0].click();
  buttons[1].click();
  assert.ok(buttons[0].disabled);
  assert.ok(buttons[1].disabled);

  delete global.window;
  delete global.document;
  delete global.localStorage;
  delete global.Date;
});
