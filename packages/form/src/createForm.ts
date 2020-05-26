/******************************************************
 * Created by nanyuantingfeng on 2019-03-22 13:14.
 *****************************************************/
import createBaseForm from './createBaseForm'
import { FormCreateOption } from './types'

export default createForm

export function createForm<T>(options?: FormCreateOption<T>) {
  return createBaseForm(options)
}
