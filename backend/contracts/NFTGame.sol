// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTGame is ERC721, Ownable {
    //character values in a struct
    struct CharacterAttributes {
        uint characterIndex;
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    // For counting the number of tokens
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // array holding default value for all the characters
    CharacterAttributes[] defaultCharacters;

    // Maps each token id to their attribute state as defined by the CharacterAttributes struct
    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

    struct BigBoss {
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    BigBoss public bigBoss;

    // Stores which address owns which token id
    mapping(address => uint256) public nftHolders;

    // Data passed to the constructor to initialize the default characters' values
    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint[] memory characterHps,
        uint[] memory characterAttackDmgs,
        string memory bossName,
        string memory bossImageURI,
        uint bossHp,
        uint bossAttackDamage
    ) ERC721("Fighters", "FIGHTER") {
        // Initialize the big boss
        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage
        });

        console.log(
            "Done initializing boss %s w/ HP %s, img %s",
            bigBoss.name,
            bigBoss.hp,
            bigBoss.imageURI
        );

        // Loop through all the characters, and save their values in the defaultCharacters array
        for (uint i = 0; i < characterNames.length; i += 1) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHps[i],
                    maxHp: characterHps[i],
                    attackDamage: characterAttackDmgs[i]
                })
            );

            CharacterAttributes memory c = defaultCharacters[i];
            console.log(
                "Done initializing %s w/ HP %s, img %s",
                c.name,
                c.hp,
                c.imageURI
            );
        }

        //starting token_id count from 1
        _tokenIds.increment();
    }

    // Get NFT based on the characterID
    function mintCharacterNFT(uint _characterIndex) external {
        // Get current tokenId (starts at 1).
        uint256 newItemId = _tokenIds.current();

        // Assigns the tokenId to the caller's address.
        _safeMint(msg.sender, newItemId);

        // Mapping tokenId => character attributes.
        // this holds the updating value for each NFT
        nftHolderAttributes[newItemId] = CharacterAttributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            hp: defaultCharacters[_characterIndex].hp,
            maxHp: defaultCharacters[_characterIndex].maxHp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        console.log(
            "Minted NFT w/ tokenId %s and characterIndex %s",
            newItemId,
            _characterIndex
        );

        // Tracking which address owns which tokenId
        nftHolders[msg.sender] = newItemId;

        // Increment the tokenId for the next mint
        _tokenIds.increment();
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        CharacterAttributes memory charAttributes = nftHolderAttributes[
            _tokenId
        ];

        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(
            charAttributes.attackDamage
        );

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                charAttributes.name,
                " -- NFT #: ",
                Strings.toString(_tokenId),
                '", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "',
                charAttributes.imageURI,
                '", "attributes": [ { "trait_type": "Health Points", "value": ',
                strHp,
                ', "max_value":',
                strMaxHp,
                '}, { "trait_type": "Attack Damage", "value": ',
                strAttackDamage,
                "} ]}"
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function revive(uint256 _tokenId) external payable {
        require(
            nftHolders[msg.sender] == _tokenId,
            "Only the owner of this NFT can revive it"
        );

        require(msg.value >= 0.1 ether, "You must pay 0.1 MATIC");

        CharacterAttributes storage charAttributes = nftHolderAttributes[
            _tokenId
        ];

        charAttributes.hp = charAttributes.maxHp;

        console.log(
            "Revived character %s with tokenId %s to full health %s",
            charAttributes.name,
            _tokenId,
            charAttributes.hp
        );
    }

    function withdraw() public payable onlyOwner {
        (bool sent, bytes memory data) = payable(msg.sender).call{
            value: msg.value
        }("");
        require(sent, "Failed to send Ether");
    }
}
