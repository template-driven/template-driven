/******************************************************
 * Created by nanyuantingfeng on 2019-05-08 19:10.
 *****************************************************/
import { Formula, register } from '../Formula'

@register('arithmetic')
export class ArithmeticFormula extends Formula {
  calculate<T>(data: any[]): Promise<T> {
    const { formula, args = [] } = this.source
    let source = formula
    args.forEach((arg, i) => (source = source.replace(new RegExp(arg, 'g'), asStringValue(data[i]))))
    return new Function('SUM', `return ${source}`)(SUM)
  }
}

function asStringValue(value: any) {
  switch (typeof value) {
    case 'bigint':
    case 'boolean':
    case 'number':
    case 'undefined':
      return String(value)
    case 'string':
      return JSON.stringify(value)
  }
  return null
}

function SUM(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0)
}
