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

async function getData(request, ...names) {
  if (/^application\/x-www-form-urlencoded/.test(request.headers.get('content-type'))) {
    const data = new URLSearchParams(await request.text());
    return names.reduce((prev, name) => {
      if (data.get(name)) {
        try {
          // eslint-disable-next-line no-param-reassign
          prev[name] = Number.parseInt(data.get(name), 10);
        } catch {
          // eslint-disable-next-line no-param-reassign
          prev[name] = data.get(name);
        }
      }
      return prev;
    }, {});
  } else if (/json/.test(request.headers.get('content-type'))) {
    const data = await request.json();
    return names.reduce((prev, name) => {
      if (data[name]) {
      // eslint-disable-next-line no-param-reassign
        prev[name] = data[name];
      }
      return prev;
    }, {});
  }
  return {};
}

module.exports = {
  getData,
};
