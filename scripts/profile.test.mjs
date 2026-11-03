import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let App;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, logLevel: 'silent' });
  App = (await server.ssrLoadModule('/src/App.jsx')).default;
});
after(async () => { await server?.close(); });

function renderPage(hash, items = null) {
  globalThis.window = { location: { hash } };
  globalThis.localStorage = { getItem: () => items === null ? null : JSON.stringify(items) };
  return renderToStaticMarkup(React.createElement(App));
}

const ownItem = { id: 'my-item', title: 'My notebook', price: 50, category: 'textbooks', condition: 'used', description: 'A notebook', status: 'active', owner: 'you', seller: 'You', photos: [] };

test('profile separates existing active listings and sold history, excluding other sellers', () => {
  const html = renderPage('#/profile');
  const [active, sold] = html.split('<section class="profile-section" aria-labelledby="sold-items-title">');
  assert.match(active, /Calculus II textbook/);
  assert.match(active, /Engineering lab coat/);
  assert.doesNotMatch(active, /MATH 201 workbook/);
  assert.match(sold, /MATH 201 workbook/);
  assert.doesNotMatch(html, /Student desk lamp|Bluetooth headphones|Drawing tablet|Used storage shelf|Sketching kit/);
  assert.doesNotMatch(html, /Listing unavailable|role="dialog"/);
  assert.match(html, /aria-current="page"/);
});

test('a newly saved listing appears in the profile with view and edit actions', () => {
  const html = renderPage('#/profile', [ownItem]);
  assert.match(html, /My notebook/);
  assert.match(html, /href="#\/items\/my-item"/);
  assert.match(html, /href="#\/items\/my-item\/edit\?from=profile"/);
  assert.match(html, /You have no sold items yet/);
});

test('a saved sold status moves the item out of active listings into sold history', () => {
  const html = renderPage('#/profile', [{ ...ownItem, status: 'sold' }]);
  const [active, sold] = html.split('<section class="profile-section" aria-labelledby="sold-items-title">');
  assert.match(active, /You have no active listings yet/);
  assert.doesNotMatch(active, /My notebook/);
  assert.match(sold, /My notebook/);
  assert.match(sold, /class="soldstatus">SOLD/);
});

test('an empty account shows helpful empty states in both sections', () => {
  const html = renderPage('#/profile', []);
  assert.match(html, /You have no active listings yet/);
  assert.match(html, /You have no sold items yet/);
});

test('browse keeps all sellers and offers the profile link', () => {
  const html = renderPage('#/');
  assert.match(html, /href="#\/profile" aria-label="My profile"/);
  assert.match(html, /Bluetooth headphones/);
  assert.match(html, /Calculus II textbook/);
  assert.doesNotMatch(html, /class="manage-listing"/);
});
