import React from 'react'
import ReactDOM from 'react-dom'
import createForm from '../src/createForm'

class MyInput extends React.Component<any> {
  onChange = ({ target: { value } }: any) => {
    const { onChange } = this.props
    onChange(value.split(','))
  }
  render() {
    const { value = [] } = this.props
    return <input {...this.props} onChange={this.onChange} value={value.join(',')} />
  }
}

class Test extends React.Component<any> {
  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <div>
        {getFieldDecorator('url_array', {
          initialValue: ['test'],
          rules: [{ required: true, message: 'The tags must be urls', type: 'array', defaultField: { type: 'url' } }]
        })(<MyInput />)}
      </div>
    )
  }
}

const FormDEMO = createForm({ withRef: true })(Test)

describe('validate array type', () => {
  let container: any
  let component: any
  let form: any

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    component = ReactDOM.render(<FormDEMO />, container)
    component = component.refs.wrappedComponent
    form = component.props.form
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container)
    document.body.removeChild(container)
  })

  it('forceValidate works', async () => {
    const errors = await form.validateFields().catch((e: any) => e)
    console.log(errors)

    expect(errors).toBeTruthy()
    expect(errors).toEqual({ url_array: [['url_array.0 is not a valid url']] })
  })
})
