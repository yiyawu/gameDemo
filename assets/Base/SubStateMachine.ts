import State from './State'
import StateMachine from './StateMachine'


//动画帧数
/***
 * 子有限状态机基类
 * 用处：例如有个idle的state，但是有多个方向，为了让主状态机更整洁，可以把同类型的但具体不同的state都封装在子状态机中
 */
export default abstract class SubStateMachine {
  private _currentState: State = null
  stateMachines: Map<string, State> = new Map()

  constructor(public fsm: StateMachine){}
  get currentState(){
    return this._currentState
  }

  set currentState(newState: State){
    this._currentState = newState
    this._currentState.run()
  }

  abstract run(): void

}
