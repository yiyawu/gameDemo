import { _decorator, Component, Sprite, SpriteFrame, UITransform } from 'cc'
import levels from '../../Levels'
import { TILE_TYPE_ENUM } from '../../Enum'

export const TILE_WIDTH = 55
export const TILE_HEIGHT = 55
const { ccclass, property } = _decorator
@ccclass('TileManager')
/**
 * 3种类型
 * 1.可走可转
 * 2.不可走可转
 * 3.不可走不可转
 */
export class TileManager extends Component {
  type: TILE_TYPE_ENUM
  moveable: boolean
  turnable: boolean
  init(type: TILE_TYPE_ENUM ,spriteFrame: SpriteFrame, i: number, j: number) {
    this.type = type
    if(
      this.type === TILE_TYPE_ENUM.WALL_COLUMN ||
      this.type === TILE_TYPE_ENUM.WALL_LEFT_BOTTOM ||
      this.type === TILE_TYPE_ENUM.WALL_LEFT_TOP ||
      this.type === TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM ||
      this.type === TILE_TYPE_ENUM.WALL_RIGHT_TOP ||
      this.type === TILE_TYPE_ENUM.WALL_ROW 
    ) {
        this.moveable = false
        this.turnable = false
    } else if (
      this.type === TILE_TYPE_ENUM.CLIFF_CENTER ||
      this.type === TILE_TYPE_ENUM.CLIFF_LEFT ||
      this.type === TILE_TYPE_ENUM.CLIFF_RIGHT 
    ) {
      this.moveable = false
      this.turnable = true
    } else if (this.type === TILE_TYPE_ENUM.FLOOR) {
      this.moveable = true
      this.turnable = true
    }

    
    //设置ui格式
    const transform = this.getComponent(UITransform)
    const sprite = this.node.addComponent(Sprite)
    sprite.spriteFrame = spriteFrame
    transform.setContentSize(TILE_WIDTH, TILE_HEIGHT)
    this.node.setPosition(i * TILE_WIDTH, -j * TILE_HEIGHT)
  }
}
