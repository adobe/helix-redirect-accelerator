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
/**
 * Turns regex-like replacement patterns into valid VCL statements, e.g. `/foo/$1.html` becomes
 * `"/foo/" + re.group.1 + ".html"`
 * @param {string} pattern - a replacement pattern that may include regex-like references like `$1`
 */
function pattern2vcl(pattern) {
  return `"${pattern.replace(/\$([0-9])/g, '" + re.group.$1 + "')}"`;
}

/**
 * Turns a regex-pattern (on the full URL, if it starts with `https://`, on the path and QS only, otherwise)
 * into a valid VCL condition
 * @param {string} pattern - a regex-like pattern
 */
function condition(pattern) {
  const varname = pattern.match(/^https:\/\//) ? '("https://" + req.http.host + req.url.path)' : 'req.url.path';
  return `${varname} ~ "${pattern}"`;
}

module.exports = { condition, pattern2vcl };
