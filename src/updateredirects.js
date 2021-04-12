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

const RedirectConfig = require('@adobe/helix-shared/src/RedirectConfig');
const { Response } = require('@adobe/helix-fetch');
const f = require('@adobe/fastly-native-promises');
const { pattern2vcl, condition } = require('./vcl-utils.js');

async function updateredirects({
  owner, repo, ref, service, token, version,
}, logger) {
  if (!owner || !repo || !ref || !service || !token || !version) {
    return new Response('owner, repo, ref, service, token, version are required parameters', {
      status: 400,
    });
  }
  const config = await new RedirectConfig()
    .withRepo(owner, repo, ref)
    .init();

  const fastly = f(token, service);

  const redirects = config.all().map(({ from, to }) => ({
    condition: condition(from),
    expression: pattern2vcl(to),
  }));

  const update = fastly.headers.update(
    version,
    'REQUEST',
    'Created by helix-redirect-accelerator for Redirects',
    'hlx-acc-redirect',
    'set',
    'http.X-Location',
    'request',
  );

  logger.info(`Updating redirects for service ${service} v${version}`);

  await update(...redirects);

  return new Response('Redirects updated.');
}

module.exports = {
  updateredirects,
};
