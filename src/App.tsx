import { useRef, useEffect } from 'react'
import type { FC } from 'react'
import moment from 'moment-timezone'
import histories from './assets/data.json'

// @ts-ignore
import getLicenseKey from './key'
import { CIQ } from 'chartiq'
import 'chartiq/css/stx-chart.css'
import 'chartiq/js/standard'
import 'chartiq/js/addOns'
// @ts-ignore
getLicenseKey(CIQ)

const App: FC = () => {
  const box = useRef<HTMLDivElement | null>(null)
  const stx = useRef<any>(null)
  const timer = useRef<any>(null)

  const formatTime = (time: string | number | moment.Moment, format?: string) => {
    if(format){
      return moment(time).tz(`America/New_York`).format(format)
    }
    return moment(time).tz(`America/New_York`).format('YYYY-MM-DD HH:mm:ss')
  }

  useEffect(() => {
    let data: any[] = []

    histories.forEach(item => {
      data.push({
        Date: formatTime(item.timestamp),
        Open: Number.parseFloat(item.open),
        High: Number.parseFloat(item.high),
        Low: Number.parseFloat(item.low),
        Close: Number.parseFloat(item.close),
        Volume: 1,
      })
    })

    const container = document.createElement('div')
    container.style = 'width: 100%; height: 100%;'
    box.current?.appendChild(container)

    const stxx = new CIQ.ChartEngine({
      container: container,
      animations: {},
      axisBorders: false,
      minimumCandleWidth: 5,
      layout: {
        chartType: "mountain",
        animation: true,
        candleWidth: 15,
        crosshair: false
      },
      preferences: {
        currentPriceLine: true,
      },
      chart: {
        height: 500,
        barsHaveWidth: true,
        allowScrollFuture: false,
        dynamicYAxis: true,
        highLowBars: true,
        Background: 'transparent',
        xAxis: {
          futureTicks: false,
          displayBorder: false,
          displayGridLines: false,
          minimumLabelWidth: 60,
          noDrawBorder: true,
        },
        yAxis: {
          displayBorder: false,
          displayGridLines: false,
        },
        baseline: {
          userLevel: false,
        }
      },
      controls: {
        chartControls: false
      }
    })

    CIQ.ChartEngine.YAxis.prototype.decimalPlaces=4;
    stxx.chart.xAxis.displayBorder = false

    new CIQ.Animation({
      stx: stxx,
      easeMachine: new CIQ.EaseMachine("easeInOutQuad", 400),
      animationParameters: {
        tension: 0.3
      }
    })

    stxx.setLineStyle({
      width: 2
    })

    let parameters = {
      masterData: data,
      periodicity: {
        period: 1,
        interval: 5,
        timeUnit: 'millisecond'
      },
    }

    stx.current = stxx
    stxx.loadChart(` `, parameters, () => {
      timer.current = setInterval(() => {
        stxx.updateChartData({
          Last: 105901 + Math.random(),
          Volume: 1,
          DT: new Date(Date.now()).getTime()
        })
      }, 500)
    });

    const settings = {
      chart: {
        Background: {
          color: "transparent"
        },
        "Grid Lines": {
          color: "transparent",
        },
        "Grid Dividers": {
          color: "transparent"
        },
        "Axis Text": {
          color: "#b3bec1"
        }
      },
      chartTypes: {
        "Candle/Bar": {
          up: {
            color: "#2ECC71",
            wick: "#2ECC71",
            border: "#2ECC71",
          },
          down: {
            color: "#FF5449",
            wick: "#FF5449",
            border: "#FF5449",
          },
          even: {
            color: "",
            wick: "",
            border: "",
          }
        },
        Line: {
          color: "",
        },
        Mountain: {
          color: "#DBEC65",
          basecolor: "#DBEC65",
        }
      }
    }
    stxx.setThemeSettings(settings)

    return () => {
      if (stx.current) {
        // destroy chart
        stx.current.container.remove()
        stx.current.clear();
        stx.current.draw = () => {};
        stx.current = null
      }
      if(timer.current){
        clearInterval(timer.current)
      }
    }
  }, [])

  return <>
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <div ref={box} style={{ width: '100vw', height: 500, position: 'relative' }}></div>
    </div>
  </>
}

export default App
