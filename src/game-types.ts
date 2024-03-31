import { VertexName } from "./types";

export enum EnemyTypes {
  GiantCrocodile = "Crocodilo gigante",
  MythicalJaguar = "Onca mitica",
  ChimeraAnts = "Formiga quimera",
}

export enum WeaponTypes {
  PirateSword = "Espada pirata enferrujada",
  HammerOld = "Martelho velho",
  Pistol = "Pistol",
  WoodStick = "Graveto de madeira"
}

export enum MedicineTypes {
  GreenHerbs = "Ervas medicinais",
  GauzeAndAlcohol = "Gaze e Alcool",
  BandAid = "Curativo",
}

export interface Entity {
  healthPoints: number;
  attackDamage: number;

  move: (vertex: VertexName) => void;
  attack: (aim: Entity, damage: number) => void;
  takeDamage: (damage: number) => void;
  respawn: (checkpoint: VertexName) => void;
}

export interface Item {
  position: VertexName;
  type: WeaponTypes | MedicineTypes;
  useItem: (entity: Entity) => void;
}

export enum State {
  start = "start game",
  restart = "restart game",
  gameOver = "game over",
  usedItem = "used item",
  playerCombat = "player combat",
  EnemiesCombat = "enemies combat",
  movedPlayer = "moved player",
  foundTreasure = "found treasure",
  endGame = "end game",
  wonGame = "won game",
}
