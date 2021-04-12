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

  const redirects = await config.all();

  const redirects301 = redirects.filter((r) => r.type === 'permanent').map(({ from, to }) => ({
    condition: condition(from),
    expression: pattern2vcl(to),
  }));

  const update301 = fastly.headers.update(
    version,
    'REQUEST',
    'Created by helix-redirect-accelerator for Redirects',
    'hlx-301-redirect',
    'set',
    'http.X-301-Location',
    'request',
  );

  const redirects302 = redirects.filter((r) => r.type === 'temporary').map(({ from, to }) => ({
    condition: condition(from),
    expression: pattern2vcl(to),
  }));

  const update302 = fastly.headers.update(
    version,
    'REQUEST',
    'Created by helix-redirect-accelerator for Redirects',
    'hlx-302-redirect',
    'set',
    'http.X-302-Location',
    'request',
  );

  logger.info(`Updating redirects for service ${service} v${version}`);

  // generate a long list of conditions and request headers, each
  // corresponding to one redirect rule
  // permanent
  await update301(...redirects301);
  // temporary
  await update302(...redirects302);

  await fastly.writeCondition(version, 'hlx-301-redirect', {
    name: 'hlx-301-redirect',
    type: 'request',
    priority: 101,
    statement: 'req.http.X-301-Location',
  });

  await fastly.writeCondition(version, 'hlx-302-redirect', {
    name: 'hlx-302-redirect',
    type: 'request',
    priority: 101,
    statement: 'req.http.X-302-Location',
  });

  await fastly.writeCondition(version, 'hlx-any-redirect', {
    name: 'hlx-any-redirect',
    type: 'response',
    statement: '(resp.status == 301 || resp.status == 302) && (req.http.X-301-Location || req.http.X-302-Location)',
  });

  await fastly.writeResponse(version, 'hlx-301-response', {
    name: 'hlx-301-response',
    request_condition: 'hlx-301-redirect',
    content_type: 'text/html',
    status: 301,
    content: 'moved permanently',
  });

  await fastly.writeResponse(version, 'hlx-302-response', {
    name: 'hlx-302-response',
    request_condition: 'hlx-302-redirect',
    content_type: 'text/html',
    status: 302,
    content: 'moved temporarily',
  });

  await fastly.writeHeader(version, 'hlx-any-location', {
    name: 'hlx-any-location',
    type: 'response',
    response_condition: 'hlx-any-redirect',
    dst: 'http.Location',
    src: 'if(req.http.X-301-Location, req.http.X-301-Location, req.http.X-302-Location)',
  });

  fastly.discard();

  return new Response('Redirects updated.');
}

module.exports = {
  updateredirects,
};
