The contract has been deployed to `Ropsten` test net with following address:
0x6178a413c4e4c5724515abf045c17070c87edbaa

You can check it out in ether scan here:
https://ropsten.etherscan.io/address/0x636dfcc746afeff4d8290ea2f85aebd15e705c6a

You can also find ABI in this directory: `rate.ropsten.json`

Here is an example on how to consume this Contract:
```javascript
// Ropsten Addresses
const rateAddress = "0x6178a413c4e4c5724515abf045c17070c87edbaa";
const compoundAddress = "0xbc689667c13fb2a04f09272753760e38a95b998c";
const makerDAOAddress = "0x9588a660241aeA569B3965e2f00631f2C5eDaE33";

const provider = new ethers.providers.JsonRpcProvider('https://eth-testnet.coincircle.com');

const rateContract = new ethers.Contract(rateAddress, rateABI, provider);
const compoundContract = new ethers.Contract(compoundAddress, compoundABI, provider);

const rates = await rateContract.getRates(compoundAddress, makerDAOAddress);
const compoundAPY = calCompoundAPY(rates[0].toString());
const makerDaoAPY = calMakerDaoAPY(rates[1].toString());


const calCompoundAPY = (rawRate: number) => {
  const ethMantissa = 1e18;
  const blocksPerDay = 4 * 60 * 24;
  const daysPerYear = 365;
  return (((Math.pow((rawRate / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
}

const calMakerDaoAPY = (rawRate: number) => {
  const rate = rawRate / Math.pow(10, 27);
  const secondsInYear = 60 * 60 * 24 * 365;
  return Math.pow(rate, secondsInYear);
}
```
