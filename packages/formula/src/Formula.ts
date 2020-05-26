/******************************************************
 * Created by nanyuantingfeng on 2019-05-07 18:57.
 *****************************************************/
import { action, observable, reaction, runInAction } from 'mobx'
import { Class } from 'utility-types'
import invariant from 'invariant'
import { getAt, setAt, toPathNameAndKey } from './helpers'
import { FormulaType, IObject, ObservableMapLike } from './types'

const FormulaImplementsRegistry = new Map<string, Class<Formula>>()

function registerToRegistry(type: string, Clazz: Class<Formula>) {
  FormulaImplementsRegistry.set(type, Clazz)
}

export function isRegisteredFormula(type: string) {
  return FormulaImplementsRegistry.has(type)
}

export function register(type: string): ClassDecorator {
  return (target: Object) => {
    Formula.register(type, target as Class<Formula>)
  }
}

const noop = () => {}

export abstract class Formula {
  private unlisten: () => void = noop
  private unretry: () => void = noop

  protected forKey: string
  protected dataset: ObservableMapLike<string, IObject>
  protected isBusy: boolean = false
  protected extra: any

  @observable
  private __RETRIGGER__: number = 0

  constructor(public source: FormulaType) {}

  setDataset<T>(dataset: ObservableMapLike<string, T>) {
    this.dataset = dataset
  }

  setExtra<T>(extra: T) {
    this.extra = extra
  }

  private expression = () => {
    const { args = [] } = this.source
    return args.map(arg => getAt(this.dataset, toPathNameAndKey(arg)))
  }

  private effect = async (result: any[]) => {
    this.isBusy = true

    // has undefined value
    // 有依赖的值并没有赋值,说明计算的条件不成立
    if (result.some(v => v === undefined)) {
      this.isBusy = false
      return
    }

    const value = await this.calculate(result)
    runInAction(() => setAt(this.dataset, toPathNameAndKey(this.forKey), value))
    this.isBusy = false
  }

  private scheduler = () => {
    this.unretry()
    this.unretry = reaction(() => this.__RETRIGGER__, () => this.effect(this.expression()))
  }

  listen<T>(key: string) {
    this.dispose && this.dispose()

    this.forKey = key
    this.isBusy = false
    this.unlisten = reaction(this.expression, this.effect, { fireImmediately: true })
    this.scheduler()
    return this
  }

  @action
  trigger() {
    this.__RETRIGGER__ += 1
  }

  dispose() {
    this.unretry()
    this.unlisten()
  }

  abstract calculate<T>(data: any[]): Promise<T>

  static register = registerToRegistry
  static createFormula(source: FormulaType): Formula {
    const { type } = source
    invariant(FormulaImplementsRegistry.has(type), `没有找到注册的Formula类型:${type}.`)
    return new (FormulaImplementsRegistry.get(type)!)(source)
  }
}
