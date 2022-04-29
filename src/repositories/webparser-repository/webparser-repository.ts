import got from 'got';

import { WebParserType, WebContentType } from './parsers/web-parser';
import { ArXivWebParser } from './parsers/arxiv';

import { Preference } from '../../utils/preference';
import { PaperEntityDraft } from '../../models/PaperEntityDraft';
import { SharedState } from '../../interactors/app-state';

export class WebParserRepository {
  preference: Preference;
  sharedState: SharedState;
  parserList: WebParserType[];

  constructor(preference: Preference, sharedState: SharedState) {
    this.preference = preference;
    this.sharedState = sharedState;

    this.parserList = [new ArXivWebParser(this.preference)];
  }

  async parse(webContent: WebContentType): Promise<PaperEntityDraft> {
    let entityDraft = new PaperEntityDraft();
    for (const parser of this.parserList) {
      try {
        entityDraft = await parser.parse(webContent, entityDraft);
      } catch (error) {
        this.sharedState.set(
          'viewState.alertInformation',
          `Scraper ${parser.constructor.name} error: ${error as string}`
        );
      }
    }
    return entityDraft;
  }
}
