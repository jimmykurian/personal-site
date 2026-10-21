/**
 * @file common.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Given } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { fileFor } from '../../support/dist';

Given('the production build of the site', function () {
  assert.equal(fileFor('/'), '/index.html', 'the build has no home page');
});
