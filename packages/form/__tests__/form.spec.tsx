/* eslint-disable no-undef, react/prop-types, react/no-multi-comp,
react/prefer-stateless-function */

import React from 'react'
import { mount } from 'enzyme'
import createForm from '../src/createForm'

describe('setFieldsValue', () => {
  // https://github.com/ant-design/ant-design/issues/8386
  it('should work even set with undefined name', () => {
    const Test = createForm({ withRef: true })(
      class extends React.Component<any> {
        componentDidMount() {
          this.props.form.setFieldsValue({
            normal: '2',
            inexist: 'oh'
          })
        }

        render() {
          const { getFieldProps } = this.props.form
          return <input {...getFieldProps('normal', { initialValue: '1' })} />
        }
      }
    )
    const wrapper = mount(<Test />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    expect(form.getFieldValue('normal')).toBe('2')
  })
})

describe('resetFields', () => {
  it('can reset hidden fields', () => {
    const Test = createForm({ withRef: true })(
      class extends React.Component<any> {
        render() {
          const { getFieldProps } = this.props.form
          return (
            <input
              {...getFieldProps('normal', {
                hidden: true,
                initialValue: ''
              })}
            />
          )
        }
      }
    )
    const wrapper = mount(<Test />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    form.setFieldsValue({ normal: 'Hello world!' })
    expect(form.getFieldsValue(['normal'])).toEqual({ normal: 'Hello world!' })
    form.resetFields()
    expect(form.getFieldsValue(['normal'])).toEqual({ normal: '' })
  })
})
