/******************************************************
 * Created by nanyuantingfeng on 2019-05-08 17:04.
 *****************************************************/
import { toPath, isObject } from 'lodash'
import { get, set, toJS, has, ObservableMap } from 'mobx'
import { FormulaType, IObject, ObservableMapLike } from './types'
import { detectCycle } from './detectCycle'

export function patchAt<T>(object: ObservableMapLike<string, T>, path: string | string[]): string[] {
  const paths: string[] = toPath(path)

  paths.forEach((p, i) => {
    if (!has(object, p)) {
      if (i === paths.length - 1) {
        set(object, p, undefined)
      } else {
        set(object, p, !isNaN(Number(paths[i + 1])) ? [] : {})
      }
    }
    object = get(object, p)
  })

  return paths
}

export function getAt<T>(object: ObservableMapLike<string, T>, path: string | string[]) {
  const paths = patchAt(object, path)
  return paths.reduce((p, n) => get(p, n), object)
}

export function setAt<T>(object: ObservableMapLike<string, T>, path: string | string[], value: any) {
  if (!isObject(object) || object === null) {
    return object
  }
  const paths = patchAt(object, path)
  const pL = paths.pop()
  const oo = getAt(object, paths)
  set(oo, pL!, value)
  return object
}

export function keepValueMerge<T>(object: ObservableMap<string, T>, value: any) {
  const keys = Object.keys(value)
  keys.forEach((key) => {
    const oldValue: any = toJS(get(object, key))
    const newValue = { ...oldValue, ...value[key] }

    if (newValue.value === undefined) {
      newValue.value = (oldValue || {}).value
    }
    set(object, key, newValue)
  })
}

export function detectArgs(formulas: IObject<FormulaType>) {
  const keys = Object.keys(formulas)
  const oo: any = {}
  keys.forEach((key) => (oo[key] = formulas[key].args))
  const res = detectCycle(oo)
  if (res) {
    throw new TypeError(`检测到循环依赖 : ${res.join(' => ')}`)
  }
  return formulas
}

export function toPathNameAndKey(path: string) {
  const paths = path.split('.')
  const key = paths.pop()
  const name = paths.join('.')
  return [name, key]
}
