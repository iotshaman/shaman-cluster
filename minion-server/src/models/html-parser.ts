import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';

export class HtmlParser {

  $: CheerioAPI;

  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  parse = (parsers: {[key: string]: ($: CheerioAPI) => any}): {[key: string]: any} => {
    let keys = Object.keys(parsers);
    return keys.reduce((a, b) => {
      try {
        a[b] = parsers[b](this.$);
      } catch (ex) {
        a[b] = null;
      }
      return a;
    }, {});
  }

}