import React from "react";
import logo from "./logo.svg";
import "./App.scss";
import Napchart from "napchart";
import moment from "moment";
import ColorScheme from "color-scheme";
import Color from "color";
import "react-input-range/lib/css/index.css";
import InputRange from "react-input-range";
import { Container, Row, Col } from "reactstrap";
import { TimePicker, Button as AntButton } from "antd";
import Slider, { Range } from "rc-slider";
import { Button, ButtonGroup } from "@material-ui/core";
import "antd/dist/antd.css";
import { tween } from "shifty";

function momentToMinutes(mm) {
  var mmtMidnight = moment().startOf("day");

  // Difference in minutes
  return mm.diff(mmtMidnight, "minutes");
}
const baseColor = Color("#467F9F");
const colors = Array(7)
  .fill(0)
  .map((v, i) =>
    baseColor
      .darken(0.05 * i)
      .hex()
      .substring(1)
  );
console.log("colors: ", colors);
class App extends React.Component {
  state = {
    sod: 14,
    cyclelength: 90,
    start: moment()
      .hours(7)
      .minutes(30),
    open: false,
    mode: "wake",
    calced: false,
    times: []
  };

  componentDidMount() {
    var canvas = this.c;
    var ctx = canvas.getContext("2d");

    var napchart = Napchart.init(
      ctx,
      {
        flags: [{ minutes: momentToMinutes(this.state.start), flagText: "⏰" }],
        elements: [],
        colorTags: [],
        shape: "circle",
        lanes: 1,
        lanesConfig: { 0: { locked: true } },
        id: "nuosr",
        metaInfo: { title: "", description: "" }
      },
      {
        responsive: true,
        ampm: false,
        penMode: false
      }
    );

    window.napchart = napchart;
    this.chart = napchart;
    // this.drawWake();

    napchart.onUpdate = a => {
      // const el = this.chart.data.elements.find(e => (e.id == 0));
      if (!this.chart.data.elements.length) {
        return;
      }
      let el = this.chart.data.elements[0];
      // if(this.state.mode=="sleep"){
      //   el = this.chart.data.elements.find(e => e.id == "id:0");
      // }
      var mmt = moment()
        .startOf("day")
        .add(this.state.mode == "wake" ? el.end : el.start, "minutes");
      this.wakeTime = momentToMinutes(mmt);
      this.setState({
        start: mmt
        // sod: this.chart.helpers.duration(el.start, el.end)
      });
      console.log("yes");
    };

    napchart.onUp = () => {
      this.rotateRight();
    };

    napchart.updateDimensions();
  }

  now = () => {
    // Your moment
    // var mmt = moment();
    // this.state.start = mmt;
    // // this.draw();
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
    console.log("this.state.sod: ", this.state.sod);

    Array(7)
      .fill(0)
      .forEach((a, i) => {
        this.chart.createElement({
          start: this.chart.helpers.limit(
            fallAsleepTime + this.state.cyclelength * i
          ),
          end: this.chart.helpers.limit(
            fallAsleepTime + this.state.cyclelength * (i + 1)
          ),
          // id: ":)" +i,
          color: "#" + colors[i],
          text: this.chart.helpers.minutesToReadable(
            this.state.cyclelength * (i + 1)
          )
        });
      });
  };

  drawSleep = () => {
    this.chart.setElements([]);
    // Your moment at midnight

    var wakeTime = momentToMinutes(this.state.start);

    this.wakeTime = wakeTime;
    Array(6)
      .fill(0)
      .forEach((a, i) => {
        this.chart.createElement({
          start: this.chart.helpers.limit(
            wakeTime + this.state.cyclelength * i
          ),
          end: this.chart.helpers.limit(
            wakeTime + this.state.cyclelength * (i + 1)
          ),
          color: "#" + colors[i],
          id: "id:" + i,
          text: this.chart.helpers.minutesToReadable(
            this.state.cyclelength * (i + 1)
          )
        });
      });

    this.setState({
      calced: true
    });
  };

