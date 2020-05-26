import React from 'react'
import { mount } from 'enzyme'
import createForm from '../src/createDOMForm'

describe('binding dynamic fields without any errors', () => {
  it('normal input', async () => {
    const Test = createForm({ withRef: true })(
      class extends React.Component<any> {
        render() {
          const { form, mode } = this.props
          const { getFieldDecorator } = form
          return (
            <form>
              <span>text content</span>
              {mode ? getFieldDecorator('name')(<input id="text" />) : null}
              <span>text content</span>
              <span>text content</span>
              <span>text content</span>
              {mode ? null : getFieldDecorator('name')(<input id="number" type="number" />)}
              <span>text content</span>
            </form>
          )
        }
      }
    )

    const wrapper = mount(<Test mode />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    wrapper.find('#text').simulate('change', { target: { value: '123' } })
    wrapper.setProps({ mode: false })
    expect(form.getFieldValue('name')).toBe('123')
    wrapper.find('#number').simulate('change', { target: { value: '456' } })
    wrapper.setProps({ mode: true })
    expect(form.getFieldValue('name')).toBe('456')

    const values = form.getFieldsValue()
    expect(values.name).toBe('456')
  })

  it('hidden input', async () => {
    const Test = createForm({
      withRef: true
    })(
      class extends React.Component<any> {
        render() {
          const { form, mode } = this.props
          const { getFieldDecorator } = form
          return (
            <form>
              <span>text content</span>
              {mode ? getFieldDecorator('input1')(<input id="text1" />) : null}
              <span>text content</span>
              <span>text content</span>
              <span>text content</span>
              {mode ? getFieldDecorator('input2')(<input id="text2" />) : null}
              <span>text content</span>
            </form>
          )
        }
      }
    )
    const wrapper = mount(<Test mode />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    wrapper.find('#text1').simulate('change', { target: { value: '123' } })
    wrapper.find('#text2').simulate('change', { target: { value: '456' } })
    expect(form.getFieldValue('input1')).toBe('123')
    expect(form.getFieldValue('input2')).toBe('456')
    wrapper.setProps({ mode: false })
    expect(form.getFieldValue('input1')).toBe(undefined)
    expect(form.getFieldValue('input2')).toBe(undefined)
    wrapper.setProps({ mode: true })
    expect(form.getFieldValue('input1')).toBe('123')
    expect(form.getFieldValue('input2')).toBe('456')
    wrapper.find('#text1').simulate('change', { target: { value: '789' } })
    expect(form.getFieldValue('input1')).toBe('789')
    expect(form.getFieldValue('input2')).toBe('456')
    const values = form.getFieldsValue()

    expect(values.input1).toBe('789')
    expect(values.input2).toBe('456')
  })

  it('nested fields', async () => {
    const Test = createForm({
      withRef: true
    })(
      class extends React.Component<any> {
        render() {
          const { form, mode } = this.props
          const { getFieldDecorator } = form
          return (
            <form>
              {mode ? getFieldDecorator('name.xxx')(<input id="text" />) : null}
              <span>text content</span>
              {mode ? null : getFieldDecorator('name.xxx')(<input id="number" type="number" />)}
            </form>
          )
        }
      }
    )
    const wrapper = mount(<Test mode />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    wrapper.find('#text').simulate('change', { target: { value: '123' } })
    wrapper.setProps({ mode: false })
    expect(form.getFieldValue('name.xxx')).toBe('123')
    wrapper.find('#number').simulate('change', { target: { value: '456' } })
    wrapper.setProps({ mode: true })
    expect(form.getFieldValue('name.xxx')).toBe('456')

    const values = form.getFieldsValue()
    expect(values.name.xxx).toBe('456')
  })

  it('input with different keys', async () => {
    const Test = createForm({
      withRef: true
    })(
      class extends React.Component<any> {
        render() {
          const { form, mode } = this.props
          const { getFieldDecorator } = form
          return (
            <form>
              {mode ? getFieldDecorator('name')(<input key="text" id="text" />) : null}
              {mode ? null : getFieldDecorator('name')(<input key="number" id="number" type="number" />)}
            </form>
          )
        }
      }
    )
    const wrapper = mount(<Test mode />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    wrapper.find('#text').simulate('change', { target: { value: '123' } })
    wrapper.setProps({ mode: false })
    expect(form.getFieldValue('name')).toBe('123')
    wrapper.find('#number').simulate('change', { target: { value: '456' } })
    wrapper.setProps({ mode: true })
    expect(form.getFieldValue('name')).toBe('456')
    const values = form.getFieldsValue()
    expect(values.name).toBe('456')
  })

  it('submit without removed fields', async () => {
    const Test = createForm({
      withRef: true
    })(
      class extends React.Component<any> {
        render() {
          const { form, mode } = this.props
          const { getFieldDecorator } = form
          return (
            <form>
              {getFieldDecorator('name1')(<input />)}
              {getFieldDecorator('name2')(<input />)}
              {mode ? null : getFieldDecorator('name3')(<input />)}
              {mode ? null : getFieldDecorator('name4')(<input />)}
            </form>
          )
        }
      }
    )
    const wrapper = mount(<Test />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    const values = form.getFieldsValue()

    expect('name1' in values).toBe(true)
    expect('name2' in values).toBe(true)
    expect('name3' in values).toBe(true)
    expect('name4' in values).toBe(true)

    wrapper.setProps({ mode: true })
    const values2 = form.getFieldsValue()

    expect('name1' in values2).toBe(true)
    expect('name2' in values2).toBe(true)
    expect('name3' in values2).toBe(false)
    expect('name4' in values2).toBe(false)
  })

  it('reset fields', async () => {
    const Test = createForm({
      withRef: true
    })(
      class extends React.Component<any> {
        render() {
          const { form, mode } = this.props
          const { getFieldDecorator } = form
          return (
            <form>
              <span>text content</span>
              {mode ? getFieldDecorator('input1')(<input id="text1" />) : null}
              <span>text content</span>
              <span>text content</span>
              <span>text content</span>
              {mode ? getFieldDecorator('input2')(<input id="text2" />) : null}
              <span>text content</span>
            </form>
          )
        }
      }
    )
    const wrapper = mount(<Test mode />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    wrapper.find('#text1').simulate('change', { target: { value: '123' } })
    wrapper.find('#text2').simulate('change', { target: { value: '456' } })
    expect(form.getFieldValue('input1')).toBe('123')
    expect(form.getFieldValue('input2')).toBe('456')
    wrapper.setProps({ mode: false })
    expect(form.getFieldValue('input1')).toBe(undefined)
    expect(form.getFieldValue('input2')).toBe(undefined)
    form.resetFields()
    wrapper.setProps({ mode: true })
    expect(form.getFieldValue('input1')).toBe('123')
    expect(form.getFieldValue('input2')).toBe('456')
    wrapper.find('#text1').simulate('change', { target: { value: '789' } })
    expect(form.getFieldValue('input1')).toBe('789')
    expect(form.getFieldValue('input2')).toBe('456')
    wrapper.find('#text2').simulate('change', { target: { value: '456' } })
    expect(form.getFieldValue('input2')).toBe('456')

    const values = form.getFieldsValue()
    expect(values.input1).toBe('789')
    expect(values.input2).toBe('456')
  })
})
