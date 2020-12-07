import React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react';
import { TextField } from '@fluentui/react';
import { Icon } from '@fluentui/react/lib/Icon';

import { Timer } from './Timer';
import './App.css';

const MSN_RSS_URI = 'https://rss.msn.com/';
const MSN_TITLE = 'MSN | Outlook, Office, Skype, Bing, Breaking News, and Latest Videos';

interface RssResponse {
  nodeName: string;
  children: HTMLCollection;
  innerHTML: string;
}

function dfsRecordTitles(document: RssResponse): Array<string> {
  const titles: Array<string> = [];
  if (document?.nodeName === 'title' && !document.innerHTML.includes(MSN_TITLE)) {
    titles.push(document.innerHTML);
  } else if (document.children) {
    const children = Object.keys(document.children).map(key => document.children[Number.parseInt(key)]);
    titles.push(...children.map(child => dfsRecordTitles(child)).reduce((prev, curr) => prev.concat(curr), []));
  }
  return titles;
}

/**
 * Only consider times consisting of minutes and seconds
 */
function convertSecondsToTimestamp(seconds: number): string {
  const numSeconds = seconds % 60;
  const numMinutes = Math.floor(seconds / 60);
  const padWithZeros = (timeValue: number) => `${timeValue < 10 ? '0' : ''}${timeValue}`;
  return `${padWithZeros(numMinutes)}:${padWithZeros(numSeconds)}`;
}

interface StatisticProps {
  label: string;
  value: string;
}

const Statistic = (props: StatisticProps) => <p>{props.label}: <span className="stats-value">{props.value}</span></p>;
const ShareIcon = () => <Icon iconName="Share" />;

type AppProps = {};
interface AppState {
  articles: Array<string>;
  headline: string;
  userInput: string;
  headlinesCompleted: Array<string>;
  timer: Timer;
  appStopped: boolean;
  currentTime: Date; // used only to trigger updates to render()
}

class App extends React.Component<AppProps, AppState> {
  private _timerInterval: number;

  constructor(props: AppProps) {
    super(props);
    this._timerInterval = 0;
    this.state = {
      articles: [],
      headline: '',
      userInput: '',
      headlinesCompleted: [],
      timer: new Timer(),
      appStopped: true,
      currentTime: new Date(),
    };
  }

  public render(): JSX.Element {
    const { 
      articles,
      headline,
      timer,
      headlinesCompleted,
      userInput,
      appStopped,
    } = this.state;

    const headlineIndex = articles.indexOf(headline);
    const nextHeadline: string = articles[headlineIndex + 1];
    const secondsElapsed = Math.floor(timer.getTimeElapsed() / 1000);

    const handleStartClick = () => {
      const { timer } = this.state;

      timer.start();
      this.setState({
        ...this.state,
        appStopped: false,
        timer,
      });

      const inputField = document.getElementById('inputField') as HTMLTextAreaElement;
      inputField.autofocus = true;
      if (inputField) {
        inputField.focus();
      }
    };

    const handleStopClick = () => {
      const { timer } = this.state;
      timer.stop();
      this.setState({
        ...this.state,
        appStopped: true,
        timer,
      });
    };

    const handleTextUpdate = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string | undefined) => {
      const { headlinesCompleted, headline, articles } = this.state;
      this.setState({
        ...this.state,
        userInput: newValue as string,
      });
      if (newValue === headline) {
        // Move user to next headline
        const headlineIndex = articles.indexOf(headline);
        this.setState({
          ...this.state,
          headlinesCompleted: [...headlinesCompleted, headline],
          headline: articles[headlineIndex + 1],
          userInput: '',
        });
      }
    };

    // Compute words spelled so far
    let wordsCount = headlinesCompleted.map(headline => headline.trim().split(' ').length).reduce((prev, curr) => prev + curr, 0);
    if (userInput.trim().length > 0) {
      wordsCount += userInput.trim().split(' ').length;
    }
    const showWpmScore = appStopped && (headlinesCompleted.length || userInput);
    const wpmScore = Math.floor(wordsCount * (60 / secondsElapsed));

    const inputTextField = <TextField
      label='Type here'
      multiline
      value={userInput}
      style={{ height: "8em" }}
      onChange={handleTextUpdate}
      disabled={appStopped}
      id='inputField'
    />;

    return (
      <div className="app">
        <h1>Typing Speed Test 🔥</h1>
        <div id="typing-space">
          <div id="source-area">
            <div>
              <p>Type what appears here in the box to the right. Press <b>Start</b> to begin</p>
              <ul>
                <li key={headline}>{headline}</li>
                <li key={nextHeadline} className="next-headline">{nextHeadline}</li>
              </ul>
            </div>
            <div>
              <PrimaryButton 
                text='Start >'
                onClick={handleStartClick}
              />
            </div>
          </div>
          <div id="input-area">
            {inputTextField}

            <div className="input-subrow">
              <DefaultButton
                text='Stop'
                onClick={handleStopClick}
                disabled={appStopped}
              />
              <div className="stats">
                <Statistic
                  label='Time elapsed'
                  value={convertSecondsToTimestamp(secondsElapsed)}
                />
                <Statistic
                  label='Words typed'
                  value={wordsCount.toString()}
                />
                {showWpmScore &&
                  <Statistic
                    label='Words per minute'
                    value={wpmScore.toString()}
                  />
                }
              </div>
            </div>
            <p>Share <ShareIcon/> your score and challenge a friend</p>
          </div>
        </div>
      </div>
    );
  }

  public componentDidMount(): void {
    this._timerInterval = window.setInterval(() => {
      this.setState({
        ...this.state,
        currentTime: new Date(),
      });
    }, 1000);

    fetch(MSN_RSS_URI).then(resp => {
      return resp.text();
    })
    .then(text => { 
      return ((new window.DOMParser().parseFromString(text, 'text/xml')) as unknown) as RssResponse;
    })
    .then((response: RssResponse) => {
      const titles = dfsRecordTitles(response);
      this.setState({
        ...this.state,
        articles: titles,
        headline: titles.length ? titles[0] : '',
      });
    });
  }

  public componentWillUnmount(): void {
    clearInterval(this._timerInterval);
  }
}

export default App;
