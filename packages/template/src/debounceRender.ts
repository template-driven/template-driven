/******************************************************
 * Created by nanyuantingfeng on 2019-05-14 11:40.
 *****************************************************/
import React from 'react'
import { debounce } from 'lodash'

export default debounceRender

export function debounceRender<T>(wait: number = 16, options?: any) {
  return <C extends React.ComponentType<T>>(Component: C): C =>
    class Debounced extends React.Component<T, any> {
      static displayName = `Debounced(${Component.displayName})`
      private updateDebounced = debounce(this.forceUpdate, wait, options)

      shouldComponentUpdate() {
        this.updateDebounced()
        return false
      }

      componentWillUnmount() {
        this.updateDebounced.cancel()
      }

      render() {
        return React.createElement(Component, this.props)
      }
    } as any
}
