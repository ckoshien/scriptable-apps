// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: magic;
const DAY_IN_MICROSECONDS = 86400000;
let game = await gameAPI();
const number = Math.floor(Math.random() * game.length);
let widget = await createWidget(game[number]);
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget);
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentMedium();
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete();

async function createWidget(game) {
  const gameDate =
    new Date(game.game_date).getMonth() +
    1 +
    "/" +
    new Date(game.game_date).getDate();
  let title = `${gameDate}の公式戦`;
  let widget = new ListWidget();
  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("141414"), new Color("13233F")];
  widget.backgroundGradient = gradient;
  // Show app icon and title
  let titleStack = widget.addStack();
  titleStack.addSpacer(4);
  let titleElement = titleStack.addText(title);
  titleElement.textColor = Color.white();
  titleElement.textOpacity = 0.7;
  titleElement.font = Font.mediumSystemFont(13);
  widget.addSpacer(12);
  titleStack.addSpacer(6);
  const resultStack = widget.addStack();
  // Show API
  const teamNameStack = resultStack.addStack();
  resultStack.addSpacer(10);
  teamNameStack.layoutVertically();
  const scoreStack = resultStack.addStack();
  scoreStack.layoutVertically();
  let firstTElement = teamNameStack.addText(game.first_team_name);
  firstTElement.textColor = Color.white();
  firstTElement.font = Font.mediumSystemFont(18);
  firstTElement;
  scoreStack.addText(String(game.first_run));
  let lastTElement = teamNameStack.addText(game.last_team_name);
  lastTElement.textColor = Color.white();
  lastTElement.font = Font.mediumSystemFont(18);
  scoreStack.addText(String(game.last_run));
  // UI presented in Siri ans Shortcuta is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8);
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward");
    let footerStack = widget.addStack();
    let linkStack = footerStack.addStack();
    linkStack.centerAlignContent();
    linkStack.url = `https://cap-scorebook.com/game/${game.game_id}`;
    let linkElement = linkStack.addText("スコアブックを開く");
    linkElement.font = Font.mediumSystemFont(13);
    linkElement.textColor = Color.blue();
    linkStack.addSpacer(3);
    let linkSymbolElement = linkStack.addImage(linkSymbol.image);
    linkSymbolElement.imageSize = new Size(11, 11);
    linkSymbolElement.tintColor = Color.blue();
    footerStack.addSpacer();
    // Add link to documentation
    let docsSymbol = SFSymbol.named("baseball");
    let docsElement = footerStack.addImage(docsSymbol.image);
    docsElement.imageSize = new Size(20, 20);
    docsElement.tintColor = Color.white();
    docsElement.imageOpacity = 0.5;
    docsElement.url = "https://docs.scriptable.app";
  }
  return widget;
}

async function gameAPI() {
  const beginDate = new Date();
  beginDate.setTime(beginDate.getTime() - 7 * DAY_IN_MICROSECONDS);
  let games = (await loadGames()).filter((game) => {
    return (
      new Date(game.game_date) >= beginDate &&
      !game.is_private &&
      game.isCap &&
      game.league_id !== 1
    );
  });
  return games;
}

async function loadGames() {
  let url = "https://jcbl-score.com/scoresheet/api/v1/game";
  let req = new Request(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const res = await req.loadJSON();
  return res;
}

async function loadTeamIcon(id) {
  let url = `https://s3.ap-northeast-1.wasabisys.com/capbaseball/teamIcons/${id}.jpg`;
  let req = new Request(url);
  try {
    const res = req.loadImage();
    return res;  
  } catch (error) {
    console.error(error)
    return null
  }
}
