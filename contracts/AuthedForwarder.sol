pragma solidity ^0.4.4;

// This will forward to any contract any calldata w/ an authorized address as it's first argument to any method.
contract AuthedForwarder
{
    mapping (address => mapping (bytes4 => bool)) whitelisted;
    mapping (address => mapping (uint256 => bool)) nonces;
    
    function AuthedForwarder()
    {
        whitelisted[this][bytes4(bytes32(sha3("test(address)")))] = true;
    }

    function addressAndBytesCompare(address _addy, uint src) internal returns (bool success)
    {
        uint a;
        uint b;
        
        assembly {
            a := mload(src)
            b := _addy
        }
        return a == b;
    }
    
    function loadSig(uint src) internal returns (bytes4 result)
    {
        bytes4 a;
        
        assembly {
            a := mload(src)
        }
        return a;
    }
    
    
    function test(address _foo)
    {
        if (msg.sender == address(this))
            Test(_foo);
    }

    function whitelist(bytes4 sig)
    {
        whitelisted[msg.sender][sig] = true;
    }
    
    function callOtherContract32Check(address _target, bytes _calldata, uint256 _nonce, uint8 _v, bytes32 _r, bytes32 _s) internal returns (bool result)
    {
        uint calldataaddy;
        uint calldatasig;
        
        assembly {
            // first part of calldata is length (32 bytes),
            // then there's 4 bytes of method sig 
            // then there's 12 bytes of padding 
            // before 20 bytes of addresss
            calldatasig := add(_calldata, 32)
            calldataaddy := add(_calldata, 36)
        }
    
        if (!whitelisted[_target][loadSig(calldatasig)])
        {
            return false;
        }
        
        bytes32 hash = sha3(this, _target, _calldata, _nonce);
        address addy = ecrecover(hash, _v, _r, _s);

        if (nonces[addy][_nonce])
            return false;
            
        if (addressAndBytesCompare(addy, calldataaddy) == false)
            return false;

        nonces[addy][_nonce] = true;        
        return true;
    }
    
    
    function callOtherContract32(address _target, bytes _calldata, uint256 _nonce, bool _careReturn, uint8 _v, bytes32 _r, bytes32 _s)
    {
        bytes32 ret;

        if (!callOtherContract32Check(_target, _calldata, _nonce, _v, _r, _s))
        {
            TransactionDenied();
            return;    
        } 
        ret = callContract32(_target, _calldata);
        if (_careReturn) 
        {
            TransactionReturnValue32(ret);
        }
        return;
    }

    function callContract32(address _target, bytes _calldata) internal returns (bytes32 result)
    {
        bytes32  _return;
        uint256 _calldatalength = _calldata.length;
       
        assembly {
            //gas needs to be uint:ed
            let g := sub(gas,10000)
            let p := add(_calldata, 32) // first part of calldata is the length

            let retval := call(g
                    , _target //address
                    , 0 //value
                    , p //mem in
                    , _calldatalength  //mem_insz
                    , _return
                    , 32) //We expect no return data bigger than 32
            // Check return value
            // 0 == it threw, so we do aswell by jumping to
            // bad destination (02)
            jumpi(0x02,iszero(retval))
                        // return(p,s) : end execution, return data mem[p..(p+s))
            return(_return,32)
        }
    }
    event Test(address _foo);
    event TransactionReturnValue32(bytes32 _result);
    event TransactionDenied();
}
