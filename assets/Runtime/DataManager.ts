import Singleton from '../Base/Singleton'
import { ITile } from '../Levels'
import { PlayerManager } from '../Script/Player/PlayerManager'
import { TileManager } from '../Script/Tile/TileManage'
import { WoodenSkeletonManager } from '../Script/WoodenSkeleton/WoodenSkeletonManager'

export default class DataManager extends Singleton {
  static get Instance() {
    return super.getInstance<DataManager>()
  }
  mapInfo: Array<Array<ITile>>
  tileInfo: Array<Array<TileManager>>
  mapRowCount: number = 0
  mapColumnCount: number = 0
  levelIndex: number = 1
  player: PlayerManager
  enemies: WoodenSkeletonManager[]
  reset(){
    this.mapInfo = []
    this.tileInfo = []
    this.mapRowCount = 0
    this.mapColumnCount = 0
    this.player = null
    this.enemies = []
  }
}
