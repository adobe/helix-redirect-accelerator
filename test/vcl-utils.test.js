/*
 * Copyright 2018 Adobe. All rights reserved.
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
const utils = require('../src/vcl-utils');

describe('Testing vcl-utils.js', () => {
  it('#pattern2vcl', () => {
    assert.equal(utils.pattern2vcl('/foo/bar'), '"/foo/bar"');
    assert.equal(utils.pattern2vcl('/foo/$1.html'), '"/foo/" + re.group.1 + ".html"');
    assert.equal(utils.pattern2vcl('/foo/$1/bar/$2.html'), '"/foo/" + re.group.1 + "/bar/" + re.group.2 + ".html"');
    assert.equal(utils.pattern2vcl('/foo/$1/bar/$2.$3'), '"/foo/" + re.group.1 + "/bar/" + re.group.2 + "." + re.group.3 + ""');
  });

  it('#condition', () => {
    assert.equal(utils.condition('/old/(.*)', 'default'), 'req.url.path ~ "/old/(.*)"');
    assert.equal(utils.condition('https://(.*).adobe.io', 'staging'), '("https://" + req.http.host + req.url.path) ~ "https://(.*).adobe.io"');
  });
});
