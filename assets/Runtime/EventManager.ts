import Singleton from '../Base/Singleton'
import { ITile } from '../Levels'
interface Iitem{
  func: Function
  ctx: any
}
export default class EventManager extends Singleton {
  static get Instance() {
    return super.getInstance<EventManager>()
  }
  
  eventDic: Map<string, Array<Iitem>> = new Map()
  
  on(eventName: string, func: Function, ctx?: any) {
    if(this.eventDic.has(eventName)) {
      this.eventDic.get(eventName).push({func, ctx})
    } else {
      this.eventDic.set(eventName, [{func, ctx}])
    }
  }

  off(eventName: string, func: Function){
    if(this.eventDic.has(eventName)) {
      const index = this.eventDic.get(eventName).findIndex(item => item.func === func)
      index > -1 && this.eventDic.get(eventName).splice(index, 1)
    }
  }
  
  emit(eventName: string, ...args: any){
    if(this.eventDic.has(eventName)) {
      this.eventDic.get(eventName).forEach(({func, ctx}) => {
        ctx? func.apply(ctx, args): func(...args)
      })
    }
  }

  clear(){
    this.eventDic.clear()
  }
}
