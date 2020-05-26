/******************************************************
 * Created by nanyuantingfeng on 2019-03-22 13:22.
 *****************************************************/
declare module 'async-validator' {
  class AsyncValidator {
    constructor(rules: any)
    validate: (values: { [key: string]: any }, fn: (error: Error, fields: any[]) => void) => Promise<any>
  }
  export default AsyncValidator
}
