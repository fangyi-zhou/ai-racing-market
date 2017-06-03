import { AiRacingMarketPage } from './app.po';

describe('ai-racing-market App', () => {
  let page: AiRacingMarketPage;

  beforeEach(() => {
    page = new AiRacingMarketPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
