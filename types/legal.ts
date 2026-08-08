export interface LegalNotice {
  type: 'info' | 'warning' | 'success';
  title: string;
  content: string;
}

export interface LegalSection {
  id: string;
  title: string;
  content: string[];
  notice?: LegalNotice;
}

export interface LegalPage {
  title: string;
  description: string;
  lastUpdated: string;
  readingTime: string;
  sections: LegalSection[];
}