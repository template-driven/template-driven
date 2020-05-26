/**************************************************
 * Created by nanyuantingfeng on 05/05/2017 19:22.
 **************************************************/
import React from 'react'

import Cellar from './Cellar'
import { FieldType, TemplateType } from './types'
import { fnIsMultiArray } from './helpers'
import { ObservableMap } from 'mobx'
import { FormType } from '@template-driven/form'
import { Observer } from 'mobx-react'

export interface TemplateRenderProps {
  template: TemplateType
  dataset: ObservableMap
  cellar: Cellar
  className?: string
  rootWrapper?: React.ComponentClass<any>
  groupWrapper?: (props: any, fields: any[], index?: number) => JSX.Element

  tags?: ObservableMap
  externals?: ObservableMap
  primaryKey?: string | ((item: FormType) => string)
  [key: string]: any
}

export default class TemplateRender extends React.Component<TemplateRenderProps, any> {
  static defaultProps = {
    template: { fields: [] as FieldType[] },
    className: ''
  }

  renderSimpleFields(fields: FieldType[], prefixKey: number | string = ''): JSX.Element[] {
    const { cellar, dataset, tags, externals, ...others } = this.props
    return fields.map((fieldO, index) => {
      const { name } = fieldO
      return (
        <Observer key={`${prefixKey}_${name}_${index}`}>
          {() => {
            const field = dataset.has(name) ? dataset.get(name) : fieldO
            const CC = cellar.getComponent(field)
            const tag = tags.get(name)
            const external = externals.get(name)
            // add `value` to mobx store listening queue
            const { value } = field
            return React.createElement(CC, { ...others, tag, external, field, value })
          }}
        </Observer>
      )
    })
  }

  renderMultiFields(multiFields: FieldType[][] = []): JSX.Element[] {
    const oo: JSX.Element[] = []
    let i = -1
    while (++i < multiFields.length) {
      let fields = multiFields[i]
      let array = this.renderSimpleFields(fields, i)
      oo.concat(array)
    }
    return oo
  }

  renderFields(fields: FieldType[] | FieldType[][]): JSX.Element[] {
    return fnIsMultiArray(fields)
      ? this.renderMultiFields(fields as FieldType[][])
      : this.renderSimpleFields(fields as FieldType[])
  }

  renderGroup() {
    let { groupWrapper, template } = this.props
    let fields = template as any

    let multiFields: FieldType[][]

    if (fnIsMultiArray(fields)) {
      multiFields = fields as FieldType[][]
    }

    if (groupWrapper && multiFields) {
      return multiFields.map((line, index) => groupWrapper(this.props, this.renderSimpleFields(line, index), index))
    }

    return this.renderFields(multiFields || fields)
  }

  render() {
    const { className, rootWrapper = 'div' } = this.props
    return React.createElement(rootWrapper, { className }, this.renderGroup())
  }
}