  drawWake = () => {
    this.chart.setElements([]);
    // Your moment at midnight

    var wakeTime = momentToMinutes(this.state.start);

    this.wakeTime = wakeTime;
    Array(6)
      .fill(0)
      .forEach((a, i) => {
        this.chart.createElement({
          start: this.chart.helpers.limit(
            wakeTime - this.state.cyclelength * (i + 1)
          ),
          end: this.chart.helpers.limit(wakeTime - this.state.cyclelength * i),
          color: "#" + colors[i],
          id: "id:" + i,
          text: this.chart.helpers.minutesToReadable(
            this.state.cyclelength * (i + 1)
          )
        });
      });

    this.setState({
      calced: true
    });
  };

  animyeah = () => {
    for (let i = 0; i < 6; i++) {
      tween({
        from: { p: 0 },
        to: { p: 1 },
        delay: i * 100,
        duration: 800,
        easing: "easeOutQuad",
        step: state => {
          this.chart.setAnimProgress("id:" + i, state.p);
          this.chart.draw();
        }
      }).then(() => console.log("All done!"));
    }

    setTimeout(() => {
      this.rotateRight();
    }, 1000);
  };

  rotateRight = () => {
    if (this.state.mode == "wake") {
      this.chart.animShapeLars({
        ...this.chart.allShapes.circle,
        shift: this.chart.helpers.middlePoint(
          momentToMinutes(this.state.start) - 6 * 90,
          momentToMinutes(this.state.start)
        )
      });
    } else {
      this.chart.animShapeLars({
        ...this.chart.allShapes.circle,
        shift: this.chart.helpers.middlePoint(
          momentToMinutes(this.state.start),
          momentToMinutes(this.state.start) + 6 * 90
        )
      });
    }
  };

  handleOpenChange = open => {
    this.setState({ open });
  };

