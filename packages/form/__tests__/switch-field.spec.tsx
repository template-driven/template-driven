import React from 'react'
import { mount } from 'enzyme'
import createDOMForm from '../src/createDOMForm'

jest.mock('dom-scroll-into-view', () => jest.fn())

// https://github.com/ant-design/ant-design/issues/12560
describe('switch field should not lost field', () => {
  // assume we have fields: [a, b, c] when switch a with b
  // mark at node a: a as toRemove, b as toAdd
  // mark at node b: b as toRemove, a as toAdd
  // if do change instantly, result will be
  // [a, b, c] -> [b, c] -> [a, c], it's a wrong result
  // but collect them and do this after, result will be
  // [a, b, c] -> (remove a,b) [c] -> (add a,b) [a,b, c]

  // Prepare

  class Test extends React.Component<any> {
    state = {
      list: ['a', 'b', 'c']
    }
    switch = () => {
      this.setState({
        list: ['b', 'a', 'c']
      })
    }
    render() {
      const { getFieldDecorator } = this.props.form
      const [one, two, three] = this.state.list
      // do not use map
      // react will detect it by key and knowing there was a change on order.
      // we need to test [custom reparenting], so use hard written three element.
      return (
        <div>
          {getFieldDecorator(one)(<input className="one" />)}
          {getFieldDecorator(two)(<input className="two" />)}
          {getFieldDecorator(three)(<input className="three" />)}
          <button className="sw" onClick={this.switch}>
            Switch a with b
          </button>
        </div>
      )
    }
  }

  const FormDEMO = createDOMForm({ withRef: true })(Test)

  // Do the test
  it('Preserve right fields when switch them', () => {
    const wrapper = mount(<FormDEMO />)
    // @ts-ignore
    const form = wrapper.ref('wrappedComponent').props.form

    wrapper.find('.one').simulate('change', { target: { value: 'value1' } })

    expect(Object.keys(form.getFieldsValue())).toEqual(expect.arrayContaining(['a', 'b', 'c']))
    expect(form.getFieldValue('a')).toBe('value1')

    wrapper.find('.sw').simulate('click')

    expect(Object.keys(form.getFieldsValue())).toEqual(expect.arrayContaining(['a', 'b', 'c']))
    expect(form.getFieldValue('a')).toBe('value1')
  })
})
