import React from 'react'
import { mount } from 'enzyme'
// @ts-ignore
import scrollIntoView from 'dom-scroll-into-view'
import createDOMForm from '../src/createDOMForm'
import { FormType } from '../src'

jest.mock('dom-scroll-into-view', () => jest.fn())

const Test = createDOMForm({ withRef: true })(
  class extends React.Component<any> {
    render() {
      const { form, name } = this.props
      const { getFieldDecorator } = form
      return (
        <div>
          {getFieldDecorator(name, {
            rules: [
              {
                required: true
              }
            ]
          })(<textarea style={{ overflowY: 'auto' }} />)}
        </div>
      )
    }
  }
)

describe('validateFieldsAndScroll', () => {
  let div: any

  beforeEach(() => {
    scrollIntoView.mockClear()
    div = document.createElement('div')
  })

  it('works on overflowY auto element', (done) => {
    const wrapper = mount(<Test name="normal" />, { attachTo: div })
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form as FormType
    form.validateFieldsAndScroll(() => {
      expect(scrollIntoView.mock.calls[0][1].tagName).not.toBe('TEXTAREA')
      wrapper.detach()
      done()
    })
  })

  it('works with nested fields', (done) => {
    const wrapper = mount(<Test name="a.b.c" />, { attachTo: div })
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form
    form.validateFieldsAndScroll(() => {
      expect(scrollIntoView).toHaveBeenCalled()
      wrapper.detach()
      done()
    })
  })
})
