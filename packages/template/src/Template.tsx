/******************************************************
 * Created by nanyuantingfeng on 2019-05-14 19:52.
 *****************************************************/
import React from 'react'

import { IObject, Calculable, CalculableOptions, FormulaType } from '@template-driven/formula'
import MessageCenter from 'message-center.js'
import { observable, ObservableMap } from 'mobx'
import { observer } from 'mobx-react'

import Bus, { IExtendBus } from './Bus'
import { FieldComponentProps, FieldType, IComponentDef } from './types'
import Cellar from './Cellar'
import TemplateAPI from './TemplateAPI'
import invariant from 'invariant'
import { Assign, Omit } from 'utility-types'

export type TemplateLiteProps = Assign<
  {
    wrapper?: (props: FieldComponentProps, node: React.ReactNode) => React.ReactNode
    rootWrapper?: React.ComponentClass<any>
    groupWrapper?: (props: FieldComponentProps, fields: any[], index?: number) => JSX.Element

    dataset?: ObservableMap<string, any>
    formulas?: ObservableMap<string, FormulaType>
    template: FieldType[]
    elements: IComponentDef[]
    className?: string
    bus?: MessageCenter
    loading?: React.ComponentType<{ bus: IExtendBus; [key: string]: any }>
    onValueChange?: (changedValues: any) => void
    extra?: any
  },
  Omit<CalculableOptions, 'primaryKey'>
>

@observer
export class Template extends React.Component<TemplateLiteProps, any> {
  cellar: Cellar
  bus: IExtendBus

  @observable
  private calculable: Calculable

  constructor(props: TemplateLiteProps, ...args: any[]) {
    super(props, ...args)
    invariant(Array.isArray(props.elements), 'elements is not an array')
    this.cellar = new Cellar(props.elements)
    this.bus = Bus(props.bus as IExtendBus)
  }

  componentDidMount() {
    const { template, extra } = this.props
    this.initialize(template, extra)
  }

  componentDidUpdate(prevProps: Readonly<TemplateLiteProps>): void {
    if (this.props.template !== prevProps.template) {
      const { template, extra } = this.props
      this.initialize(template, extra)
    }
  }

  initialize(template: IObject[], extra?: any) {
    if (this.calculable) {
      this.calculable.update(template, extra)
      return
    }

    const { exclude = ['field'], dataset, formulas } = this.props
    this.calculable = new Calculable({
      source: template,
      options: { exclude },
      formulas,
      dataset,
      extra
    })
  }

  render() {
    if (!this.calculable) {
      const { loading, ...others } = this.props
      return loading ? React.createElement(loading, { ...others, bus: this.bus }) : null
    }

    const { elements, exclude, parseFormula, extra: _0, ...others } = this.props
    return <TemplateAPI {...others} cellar={this.cellar} dataset={this.calculable.dataset} />
  }
}

export default Template
