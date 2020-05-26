/**************************************************
 * Created by nanyuantingfeng on 21/07/2017 11:25.
 **************************************************/
import React from 'react'

import Template from './Template'
import { IExtendBus } from './Bus'

import { IComponentDef, TemplateType } from './types'
import MessageCenter from 'message-center.js'
import { CalculableOptions, FormulaType, IObject } from '@template-driven/formula'
import { fnGetFields } from './helpers'

import debounceRender from './debounceRender'
import { Assign, Omit } from 'utility-types'
import { ObservableMap } from 'mobx'

export type DynamicProps = Assign<
  {
    elements: IComponentDef[]

    template: TemplateType
    wrapper?: (props: any, node: React.ReactNode) => React.ReactNode
    rootWrapper?: React.ComponentClass<any>
    groupWrapper?: (props: any, fields: any[], index?: number) => JSX.Element

    dataset?: ObservableMap<string, IObject>
    formulas?: ObservableMap<string, FormulaType>

    className?: string
    bus?: MessageCenter
    loading?: React.ComponentType<{ bus: IExtendBus; [key: string]: any }>
    value?: IObject
    tags?: IObject
    externals?: IObject
    onValueChange?: (changedValues: any) => void
    layout?: any
  },
  Omit<CalculableOptions, 'primaryKey'>
>

@debounceRender()
export class Dynamic extends React.Component<DynamicProps, any> {
  static displayName = 'Dynamic'
  render() {
    const { template, ...others } = this.props
    return <Template template={fnGetFields(template)} extra={template} {...others} />
  }
}

export default Dynamic
