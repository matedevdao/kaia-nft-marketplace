import { el } from "@webtaku/el";

export class History {
  root: HTMLElement;

  constructor() {
    this.root = el('section.history',
      el('h2.page-title', '히스토리'),
    )
  }
}
