/******************************************************
 * Created by nanyuantingfeng on 2019-04-25 12:17.
 *****************************************************/
import React from 'react'
import { ObservableMap, IObservableObject } from 'mobx'

export interface FormCreateOption<T> {
  nested?: boolean
  withRef?: boolean
  onValuesChange?: (props: T, changedValues: any) => void
}

export type Rule = Partial<{
  required: boolean
  message: string
  type: string
  pattern: RegExp
  validator(rule: Rule, value: any, callback: (message: string) => void, source: any, options: any): void
}>

export type ValidateItemType = {
  trigger: string | string[]
  rules: Rule | Rule[]
}

export type FieldOption = Partial<{
  valuePropName: string
  trigger: string
  validateTrigger: string
  rules: Rule | Rule[]
  props: any
  normalize: (value: any) => any
  validate: ValidateItemType[]
  parseValue: (value: any) => any
  initialValue: any
  getValueFromEvent(e: Event): any
}>

export type ValidateCallback = (error?: any[], values?: any) => void

export interface FormType {
  fieldsMeta: any
  errors: ObservableMap<string, any>
  dataset: ObservableMap<string, any>

  getFieldDecorator(name: string, option?: FieldOption): (element: React.ReactElement) => React.ReactElement
  getFieldProps(name: string, option?: FieldOption): any

  getFieldValue(name: string): any
  setFieldValue(name: string, value: any): void

  getFieldsValue(names?: string[]): any
  setFieldsValue(values: any): void
  setFieldsInitialValue(values: any): void

  resetErrors(names?: string[]): void
  resetFields(names?: string[]): void

  getFieldError(name: string): any
  getFieldsError(names?: string[]): object

  validateField(name: string): Promise<any>

  validateFields(names?: string[], callback?: ValidateCallback): Promise<any>
  validateFields(callback?: ValidateCallback): Promise<any>

  validateFieldsAndScroll(names?: string[], callback?: ValidateCallback): Promise<any>
  validateFieldsAndScroll(callback?: ValidateCallback): Promise<any>
}

export interface FormContextType {
  form: FormType // the form object
}

export type PlainObject<V = any> = { [key: string]: V }

export type ObservableObject<T> = T & IObservableObject

export type SimpleObject<V = any> = { [key: string]: V }

export interface FieldMeta {
  name: string
  valuePropName: string
  rules?: Rule | Rule[]
  validatorHandler?: (...params: any[]) => Promise<any>
  getValueFromEvent?: (e: any) => any
  parseValue?: (value: any) => any
  normalize?: (value: any) => any
  initialValue?: any
  props?: any
  trigger?: string
  validateTrigger?: string
  validate?: ValidateItemType[]
}

export interface DatasetValue {
  value?: any
  excluded?: boolean
  [key: string]: any
}
