import * as puppeteer from "puppeteer-core";
import { inject, injectable } from 'inversify';
import { newGuid, RestClientFactory } from 'shaman-cluster-lib';
import { TYPES } from '../../composition/app.composition.types';
import { ScrapeArgs } from './scrape.args';
import { ISkill } from '../skill';
import { AppConfig } from '../../models/app.config';
import { IMonitorService } from '../../services/monitor.service';

@injectable()
export class ScrapeSkill implements ISkill {

  name: string = 'scrape';
  agent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.MonitorService) private monitor: IMonitorService) {

  }

  async execute(req: any): Promise<void> {
    if (!this.validateRequests<ScrapeArgs>(req)) 
      return Promise.reject("Invalid arguments provided.");
    if (!req.render) return this.scrape(req);
    else return this.scrapeWithRender(req);
  }

  validateRequests<T>(req: any): req is T {
    if (!(req as ScrapeArgs).apiBaseUri) return false;
    if (!(req as ScrapeArgs).requestUri) return false;
    if (!(req as ScrapeArgs).args) return false;
    if (!(req as ScrapeArgs).requestId) return false;
    return true;
  }

  private async scrape(req: ScrapeArgs): Promise<void> {
    try {
      let client = RestClientFactory(req.apiBaseUri, req.proxy, this.config.proxy);
      let headers = {'User-Agent': this.agent};
      let uri = req.requestUri == '/' ? '' : req.requestUri;
      let html = await client.GetHtml(uri, headers);
      let filename = `${newGuid()}.html`;
      await this.monitor.storeFile(req.requestId, html, filename, req.args, 'html');
    } catch(ex) {
      let error = ex as Error;
      let message = error.message || 'Unkown error';
      let stack = error.stack || 'No stack trace available';
      await this.monitor.logError(req.requestId, message, stack, req.args);
      throw ex;
    }
  }

  private async scrapeWithRender(req: ScrapeArgs): Promise<void> {
    let browser: puppeteer.Browser;
    try {
      if (!this.config.chromiumPath) return Promise.reject(new Error("Chromium not configured."));
      browser = !req.proxy || this.config.proxy?.type != "tor" ? 
        await puppeteer.launch({headless: true, executablePath: this.config.chromiumPath}) :
        await puppeteer.launch({headless: true, executablePath: this.config.chromiumPath, args: [
          `--proxy-server=${this.config.proxy.proxyAddress}`,
        ]});
      const page = await browser.newPage();
      await page.setUserAgent(this.agent);
      await page.goto(`${req.apiBaseUri}/${req.requestUri}`, {'timeout': 120000});
      const html = await page.content();
      await browser.close();
      let filename = `${newGuid()}.html`;
      await this.monitor.storeFile(req.requestId, html, filename, req.args, 'html');
    } catch(ex) {
      if (!!browser) await browser.close();
      let error = ex as Error;
      let message = error.message || 'Unkown error';
      let stack = error.stack || 'No stack trace available';
      await this.monitor.logError(req.requestId, message, stack, req.args);
      throw ex;
    }
  }

}