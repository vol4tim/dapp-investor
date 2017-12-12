import React from 'react'

const Form = props => (
  <form onSubmit={props.handleSubmit}>
    <div className={(props.fields.address.error) ? 'form-group has-error' : 'form-group'}>
      <input value={props.fields.address.value} onChange={props.handleChange} name="address" type="text" className="form-control" />
      {props.fields.address.error &&
        <span className="help-block">{props.fields.address.error}</span>
      }
    </div>
    <button type="submit" className="btn btn-primary" disabled={props.form.submitting}>Save</button>
  </form>
)

export default Form
