import React from 'react'
import { mount } from 'enzyme'
import createDOMForm from '../src/createDOMForm'

// https://github.com/ant-design/ant-design/issues/13689
describe('reset form validate when rule changed', () => {
  class Test extends React.Component<any> {
    state = { type: false }

    render() {
      const { form } = this.props
      const { getFieldDecorator } = form
      //const type = form.getFieldValue('type')
      const { type } = this.state

      return (
        <div>
          {getFieldDecorator('type', {
            onChange: (value: any) => {
              this.setState({ type: value })
            }
          })(<input className="type" />)}
          {getFieldDecorator('val1', {
            rules: [{ required: !!type }]
          })(<input className="val1" />)}
          {getFieldDecorator('val2', {
            rules: [{ required: !type }]
          })(<input className="val1" />)}
          <button />
        </div>
      )
    }
  }

  const FormDemo = createDOMForm({ withRef: true })(Test)

  // Do the test
  it('should update errors', async () => {
    const wrapper = mount(<FormDemo />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form

    // type => test
    wrapper.find('.type').simulate('change', { target: { value: 'test' } })
    const err = await form.validateFields().catch((e: any) => e)
    expect(Object.keys(err)).toEqual(['val1'])

    // type => ''
    wrapper.find('.type').simulate('change', { target: { value: '' } })

    const err2 = await form.validateFields().catch((e: any) => e)
    expect(Object.keys(err2)).toEqual(['val2'])
  })
})
