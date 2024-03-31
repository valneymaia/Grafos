import { minmax } from "./func";
import { Entity } from "./game-types";
import { VertexName } from "./types";

export default class Player implements Entity {
  private health: number;
  private damage: number;
  private position: VertexName;
  private _bagWeight: number;
  private _foundTreasure: boolean;

  constructor(
    private baseDamage: number = 10,
    private baseBagWeight: number = 100,
    private startPosition: string = "v0"
  ) {
    this.health = 100;
    this.damage = this.baseDamage;
    this.position = startPosition;
    this._bagWeight = this.baseBagWeight;
    this._foundTreasure = false;
  }

  get healthPoints() {
    return this.health;
  }

  set healthPoints(value: number) {
    this.health = minmax(value, 0, 100);
    this.bagWeight = this.foundTreasure
      ? Math.min(value, this._bagWeight)
      : value;
  }

  get attackDamage() {
    return this.damage;
  }

  set attackDamage(value: number) {
    this.damage = minmax(value, 1, 99);
  }

  get pos() {
    return this.position;
  }

  public get bagWeight(): number {
    return this._bagWeight;
  }

  private set bagWeight(value: number) {
    this._bagWeight = this._foundTreasure
      ? minmax(value, 0, this.bagWeight)
      : value;
  }

  public get foundTreasure(): boolean {
    return this._foundTreasure;
  }
  public set foundTreasure(value: boolean) {
    this._foundTreasure = value;
  }

  public move(vertex: VertexName): void {
    this.position = vertex;
  }

  public attack(aim: Entity): void {
    aim.takeDamage(this.attackDamage);
  }

  public takeDamage(damage: number): void {
    this.healthPoints = this.health - damage;
  }

  public respawn(checkpoint: VertexName): void {
    this.move(checkpoint);
    this.health = 100;
    this.damage = this.baseDamage;
    this._bagWeight = this.baseBagWeight;
  }

  public death(): void {
    this.respawn(this.startPosition);
  }
}
