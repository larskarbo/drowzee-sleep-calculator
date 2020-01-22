import React from "react";
import logo from "./logo.svg";
import "./App.scss";
import Napchart from "napchart";
import d from "./initialChartData.json";
import moment from "moment";
import ColorScheme from "color-scheme";
import Color from "color";
import "react-input-range/lib/css/index.css"
import InputRange from 'react-input-range';

import Slider, { Range } from "rc-slider";
const colors = [
  "B84D00",
  "CB5310",
  "DF6019",
  "AF922A",
  "A5AF2A",
  "7AA61D",
  "98B71F"
];
class App extends React.Component {
  state = {
    sod: 14,
    cyclelength: 90
  };

  componentDidMount() {
    var canvas = this.c;
    var ctx = canvas.getContext("2d");

    var napchart = Napchart.init(ctx, d, {
      responsive: true,
      ampm: true
    });

    window.napchart = napchart;
    this.chart = napchart;
    this.figma();
    this.now();

    napchart.onUpdate = a => {
      console.log('this.chart.data: ', this.chart.data);
      const el = this.chart.data.elements.find(e=>e.id="sod")
      console.log(el.start)
      this.setState({
        start:  moment().startOf("day").add(el.start, 'minutes'),
        sod: this.chart.helpers.duration(el.start, el.end)
      })
    }
  }

  figma = () => {
    window
      .fetch(
        "https://api.figma.com/v1/files/cxvPb2xw8pVyKpZd3SQnyf?ids=1%3A2",
        {
          headers: new Headers({
            "Content-Type": "application/json",
            "X-FIGMA-TOKEN": "31624-9fef7c3e-7a79-42ae-97fd-491692881230"
          })
        }
      )
      .then(j => j.json())
      .then(a => {
        let colors = [];
        console.log("a: ", a);
        const b = a.document.children[0].children[0];
        console.log("b: ", b.children);
        b.children
          .sort((a, b) => a.name < b.name)
          .forEach(element => {
            console.log("element: ");
            const rgb = {
              r: element.fills[0].color.r * 255,
              g: element.fills[0].color.g * 255,
              b: element.fills[0].color.b * 255
            };
            colors.push(
              Color(rgb)
                .hex()
                .substring(1)
            );
          });
        console.log("colors: ", JSON.stringify(colors));
      });
  };

  now = () => {
    // Your moment
    var mmt = moment().hours(23);
    this.state.start = mmt;
    this.draw();
  };

  draw = () => {
    this.chart.setElements([]);
    // Your moment at midnight
    var mmtMidnight = moment().startOf("day");

    // Difference in minutes
    var bedTime = this.state.start.diff(mmtMidnight, "minutes");
    console.log("bedTime: ", bedTime);

    if (this.state.sod) {
      this.chart.createElement({
        start: this.chart.helpers.limit(bedTime),
        end: this.chart.helpers.limit(bedTime + this.state.sod),
        color: "gray",
        id: "sod",
        text: "(" + this.chart.helpers.minutesToReadable(this.state.sod) + ")"
      });
    }

    const fallAsleepTime = this.state.sod + bedTime;
    console.log('this.state.sod: ', this.state.sod);

    Array(7)
      .fill(0)
      .forEach((a, i) => {
        this.chart.createElement({
          start: this.chart.helpers.limit(fallAsleepTime + this.state.cyclelength * i),
          end: this.chart.helpers.limit(fallAsleepTime + this.state.cyclelength * (i + 1)),
          color: "#" + colors[i],
          text: this.chart.helpers.minutesToReadable(this.state.cyclelength * (i + 1))
        });
      });
  };

  render() {
    return (
      <div className="App">
        <div>
          <div className="div">
          <h2>When do you plan to go to bed?</h2>
          <button onClick={this.now}>Now!</button>
          (drag chart to get other values)
          </div>
          <div className="div">
          <h2>How long time do you spend falling asleep?</h2>
          <InputRange
            minValue={0}
            maxValue={120}
            value={this.state.sod}
            onChange={a => {
              this.setState({
                sod:a*1
              }, ()=> this.draw())

            }}
          />
          </div>
          <div className="div">
          <h2>Length of sleep cycles (normal: 90 minutes)</h2>
          <InputRange
            minValue={70}
            maxValue={110}
            value={this.state.cyclelength}
            onChange={a => {
              this.setState({
                cyclelength:a*1
              }, ()=> this.draw())

            }}
          />
          </div>

          <div className="div">
          <h3>Look at the chart to see when it is smart to wake up</h3>
          </div>
        </div>
        <div>
          <div style={{paddingTop: 25}}><canvas width={800} height={800} ref={c => (this.c = c)}>
            A chart
          </canvas>
          </div>
          
        </div>
      </div>
    );
  }
}

export default App;
