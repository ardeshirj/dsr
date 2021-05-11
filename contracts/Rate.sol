pragma solidity ^0.8.4;

contract Compound {
  function supplyRatePerBlock() public view returns (uint) {}
}

contract DSR {
  function dsr() public view returns (uint) {}
}

contract BZX {
  function supplyInterestRate() public view returns (uint) {}
}

contract Rate {
  function compoundSupplyRate(address compoundAddress) public view returns (uint result) {
    Compound compound = Compound(compoundAddress);
    return compound.supplyRatePerBlock();
  }

  function dsrSupplyRate(address dsrAddress) public view returns (uint result) {
    DSR makerDAO = DSR(dsrAddress);
    return makerDAO.dsr();
  }

  function bzxSupplyRate(address bzxAddress) public view returns (uint result) {
    BZX bzx = BZX(bzxAddress);
    return bzx.supplyInterestRate();
  }
}
