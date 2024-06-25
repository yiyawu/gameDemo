import { _decorator, Component, Sprite, SpriteFrame, UITransform, Animation, AnimationClip, animation } from 'cc'
import { FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from '../Enum'
import State from './State'
import SubStateMachine from './SubStateMachine'


//动画帧数
const { ccclass, property } = _decorator
type ParamsValueType = boolean | number
export interface IParamsValue {
  type: FSM_PARAM_TYPE_ENUM
  value: ParamsValueType
}
export const getInitParamsTrigger = () => {
  return {
    type: FSM_PARAM_TYPE_ENUM.TRIGGER,
    value: false
  }
}
export const getInitParamsNumber = () => {
  return {
    type: FSM_PARAM_TYPE_ENUM.NUMBER,
    value: 0
  }
}
/***
 * 流动图
 * 1.entity的state或者direction改变触发setter
 * 2.setter里触发fsm的setParams方法
 * 3.setParams执行run方法（run方法由子类重写）
 * 4.run方法会更改currentState，然后触发currentState的setter
 * 5-1.如果currentState是子状态机，继续执行他的run方法，run方法又会设置子状态机的currentState，触发子状态run方法
 * 5-2.如果是子状态，run方法就是播放动画
 */

/***
 * 有限状态机基类
 */
@ccclass('StateMachine')
export default abstract class StateMachine extends Component {
  private _currentState: State | SubStateMachine = null
  params: Map<string, IParamsValue> = new Map() 
  stateMachines: Map<string, SubStateMachine | State > = new Map()
  animationComponent: Animation
  waitingList: Array<Promise<SpriteFrame[]>> = []

  getParams(paramsName: string){
    if(this.params.has(paramsName)) {
      return this.params.get(paramsName)
    }
  }

  setParams(paramsName: string, value: ParamsValueType){
    if(this.params.has(paramsName)){
      this.params.get(paramsName).value = value
      this.run()
      this.resetTrigger()
    }
  }
  
  resetTrigger(){
    for(const[_,value] of this.params){
      if(value.type === FSM_PARAM_TYPE_ENUM.TRIGGER){
        value.value = false
      }
    }
  }

  abstract init(): void
  abstract run(): void
  
  get currentState(){
    return this._currentState
  }

  set currentState(newState: State | SubStateMachine){
    this._currentState = newState
    this._currentState.run()
  }
}
