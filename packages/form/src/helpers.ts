/******************************************************
 * Created by nanyuantingfeng on 2019-03-22 13:14.
 *****************************************************/
import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { isObservableMap } from 'mobx'
import { ValidateItemType, Rule } from './types'

export function getValueFromEvent(e: any) {
  if (!e || !e.target) {
    return e
  }

  const { target } = e
  return target.type === 'checkbox' ? target.checked : target.value
}

export function checkIsRequired(rules: any) {
  if (rules) {
    if (Array.isArray(rules)) {
      return rules.filter(({ required }) => required).length > 0
    }
    return !!rules.required
  }
  return false
}

function getDisplayName(WrappedComponent: React.ComponentType) {
  return WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent'
}

export function hoistStatics(
  Container: React.ComponentType<any> & { WrappedComponent?: React.ComponentType<any> },
  WrappedComponent: React.ComponentType<any>
) {
  Container.displayName = `Form(${getDisplayName(WrappedComponent)})`
  Container.WrappedComponent = WrappedComponent
  return hoistNonReactStatics(Container, WrappedComponent)
}

export function identity(data: any) {
  return data
}

export function normalizeValidateRules(
  validate: ValidateItemType[] = [],
  rules?: Rule | Rule[],
  validateTrigger?: string
): ValidateItemType[] {
  const validateRules = validate.map((item) => {
    const newItem = {
      ...item,
      trigger: item.trigger || []
    }

    if (typeof newItem.trigger === 'string') {
      newItem.trigger = [newItem.trigger]
    }

    return newItem
  })

  if (rules) {
    validateRules.push({
      trigger: validateTrigger ? [validateTrigger] : [],
      rules
    })
  }
  return validateRules
}

export function getValidateTriggers(validateRules: ValidateItemType[]): string[] {
  return validateRules
    .filter((item) => !!item.rules && (item.rules as any[]).length)
    .map((item) => item.trigger)
    .reduce((pre, curr) => pre.concat(curr as string), []) as string[]
}

export function mapToObject(map: Map<string, any>) {
  if (!(map instanceof Map || isObservableMap(map))) {
    throw new Error('argument must be es2015 Maps')
  }
  const oo: any = {}
  for (const [name, value] of map) {
    oo[name] = value
  }

  return oo
}

export function batch(fn: (values: any[]) => void) {
  let caching = false
  let queue: any[] = []
  return (value: any) => {
    if (!caching) {
      caching = true
      queue.push(value)
      setTimeout(() => {
        fn(queue)
        caching = false
        queue = []
      })
      return
    }

    queue.push(value)
  }
}
