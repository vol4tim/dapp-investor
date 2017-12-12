import React from 'react'

const Table = props => (
  <table className="table table-bordered">
    <thead>
      <tr>
        <th>Наименование</th>
        <th>Cпрос</th>
        <th>Комиссия рынка</th>
        <th>Доход рынка</th>
      </tr>
    </thead>
    <tbody>
      {props.data.map((row, index) => (
        <tr key={index}>
          <th>{row.name}</th>
          <td>{row.ask}</td>
          <td>{row.fee}</td>
          <td>{row.income}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export default Table
