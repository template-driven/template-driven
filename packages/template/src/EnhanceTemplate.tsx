/**************************************************
 * Created by nanyuantingfeng on 16/05/2017 11:16.
 **************************************************/
import React from 'react'
import Dynamic from './Dynamic'
import Bus, { IExtendBus } from './Bus'
import { IComponentDef, TemplateComponentProps, TemplateType } from './types'

/**********************************************************************************
 * @param config
 * @constructor
 *
 * config : {
 *  cellar : Array[Components] // 组建仓库
 *  loading : Component // 异步时候展示组件
 *  wrapper : Function(props,component) // 运行时侯的 wrapper 修正
 *  template ?: Object //模板描述(可选),
 *  groupWrapper ?: Function(props,components, index)
 * }
 *********************************************************************************/
export type EnhanceTemplateConfig = Partial<{
  elements: IComponentDef[]
  loading?: React.ComponentType
  wrapper?: (props: any, component: React.ComponentType) => any
  template?: TemplateType
  groupWrapper?: Function
}>

export function EnhanceTemplate<T = any>(config?: EnhanceTemplateConfig) {
  return <C extends React.ComponentType<TemplateComponentProps>>(Component: C): C => {
    return class Template extends React.Component<T & EnhanceTemplateConfig, any> {
      static displayName = `EnhanceTemplate(${Component.displayName})`

      bus: IExtendBus

      constructor(props: any, ...args: any[]) {
        super(props, ...args)
        this.bus = Bus(props.bus)
      }

      render() {
        const { props, bus } = this
        return React.createElement(
          Component,
          {
            ...(props as any),
            bus
          },
          // @ts-ignore
          React.createElement(Dynamic, {
            ...config,
            ...(props as any),
            bus
          })
        )
      }
    } as any
  }
}

export default EnhanceTemplate
