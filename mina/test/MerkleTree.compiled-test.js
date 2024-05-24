import { DurableObjectState } from "@kimlikdao/lib/cloudflare/mock/durableObject";
import { MinaMerkleTree } from "@kimlikdao/lib/mina/merkleTree";
import { assertArrayEq, assertEq } from "@kimlikdao/lib/testing/assert";
import { HexKey, MerkleTree, WitnessElem } from "../MerkleTree";

/**
 * @param {number} ms
 * @return {!Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testEquivalence = async () => {
  const mm = new MinaMerkleTree(4);
  const mt = new MerkleTree(new DurableObjectState(),
    /** @type {!cloudflare.Environment} */({}));

  await delay(0); // blockConcurrencyWhile() is not mocked fully so we need this
  await mt.setHeight(4);

  const mmR = mm.setLeaf(HexKey("A"), 101n);
  const mtR = await mt.setLeaf(HexKey("A"), 101n);

  assertEq(mmR, mtR);

  const mmW = mm.getWitness("B");
  const mtW = await mt.getWitness("B");

  assertArrayEq(
    mmW.map((/** @type {WitnessElem} */ w) => w.sibling),
    mtW.map((/** @type {WitnessElem} */ w) => w.sibling)
  );

  assertArrayEq(
    mmW.map((/** @type {WitnessElem} */ w) => w.isLeft),
    mtW.map((/** @type {WitnessElem} */ w) => w.isLeft)
  );

  mm.setLeaf("9AAA", 10000n);
  await mt.setLeaf("9AAA", 10000n);

  assertEq(mm.getNode(""), await mt.getNode(""));
}

testEquivalence();
