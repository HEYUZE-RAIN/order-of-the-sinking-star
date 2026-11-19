/** 区域攻略英文版 · 第二批（北境 + 东境） */
module.exports = {
  heroes1: {
    w: "Heroes of Hauling: the northern opener. Valens pushes, Piff pulls, Isador swaps — those three actions are the entire solution space. The question is never where the object lands, but where you end up after pushing it.",
    tips: [
      "Before each push, think where you'll be standing afterwards; a bad stance ruins everything downstream.",
      "Piff can only pull: face away from the target and step back, and the object follows.",
      "Isador swaps at range — use him to slip past a jammed corridor.",
      "Undo is nearly free; experiment rather than stare."
    ]
  },
  heroes2: {
    w: "Heroes 2: Monsters. Goblins walk into heroes and kill them; dragons take two tiles and move slowly. There's no combat here — treat monsters as blocks that move, and pinning one in a corner is the best answer.",
    tips: [
      "Don't wait for a monster in a corridor; get Valens behind it in the open first.",
      "Push a monster into a corner to pin it, and it becomes inert scenery.",
      "Clear the flanks before the middle; anything near the exit has to go.",
      "You don't need to clear every monster — just a path the whole party fits through."
    ]
  },
  heroes3: {
    w: "Heroes 3: Bard, Druid. The Bard charms everything within two tiles; the Druid crystallises living things — including teammates. From here on, allies are officially props.",
    tips: [
      "Stand in the middle of a group and charm them all at once; far faster than pushing one by one.",
      "Pushing a crystallised teammate onto a plate is a legitimate solution — don't hoard them.",
      "Thaw in reverse order, innermost first, or you wall yourself in.",
      "Never freeze the Druid into a corner; he's the only one who can thaw anyone."
    ]
  },
  goblin_rotation: {
    w: "Goblin Turning: practice at making monsters take your position. They walk toward you, so your movement is the remote control.",
    tips: [
      "Want it to go left? Stand two tiles to its right and step back to lure it.",
      "A ring of goblins can jam each other; charm them into place first, then push.",
      "Never pull a monster along a straight line — circling to its flank is always safe."
    ]
  },
  strength: {
    w: "Strength: Valens's push is a whole-row push, moving a line of blocks at once. This area drills solving several targets with one shove.",
    tips: [
      "A row of crates must go all the way; stopping halfway forfeits it.",
      "Count the row first and remember how many tiles remain before the wall.",
      "Pushed teammates move too — don't shove your own people off a ledge."
    ]
  },
  elevators: {
    w: "Elevators: vertical hauling. A platform only moves when you stand on it or weight it down, so who's on top is the switch.",
    tips: [
      "Hero first, crate second; the other way round leaves you on the lower floor.",
      "Use a crystallised teammate as counterweight so your hands stay free.",
      "Check for a landing up top before the platform reaches it."
    ]
  },
  heroes_and_artifacts: {
    w: "Heroes and Artifacts: artifacts can't be pushed, only swapped. Isador is the only one who can handle them.",
    tips: [
      "Identify what won't budge first; those can only be solved by swapping.",
      "A swap moves you and the object at once — plan both landing tiles.",
      "Artifacts are often keys; don't swap one somewhere you can't retrieve it."
    ]
  },
  mirror: {
    w: "The Mirror Isles: swap with your reflection. The reflection isn't a copy, it's a usable position. Step back before aiming and you throw farther.",
    tips: [
      "See where the reflection lands before moving; don't touch the mirror first.",
      "Stepping back throws farther — when out of reach, walk backwards.",
      "After swapping, immediately re-aim the mirror for the next leg; don't seal your way back.",
      "Stones move the same way: put one in the light path, then swap."
    ]
  },
  vertical_mirrors: {
    w: "Vertical Mirrors: stand a mirror upright and the reflection lands high or low. Height difference is the whole area, and counting tiles flatly will be wrong.",
    tips: [
      "A vertical mirror's reflection distance is horizontal distance to the mirror, not straight-line distance.",
      "Can't reach a high ledge? Look for a vertical mirror, not stairs.",
      "The landing must be solid ground — swapping onto a floating reflection drops you."
    ]
  },
  vertical_reflection: {
    w: "Vertical Mirrors, chained: mirror to mirror lets one swap cross two floors. From here you must hold two heights in your head at once.",
    tips: [
      "Set both mirror angles before starting to swap.",
      "Swap order decides whether you can come back — usually up first, down later.",
      "Stuck? Sketch a side view; faster than spinning the camera."
    ]
  },
  metamirrors: {
    w: "Meta Mirrors: two or more mirrors face each other and reflections nest. Grasping that light paths are reversible is the gate to this area.",
    tips: [
      "Two mirrors on you at once means two swap targets — that's duplication.",
      "Confirm both light paths are open before swapping.",
      "A duplicated you can hold switches and serve as a step, same as the original."
    ]
  },
  mirrorable_stones: {
    w: "Mirrorable Stones: stones have reflections too. Swapping a stone to the far bank is the main way to fill water.",
    tips: [
      "A stone needs to be in a light path to have a reflection — push it into view from the bank first.",
      "When two stones won't make a bridge, swap one across as a landing first.",
      "Stones sink in water, so pick solid ground."
    ]
  },
  mirrors_and_stones: {
    w: "Mirrors and Stones: the eastern mid-game hybrid. Lay the path before adjusting angles; reversed, you strand yourself on an island.",
    tips: [
      "Step one is always adding standable tiles; step two is angles.",
      "A stone blocking a mirror disables it — don't push stones into light paths.",
      "The step-back-before-aiming trick sees the most use here."
    ]
  },
  mirrors_in_3d: {
    w: "Mirrors and Depth: mirror swaps across real floors, where the reflection may land a storey up or down.",
    tips: [
      "Pin down which floor the target is on, then find a mirror that reaches it.",
      "In 3D a vertical mirror is both elevator and portal.",
      "Confirm floor under the landing tile — falling in 3D means starting over."
    ]
  },
};
