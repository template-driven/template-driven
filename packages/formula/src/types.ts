/******************************************************
 * Created by nanyuantingfeng on 2019-05-08 15:15.
 *****************************************************/
import { IObservableObject, ObservableMap } from 'mobx'

export type SimpleValue = string | number | boolean | Date | RegExp | null
export type SimpleArray = SimpleValue[]
export type PlainObject = { [key: string]: SimpleValue | ComplexValue }
export type PlainArray = PlainObject[]
export type ComplexValue = SimpleArray | PlainObject | PlainArray

export type IObject<V = any> = Record<string, V>

export interface FormulaType {
  type: string
  formula: any
  args?: string[]
  id?: string
  initialValue?: any
}

export type ObservableObject<T> = T & IObservableObject

export type ObservableMapLike<K, V> = ObservableMap<K, V> | ObservableObject<IObject<V>>
