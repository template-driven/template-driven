/******************************************************
 * Created by nanyuantingfeng on 2019-03-22 13:14.
 *****************************************************/
import React from 'react'
import { Omit } from 'utility-types'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'

import { checkIsRequired } from './helpers'
import { FormContext } from './FormContext'
import { FormType } from './types'

export interface FormItemProps {
  label?: string
  disabledValidate?: boolean
  hasFeedback?: boolean
  extra?: any
  wrapperCol?: object
  Wrapper?: React.ComponentType<Omit<FormItemProps, 'Wrapper'>>
  children: ((form: FormType) => React.ReactNode) | React.ReactNode
  [key: string]: any
}

export function createFormItem<T>(
  Wrapper: React.ComponentType<Omit<FormItemProps, 'Wrapper'> & T>,
  defaultProps?: any
) {
  return function WrappedFormItemObserver(props: FormItemProps) {
    return React.createElement(FormItem, { ...defaultProps, Wrapper, ...props })
  }
}

function Wrapper(props: any) {
  const { style, className, children } = props
  return React.createElement('div', { style, className }, children)
}

@observer
export class FormItem extends React.Component<FormItemProps> {
  static displayName = `Observered.FormItem`
  static contextType = FormContext

  static defaultProps = {
    disabledValidate: false,
    Wrapper: Wrapper
  }

  render() {
    const { children: CHN, Wrapper, disabledValidate, ...others } = this.props

    if (!Wrapper) {
      throw new Error('You must set the FormItem by `Wrapper` component in props.')
    }

    let fieldMeta: any

    const { form } = this.context
    let children = React.Children.toArray(CHN)

    // get the first form component that bind props
    children = React.Children.map(children, (child) => {
      const name = (child as any).props && (child as any).props['data-field-name']
      const childFieldOption = form.fieldsMeta.get(name)

      if (!fieldMeta && childFieldOption) {
        fieldMeta = childFieldOption
        return React.cloneElement(child as any, {
          ...(child as any).props,
          [fieldMeta.valuePropName]: form.getFieldValue(name)
        })
      }

      return child
    })

    let appendProps: any = {}

    if (fieldMeta) {
      const name = fieldMeta.name
      appendProps = toJS(form.dataset.get(name))
      const { excluded } = appendProps

      if (excluded) {
        return null
      }

      // delete to prevent send DOM element attr.
      delete appendProps.excluded

      // set validate status
      if (!disabledValidate) {
        const err = form.errors.get(name)
        if (err) {
          appendProps.validateStatus = err.length > 0 ? 'error' : 'success'
        }
        appendProps.required = checkIsRequired(fieldMeta.rules)
        appendProps.help = appendProps.validateStatus === 'error' && err.map(({ message }: any) => message).join(' ')
      }
    }

    return React.createElement(Wrapper, { ...appendProps, ...others }, children)
  }
}

export default FormItem
