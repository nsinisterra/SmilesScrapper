'use strict';

import playwright from 'playwright';
import { config } from '../config';

export default class Browser {
  private _browser: any;

  async getApiData(url) {
    const page = await this.openPage(url);
    return (
      await page.waitForResponse(
        (response) =>
          response
            .url()
            .includes(
              'https://api-air-flightsearch-prd.smiles.com.br/v1/airlines/search'
            ) && response.status() === 200
      )
    ).json();
  }

  async openPage(url) {
    if (!this._browser) {
      await this.openBrowser();
    }

    const page = await this._browser.newPage();
    await page.goto(url);
    return page;
  }

  async openBrowser() {
    this._browser = await playwright.chromium.launch({
      headless: config.playwright.headless // Show the browser.
    });

    return this._browser;
  }

  async close() {
    await this._browser.close();
  }
}
