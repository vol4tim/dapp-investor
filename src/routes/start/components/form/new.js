import React from 'react'
import { Link } from 'react-router-dom'

const redirect = (history) => {
  setTimeout(() => {
    history.push('/congress')
  }, 3000)
}

const Form = (props) => {
  if (props.form.success) {
    redirect(props.history);
  }
  return <form onSubmit={props.handleSubmit} className="text-left">
    <div className={(props.fields.quorum.error) ? 'form-group has-error' : 'form-group'}>
      <label>minimumQuorumForProposals</label>
      <input value={props.fields.quorum.value} onChange={props.handleChange} name="quorum" type="text" className="form-control" />
      {props.fields.quorum.error &&
        <span className="help-block">{props.fields.quorum.error}</span>
      }
    </div>
    <div className={(props.fields.minutes.error) ? 'form-group has-error' : 'form-group'}>
      <label>minutesForDebate</label>
      <input value={props.fields.minutes.value} onChange={props.handleChange} name="minutes" type="text" className="form-control" />
      {props.fields.minutes.error &&
        <span className="help-block">{props.fields.minutes.error}</span>
      }
    </div>
    <div className={(props.fields.majority.error) ? 'form-group has-error' : 'form-group'}>
      <label>marginOfVotesForMajority</label>
      <input value={props.fields.majority.value} onChange={props.handleChange} name="majority" type="text" className="form-control" />
      {props.fields.majority.error &&
        <span className="help-block">{props.fields.majority.error}</span>
      }
    </div>
    <div className={(props.fields.leader.error) ? 'form-group has-error' : 'form-group'}>
      <label>congressLeader</label>
      <input value={props.fields.leader.value} onChange={props.handleChange} name="leader" type="text" className="form-control" />
      {props.fields.leader.error &&
        <span className="help-block">{props.fields.leader.error}</span>
      }
    </div>
    <div className="text-center">
      <button type="submit" className="btn btn-primary" disabled={props.form.submitting}>Create</button>
    </div>
    {props.form.success &&
      <div>
        <div className="alert alert-success">{props.form.success}</div>
        <div className="text-center">
          <Link to="/">Open congress</Link>
        </div>
      </div>
    }
  </form>
}

export default Form
