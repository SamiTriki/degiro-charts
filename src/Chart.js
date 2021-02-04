import { formatDatesForChart } from './utils'
import * as V from 'victory'

function Chart({ transactions}) {

  if (!transactions.length) {
    return <p>Waiting for data to draw chart</p>
  }

  const transactionsByDay = formatDatesForChart(transactions)

  // inneficient change later
  let formattedata = Object.keys(transactionsByDay)
    .reduce((dates, current, idx) => {
      if (transactionsByDay[current].change) { // only show change in portfolio value, update with show nil transactions
        return [...dates, {
          cumul: transactionsByDay[current].total,
          change: transactionsByDay[current].change,
          date: new Date(current).getTime()
        }]
      }
      return dates
    }, [])


  return (
    <V.VictoryChart padding={{top: 10, left: 30, bottom: 30}} theme={V.VictoryTheme.material}>
      <V.VictoryAxis
        padding={0}
        tickValues={formattedata.filter(d => d.change >= 10).map(d => new Date(d.date))}
        tickFormat={formattedata.filter(d => d.change >= 10).map(day => {
          let d = new Date(day.date);
          let formattedDate = `${d.getMonth()+1}/${d.getFullYear().toString().substring(2, 4)}`;
          return formattedDate
        })}

        style={{
          grid: {stroke: 0},
          tickLabels: {
            fontSize: 5,
          }
        }}
      />
      <V.VictoryAxis label="Cash" dependentAxis tickFormat={(x) => `£${x / 1000}k`} style={{
        axisLabel: { fontSize: 5, padding: 30},
        tickLabels: { fontSize: 5}
      }}/>
      <V.VictoryLine
        data={formattedata}
        style={{
          data: {
            stroke: "#009fdf",
            strokeWidth: 0.6,
          },
          parent: { border: "1px solid #ccc" },
          labels: {
            fontSize: 10
          }
        }}
        x="date"
        y="cumul"
      />
    </V.VictoryChart>
  )
}

export default Chart