  handleClose = () => this.setState({ open: false });
  reset = () => {
    this.chart.setElements([]);
    this.chart.animShapeLars({
      ...this.chart.allShapes.circle,
      shift: 0
    });
  };
  render() {
    let times = [];
    let wake = "";
    let asleep = "";
    if (this.state.calced) {
      if (this.state.mode == "wake") {
        times = [
          this.wakeTime - this.state.cyclelength * 6,
          this.wakeTime - this.state.cyclelength * 5,
          this.wakeTime - this.state.cyclelength * 4
        ]
          .map(this.chart.helpers.limit)
          .map(v => this.chart.helpers.minutesToClock(this.chart, v));
        wake = this.chart.helpers.minutesToClock(this.chart, this.wakeTime);
      } else {
        times = [
          this.wakeTime + this.state.cyclelength * 4,
          this.wakeTime + this.state.cyclelength * 5,
          this.wakeTime + this.state.cyclelength * 6
        ]
          .map(this.chart.helpers.limit)
          .map(v => this.chart.helpers.minutesToClock(this.chart, v));
        asleep = this.chart.helpers.minutesToClock(this.chart, this.wakeTime);
      }
    }
    const activeButton = {
      background: "#467F9F",
      color: "white",
      fontWeight: "bold"
    };
    return (
      <div
        className="App"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <ButtonGroup
            color="primary"
            aria-label="outlined primary button group"
          >
            <Button
              style={this.state.mode == "wake" ? activeButton : {}}
              onClick={() => {
                this.setState({
                  start: moment()
                    .hours(7)
                    .minutes(30),
                  calced: false,
                  mode: "wake"
                }, () => {
                  this.chart.setFlag(
                    momentToMinutes(this.state.start),
                    this.state.mode
                  );
                });
                this.reset();
                
              }}
            >
              I want to wake up at
            </Button>
            <Button
              onClick={() => {
                this.setState({ mode: "sleep" });
                this.setState(
                  {
                    start: moment()
                      .hours(22)
                      .minutes(30),
                    calced: false
                  },
                  () => {
                    this.chart.setFlag(
                      momentToMinutes(this.state.start),
                      this.state.mode
                    );
                  }
                );
                this.reset();
              }}
              style={this.state.mode == "sleep" ? activeButton : {}}
            >
              <div>I want to fall asleep at</div>
            </Button>
          </ButtonGroup>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20
          }}
        >
          <span
            style={{
              paddingRight: 6
            }}
          >
            {this.state.mode == "wake" ? "⏰ → " : "🛌 → "}
          </span>{" "}
          <TimePicker
            minuteStep={15}
            format={"HH:mm"}
            value={this.state.start}
            onChange={v => {
              console.log(v);
              this.setState({ start: v }, () => {
                if (this.state.calced) {
                  this.drawWake();
                  setTimeout(() => {
                    this.rotateRight();
                  }, 400);
                }
                this.chart.setFlag(
                  momentToMinutes(this.state.start),
                  this.state.mode
                );
              });
            }}
            open={this.state.open}
            onOpenChange={this.handleOpenChange}
            addon={() => (
              <AntButton size="small" type="primary" onClick={this.handleClose}>
                Ok
              </AntButton>
            )}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
            // padding: 20
          }}
        >
          <AntButton
            // style={}
            type="default"
            onClick={() => {
              if (this.state.mode == "wake") {
                this.drawWake();
              } else {
                this.drawSleep();
              }
              this.animyeah();
            }}
          >
            {this.state.mode == "wake"
              ? "When should I fall asleep? 🛌"
              : "When should I wake up? ⏰"}
          </AntButton>
        </div>
        <div style={{ paddingTop: 25 }}>
          <canvas ref={c => (this.c = c)}>A chart</canvas>

          {times.length ? (
            this.state.mode == "wake" ? (
              <div>
                <div
                  className="res"
                  style={{
                    top: -this.chart.canvas.offsetHeight * 0.55,
                    marginBottom: -this.chart.canvas.offsetHeight * 0.55,
                    minHeight: this.chart.canvas.offsetHeight * 0.55
                  }}
                >
                  If you wake up at{" "}
                  <span
                    style={{
                      backgroundColor: "#" + colors[0]
                    }}
                  >
                    {wake}
                  </span>
                  ,
                  <div>
                    You should aim to fall asleep at{" "}
                    <span
                      style={{
                        backgroundColor: "#" + colors[2]
                      }}
                    >
                      {times[0]}
                    </span>
                    ,{" "}
                    <span
                      style={{
                        backgroundColor: "#" + colors[4]
                      }}
                    >
                      {times[1]}
                    </span>{" "}
                    or{" "}
                    <span
                      style={{
                        backgroundColor: "#" + colors[6]
                      }}
                    >
                      {times[2]}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="res"
                  style={{
                    top: -this.chart.canvas.offsetHeight * 0.55,
                    marginBottom: -this.chart.canvas.offsetHeight * 0.55,
                    minHeight: this.chart.canvas.offsetHeight * 0.55
                  }}
                >
                  If you fall asleep at{" "}
                  <span
                    style={{
                      backgroundColor: "#" + colors[0]
                    }}
                  >
                    {asleep}
                  </span>
                  ,
                  <div>
                    You should aim to wake up at{" "}
                    <span
                      style={{
                        backgroundColor: "#" + colors[2]
                      }}
                    >
                      {times[0]}
                    </span>
                    ,{" "}
                    <span
                      style={{
                        backgroundColor: "#" + colors[4]
                      }}
                    >
                      {times[1]}
                    </span>{" "}
                    or{" "}
                    <span
                      style={{
                        backgroundColor: "#" + colors[6]
                      }}
                    >
                      {times[2]}
                    </span>
                  </div>
                </div>
              </div>
            )
          ) : null}
        </div>

        {/* <div>
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
                this.setState(
                  {
                    sod: a * 1
                  },
                  () => this.draw()
                );
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
                this.setState(
                  {
                    cyclelength: a * 1
                  },
                  () => this.draw()
                );
              }}
            />
          </div>

          <div className="div">
            <h3>Look at the chart to see when it is smart to wake up</h3>
          </div>
        </div> */}
      </div>
    );
  }
}

export default App;
