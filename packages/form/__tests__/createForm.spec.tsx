/* eslint-disable no-undef, space-before-keywords, react/prop-types, react/no-multi-comp,
react/prefer-stateless-function, react/no-string-refs */

import React from 'react'
import { mount } from 'enzyme'
import createForm from '../src/createForm'
import { observable, toJS } from 'mobx'

describe('onValuesChange', () => {
  it('trigger `onValuesChange` when value change', async () => {
    const onValuesChange = jest.fn() as any
    // @ts-ignore
    const Test = createForm<any>({ onValuesChange })(
      class extends React.Component<any> {
        render() {
          const { getFieldProps } = this.props.form
          return (
            <form>
              <input {...getFieldProps('user.name', { initialValue: 9 })} />
              <input {...getFieldProps('user.age')} type="number" />
              <input {...getFieldProps('agreement')} type="checkbox" />
            </form>
          )
        }
      }
    )

    const data = observable.map()

    const wrapper = mount(<Test dataset={data} />)
    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: 'Benjy' } })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    expect(onValuesChange.mock.calls[0][1]).toMatchObject({ 'user.name': 'Benjy' })
  })

  it('trigger `onValuesChange` when `setFieldsValue`', async () => {
    const onValuesChange = jest.fn()
    const Test = createForm({
      withRef: true,
      // @ts-ignore
      onValuesChange
    })(
      class extends React.Component<any> {
        render() {
          const { getFieldProps } = this.props.form
          return (
            <form>
              <input {...getFieldProps('user.name')} />
              <input {...getFieldProps('user.age')} type="number" />
              <input {...getFieldProps('agreement')} type="checkbox" />
            </form>
          )
        }
      }
    )

    const wrapper = mount(<Test />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    form.setFieldsValue({ 'user.name': 'Benjy' })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    expect(onValuesChange.mock.calls[0][1]).toMatchObject({ 'user.name': 'Benjy' })
  })
})
