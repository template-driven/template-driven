/**************************************************
 * Created by nanyuantingfeng on 17/05/2017 11:07.
 **************************************************/
import React from 'react'
import { IExtendBus } from './Bus'
import { FieldComponentProps, FieldConfigOption } from './types'

const noop = (props: any, component: React.ComponentClass<any>) => component

const identity = (value: any) => value

function fnCallOrReturn(f: Function, ...args: any[]): any {
  if (typeof f === 'function') {
    return f(...args)
  }
  return f
}

function fnWrapperRule(line: any, bus: IExtendBus) {
  const fx = () => bus.getValidateLevel()

  if (typeof line === 'function') {
    return {
      validator: line,
      get level() {
        return fx()
      }
    }
  }

  if (line !== null && typeof line === 'object') {
    return {
      ...line,
      get level() {
        return fx()
      }
    }
  }
}

function fnBuildRequired(required: any, field: any, props: any) {
  const { optional } = field

  if (typeof required === 'string') {
    return { required: !optional, message: required }
  }

  if (typeof required === 'function') {
    return fnCallOrReturn(required, field, props)
  }

  return required
}

function fnBuildValidator(validator: any, field: any, props: any) {
  if (validator && typeof validator === 'function') {
    let oo = validator(field, props)
    oo = Array.isArray(oo) ? oo : [oo]
    return oo.filter((line: any) => !!line).map((line: any) => fnWrapperRule(line, props.bus))
  }
  return false
}

export function EnhanceField<T = any>(config: FieldConfigOption) {
  return <C extends React.ComponentType<FieldComponentProps>>(Component: C): C => {
    type IEnhanceFieldProps = {
      initialValue: any
      field: any
      form: any
      bus: IExtendBus
      wrapper: any
      [key: string]: any
    }

    return class Field extends React.Component<IEnhanceFieldProps> {
      static displayName = `EnhanceField(${Component.displayName || (Component as any).name})`
      static descriptor = config.descriptor

      render() {
        let { initialValue, field, form, bus, wrapper, normalize, parseValue, ...others } = this.props

        initialValue = fnCallOrReturn(initialValue || config.initialValue || noop, this.props)
        normalize = normalize || config.normalize || identity
        parseValue = parseValue || config.parseValue || identity

        const cfg: any = {
          initialValue,
          rules: [],
          normalize,
          parseValue,
          validateTrigger: config.validateTrigger
        }

        const { validator, required } = config

        const requiredRule = fnBuildRequired(required, field, this.props)
        const validatorRules = fnBuildValidator(validator, field, this.props)

        if (requiredRule) {
          cfg.rules.push(requiredRule)
        }

        if (validatorRules) {
          cfg.rules.push(...validatorRules)
        }

        wrapper = config.wrapper || wrapper || noop

        let component: JSX.Element
        const { name } = field

        if (name) {
          const { getFieldDecorator } = form
          const decorator = getFieldDecorator(name, cfg)
          // 调用 Form::getFieldDecorator API 使其支持校验等功能
          // @ts-ignore
          component = decorator(<Component {...others} form={form} field={field} bus={bus} />)
        } else {
          // @ts-ignore
          component = <Component {...others} field={field} bus={bus} />
        }

        return wrapper(this.props, component)
      }
    } as any
  }
}
