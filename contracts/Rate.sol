// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Compound {
  function supplyRatePerBlock() public view returns (uint) {}
}

contract MakeDAO {
  function dsr() public view returns (uint) {}
}

contract Rate {
  function getRates(
    address compoundAddress,
    address makerDaoAddress
  )  public view returns(uint, uint) {

    Compound compound = Compound(compoundAddress);
    MakeDAO makerDAO = MakeDAO(makerDaoAddress);

    return (compound.supplyRatePerBlock(), makerDAO.dsr());
  }
}
