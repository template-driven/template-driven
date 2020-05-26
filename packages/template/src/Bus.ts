/**************************************************
 * Created by nanyuantingfeng on 11/05/2017 14:21.
 **************************************************/
import MessageCenter from 'message-center.js'
import { cloneDeep, isEqual } from 'lodash'

function fnDeepCompare(a: any, b: any): boolean {
  return isEqual(a, b)
}

function fnDeepClone<T>(d: T): T {
  return cloneDeep(d)
}

export type IExtendBus = MessageCenter & {
  getValue<T>(): Promise<T>
  getFieldsValue<T>(): Promise<T>
  getValueWithValidate<T>(levelOrFields?: number | string[]): Promise<T>
  setValue<T>(values: T): Promise<void>
  setFieldsValue<T>(values: T): Promise<void>
  setValueWithReference<T>(values: T): Promise<T>
  setReference<T>(values: T): Promise<T>
  isEqualWithReference(): Promise<boolean>
  clearValidate: () => Promise<void>
  resetFields: () => Promise<void>
  getValidateLevel: () => number
  setValidateLevel: (level?: number) => void
  setFieldsExternalsData: (data?: any) => IExtendBus
  validate: (names: string[]) => Promise<void>

  [propKey: string]: any
}

export function extendBus(bus = new MessageCenter() as IExtendBus): IExtendBus {
  bus.getValue = function(this: IExtendBus) {
    return this.invoke('@form:getFieldsValue')
  }

  bus.getFieldsValue = function(this: IExtendBus) {
    return this.invoke('@form:get:value')
  }

  bus.getValueWithValidate = function(this: IExtendBus, level: number) {
    this.setFieldsExternalsData()
    return this.invoke('@form:getValueWithValidate', level)
  }

  bus.setValue = function(this: IExtendBus, values) {
    return this.invoke('@form:setFieldsValue', values)
  }

  bus.setFieldsValue = function(this: IExtendBus, values) {
    return this.invoke('@form:set:value', values)
  }

  bus.setValueWithReference = function(this: IExtendBus, values) {
    return this.setValue(values)
      .then(() => this.getValue())
      .then((d: any) => this.setReference(d))
  }

  bus.validate = function(this: IExtendBus, names: string[]) {
    return this.invoke('@form:validate', names)
  }

  bus.setReference = function(this: IExtendBus, data) {
    if (data) {
      this._$REFERENCE_VALUE = fnDeepClone(data)
      return Promise.resolve(data)
    }

    return this.getValue().then((data: any) => {
      this._$REFERENCE_VALUE = fnDeepClone(data)
      return data
    })
  }

  bus.isEqualWithReference = function(this: IExtendBus) {
    return this.getValue().then((data: any) => {
      return fnDeepCompare(this._$REFERENCE_VALUE, data)
    })
  }

  bus.clearValidate = function(this: IExtendBus) {
    this.setFieldsExternalsData()
    return this.invoke('@form:clear:validate')
  }

  bus.resetFields = function(this: IExtendBus) {
    return this.invoke('@form:reset:fields')
  }

  // 为校验级别增加的Hook
  bus.getValidateLevel = function(this: IExtendBus) {
    return this.__$VALIDATE_LEVEL$__ || 0
  }

  bus.setValidateLevel = function(this: IExtendBus, level) {
    this.__$VALIDATE_LEVEL$__ = level || 0
    return this
  }

  bus.setFieldsExternalsData = function(this: IExtendBus, data) {
    this.invoke('@form:setFieldsExternalsData', data)
    return this
  }

  return bus
}

export default extendBus
