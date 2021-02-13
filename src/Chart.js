import { transactionsPerPeriod } from './utils.ts'
import * as V from 'victory'

/** calculates ticks to render on the x-axis, we just want to display
 * an evenly spaced set of time ticks no matter the size of the dataset
 * to prevent overcrowding.
 * a segment is the line between two ticks
 * https://math.stackexchange.com/questions/563566/how-do-i-find-the-middle1-2-1-3-1-4-etc-of-a-line
 * */
function calculateTicksForChart(transactions, segmentsCount = 4) {
  const min = transactions[0].timestamp;
  const max = transactions[transactions.length-1].timestamp;

  if (segmentsCount < 2) {
    throw new Error('n should be an Int superior or equal to 2')
  }

  // delta is a segment
  let delta = (max-min)/segmentsCount

  // find each ticks between the two values
  let ticks = new Array(segmentsCount-1).fill().map((v, idx) => {
    return min + (delta*(idx+1))
  })

  return [min, ...ticks, max].map(t => new Date(t))
}

// Fix ts issue with style requirement
function Chart({ transactions, style }) {
  if (!transactions.length) {
    return <p>Waiting for data to draw chart</p>
  }

  const transactionsByDay = transactionsPerPeriod(transactions, 'day')
  const transactionsByDayArray = Object.values(transactionsByDay)
  const tickValues = calculateTicksForChart(transactionsByDayArray)

  return (
    <V.VictoryChart padding={{top: 10, left: 30, bottom: 30, right: 10}} theme={V.VictoryTheme.material}>
      <V.VictoryAxis
        padding={0}
        tickValues={tickValues}
        tickFormat={d => {
          return d.toLocaleDateString("en-GB", {
            year: "2-digit",
            month: "2-digit",
          })
        }}

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
        data={transactionsByDayArray}
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
        x="timestamp"
        y="total"
      />
    </V.VictoryChart>
  )
}

export default Chart
