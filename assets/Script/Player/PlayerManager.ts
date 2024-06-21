import { _decorator, Component, Sprite, SpriteFrame, UITransform, Animation, AnimationClip, animation } from 'cc'
import levels from '../../Levels'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManage'
import ResourceManager from '../../Runtime/ResourceManager'
import { CONTROLLER_ENUM, EVENT_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'

//动画帧数
const ANIMATION_SPEED = 1/8
const { ccclass, property } = _decorator
@ccclass('PlayerManager')
export class PlayerManager extends Component {
  x:number = 0
  y:number = 0
  targetX:number = 0
  targetY:number = 0

  private readonly move_speed = 1/10
  async init(){
    await this.render()

    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this)
  }

  update(dt: number): void {
      this.updateXY()
      this.node.setPosition(this.x * TILE_WIDTH, this.y * TILE_HEIGHT)
  }
  /**
   * 实现逻辑，设置目标坐标targetX.targetY
   * 让x,y坐标逐渐趋于目标坐标,当相差很小的时候在让他们相等
   */
  updateXY(){
    if(this.targetX < this.x){
      this.x -= this.move_speed
    }  else if (this.targetX > this.x) {
      this.x += this.move_speed
    }
    if(this.targetY < this.y){
      this.y -= this.move_speed
    } else if (this.targetY > this.y) {
      this.y += this.move_speed
    }
    if(Math.abs(this.targetY - this.y) < 0.01 && Math.abs(this.targetX - this.x) < 0.01){
      this.x = this.targetX
      this.y = this.targetY
    }
  }
  move(type: CONTROLLER_ENUM){
    if(type === CONTROLLER_ENUM.BOTTOM){
      this.targetY -= 1
    } else if (type === CONTROLLER_ENUM.TOP) {
      this.targetY += 1
    } else if (type === CONTROLLER_ENUM.LEFT) {
      this.targetX -= 1
    } else if (type === CONTROLLER_ENUM.RIGHT) {
      this.targetX += 1
    }
  }
  async render(){
    const sprite = this.addComponent(Sprite)
    //代码方式更改属性
    sprite.sizeMode = Sprite.SizeMode.CUSTOM
    const transform = this.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH*4, TILE_HEIGHT*4)
    //加载资源
    const spriteFrames = await ResourceManager.Instance.loadDir('texture/player/idle/top')
    const animationComponent = this.addComponent(Animation)
    //挂在动画节点
    const animationClip = new AnimationClip()
    const track = new animation.ObjectTrack()
    track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame')
    const frames: Array<[number, SpriteFrame]> = spriteFrames.map((item,index)=>[ANIMATION_SPEED * index,item])
    track.channel.curve.assignSorted(frames)
    
    animationClip.addTrack(track)
    //修改节点属性
    animationClip.duration = frames.length * ANIMATION_SPEED //动画剪辑周期
    animationClip.wrapMode = AnimationClip.WrapMode.Loop // 设置循环播放
    animationComponent.defaultClip = animationClip
    animationComponent.play()
  }
}
