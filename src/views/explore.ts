import { el } from "@webtaku/el";

export class Explore {
  root: HTMLElement;

  constructor() {
    this.root = el('section.explore',
      el('h2.page-title', '탐색'),
    )
  }
}
