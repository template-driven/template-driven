import 'antd/dist/antd.css'

import { reaction, observable, ObservableMap } from 'mobx'
import React from 'react'
import { render } from 'react-dom'
import { Form, Select, InputNumber, Switch, Radio, Slider, Button, Upload, Input, DatePicker } from 'antd'
const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

import { createForm, createFormItem, FormType } from '../src'

const FormItem = createFormItem(Form.Item, {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
})

class DEMO extends React.Component<{ form: FormType; dataset: ObservableMap<any> }> {
  page = false

  state = { page: false }

  handleSubmit = (e: any) => {
    e.preventDefault()

    const { form } = this.props
    form
      .validateFields()
      .then((values: any) => console.log('success:', values))
      .catch((e: any) => console.log('error:', e))
  }

  normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }

  render() {
    const { getFieldProps, getFieldDecorator } = this.props.form
    return (
      <Form onSubmitCapture={this.handleSubmit}>
        <Button onClick={() => this.setState({ page: !this.state.page })}>CHANGE</Button>
        <Button onClick={() => this.props.form.resetErrors()}>CLEAR</Button>
        <Button onClick={() => this.props.form.validateField('nest.a')}>VALIDATE ONE</Button>
        <Button onClick={() => this.props.form.validateFields(['nest.b', 'nest.c'])}>VALIDATE TWO</Button>

        <FormItem label="Nation">
          <span className="ant-form-text">China</span>
        </FormItem>

        {this.state.page && (
          <>
            <FormItem hasFeedback key="a" label="nest.a">
              {getFieldDecorator('nest.a', {
                rules: { required: true, message: 'Please input something!' },
                validateTrigger: 'onBlur'
              })(<Input placeholder="Input here" />)}
            </FormItem>

            <FormItem hasFeedback key="b" label="nest.b">
              <Input
                {...getFieldProps('nest.b', {
                  rules: { required: true, message: 'Please input something!' },
                  validateTrigger: 'onBlur'
                })}
                placeholder="Input here"
              />
            </FormItem>

            <FormItem hasFeedback key="c" label="nest.c">
              <Input
                {...getFieldProps('nest.c', {
                  rules: { required: true, message: 'Please input something!' },
                  validateTrigger: 'onBlur'
                })}
                placeholder="Input here"
              />
            </FormItem>
          </>
        )}
        <FormItem hasFeedback label="select">
          {getFieldDecorator('select', {
            rules: [{ required: true, message: 'Please select your country!' }]
          })(
            <Select placeholder="Please select a country">
              <Option value="china">China</Option>
              <Option value="usa">U.S.A</Option>
            </Select>
          )}
        </FormItem>

        <FormItem label="Select[multiple]" hasFeedback>
          <Select
            {...getFieldProps('selectMultiple', {
              initialValue: ['red'],
              rules: { required: true, message: 'Please select your colors!' },
              props: {
                mode: 'multiple',
                placeholder: 'Please select favourite colors'
              }
            })}
          >
            <Option value="red">Red</Option>
            <Option value="green">Green</Option>
            <Option value="blue">Blue</Option>
          </Select>
        </FormItem>

        {this.state.page && (
          <FormItem>
            <InputNumber
              id="inputNumber"
              min={1}
              max={10000}
              {...getFieldProps('inputNumber', {
                initialValue: 1
              })}
            />
            <span className="ant-form-text"> machines</span>
          </FormItem>
        )}

        <FormItem label="Switch">
          <Switch {...getFieldProps('switch', { valuePropName: 'checked' })} />
        </FormItem>

        <FormItem label="Date">
          <DatePicker {...getFieldProps('date')} />
        </FormItem>

        <FormItem label="Slider">
          {getFieldDecorator('slider')(<Slider marks={{ 0: 'A', 20: 'B', 40: 'C', 60: 'D', 80: 'E', 100: 'F' }} />)}
        </FormItem>

        <FormItem label="Radio.Group">
          <RadioGroup {...getFieldProps('radioGroup')}>
            <Radio value="a">item 1</Radio>
            <Radio value="b">item 2</Radio>
            <Radio value="c">item 3</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem label="Radio.Button">
          <RadioGroup {...getFieldProps('radioButton')}>
            <RadioButton value="a">item 1</RadioButton>
            <RadioButton value="b">item 2</RadioButton>
            <RadioButton value="c">item 3</RadioButton>
          </RadioGroup>
        </FormItem>

        <FormItem label="Upload" extra="longgggggggggggggggggggggggggggggggggg">
          <Upload
            name="logo"
            action="/upload.do"
            listType="picture"
            {...getFieldProps('upload', {
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile
            })}
          >
            <Button>Click to upload</Button>
          </Upload>
        </FormItem>

        <FormItem wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </FormItem>
      </Form>
    )
  }
}

const WrappedDEMO = createForm()(DEMO)

const dataset = observable.map({
  inputNumber: { label: 1, value: 123, excluded: false },
  'nest.a': { value: 9 }
})

reaction(
  () => dataset.get('nest.a')!.value,
  (v) => {
    dataset.get('inputNumber')!.label = v
    dataset.get('inputNumber')!.excluded = String(v).length > 3
  },
  { fireImmediately: true }
)

render(<WrappedDEMO dataset={dataset} />, document.getElementById('root'))
