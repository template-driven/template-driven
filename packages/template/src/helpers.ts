/******************************************************
 * Created by nanyuantingfeng on 2019-05-06 11:07.
 *****************************************************/
export function fnGetFields(template: any) {
  if (Array.isArray(template)) {
    return template
  }

  if (template && template.fields) {
    return template.fields
  }
  return []
}

export function fnIsMultiArray(array: any[] | any[][] = []): boolean {
  let i = -1
  while (++i < array.length) {
    if (!(array[i] instanceof Array)) {
      return false
    }
  }
  return true
}
