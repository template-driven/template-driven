/******************************************************
 * Created by nanyuantingfeng on 2019-04-25 12:22.
 *****************************************************/
import createBaseForm from './createBaseForm'
import { FormCreateOption } from './types'

export default createDOMForm

export function createDOMForm<T>(options?: FormCreateOption<T>) {
  return createBaseForm(options)
}
