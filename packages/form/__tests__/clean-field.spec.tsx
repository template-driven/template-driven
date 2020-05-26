import React, { ElementRef } from 'react'
import ReactDOM from 'react-dom'
import { mount } from 'enzyme'
import createDOMForm from '../src/createDOMForm'
import type { FormType } from '../src'

jest.mock('dom-scroll-into-view', () => jest.fn())

describe('clean field', () => {
  let div: any

  beforeEach(() => {
    div = document.createElement('div')
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div)
  })

  // https://github.com/ant-design/ant-design/issues/12560
  describe('clean field if did update removed', () => {
    // Prepare
    const Popup = ({ visible, children }: any) => {
      if (!visible) return null
      return <div>{children}</div>
    }

    class Demo extends React.Component<any, any> {
      render() {
        const { init, show } = this.props
        const { getFieldDecorator } = this.props.form

        let name
        let age

        if (init) {
          name = (
            <div>
              name:
              {getFieldDecorator('name', {
                rules: [{ required: true }]
              })(<input />)}
            </div>
          )
        } else {
          age = (
            <div>
              age:
              {getFieldDecorator('age', {
                rules: [{ required: true }]
              })(<input />)}
            </div>
          )
        }

        return (
          <Popup visible={show}>
            {name}
            {age}
          </Popup>
        )
      }
    }

    const FormDemo = createDOMForm({
      withRef: true
    })(Demo)

    class Test extends React.Component<any, any> {
      state = {
        show: false,
        init: false
      }

      onClick = () => {
        this.setState({ show: true })
        this.setState({ init: true })
      }

      demo: any

      setRef = (demo: ElementRef<any>) => {
        this.demo = demo
      }

      render() {
        const { show, init } = this.state
        return (
          <div>
            <FormDemo ref={this.setRef} show={show} init={init} />
            <button className="my-btn" onClick={this.onClick}>
              Show
            </button>
          </div>
        )
      }
    }

    // Do the test
    it('Remove when mount', () => {
      const wrapper = mount(<Test />, { attachTo: div })
      const form = (wrapper.find('Demo').props().form as unknown) as FormType
      form.validateFields((error) => {
        expect(Object.keys(error as any)).toEqual(['age'])
      })

      wrapper.find('.my-btn').simulate('click')

      form.validateFields((error) => {
        expect(Object.keys(error as any)).toEqual(['name'])
      })
    })
  })

  // https://github.com/react-component/form/issues/205
  describe('Do not clean if field dom exist', () => {
    class Demo extends React.Component<any, any> {
      state = {
        visible: true
      }
      tmp: any
      componentWillMount() {
        this.tmp = this.props.form.getFieldDecorator('age', {
          rules: [{ required: true }]
        })
      }

      render() {
        const { visible } = this.state
        return <div>{visible && this.tmp(<input />)}</div>
      }
    }

    const FormDemo = createDOMForm({
      withRef: true
    })(Demo)

    // Do the test
    it('Remove when mount', () => {
      const wrapper = mount(<FormDemo />, { attachTo: div })
      const form = (wrapper.find('Demo').props().form as unknown) as FormType

      // Init
      form.validateFields((error) => {
        expect(Object.keys(error as any)).toEqual(['age'])
      })

      // Refresh
      wrapper.update()
      form.validateFields((error) => {
        expect(Object.keys(error as any)).toEqual(['age'])
      })

      // Hide
      wrapper.find('Demo').setState({ visible: false })
      form.validateFields((error) => {
        expect(Object.keys(error || {})).toEqual([])
      })
    })
  })

  describe("Don't clean field when has '{ preserve: ture }'", () => {
    // Prepare
    const Popup = ({ visible, children }: any) => {
      if (!visible) return null
      return <div>{children}</div>
    }

    class Demo extends React.Component<any, any> {
      render() {
        const { init, show } = this.props
        const { getFieldDecorator } = this.props.form

        let name
        let age

        if (init) {
          name = (
            <div>
              name:
              {getFieldDecorator('name', {
                rules: [{ required: true }]
              })(<input />)}
            </div>
          )
        } else {
          age = (
            <div>
              age:
              {getFieldDecorator('age', {
                rules: [{ required: true }]
              })(<input />)}
            </div>
          )
        }

        return (
          <Popup visible={show}>
            {name}
            {age}
          </Popup>
        )
      }
    }

    const FormDemo = createDOMForm({
      withRef: true
    })(Demo)

    class Test extends React.Component<any, any> {
      state = {
        show: false,
        init: false
      }

      onClick = () => {
        this.setState({ show: true })
        this.setState({ init: true })
      }

      demo: any

      setRef = (demo: any) => {
        this.demo = demo
      }

      render() {
        const { show, init } = this.state
        return (
          <div>
            <FormDemo ref={this.setRef} show={show} init={init} />
            <button className="my-btn" onClick={this.onClick}>
              Show
            </button>
          </div>
        )
      }
    }

    // Do the test
    it("Don't remove when mount", async () => {
      const wrapper = mount(<Test />, { attachTo: div })
      const form = (wrapper.find('Demo').props().form as unknown) as FormType
      const error = await form.validateFields().catch((e) => e)

      expect(Object.keys(error)).toEqual(['age'])

      wrapper.find('.my-btn').simulate('click')

      const error1 = await form.validateFields().catch((e) => e)

      expect(Object.keys(error1)).toEqual(['name'])
    })
  })
})
