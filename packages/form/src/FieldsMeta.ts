/******************************************************
 * Created by nanyuantingfeng on 2019-06-06 16:39.
 *****************************************************/
import { DatasetValue, FieldMeta } from './types'
import { ObservableMap } from 'mobx'

export default class FieldsMeta {
  private fieldsMeta: { [key: string]: FieldMeta } = {}
  private renderFields: any = {}

  constructor(private dataset: ObservableMap<string, DatasetValue>) {}

  getEffectiveKeys() {
    const keys = Object.keys(this.fieldsMeta)
    return keys.filter((name) => !this.dataset.get(name)!.excluded)
  }

  cleanUpUselessFields() {
    const keys = Object.keys(this.fieldsMeta)
    keys.filter((name) => !this.renderFields[name]).forEach((name) => delete this.fieldsMeta[name])
    this.renderFields = {}
  }

  recordRenderField(name: string) {
    this.renderFields[name] = true
  }

  has(name: string) {
    return !!this.fieldsMeta[name]
  }

  hasEffective(name: string) {
    return this.has(name) && !this.dataset.get(name)!.excluded
  }

  get(name: string) {
    return this.fieldsMeta[name]
  }

  set(name: string, value: FieldMeta) {
    this.fieldsMeta[name] = value
  }

  clear() {
    this.fieldsMeta = {}
  }
}
