/******************************************************
 * Created by nanyuantingfeng on 2019-05-06 10:52.
 *****************************************************/
import React from 'react'
import { FormType } from '@template-driven/form'
import { IExtendBus } from './Bus'

export type FieldType = {
  name: string
  type?: string
  dataType?: any
  label?: string
  defaultValue?: any
  optional?: boolean
  editable?: boolean
  excluded?: boolean
  visible?: boolean
  [key: string]: any
}

export type DescriptorType = Partial<{
  name: string
  type: string
  test: (field: FieldType) => boolean
  [key: string]: any
}>

export type TemplateType =
  | {
      fields: FieldType[]
      id?: string
      [key: string]: any
    }
  | FieldType[]

export type Rule = {
  validator: ValidatorFn
  level: number
}

export type ValidatorFn = (rule: Rule, value: any, callback: (message?: string) => void) => void
export type ValidatorOB = { validator: ValidatorFn; [key: string]: any }
export type ValidatorFB = ValidatorFn | ValidatorOB

export type PlainObject = { [key: string]: any }
export type SimpleValue = string | number | boolean | void | null | PlainObject
export type ValueType = SimpleValue | SimpleValue[] | Map<string, SimpleValue> | Set<SimpleValue>

export interface FieldComponentProps {
  field: FieldType
  bus: IExtendBus
  style: React.CSSProperties
  form: FormType
  onChange: (value: ValueType) => void
  value: any
  external: any
  tag: any

  [key: string]: any
}

export type TemplateComponentProps = {
  template: TemplateType
  bus?: IExtendBus
  value?: PlainObject
  externals?: PlainObject
  tags?: PlainObject
}

export type FieldConfigOption = {
  descriptor: DescriptorType
  initialValue?: ((props: FieldComponentProps) => ValueType) | ValueType
  normalize?: (value: any) => ValueType
  parseValue?: (value: any) => ValueType
  required?: string | ((field: FieldType, props: any) => { required: boolean; message?: string })
  validator?: (field: FieldType, props: FieldComponentProps) => ValidatorFB[]
  wrapper?: (props: FieldComponentProps, node: React.ReactNode) => React.ReactNode
  validateTrigger?: string
  [key: string]: any
}

export interface IComponentDef extends React.ComponentClass<any> {
  descriptor?: DescriptorType
}
