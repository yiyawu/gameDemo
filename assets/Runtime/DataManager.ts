import Singleton from '../Base/Singleton'
import { ILevel, ITile } from '../Levels'
import { BurstManager } from '../Script/Burst/BurstManager'
import { DoorManager } from '../Script/Door/DoorManager'
import { PlayerManager } from '../Script/Player/PlayerManager'
import { SmokeManager } from '../Script/Smoke/SmokeManager'
import SpikesManager from '../Script/Spikes/SpikesManager'
import { TileManager } from '../Script/Tile/TileManage'
import { WoodenSkeletonManager } from '../Script/WoodenSkeleton/WoodenSkeletonManager'
export type IRecord = Omit<ILevel, 'mapInfo'>
export default class DataManager extends Singleton {
  static get Instance() {
    return super.getInstance<DataManager>()
  }
  player: PlayerManager
  enemies: WoodenSkeletonManager[]
  door: DoorManager
  spikes: SpikesManager[]
  bursts: BurstManager[]
  smokes: SmokeManager[]
  mapRowCount: number
  mapColumnCount: number
  levelIndex: number = 1
  mapInfo: Array<Array<ITile>>
  tileInfo: Array<Array<TileManager>>
  records: IRecord[]//撤回数据
  private constructor() {
    super()
    this.reset()
  }
  reset(){
    this.mapInfo = []
    this.tileInfo = []
    this.mapRowCount = 0
    this.mapColumnCount = 0
    this.player = null
    this.enemies = []
    this.door = null
    this.records = []
    this.smokes = []
    this.spikes = []
    this.bursts = []
  }
}
