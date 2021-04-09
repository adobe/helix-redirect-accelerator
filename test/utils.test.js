/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */

const assert = require('assert');
const { Request } = require('@adobe/helix-fetch');
const { getData } = require('../src/utils');

describe('Test Utils', () => {
  it('JSON body can be parsed', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ foo: 'bar' }),
    });
    assert.deepStrictEqual(await getData(req, 'foo', 'bar'), { foo: 'bar' });
  });

  it('URL encoded body can be parsed', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'foo=bar',
    });
    assert.deepStrictEqual(await getData(req, 'foo', 'bar'), { foo: 'bar' });
  });

  it('URL encoded body can be parsed', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
    });
    assert.deepStrictEqual(await getData(req, 'foo', 'bar'), { });
  });
});
