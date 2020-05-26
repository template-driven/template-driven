/******************************************************
 * Created by nanyuantingfeng on 2019-05-08 19:10.
 *****************************************************/
import { Formula, register } from '../Formula'

@register('function')
export class FunctionFormula extends Formula {
  calculate<T>(data: any[]): Promise<T> {
    const { formula, args = [] } = this.source
    return formula(...args)
  }
}
