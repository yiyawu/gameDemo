//写一个单例模式
export default class Singleton {
  private static instance: any
  public static getInstance<T>(): T {
    if (!this.instance) {
      this.instance = new this()
    }
    return this.instance
  }
}
