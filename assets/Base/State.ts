import { AnimationClip,animation,Sprite,SpriteFrame } from "cc"
import ResourceManager from "../Runtime/ResourceManager"
import StateMachine from "./StateMachine"
import { sortSpriteFrame } from "../Utils"

export const ANIMATION_SPEED = 1/8
export default class State {
  private animationClip: AnimationClip
  constructor(    
    private fsm: StateMachine,
    private spriteFrameDir?: string,
    private wrapMode: AnimationClip.WrapMode = AnimationClip.WrapMode.Normal,
    private speed: number = ANIMATION_SPEED,
    private events: Array<AnimationClip.IEvent> = []
  ) {
    this.init()
  }
  async init(){
    //加载资源
    const promise = ResourceManager.Instance.loadDir(this.spriteFrameDir)
    this.fsm.waitingList.push(promise)
    const spriteFrames = await promise
    //挂在动画节点
    const track = new animation.ObjectTrack()
    track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame')
    const frames: Array<[number, SpriteFrame]> = sortSpriteFrame(spriteFrames).map((item,index)=>[this.speed * index,item])
    track.channel.curve.assignSorted(frames)

    this.animationClip = new AnimationClip()
    this.animationClip.name = this.spriteFrameDir
    this.animationClip.addTrack(track)
    //修改节点属性
    this.animationClip.duration = frames.length * this.speed //动画剪辑周期
    // console.log(this,'d');
    this.animationClip.wrapMode = this.wrapMode // 设置循环播放
   
  }
  run(){
    if(this.fsm.animationComponent.defaultClip?.name === this.animationClip.name) {
      return
    }
    this.fsm.animationComponent.defaultClip = this.animationClip
    this.fsm.animationComponent.play()
  }
}
