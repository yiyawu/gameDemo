import { _decorator, Component, Sprite, SpriteFrame, UITransform, Animation, AnimationClip, animation } from 'cc'
import { ENTITY_STATE_ENUM, FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from '../../Enum'
import State from '../../Base/State'
import StateMachine, { getInitParamsNumber, getInitParamsTrigger } from '../../Base/StateMachine'
import IdleSubStateMachine from './IdleSubStateMachine'
import DeathSubStateMachine from './DeathSubStateMachine'
import EntityManager from '../../Base/EntityManager'

//动画帧数
const { ccclass, property } = _decorator
@ccclass('DoorStateMachine')
export class DoorStateMachine extends StateMachine {
  async init(){
    this.animationComponent = this.addComponent(Animation)
    this.initParams()
    this.initStateMachine()
    this.initAnimationEvent()

    await Promise.all(this.waitingList)
  }

  initParams(){
    this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber())
  }

  initStateMachine(){
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE, new IdleSubStateMachine(this))
    this.stateMachines.set(PARAMS_NAME_ENUM.DEATH, new DeathSubStateMachine(this))
  }
  initAnimationEvent() {
    this.animationComponent.on(Animation.EventType.FINISHED, () => {
      const whiteList = ['attack']
      const name = this.animationComponent.defaultClip.name
      if (whiteList.some(v => name.includes(v))) {
        this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.IDLE
      }
    })
  }
  run() {
    switch (this.currentState) {
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
      case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
        if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        } else if (this.params.get(PARAMS_NAME_ENUM.DEATH).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH)
        } else {
          this.currentState = this.currentState
        }
        break
      default:
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        break
    }
  }
}
