// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
// import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract NFTGame is ERC721, Ownable {
    event CharacterNFTMinted(
        address indexed sender,
        uint256 indexed tokenId,
        uint256 indexed characterIndex
    );
    event AttackComplete(
        address indexed sender,
        uint indexed newBossHp,
        uint indexed newPlayerHp
    );

    //character values in a struct
    struct CharacterAttributes {
        uint characterIndex;
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    uint randNonce = 0;

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
        require(
            _characterIndex < defaultCharacters.length,
            "Character ID invalid."
        );

        require(
            nftHolders[msg.sender] == 0,
            "You already have an NFT. You can only have 1 NFT at a time."
        );

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

        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    // Gets the tokenURI for the NFT
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

    function attackBoss() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        console.log(
            "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
            player.name,
            player.hp,
            player.attackDamage
        );
        console.log(
            "Boss %s has %s HP and %s AD\n",
            bigBoss.name,
            bigBoss.hp,
            bigBoss.attackDamage
        );

        // Make sure the player has more than 0 HP.
        require(player.hp > 0, "Error: character must have HP to attack boss.");

        // Make sure the boss has more than 0 HP.
        require(
            bigBoss.hp > 0,
            "Error: boss must have HP to attack character."
        );

        //player attempts to attack bigboss
        console.log("\n%s swings at %s...", player.name, bigBoss.name);

        if (randomInt(10) > 5) {
            if (bigBoss.hp < player.attackDamage) {
                bigBoss.hp = 0;
                //Event boss is dead
                console.log("The boss is dead!");
            } else {
                bigBoss.hp = bigBoss.hp - player.attackDamage;
                //Event boss is attacked, new hp
                console.log(
                    "%s attacked boss. New boss hp: %s",
                    player.name,
                    bigBoss.hp
                );
            }
        } else {
            //Event player missed
            console.log("%s missed!", player.name);
        }

        //bigboss attempting to attack player
        console.log("\n%s swings at %s...", bigBoss.name, player.name);

        if (randomInt(10) > 5) {
            if (player.hp < bigBoss.attackDamage) {
                player.hp = 0;
                //Event Player is dead
                console.log("Player %s is dead!", player.name);
            } else {
                player.hp = player.hp - bigBoss.attackDamage;
                //Event Boss attacked player
                console.log(
                    "Boss attacked %s. New %s hp: %s",
                    player.name,
                    player.name,
                    player.hp
                );
            }
        } else {
            //Event boss missed
            console.log("Boss missed!");
        }

        emit AttackComplete(msg.sender, bigBoss.hp, player.hp);
    }

    // will get me a 0 <= randNum <_modulus
    function randomInt(uint _modulus) internal returns (uint) {
        randNonce++; // increase nonce
        return
            uint(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, randNonce)
                )
            ) % _modulus;
    }

    // Revive a character with 0.1 MATIC
    function revive() external payable {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        require(nftTokenIdOfPlayer != 0, "You don't own a Fighter NFT");

        require(msg.value >= 0.1 ether, "You must pay 0.1 MATIC");

        CharacterAttributes storage charAttributes = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];

        charAttributes.hp = charAttributes.maxHp;

        //Event player restored

        console.log(
            "Revived character %s with tokenId %s to full health %s",
            charAttributes.name,
            nftTokenIdOfPlayer,
            charAttributes.hp
        );
    }

    function reviveBoss() public onlyOwner {
        bigBoss.hp = bigBoss.maxHp;
        // Event boss restored
        console.log(
            "Revived boss %s to full health %s",
            bigBoss.name,
            bigBoss.hp
        );
    }

    // Getting all revenues from reviving a character
    function withdraw() public payable onlyOwner {
        (bool sent, ) = payable(msg.sender).call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    //If the user has a character NFT, return their character. Else, return an empty character.
    function checkIfUserHasNFT()
        public
        view
        returns (CharacterAttributes memory)
    {
        //this will be 0 if they don't have a character NFT
        uint256 userNftTokenId = nftHolders[msg.sender];

        if (userNftTokenId > 0) {
            return nftHolderAttributes[userNftTokenId];
        } else {
            CharacterAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    //Get all the default characters
    function getAllDefaultCharacters()
        public
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultCharacters;
    }

    //Gets the boss
    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss;
    }
}
