/******************************************************
 * Created by nanyuantingfeng on 2019-04-25 12:14.
 *****************************************************/
import React from 'react'
import { toJS, action, observable, transaction, ObservableMap } from 'mobx'
import AsyncValidator from 'async-validator'
import { get as _get, zipObjectDeep, isUndefined, isEqual } from 'lodash'
import { Assign, Subtract } from 'utility-types'

import {
  hoistStatics,
  getValueFromEvent,
  identity,
  normalizeValidateRules,
  getValidateTriggers,
  mapToObject,
  batch
} from './helpers'
import { FormContext } from './FormContext'
import { FormCreateOption, FieldOption, PlainObject, FormType, FieldMeta, DatasetValue } from './types'
import FieldsMeta from './FieldsMeta'

const DEFAULT_VALIDATE_TRIGGER = 'onChange'
const DEFAULT_TRIGGER = DEFAULT_VALIDATE_TRIGGER

function toNested(data: PlainObject, bool: boolean) {
  if (!bool) {
    return data
  }

  const keys = Object.keys(data)
  const values = keys.map((key) => data[key])
  return zipObjectDeep(keys, values)
}

function noop() {}

export function parseError(data: PlainObject) {
  const keys = Object.keys(data)

  const values = keys.map((k) => {
    const s: any[] = data[k]
    return s.length ? s.map((k) => k.message) : undefined
  })

  return zipObjectDeep(keys, values)
}

export default createBaseForm

