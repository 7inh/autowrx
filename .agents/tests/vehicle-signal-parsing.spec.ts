// Copyright (c) 2026 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { test, expect } from '@playwright/test';
import {
  loginAsAdmin,
  saveScreenshot,
  createTestModelViaApi,
  createTestPrototypeViaApi,
  setPrototypeCodeViaApi,
  goToPrototypeCodeTab,
  deleteModelViaApi,
  deletePrototypeViaApi,
} from './helpers';

// COVESA v6.0 signal paths used to prove each parsing rule. Real, distinct
// leaf paths (verified against backend/data/v6.0.json) so a false positive
// can't be explained by the model simply lacking the signal.
const REAL_SIGNAL = 'Vehicle.CurrentLocation.Latitude'; // used directly, uppercase
const LOWERCASE_SIGNAL = 'Vehicle.Speed'; // used via a lowercase `vehicle` local name
const COMMENTED_SIGNAL = 'Vehicle.Cabin.Door.Row1.DriverSide.IsOpen'; // only in a `#` comment
const LOGGER_SIGNAL = 'Vehicle.Body.Trunk.Rear.IsOpen'; // only inside a LOGGER call
const MARKDOWN_SIGNAL = 'Vehicle.Cabin.Seat.Row1.DriverSide.OccupancyStatus'; // only in a .md file

const APP_PY_CONTENT = [
  'from sdv_model import Vehicle',
  '',
  'vehicle = Vehicle()',
  '',
  `# ${COMMENTED_SIGNAL}.get()  -- commented out, must be ignored`,
  `LOGGER.info("${LOGGER_SIGNAL}")  # logged, must be ignored`,
  '',
  `${REAL_SIGNAL}.get()`,
  `vehicle.${LOWERCASE_SIGNAL.replace('Vehicle.', '')}.get()`,
].join('\n');

const README_MD_CONTENT = `This prototype watches \`${MARKDOWN_SIGNAL}\` for demo purposes.\n`;

const PROJECT_CODE = JSON.stringify([
  { type: 'file', name: 'app.py', content: APP_PY_CONTENT },
  { type: 'file', name: 'README.md', content: README_MD_CONTENT },
]);

test.describe('Vehicle Signal Parsing', () => {
  test.setTimeout(90000);

  let modelId: string | null = null;
  let prototypeId: string | null = null;

  test.afterEach(async ({ page }) => {
    await loginAsAdmin(page);
    if (prototypeId) {
      await deletePrototypeViaApi(page, prototypeId).catch(() => {});
      prototypeId = null;
    }
    if (modelId) {
      await deleteModelViaApi(page, modelId).catch(() => {});
      modelId = null;
    }
  });

  test('Used APIs panel ignores comments, LOGGER lines and markdown, and accepts lowercase vehicle', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const timestamp = Date.now();
    // api_version pins the model to COVESA v6.0 so the signal paths above resolve.
    modelId = await createTestModelViaApi(
      page,
      `E2E_SignalParsing_${timestamp}`,
      'private',
      undefined,
      'v6.0',
    );
    const created = await createTestPrototypeViaApi(page, {
      name: `E2E_SignalParsingProto_${timestamp}`,
      modelId,
    });
    prototypeId = created.prototypeId;

    await setPrototypeCodeViaApi(page, prototypeId, PROJECT_CODE);

    await goToPrototypeCodeTab(page, modelId, prototypeId);

    // "Used APIs" is the default tab of the API panel, backed by
    // filterAndCompareVehicleApis / useUsedVehicleApis.
    const usedSignalNames = page.locator('.signal-list-item-name');
    await expect(usedSignalNames.filter({ hasText: REAL_SIGNAL })).toBeVisible({
      timeout: 20000,
    });

    const usedNames = (await usedSignalNames.allTextContents()).map((t) => t.trim());

    // Real usage and the lowercase `vehicle.*` binding are both recognized.
    expect(usedNames).toContain(REAL_SIGNAL);
    expect(usedNames).toContain(LOWERCASE_SIGNAL);

    // A commented-out line, a LOGGER call and a Markdown file must not count
    // as signal usage, even though each string appears verbatim in the project.
    expect(usedNames).not.toContain(COMMENTED_SIGNAL);
    expect(usedNames).not.toContain(LOGGER_SIGNAL);
    expect(usedNames).not.toContain(MARKDOWN_SIGNAL);

    await saveScreenshot(page, 'vehicle-signal-parsing-used-apis');
  });
});
