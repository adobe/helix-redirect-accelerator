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
const { condit, logging } = require('@adobe/helix-testutils');
const { updateredirects } = require('../src/updateredirects');

describe('Integration Test #online', () => {
  condit('Successfully install redirects', condit.hasenvs(['FASTLY_SERVICE_ID', 'HLX_FASTLY_AUTH', 'FASTLY_VERSION']), async () => {
    const res = await updateredirects({
      owner: 'trieloff',
      repo: 'helix-demo',
      ref: '08444b97e204bee84aca9d07014f24d1be770af7',
      service: process.env.FASTLY_SERVICE_ID,
      token: process.env.HLX_FASTLY_AUTH,
      version: process.env.FASTLY_VERSION,

    }, logging.createTestLogger());
    assert.ok(res);
  }).timeout(20000);
});
