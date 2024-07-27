import * as puppeteer from "puppeteer-core";
import { URL } from 'url';
import { Element } from 'cheerio';
import { inject, injectable } from 'inversify';
import { RestClientFactory } from 'shaman-cluster-lib';
import { TYPES } from '../../composition/app.composition.types';
import { CrawlArgs } from './crawl.args';
import { ISkill } from '../skill';
import { AppConfig } from '../../models/app.config';
import { IMonitorService } from '../../services/monitor.service';
import { HtmlParser } from "../../models/html-parser";

@injectable()
export class CrawlSkill implements ISkill {

  name: string = 'crawl';
  agent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.MonitorService) private monitor: IMonitorService) {

  }

  async execute(req: any): Promise<void> {
    if (!this.validateRequests<CrawlArgs>(req)) 
      return Promise.reject("Invalid arguments provided.");
    try {
      let html = !req.render ? await this.scrape(req) : await this.scrapeWithRender(req);
      let parser = new HtmlParser(html);
      let data = parser.parse({links: $ => $('a')});
      let links: string[] = [];
      let hostUrl = new URL(req.apiBaseUri);
      data.links.each((_i: number, row: Element) => {
        let linkData = parser.parse({link: $ => $(row).attr('href')});
        if (!linkData?.link) return;
        if (linkData.link === "javascript:void(0)") return;
        let url = new URL(linkData.link, req.apiBaseUri);
        if (url.hostname != hostUrl.hostname) return;
        links.push(url.toString());
      });
      links = [...new Set(links)];
      await this.monitor.store(req.requestId, {links}, req.args);
    } catch(ex) {
      let error = ex as Error;
      let message = error.message || 'Unkown error';
      let stack = error.stack || 'No stack trace available';
      await this.monitor.logError(req.requestId, message, stack, req.args);
      throw ex;
    }
  }

  validateRequests<T>(req: any): req is T {
    if (!(req as CrawlArgs).apiBaseUri) return false;
    if (!(req as CrawlArgs).requestUri) return false;
    if (!(req as CrawlArgs).args) return false;
    if (!(req as CrawlArgs).requestId) return false;
    return true;
  }

  private async scrape(req: CrawlArgs): Promise<string> {
    let client = RestClientFactory(req.apiBaseUri, req.proxy, this.config.proxy);
    let headers = {'User-Agent': this.agent};
    let uri = req.requestUri == '/' ? '' : req.requestUri;
    return await client.GetHtml(uri, headers);
  }

  private async scrapeWithRender(req: CrawlArgs): Promise<string> {
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
      return html;
    } catch(ex) {
      if (!!browser) await browser.close();
      throw ex;
    }
  }

}