const ethMantissa = 1e18;
const blocksPerDay = 4 * 60 * 24;
const daysPerYear = 365;

export default class Utils {
  static calSupplyAPY(rate: number): number {
    return (((Math.pow((rate / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
  }
}
