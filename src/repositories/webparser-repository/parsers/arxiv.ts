import { WebContentType, WebParser } from './web-parser';
import { Preference } from '../../../utils/preference';
import { PaperEntityDraft } from '../../../models/PaperEntityDraft';

export class ArXivWebParser extends WebParser {
  constructor(preference: Preference) {
    const urlRegExp = new RegExp(
      '^https?://([^\\.]+\\.)?(arxiv\\.org|xxx\\.lanl\\.gov)/(/\\w|abs/|pdf/)'
    );
    super(preference, urlRegExp);
  }

  async parsingProcess(
    webContent: WebContentType,
    entityDraft: PaperEntityDraft
  ): Promise<PaperEntityDraft | void> {
    const arXivID = webContent.url.split('/')[4].replace('.pdf', '');
    const downloadURL = `https://arxiv.org/pdf/${arXivID}.pdf`;

    const downloadedFilePath = await this.downloadProcess([downloadURL]);

    if (arXivID) {
      entityDraft.setValue('arxiv', arXivID);
    }
    entityDraft.setValue('pubType', 0);
    entityDraft.setValue('publication', 'arXiv');
    entityDraft.setValue('mainURL', downloadedFilePath[0]);

    return entityDraft;
  }
}
