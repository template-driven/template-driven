/**************************************************
 * Created by nanyuantingfeng on 10/05/2017 13:30.
 **************************************************/
import { FieldType, IComponentDef } from './types'

export class Cellar {
  elements: IComponentDef[]
  elementsNameMap: { [key: string]: IComponentDef }
  elementsTypeMap: { [key: string]: IComponentDef }
  elementsTestLst: IComponentDef[]
  elementsUnknown: IComponentDef

  constructor(elements: IComponentDef[] = []) {
    this.elements = elements
    this.elementsNameMap = {}
    this.elementsTestLst = []
    this.elementsTypeMap = {}
    this.elementsUnknown = null

    this.initialize()
  }

  register(...args: IComponentDef[]): this {
    this.elements.push(...args)
    return this
  }

  initialize(): this {
    const elementsTestLst: IComponentDef[] = []
    const elementsNameMap: { [key: string]: IComponentDef } = {}
    const elementsTypeMap: { [key: string]: IComponentDef } = {}

    this.elements.forEach((ec) => {
      const { descriptor } = ec

      const { name, type, test } = descriptor

      if (typeof test === 'function') {
        elementsTestLst.push(ec)
      }

      if (name) {
        elementsNameMap[name] = ec
      }

      if (type) {
        elementsTypeMap[type] = ec
      }
    })

    this.elementsNameMap = elementsNameMap
    this.elementsTestLst = elementsTestLst
    this.elementsTypeMap = elementsTypeMap
    this.elementsUnknown = elementsTypeMap['unknown']

    return this
  }

  getComponent(field: FieldType): IComponentDef {
    const { elementsNameMap, elementsTestLst, elementsTypeMap } = this

    let { name, type, dataType } = field

    if (elementsNameMap[name]) {
      return elementsNameMap[name]
    }

    let i = -1
    while (++i < elementsTestLst.length) {
      const element = elementsTestLst[i]
      const { descriptor } = element
      if (descriptor.test(field)) {
        return element
      }
    }

    type = type || (dataType || {}).type || undefined

    if (elementsTypeMap[type]) {
      return elementsTypeMap[type]
    }

    console.warn(`%c没有找到:${name}<${type}>注册的控件,将使用注册的 <unknown> 控件渲染`, 'color:red;')
    return this.getUnknown()
  }

  getUnknown(): IComponentDef {
    return this.elementsUnknown
  }
}

export default Cellar
