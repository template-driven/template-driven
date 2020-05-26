/******************************************************
 * Created by nanyuantingfeng on 2019-05-15 16:06.
 *****************************************************/
import React from 'react'
import TemplateRender, { TemplateRenderProps } from './TemplateRender'
import { FieldType } from './types'
import { IExtendBus } from './Bus'
import { createForm, FormType } from '@template-driven/form'
import { IObject } from '@template-driven/formula'
import invariant from 'invariant'
import { observable, ObservableMap, set, transaction } from 'mobx'
import { Assign } from 'utility-types'

type TemplateProps = Assign<
  TemplateRenderProps,
  {
    bus: IExtendBus
    form: FormType
    value?: IObject
    tags?: IObject
    externals?: IObject
  }
>

// @ts-ignore
@createForm({
  nested: false,
  onValuesChange(props: any, changedValues: any) {
    const { onValueChange, bus } = props
    onValueChange && onValueChange(changedValues)
    bus && bus.emit('@form:value:changed', changedValues)
  }
})
export default class TemplateAPI extends React.Component<TemplateProps, any> {
  static defaultProps = {
    template: { fields: [] as FieldType[] },
    value: {},
    tags: {},
    externals: {},
    className: ''
  }

  bus: IExtendBus
  tags: ObservableMap<string, any>
  externals: ObservableMap<string, any>

  constructor(props: TemplateProps, ...args: any[]) {
    super(props as any, ...args)
    const { bus } = props
    this.bus = bus
    this.tags = observable.map(props.tags)
    this.externals = observable.map(props.externals)
  }

  componentDidMount() {
    this.bus.watch('@form:getFieldsValue', this.getValue)
    this.bus.watch('@form:setFieldsValue', this.setValue)
    this.bus.watch('@form:getValueWithValidate', this.getValueWithValidate)
    this.bus.watch('@form:setFieldsExternalsData', this.setFieldsExternalsData)

    this.bus.watch('@form:set:value', this.setValueMap)
    this.bus.watch('@form:get:value', this.getValueMap)
    this.bus.watch('@form:validate', this.validateFields)
    this.bus.watch('@form:clear:validate', this.resetValidate)
    this.bus.watch('@form:reset:fields', this.resetFields)
    this.bus.emit('@form:did:mount')

    this.updateDataset()
  }

  componentWillUnmount() {
    this.bus.un('@form:getFieldsValue')
    this.bus.un('@form:setFieldsValue')
    this.bus.un('@form:getValueWithValidate')
    this.bus.un('@form:setFieldsExternalsData')

    this.bus.un('@form:set:value')
    this.bus.un('@form:get:value')
    this.bus.un('@form:validate')
    this.bus.un('@form:clear:validate')
    this.bus.un('@form:reset:fields')
  }

  private updateDataset(prevProps: any = {}) {
    transaction(() => {
      if (this.props.tags !== prevProps.tags) {
        set(this.tags, this.props.tags)
      }

      if (this.props.externals !== prevProps.externals) {
        set(this.externals, this.props.externals)
      }

      if (this.props.value !== prevProps.value) {
        this.setValue(this.props.value)
      }
    })
  }

  componentDidUpdate(prevProps: any): void {
    this.updateDataset(prevProps)
  }

  /** @deprecated use getValue */
  getValueMap = () => {
    return this.props.form.getFieldsValue()
  }

  /** @deprecated use setValue */
  setValueMap = (values: IObject) => {
    this.props.form.setFieldsValue(values)
  }

  resetValidate = () => {
    return this.props.form.resetErrors()
  }

  resetFields = () => {
    this.props.form.resetFields()
  }

  /** @deprecated use validateFields */
  validateFAS = (level: number) => {
    return new Promise((resolve, reject) => {
      const { form, bus } = this.props
      const { validateFields, validateFieldsAndScroll } = form
      const fn = validateFieldsAndScroll || validateFields
      // is Level
      bus.setValidateLevel(level)
      fn((e: any, values: any) => {
        bus.setValidateLevel() // 设置默认值为0
        e ? reject(e) : resolve(values)
      })
    })
  }

  setFieldsExternalsData = (externals?: any) => {
    set(this.externals, externals)
  }

  setValue = (values: any) => {
    invariant(values, 'setFieldsValue must be a Object')
    return this.setValueMap(values)
  }

  validateFields = (names: string[]) => {
    return this.props.form.validateFields(names)
  }

  getValue = () => {
    return this.getValueMap()
  }

  getValueWithValidate = (level: number): Promise<any> => {
    return this.validateFAS(level).then(() => this.getValue())
  }

  render() {
    const { tags: _0, externals: _1, value: _2, ...others } = this.props

    // @ts-ignore
    return <TemplateRender {...others} tags={this.tags} externals={this.externals} />
  }
}