export function createBaseForm<T>(options: FormCreateOption<T> = {}) {
  const { nested = true, withRef, onValuesChange } = options

  type InjectedProps = { form: FormType }

  return <K extends InjectedProps>(WrappedComponent: React.ComponentType<K>) => {
    const prototype = WrappedComponent.prototype
    const oldComponentDidMount = prototype.componentDidMount || noop
    const oldComponentDidUpdate = prototype.componentDidUpdate || noop
    const oldComponentWillUnmount = prototype.componentWillUnmount || noop

    prototype.componentDidMount = function () {
      oldComponentDidMount.apply(this, arguments)
      this.props.form.cleanUpUselessFields()
    }
    prototype.componentWillUnmount = function () {
      oldComponentWillUnmount.apply(this, arguments)
      this.props.form.cleanUpUselessFields()
    }
    prototype.componentDidUpdate = function () {
      oldComponentDidUpdate.apply(this, arguments)
      this.props.form.cleanUpUselessFields()
    }

    type WrappedFormComponentProps = {
      dataset?: ObservableMap<string, any>
      wrappedComponentRef?: React.Ref<any>
    }

    class Form extends React.Component<Subtract<K, InjectedProps> & WrappedFormComponentProps & T> implements FormType {
      dataset: ObservableMap<string, DatasetValue>
      fieldsMeta: FieldsMeta
      errors = observable.map()
      private readonly sendValueChange: (value: any) => void = () => {}

      constructor(props: any, context: any) {
        super(props, context)

        this.dataset = props.dataset || observable.map()
        this.fieldsMeta = new FieldsMeta(this.dataset)

        if (onValuesChange) {
          let latestValues: any = undefined
          this.sendValueChange = batch((values) => {
            // optimization
            if (!isEqual(latestValues, values)) {
              latestValues = values
              onValuesChange(
                props,
                values.reduce((a, b) => ({ ...a, ...b }), {})
              )
            }
          })
        }
      }

      private getNames(names?: string[]): string[] {
        const fMNames = this.fieldsMeta.getEffectiveKeys()

        if (!names) {
          return fMNames
        }

        return fMNames.filter((n) => names.some((m) => n.startsWith(m)))
      }

      private createValueChangeHandler({ name, onChange, rules, getValueFromEvent }: any) {
        return (...params: any[]) => {
          const value = getValueFromEvent(...params)
          onChange && onChange(value)
          this.setFieldValue(name, value)
          this.validateFieldByRules(name, value, rules)
        }
      }

      private createValidateHandler({ name, rules, getValueFromEvent }: any) {
        return (...params: any) => {
          const value = getValueFromEvent(...params)
          return this.validateFieldByRules(name, value, rules)
        }
      }

      private validateFieldByRules = (name: string, value: any, rules: any[]) => {
        if (!rules) {
          return Promise.resolve(value)
        }
        const validator = new AsyncValidator({ [name]: rules })

        return new Promise((resolve, reject) => {
          validator.validate(
            { [name]: value },
            action('validateField', (err: Error) => {
              if (!err) {
                this.errors.set(name, [])
                resolve(value)
              } else {
                this.errors.set(name, err)
                reject(err)
              }
            })
          )
        })
      }

      cleanUpUselessFields = () => {
        this.fieldsMeta.cleanUpUselessFields()
      }

      validateField = (name: string) => {
        const value = this.getFieldValue(name)

        if (!this.fieldsMeta.hasEffective(name)) {
          return Promise.resolve(value)
        }

        const { validatorHandler } = this.fieldsMeta.get(name)
        return validatorHandler!(value)
      }

      validateFields = (names?: any, callback?: any) => {
        if (typeof names === 'function') {
          callback = names
          names = undefined
        }

        const names2 = this.getNames(names)
        const needValidateName: any[] = []

        const rules = names2.reduce<any>((o, name) => {
          const rules = this.fieldsMeta.get(name).rules
          if (rules) {
            needValidateName.push(name)
            o[name] = rules
          }
          return o
        }, {})

        const validator = new AsyncValidator(rules)

        const flattenValue = needValidateName.reduce((o, cur) => {
          o[cur] = this.getFieldValue(cur)
          return o
        }, {})

        return new Promise((resolve, reject) => {
          validator.validate(
            flattenValue,
            action((err: Error, fieldsErrors: any[]) => {
              if (!fieldsErrors) {
                names2.forEach((name) => this.errors.has(name) && this.errors.get(name).clear())
              }

              if (fieldsErrors) {
                this.errors.merge(fieldsErrors)
                const e = parseError(fieldsErrors)
                callback && callback(e as any, null)
                return reject(e)
              }

              const fieldKeys = this.fieldsMeta.getEffectiveKeys()

              const oo: any = {}
              fieldKeys.forEach((name) => (oo[name] = this.getFieldValue(name)))
              const values = toNested(oo, nested)

              callback && callback(null, values)
              return resolve(values)
            })
          )
        })
      }

      validateFieldsAndScroll = (names?: any, callback?: any) => {
        return this.validateFields(names, callback)
      }

      getFieldError = (name: string) => {
        if (this.errors.has(name)) {
          const nn = this.errors.get(name)

          if (!nn) {
            return undefined
          }

          const oo = nn.map((o: any) => o.message)
          return oo.length ? oo : undefined
        }

        const errors = parseError(mapToObject(this.errors))
        return _get(errors, name)
      }

      getFieldsError = (names?: string[]) => {
        names = this.getNames(names)
        const values = names.map((name) => this.getFieldError(name))
        return zipObjectDeep(names, values)
      }

      getFieldDecorator = (name: string, option: FieldOption = {}) => {
        return (element: React.ReactElement) => React.cloneElement(element, this.getFieldProps(name, option))
      }

      getFieldProps = (name: string, option: FieldOption = {}) => {
        const dataset = this.dataset

        if (!dataset) {
          throw new Error('Must pass `dataset` with Mobx obserable.map instance.')
        }

        if (!name) {
          throw new Error('Must call `getFieldProps` with valid name string!')
        }

        const fieldMeta: FieldMeta = {
          getValueFromEvent,
          name,
          valuePropName: 'value',
          trigger: DEFAULT_TRIGGER,
          validateTrigger: DEFAULT_VALIDATE_TRIGGER,
          props: {},
          normalize: identity,
          parseValue: identity,
          initialValue: '',
          ...option
        }

        const { trigger, validateTrigger, validate, rules, valuePropName, props: appendProps, initialValue } = fieldMeta

        const validateRules = normalizeValidateRules(validate, rules, validateTrigger)
        fieldMeta.validate = validateRules
        fieldMeta.rules = validateRules.map((k) => k.rules).reduce((prev, next) => (prev as any[]).concat(next), [])
        const validateTriggers = getValidateTriggers(validateRules)

        // set initialValue
        if (!dataset.has(name)) {
          dataset.set(name, { value: initialValue })
        } else if (isUndefined(dataset.get(name)!.value)) {
          dataset.get(name)!.value = initialValue
        }

        this.fieldsMeta.set(name, fieldMeta)

        // `fieldMeta.normalize(toJS(dataset.get(name).value))`
        // Get the value in `getFieldProps` in the same way as `getFieldValue`
        // but there is no nested value problem
        // So don't need to fix it, just call `dataset.get(name).value` directly
        const props = {
          [valuePropName]: fieldMeta.normalize!(toJS(dataset.get(name)!.value)),
          [trigger as string]: this.createValueChangeHandler(fieldMeta),
          ['data-field-name']: name,
          ...appendProps
        }

        const validatorHandler = this.createValidateHandler(fieldMeta)
        this.fieldsMeta.get(name).validatorHandler = validatorHandler

        validateTriggers.forEach((validateTrigger) => {
          if (!props[validateTrigger]) {
            props[validateTrigger] = validatorHandler
          }
        })

        this.fieldsMeta.recordRenderField(name)
        return props
      }

      setFieldValue = (name: string, value: any) => {
        const dataset = this.dataset

        if (this.fieldsMeta.has(name)) {
          value = this.fieldsMeta.get(name).parseValue!(value)
        }

        // may be set a not exist key at sometime ?..
        if (dataset.has(name)) {
          dataset.get(name)!.value = value
          this.sendValueChange && this.sendValueChange({ [name]: value })
        }
      }

      setFieldsValue = (values: any) => {
        const names = Object.keys(values)
        transaction(() => {
          names.forEach((name) => this.setFieldValue(name, values[name]))
        })
      }

      setFieldsInitialValue = (values: any) => {
        const names = this.getNames()
        transaction(() => {
          names.forEach((name) => {
            const initialValue = _get(values, name)
            // initialValue exist!
            if (initialValue !== undefined) {
              // override initialValue
              this.fieldsMeta.get(name).initialValue = initialValue

              // override value
              if (isUndefined(this.getFieldValue(name))) {
                this.setFieldValue(name, initialValue)
              }
            }
          })
        })
      }

      getFieldValue = (name: string) => {
        const dataset = this.dataset

        if (this.fieldsMeta.has(name)) {
          return this.fieldsMeta.get(name).normalize!(toJS(dataset.get(name)!.value))
        }

        const names = this.getNames([name])
        if (names.length) {
          const values = names.map((name) => this.fieldsMeta.get(name).normalize!(toJS(dataset.get(name)!.value)))
          const oo: any = zipObjectDeep(names, values)
          return oo[name]
        }

        return undefined
      }

      getFieldsValue = (names?: string[]) => {
        names = this.getNames(names)
        const oo: any = {}
        names.forEach((name) => (oo[name] = this.getFieldValue(name)))
        return toNested(oo, nested)
      }

      resetErrors = (names?: string[]) => {
        const names2 = this.getNames(names)
        transaction(() => {
          this.errors.forEach((v, k) => {
            if (!!~names2.indexOf(k)) {
              this.errors.set(k, undefined)
            }
          })
        })
      }

      resetFields = (names?: string[]) => {
        const names2 = this.getNames(names)

        transaction(() => {
          names2.forEach((name) => {
            const { initialValue } = this.fieldsMeta.get(name)
            this.setFieldValue(name, initialValue)
          })

          this.resetErrors(names)
        })
      }

      render() {
        // rerender must be clean don`t exist fields
        this.fieldsMeta.clear()
        // use __counter to force update
        // because mobx will prevent update of Component when prop not changed.

        const { wrappedComponentRef, ...others } = this.props

        let ref

        if (withRef) {
          ref = 'wrappedComponent'
        }

        if (wrappedComponentRef) {
          ref = wrappedComponentRef
        }

        const children = React.createElement(WrappedComponent, {
          ...others,
          form: this,
          ref
        } as any)

        return React.createElement(FormContext.Provider, { value: { form: this } }, children)
      }
    }

    return hoistStatics(Form, WrappedComponent) as React.ComponentType<
      Assign<Subtract<K, InjectedProps>, WrappedFormComponentProps>
    >
  }
}
